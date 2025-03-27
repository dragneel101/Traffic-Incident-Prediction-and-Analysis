import os
import requests
from dotenv import load_dotenv
from geojson import Feature, FeatureCollection, LineString
from openrouteservice import convert
import openrouteservice

# Load environment variables
load_dotenv()

ORS_API_KEY = os.getenv("ORS_API_KEY")
client = openrouteservice.Client(key=ORS_API_KEY)


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

    print("Sending request to ORS...")
    print("Request body:", body)

    response = requests.post(url, json=body, headers=headers)

    print("ORS Status Code:", response.status_code)

    if response.status_code != 200:
        print("ORS Raw Response:", response.text)
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

def get_multiple_routes(start: dict, end: dict, count: int = 3):
    """
    Generate multiple route options manually using detours and return as GeoJSON FeatureCollection.
    """
    detours = [
        None,
        {"latitude": start["latitude"] + 0.01, "longitude": start["longitude"] + 0.01},
        {"latitude": start["latitude"] - 0.01, "longitude": start["longitude"] - 0.01},
    ]

    features = []

    for i in range(min(count, len(detours))):
        via = detours[i]
        if via:
            coords = [
                [start["longitude"], start["latitude"]],
                [via["longitude"], via["latitude"]],
                [end["longitude"], end["latitude"]],
            ]
        else:
            coords = [
                [start["longitude"], start["latitude"]],
                [end["longitude"], end["latitude"]],
            ]

        try:
            response = client.directions(
                coordinates=coords,
                profile='driving-car',
                format='geojson'
            )

            feature = response["features"][0]
            coords_raw = feature["geometry"]["coordinates"]
            summary = feature["properties"].get("summary", {})

            # Create GeoJSON Feature
            line = LineString(coords_raw)
            geo_feature = Feature(
                geometry=line,
                properties={
                    "route_id": i,
                    "distance": summary.get("distance", 0),
                    "duration": summary.get("duration", 0)
                }
            )

            features.append(geo_feature)

        except Exception as e:
            print(f"Route {i} failed: {e}")
            continue

    print(f"✅ Generated {len(features)} GeoJSON route features")
    return FeatureCollection(features)
