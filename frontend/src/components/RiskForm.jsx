// src/components/RiskForm.jsx
import React, { useState } from "react";
import client from "../api/client";
import MapView from "./MapView";

const RiskForm = () => {
  const [formData, setFormData] = useState({
    hour: 17,
    latitude: 43.7,
    longitude: -79.4,
    temp_c: -5.0,
    precip_mm: 1.2,
    AUTOMOBILE: 1,
    MOTORCYCLE: 0,
    PASSENGER: 0,
    BICYCLE: 0,
    PEDESTRIAN: 1,
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle form input updates
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : parseFloat(value),
    }));
  };

  // Handle lat/lng updates from MapView
  const handleMapChange = ({ latitude, longitude }) => {
    setFormData((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));
  };

  // Submit data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);
    try {
      const res = await client.post("/api/predict_model", formData);
      setPrediction(res.data.collision_probability);
    } catch (err) {
      console.error("Prediction error:", err);
      setPrediction("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded shadow-md"
      >
        <h2 className="text-xl font-semibold text-indigo-600">
          Collision Risk Form
        </h2>

        {/* Input fields */}
        <div className="grid grid-cols-2 gap-4">
          <label>
            Hour:
            <input
              type="number"
              name="hour"
              value={formData.hour}
              onChange={handleChange}
              className="input"
            />
          </label>
          <label>
            Temperature (°C):
            <input
              type="number"
              name="temp_c"
              value={formData.temp_c}
              onChange={handleChange}
              className="input"
            />
          </label>
          <label>
            Precipitation (mm):
            <input
              type="number"
              name="precip_mm"
              value={formData.precip_mm}
              onChange={handleChange}
              className="input"
            />
          </label>
          <label>
            Latitude:
            <input
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className="input"
            />
          </label>
          <label>
            Longitude:
            <input
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className="input"
            />
          </label>
        </div>

        {/* Vehicle type checkboxes */}
        <div className="grid grid-cols-3 gap-4">
          {["AUTOMOBILE", "MOTORCYCLE", "PASSENGER", "BICYCLE", "PEDESTRIAN"].map(
            (veh) => (
              <label key={veh} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name={veh}
                  checked={formData[veh] === 1}
                  onChange={handleChange}
                />
                {veh}
              </label>
            )
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Predicting..." : "Predict Collision Risk"}
        </button>

        {/* Result display */}
        {prediction !== null && (
          <p className="mt-4 text-lg font-semibold">
            🚨 Collision Probability:{" "}
            <span className="text-red-600">
              {typeof prediction === "number"
                ? `${(prediction * 100).toFixed(2)}%`
                : "Error"}
            </span>
          </p>
        )}
      </form>

      {/* Map View Below Form */}
      <MapView
        latitude={formData.latitude}
        longitude={formData.longitude}
        onChange={handleMapChange}
      />
    </>
  );
};

export default RiskForm;
