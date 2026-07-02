import requests

from app.config import (
    ADZUNA_APP_ID,
    ADZUNA_APP_KEY,
    ADZUNA_COUNTRY
)


def fetch_jobs(domain):

    url = f"https://api.adzuna.com/v1/api/jobs/{ADZUNA_COUNTRY}/search/1"

    params = {
        "app_id": ADZUNA_APP_ID,
        "app_key": ADZUNA_APP_KEY,
        "what": domain,
        "results_per_page": 20
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        return None

    return response.json()