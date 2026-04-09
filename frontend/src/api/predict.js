import client from "./client";

export async function getMultipleRouteRisks({ start, end }) {
  const response = await client.post("/api/predict/multiple_route_risks", { start, end });
  return response.data;
}

export async function getRouteRisk({ start, end }) {
  const response = await client.post("/api/predict/route_risk", { start, end });
  return response.data;
}

export async function getTrafficIncidents(lat, lon, radiusKm = 10) {
  const response = await client.get("/api/traffic/incidents", {
    params: { lat, lon, radius_km: radiusKm },
  });
  return response.data;
}
