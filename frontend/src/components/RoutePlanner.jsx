import React, { useState } from "react";
import MapView from "./MapView";
import { getRouteRisk } from "../api/predict";
import AddressSearch from "./AddressSearch";
import Spinner from "./Spinner";

const RoutePlanner = () => {
  const [start, setStart] = useState(null);       // Start coordinates
  const [end, setEnd] = useState(null);           // End coordinates
  const [segments, setSegments] = useState([]);   // Route risk segments
  const [loading, setLoading] = useState(false);  // Spinner toggle

  // Trigger route risk prediction from backend
  const handlePredict = async () => {
    if (!start || !end) return;
    setLoading(true);
    try {
      const response = await getRouteRisk({ start, end });
      setSegments(response.route_segments);
    } catch (err) {
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  };


  // Manual test button to trigger spinner
  const handleTestSpinner = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 5000); // Simulate 2s load
  };


  return (
    <div className="mt-6"> {/* Removed relative from here */}
      <h2 className="text-xl font-semibold mb-4 text-indigo-600">
        🛣️ Route-Based Risk Planner
      </h2>

      {/* Address inputs */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <AddressSearch
          label="Start Address"
          onSelect={(coords) => setStart(coords)}
        />
        <AddressSearch
          label="End Address"
          onSelect={(coords) => setEnd(coords)}
        />
      </div>

      {/* Predict button */}
      <div className="flex gap-4 mb-4">
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded"
          onClick={handlePredict}
          disabled={!start || !end}
        >
          Predict Route Risk
        </button>
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={handleTestSpinner}
        >
          Test Spinner
        </button>
        {(!start || !end) && (
          <span className="text-gray-600 text-sm pt-2">
            Click to drop pins for start and end
          </span>
        )}
      </div>

      {/* Map with overlay wrapper */}
      <div className="relative">
        <MapView
          start={start}
          end={end}
          setStart={setStart}
          setEnd={setEnd}
          segments={segments}
        />
        {loading && <Spinner fullscreen />}
      </div>
    </div>
  );
};

export default RoutePlanner;
