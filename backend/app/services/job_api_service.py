import requests

from app.config import ADZUNA_APP_ID, ADZUNA_APP_KEY, ADZUNA_COUNTRY


def fetch_jobs(domain):
    url = f"https://api.adzuna.com/v1/api/jobs/{ADZUNA_COUNTRY}/search/1"

    params = {
        "app_id": ADZUNA_APP_ID,
        "app_key": ADZUNA_APP_KEY,
        "what": domain,
        "results_per_page": 20,
        "content-type": "application/json"
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        return {
            "error": True,
            "status_code": response.status_code,
            "details": response.text
        }

    return response.json()