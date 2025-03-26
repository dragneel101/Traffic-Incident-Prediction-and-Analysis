import os
import requests
from dotenv import load_dotenv
from openrouteservice import convert

# Load environment variables
load_dotenv()

ORS_API_KEY = os.getenv("ORS_API_KEY")

def get_route_coordinates(start: dict, end: dict):
    """
    Calls OpenRouteService Directions API to get a route between start and end coordinates.
    Returns a list of decoded lat/lng coordinate points along the route.
    """

    if ORS_API_KEY is None:
        raise ValueError("ORS_API_KEY not found. Make sure it is set in your .env file.")

    url = "https://api.openrouteservice.org/v2/directions/driving-car"

    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json"
    }

    body = {
        "coordinates": [
            [start["longitude"], start["latitude"]],
            [end["longitude"], end["latitude"]]
        ]
    }

    print("📤 Sending request to ORS...")
    print("Request body:", body)

    response = requests.post(url, json=body, headers=headers)

    print("📥 ORS Status Code:", response.status_code)

    if response.status_code != 200:
        print("📥 ORS Raw Response:", response.text)
        raise Exception(f"ORS Error {response.status_code}: {response.text}")

    data = response.json()

    if "routes" not in data or "geometry" not in data["routes"][0]:
        raise ValueError(f"❌ Unexpected ORS response format:\n{data}")

    # Decode polyline to lat/lng coordinates
    encoded_geometry = data["routes"][0]["geometry"]
    decoded_coords = convert.decode_polyline(encoded_geometry)["coordinates"]

    # Convert to list of dicts with lat/lng keys
    route_coords = [{"latitude": lat, "longitude": lng} for lng, lat in decoded_coords]

    print(f"✅ Received {len(route_coords)} route coordinates from ORS.")
    return route_coords
