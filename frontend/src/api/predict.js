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
