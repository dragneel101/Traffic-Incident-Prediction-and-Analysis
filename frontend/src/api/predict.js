import client from './client';

export async function predictCollisionRisk(formData) {
  const payload = {
    start: [formData.longitude, formData.latitude],
    end: [formData.longitude, formData.latitude], // Using same for simplicity
    timestamp: new Date().toISOString(), // Placeholder
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
