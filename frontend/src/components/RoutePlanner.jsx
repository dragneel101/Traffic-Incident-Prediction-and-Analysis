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

  return (
    <div className="mt-6 relative"> {/* Wrapper with relative for spinner positioning */}
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
      <button onClick={() => setLoading(!loading)} className="px-4 py-2 bg-gray-300 rounded">
  Toggle Spinner
</button>


      {/* Predict button */}
      <div className="flex gap-4 mb-4">
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded"
          onClick={handlePredict}
          disabled={!start || !end}
        >
          Predict Route Risk
        </button>
        {(!start || !end) && (
          <span className="text-gray-600 text-sm pt-2">
            Click to drop pins for start and end
          </span>
        )}
      </div>

      {/* Map with route and segments */}
      <MapView
        start={start}
        end={end}
        setStart={setStart}
        setEnd={setEnd}
        segments={segments}
      />

      {/* Spinner overlay */}
      {loading && <Spinner fullscreen />}
    </div>
  );
};

export default RoutePlanner;
