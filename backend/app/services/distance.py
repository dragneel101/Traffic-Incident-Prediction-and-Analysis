import openrouteservice
import os

client = openrouteservice.Client(key=os.getenv("ORS_API_KEY"))

def get_route_distance(start, end):
    """
    Returns route distance (in kilometers) between start and end using ORS.
    """
    route = client.directions(
        coordinates=[start, end],
        profile="driving-car",
        format="geojson"
    )

    distance_meters = route["features"][0]["properties"]["segments"][0]["distance"]
    return round(distance_meters / 1000, 2)
