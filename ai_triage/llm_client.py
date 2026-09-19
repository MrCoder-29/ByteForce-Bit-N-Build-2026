"""
LLM Integration Client with automatic heuristic fallback.
Supports Gemini API (or Groq/OpenAI) via environment variables.
Provides 100% offline fallback when API keys are absent or network is unavailable.
"""

import os
import json
import logging
import urllib.request
import urllib.error
from typing import Dict, Any, Optional

logger = logging.getLogger("ai_triage.llm_client")

class LLMClient:
    def __init__(self):
        self.gemini_api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        self.groq_api_key = os.environ.get("GROQ_API_KEY")
        self.openai_api_key = os.environ.get("OPENAI_API_KEY")

    def is_api_available(self) -> bool:
        return bool(self.gemini_api_key or self.groq_api_key or self.openai_api_key)

    def generate_json(self, prompt: str, system_instruction: str = "") -> Optional[Dict[str, Any]]:
        """
        Attempts to call available LLM API and return parsed JSON object.
        Returns None if API is unavailable or call fails (triggering fallback).
        """
        if self.gemini_api_key:
            res = self._call_gemini_json(prompt, system_instruction)
            if res is not None:
                return res
        
        if self.groq_api_key:
            res = self._call_openai_compat_json(
                api_key=self.groq_api_key,
                url="https://api.groq.com/openai/v1/chat/completions",
                model="llama-3.3-70b-versatile",
                prompt=prompt,
                system_instruction=system_instruction
            )
            if res is not None:
                return res

        if self.openai_api_key:
            res = self._call_openai_compat_json(
                api_key=self.openai_api_key,
                url="https://api.openai.com/v1/chat/completions",
                model="gpt-4o-mini",
                prompt=prompt,
                system_instruction=system_instruction
            )
            if res is not None:
                return res

        return None

    def _call_gemini_json(self, prompt: str, system_instruction: str) -> Optional[Dict[str, Any]]:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={self.gemini_api_key}"
            
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "response_mime_type": "application/json",
                    "temperature": 0.2
                }
            }
            if system_instruction:
                payload["system_instruction"] = {"parts": [{"text": system_instruction}]}

            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )

            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        text_resp = parts[0].get("text", "")
                        return json.loads(text_resp)
        except Exception as e:
            logger.warning(f"Gemini API call failed, falling back to heuristics: {e}")
        return None

    def _call_openai_compat_json(self, api_key: str, url: str, model: str, prompt: str, system_instruction: str) -> Optional[Dict[str, Any]]:
        try:
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction + "\nRespond with valid JSON only."})
            messages.append({"role": "user", "content": prompt})

            payload = {
                "model": model,
                "messages": messages,
                "response_format": {"type": "json_object"},
                "temperature": 0.2
            }

            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}"
                },
                method="POST"
            )

            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                choices = data.get("choices", [])
                if choices:
                    content = choices[0].get("message", {}).get("content", "")
                    return json.loads(content)
        except Exception as e:
            logger.warning(f"LLM API call failed ({url}): {e}")
        return None
