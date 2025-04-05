from geopy.geocoders import OpenCage
from geopy.exc import GeocoderTimedOut
import os

# Load your API key from environment variable
API_KEY = os.getenv("OPENCAGE_API_KEY", "b96d614b4d74432b9e28049e56dacccc")

def reverse_geocode(lat, lon):
    """
    Function to convert lat, lon to a human-readable address using OpenCage API
    """
    geolocator = OpenCage(API_KEY)
    try:
        # Use OpenCage API to reverse geocode the coordinates
        location = geolocator.reverse((lat, lon), language='en')
        if location:
            return location.address  # Return the formatted address
        return "Address not found"
    except GeocoderTimedOut:
        return "Geocoder service timed out"
    except Exception as e:
        print(f"Error during geocoding: {e}")
        return "Error"
