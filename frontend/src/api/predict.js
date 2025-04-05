import client from './client';

/**
 * Predicts collision risk at a single point.
 * This is used by the RiskForm component.
 */
export async function predictSinglePointRisk(formData) {
  const payload = {
    start: [formData.longitude, formData.latitude],
    end: [formData.longitude, formData.latitude], // Same point
    timestamp: new Date().toISOString(), // Optional
    weather: {
      hour: parseInt(formData.hour),
      temp: parseFloat(formData.temp),
      precip: parseFloat(formData.precip),
    },
    types: {
      AUTOMOBILE: formData.AUTOMOBILE,
      MOTORCYCLE: formData.MOTORCYCLE,
      PASSENGER: formData.PASSENGER,
      BICYCLE: formData.BICYCLE,
      PEDESTRIAN: formData.PEDESTRIAN,
    }
  };

  const response = await client.post('/predict', payload);
  return response.data;
}

/**
 * Predicts route-based collision risk using start and end coordinates.
 * Returns segment-wise risk scores.
 */
export async function getRouteRisk({ start, end }) {
  const response = await client.post('/api/predict/route_risk', {
    start,
    end
  });
  return response.data;
}

/**
 * Gets multiple alternative routes (with risk scores) from backend.
 * Returns a GeoJSON FeatureCollection.
 */
export async function getMultipleRouteRisks({ start, end }) {
  // Retrieve the token from localStorage (or other storage method)
  const token = localStorage.getItem("token");
  console.log("Token:", localStorage.getItem("token"));
  if (!token) {
    throw new Error("Token is missing or invalid.");
  }

  const headers = {
    'Authorization': `Bearer ${token}`,  // Add the token to the Authorization header
    'Content-Type': 'application/json'   // Make sure the content type is set
  };

  try {
    // Make the POST request with the headers
    const response = await client.post('/api/predict/multiple_route_risks', {
      start,
      end
    }, { headers });

    return response.data;  // GeoJSON format
  } catch (error) {
    console.error("Error fetching multiple route risks:", error);
    throw error;  // Rethrow the error to be handled elsewhere
  }
}
