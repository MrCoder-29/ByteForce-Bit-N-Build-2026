import math
from typing import List
from app.models import Incident, Resource
from app.schemas import ResourceRecommendation
from app.config import settings

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points 
    on the earth in kilometers using the Haversine formula.
    """
    R = 6371.0 # Earth radius in kilometers

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return round(distance, 2)

def calculate_resource_score(
    incident: Incident,
    resource: Resource,
    w1: float = settings.WEIGHT_DISTANCE,
    w2: float = settings.WEIGHT_CAPABILITY,
    w3: float = settings.WEIGHT_AVAILABILITY
) -> ResourceRecommendation:
    """
    Computes normalized score for a resource against an incident.
    Score = w1 * ProximityScore + w2 * CapabilityMatch + w3 * Availability
    """
    # 1. Proximity & Distance
    distance_km = haversine_distance(incident.latitude, incident.longitude, resource.latitude, resource.longitude)
    # Proximity score ranges from 1.0 (0km) down towards 0 as distance increases
    proximity_score = 1.0 / (1.0 + 0.2 * distance_km)

    # 2. Capability Matching
    required_caps = set(incident.required_capabilities or [])
    resource_caps = set(resource.capabilities or [])

    if not required_caps:
        capability_score = 1.0
    else:
        matched = required_caps.intersection(resource_caps)
        capability_score = len(matched) / len(required_caps)

    # 3. Availability Score
    res_status = resource.status.strip().title()
    if res_status == "Available":
        availability_score = 1.0
    elif res_status == "Dispatched":
        availability_score = 0.5 # Eligible for emergency reroute if urgent
    else: # On Scene, Maintenance, Offline
        availability_score = 0.0

    # 4. Total Weighted Score
    total_score = (w1 * proximity_score) + (w2 * capability_score) + (w3 * availability_score)

    # 5. Estimated ETA (assuming avg emergency transport speed of 40 km/h)
    avg_speed_kmh = 40.0
    eta_minutes = round((distance_km / avg_speed_kmh) * 60, 1)

    return ResourceRecommendation(
        resource_id=resource.id,
        identifier=resource.identifier,
        name=resource.name,
        type=resource.type,
        capabilities=resource.capabilities or [],
        status=resource.status,
        latitude=resource.latitude,
        longitude=resource.longitude,
        distance_km=distance_km,
        capability_match_score=round(capability_score, 2),
        availability_score=round(availability_score, 2),
        score=round(total_score, 3),
        estimated_eta_minutes=eta_minutes
    )

def rank_resources_for_incident(
    incident: Incident,
    resources: List[Resource],
    limit: int = 10
) -> List[ResourceRecommendation]:
    """
    Ranks all candidate resources for an incident by composite score descending.
    """
    recommendations = [
        calculate_resource_score(incident, res) for res in resources
    ]
    # Sort descending by score, then ascending by distance
    recommendations.sort(key=lambda r: (-r.score, r.distance_km))
    return recommendations[:limit]
