import React, { useState } from "react";
import MapView from "./MapView";
import { getRouteRisk } from "../api/predict";
import AddressSearch from "./AddressSearch";

const RoutePlanner = () => {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [segments, setSegments] = useState([]);

  const handlePredict = async () => {
    if (!start || !end) return;

    const response = await getRouteRisk({ start, end });
    setSegments(response.route_segments);
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4 text-indigo-600">
        🛣️ Route-Based Risk Planner
      </h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <AddressSearch
          label="Start Address"
          onSelect={(coords) => {
            setStart(coords);
          }}
        />
        <AddressSearch
          label="End Address"
          onSelect={(coords) => {
            setEnd(coords);
          }}
        />
      </div>

      <div className="flex gap-4 mb-4">
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded"
          onClick={handlePredict}
          disabled={!start || !end}
        >
          Predict Route Risk
        </button>
        {(!start || !end) && (
          <span className="text-gray-600 text-sm pt-2">Click to drop pins for start and end</span>
        )}
      </div>

      <MapView
        start={start}
        end={end}
        setStart={setStart}
        setEnd={setEnd}
        segments={segments}
      />
    </div>
  );
};

export default RoutePlanner;
