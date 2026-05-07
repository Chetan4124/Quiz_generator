import requests
from .config import GEMINI_API_KEY, GEMINI_API_URL
import logging
import time

logger = logging.getLogger(__name__)

def ask_ai(prompt):
    """Send prompt to Gemini with careful rate limiting"""
    
    response = requests.post(
        f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
        json={
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "maxOutputTokens": 512,
                "temperature": 0.7,
            }
        },
        timeout=30
    )
    
    if response.status_code == 200:
        result = response.json()
        return result['candidates'][0]['content']['parts'][0]['text']
    
    elif response.status_code == 429:
        # Rate limited - tell us how long to wait
        try:
            error_data = response.json()
            retry_delay = 30  # Default wait 30 seconds
            for detail in error_data.get('error', {}).get('details', []):
                if 'retryDelay' in detail:
                    retry_secs = int(detail['retryDelay'].replace('s', ''))
                    retry_delay = max(retry_delay, retry_secs)
            logger.warning(f"Rate limited. Need to wait {retry_delay} seconds")
            raise Exception(f"Rate limited. Please wait {retry_delay} seconds before trying again.")
        except Exception as e:
            if "Rate limited" in str(e):
                raise
            raise Exception("Rate limit exceeded. Please wait a minute.")
    
    else:
        error = response.json()
        raise Exception(f"API Error: {error}")