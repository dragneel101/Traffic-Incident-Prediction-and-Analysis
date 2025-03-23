import requests
import os

API_KEY = os.getenv("OPENWEATHER_API_KEY")

if not API_KEY:
    raise ValueError("❌ OPENWEATHER_API_KEY is not set. Check your .env file.")

def get_weather(lat: float, lon: float):
    """Fetch current weather conditions from OpenWeatherMap"""
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": API_KEY,
        "units": "metric"
    }

    print(f"🔍 Fetching weather for: {lat}, {lon}")
    print(f"🔐 Using API key: {API_KEY[:6]}... (hidden)")

    response = requests.get(url, params=params)

    if response.status_code != 200:
        print("❌ Weather API error:", response.status_code, response.text)
        raise Exception("Failed to fetch weather data")

    data = response.json()
    return {
        "temp": data["main"]["temp"],
        "condition": data["weather"][0]["main"],  # e.g., Rain, Clear, Snow
        "visibility": data.get("visibility", 10000),
    }
