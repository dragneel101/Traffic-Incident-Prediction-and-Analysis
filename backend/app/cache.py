from cachetools import TTLCache

# Weather: cache per ~1km grid cell (2 decimal places), 10 minute TTL
weather_cache: TTLCache = TTLCache(maxsize=500, ttl=600)

# Reverse geocoding: cache per ~100m grid cell (3 decimal places), 24 hour TTL
geocode_cache: TTLCache = TTLCache(maxsize=1000, ttl=86400)

# Traffic flow and incidents: 5 minute TTL
traffic_cache: TTLCache = TTLCache(maxsize=200, ttl=300)
