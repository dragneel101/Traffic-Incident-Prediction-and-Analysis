import requests
import os

API_KEY = os.getenv("OPENWEATHER_API_KEY")

def get_weather(lat: float, lon: float):
    """Fetch current weather conditions from OpenWeatherMap"""
    url = f"https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": API_KEY,
        "units": "metric"
    }
    response = requests.get(url, params=params)
    if response.status_code != 200:
        raise Exception("Failed to fetch weather data")
    
    data = response.json()
    return {
        "temp": data["main"]["temp"],
        "condition": data["weather"][0]["main"],  # e.g., Rain, Clear, Snow
        "visibility": data.get("visibility", 10000),
    }
