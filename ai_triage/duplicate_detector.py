"""
Spatial-Temporal + Semantic Duplicate Detection Module.
Calculates geographic distance (Haversine), time difference, and text semantic similarity.
Prevents merging unrelated incidents that occur in close geographic proximity.
"""

import math
import re
import logging
from typing import List, Tuple, Optional
from datetime import datetime
from .models import IncidentInput, DuplicateCheckResult, DuplicateCheckInput

logger = logging.getLogger("ai_triage.duplicate_detector")

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates the great-circle distance between two points on Earth in meters."""
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def calculate_text_similarity(text1: str, text2: str) -> float:
    """
    Computes text similarity using N-gram word overlap, stemming, & synonym matching.
    """
    def stem(word: str) -> str:
        w = word.lower()
        for suffix in ["ing", "ed", "es", "s", "age", "al", "ment", "ion"]:
            if len(w) > 4 and w.endswith(suffix):
                w = w[:-len(suffix)]
                break
        if len(w) > 3 and w.endswith("e"):
            w = w[:-1]
        return w

    # Domain synonym mapping to normalize equivalent terms
    synonyms = {
        "blaze": "fire", "flames": "fire", "burning": "fire",
        "leakage": "leak", "spill": "leak",
        "collision": "crash", "accident": "crash",
        "rubble": "collapse", "down": "collapse",
        "victims": "casualty", "injured": "casualty", "hurt": "casualty"
    }

    raw1 = re.findall(r"\w+", text1.lower())
    raw2 = re.findall(r"\w+", text2.lower())

    stopwords = {"the", "a", "an", "is", "at", "in", "on", "near", "and", "or", "of", "to", "with", "there", "it", "by", "from"}
    
    t1_clean = {synonyms.get(stem(w), stem(w)) for w in raw1 if w not in stopwords}
    t2_clean = {synonyms.get(stem(w), stem(w)) for w in raw2 if w not in stopwords}

    if not t1_clean or not t2_clean:
        return 0.0

    intersection = t1_clean.intersection(t2_clean)
    union = t1_clean.union(t2_clean)

    jaccard = len(intersection) / len(union)

    # Check key domain terms overlap (e.g. fire vs crash vs medical)
    critical_terms = {"fire", "crash", "gas", "leak", "flood", "collapse", "cardiac", "medical"}
    t1_crit = t1_clean.intersection(critical_terms)
    t2_crit = t2_clean.intersection(critical_terms)

    # If critical terms contradict (e.g. one is fire, one is crash), penalty applies
    if t1_crit and t2_crit and t1_crit != t2_crit:
        jaccard *= 0.1  # Severe penalty for conflicting incident types

    return round(jaccard, 4)

class DuplicateDetector:
    def __init__(self, max_distance_meters: float = 500.0, max_time_diff_minutes: float = 30.0, semantic_threshold: float = 0.25):
        self.max_distance_meters = max_distance_meters
        self.max_time_diff_minutes = max_time_diff_minutes
        self.semantic_threshold = semantic_threshold

    def check_duplicate(self, new_report: IncidentInput, existing_reports: List[IncidentInput]) -> DuplicateCheckResult:
        """
        Evaluates new_report against a list of active existing_reports.
        Returns DuplicateCheckResult for the highest-matching candidate.
        """
        if not existing_reports:
            return DuplicateCheckResult(
                is_duplicate=False,
                reason="No active reports to compare against."
            )

        best_match_id: Optional[str] = None
        best_overall_score = 0.0
        best_dist = 0.0
        best_time_diff = 0.0
        best_sem_sim = 0.0
        best_reason = ""

        t_new = new_report.get_timestamp_dt()

        for report in existing_reports:
            # Skip comparing report against itself
            if new_report.id and report.id and new_report.id == report.id:
                continue

            # 1. Spatial distance
            dist_m = haversine_distance_meters(new_report.latitude, new_report.longitude, report.latitude, report.longitude)
            
            # 2. Time difference
            t_existing = report.get_timestamp_dt()
            time_diff_min = abs((t_new - t_existing).total_seconds()) / 60.0

            # Filter early if spatial or temporal boundaries are heavily exceeded
            if dist_m > self.max_distance_meters:
                continue
            if time_diff_min > self.max_time_diff_minutes:
                continue

            # 3. Semantic similarity
            sem_sim = calculate_text_similarity(new_report.description, report.description)

            # Spatial score (1.0 at 0m, 0.0 at max_distance)
            spatial_score = max(0.0, 1.0 - (dist_m / self.max_distance_meters))
            
            # Temporal score (1.0 at 0min, 0.0 at max_time)
            temporal_score = max(0.0, 1.0 - (time_diff_min / self.max_time_diff_minutes))

            # Composite match score
            # Note: Semantic similarity is heavily weighted to avoid merging unrelated nearby events!
            overall_score = (0.50 * sem_sim) + (0.30 * spatial_score) + (0.20 * temporal_score)

            if overall_score > best_overall_score:
                best_overall_score = overall_score
                best_match_id = report.id or "unknown_id"
                best_dist = dist_m
                best_time_diff = time_diff_min
                best_sem_sim = sem_sim

        # Decision rule: Must satisfy spatial-temporal constraints AND semantic similarity threshold
        is_dup = (
            best_overall_score >= 0.50 and
            best_dist <= self.max_distance_meters and
            best_time_diff <= self.max_time_diff_minutes and
            best_sem_sim >= self.semantic_threshold
        )

        if is_dup:
            best_reason = (
                f"High confidence duplicate of report '{best_match_id}'. "
                f"Distance: {best_dist:.1f}m (<= {self.max_distance_meters}m), "
                f"Time diff: {best_time_diff:.1f}m (<= {self.max_time_diff_minutes}m), "
                f"Semantic similarity: {best_sem_sim:.2f}."
            )
        else:
            if best_match_id:
                best_reason = (
                    f"Report near '{best_match_id}' ({best_dist:.1f}m away), but semantic similarity ({best_sem_sim:.2f}) "
                    f"or composite score ({best_overall_score:.2f}) was below threshold. Classified as DISTINCT incident."
                )
            else:
                best_reason = "No candidate reports found within spatial-temporal window."

        return DuplicateCheckResult(
            is_duplicate=is_dup,
            duplicate_of_id=best_match_id if is_dup else None,
            overall_score=round(best_overall_score, 4),
            spatial_distance_meters=round(best_dist, 2),
            time_difference_minutes=round(best_time_diff, 2),
            semantic_similarity=round(best_sem_sim, 4),
            reason=best_reason
        )
