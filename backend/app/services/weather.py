import requests
import os
from dotenv import load_dotenv
from app.cache import weather_cache
from app.logging_config import get_logger

load_dotenv()
logger = get_logger(__name__)

API_KEY = os.getenv("OPENWEATHER_API_KEY")
if not API_KEY:
    raise ValueError("OPENWEATHER_API_KEY is not set. Check your .env file.")


def get_weather(lat: float, lon: float) -> dict:
    """Fetch current weather conditions from OpenWeatherMap, with in-memory caching."""
    cache_key = (round(lat, 2), round(lon, 2))
    if cache_key in weather_cache:
        return weather_cache[cache_key]

    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {"lat": lat, "lon": lon, "appid": API_KEY, "units": "metric"}

    response = requests.get(url, params=params, timeout=5)
    if response.status_code != 200:
        logger.error("weather_api_error", extra={"status": response.status_code, "lat": lat, "lon": lon})
        raise Exception("Failed to fetch weather data")

    data = response.json()

    precip_mm = 0.0
    if "rain" in data and "1h" in data["rain"]:
        precip_mm = data["rain"]["1h"]
    elif "snow" in data and "1h" in data["snow"]:
        precip_mm = data["snow"]["1h"]

    result = {
        "temp_c": data["main"]["temp"],
        "precip_mm": precip_mm,
        "condition": data["weather"][0]["main"],
        "visibility": data.get("visibility", 10000),
    }
    weather_cache[cache_key] = result
    return result
