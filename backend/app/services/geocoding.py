import os
from geopy.geocoders import OpenCage
from geopy.exc import GeocoderTimedOut
from app.cache import geocode_cache
from app.logging_config import get_logger

logger = get_logger(__name__)

API_KEY = os.getenv("OPENCAGE_API_KEY")
if not API_KEY:
    raise RuntimeError("OPENCAGE_API_KEY environment variable is not set")


def reverse_geocode(lat: float, lon: float) -> str:
    """Convert lat/lon to a human-readable address using OpenCage, with caching."""
    cache_key = (round(lat, 3), round(lon, 3))
    if cache_key in geocode_cache:
        return geocode_cache[cache_key]

    geolocator = OpenCage(API_KEY)
    try:
        location = geolocator.reverse((lat, lon), language="en", timeout=5)
        address = location.address if location else "Address not found"
    except GeocoderTimedOut:
        logger.warning("geocode_timeout", extra={"lat": lat, "lon": lon})
        address = "Address not found"
    except Exception as e:
        logger.error("geocode_error", extra={"error": str(e), "lat": lat, "lon": lon})
        address = "Address not found"

    geocode_cache[cache_key] = address
    return address
