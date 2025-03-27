import React, { useState, useRef } from "react";
import MapView from "./MapView";
import { getRouteRisk } from "../api/predict";
import AddressSearch from "./AddressSearch";
import SpinnerPortal from "./SpinnerPortal"; // Updated to use portal-based spinner
import RiskLegend from "./RiskLegend";
import { getMultipleRouteRisks } from "../api/predict";

const RoutePlanner = () => {
  const [start, setStart] = useState(null);       // Start coordinates
  const [end, setEnd] = useState(null);           // End coordinates
  const [geojson, setGeojson] = useState(null);   // Route risk segments
  const [loading, setLoading] = useState(false);  // Spinner toggle
  const startRef = useRef();
  const endRef = useRef();


  // Trigger route risk prediction from backend
  const handlePredict = async () => {
    if (!start || !end) return;
    setLoading(true);
    try {
      const response = await getMultipleRouteRisks({ start, end });
      setGeojson(response);
    } catch (err) {
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  };

    // Reset markers and segments
    const handleReset = () => {
      setStart(null);
      setEnd(null);
      setGeojson(null);
      if (startRef.current) startRef.current.clear();
      if (endRef.current) endRef.current.clear();
    };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4 text-indigo-600">
        🛣️ Route-Based Risk Planner
      </h2>

      {/* Address inputs */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <AddressSearch
          label="Start Address"
          onSelect={(coords) => setStart(coords)}
          ref={startRef}
        />
        <AddressSearch
          label="End Address"
          onSelect={(coords) => setEnd(coords)}
          ref={endRef}
        />
      </div>

      {/* Predict button and test spinner */}
      <div className="flex gap-4 mb-4">
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded"
          onClick={handlePredict}
          disabled={!start || !end}
        >
          Predict Route Risk
        </button>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded"
          onClick={handleReset}
        >
          Reset Markers
        </button>
        {(!start || !end) && (
          <span className="text-gray-600 text-sm pt-2">
            Click to drop pins for start and end
          </span>
        )}
      </div>

      {/* Risk Score Legend */}
      <RiskLegend />

      {/* Map with route and segments */}
      <MapView
        start={start}
        end={end}
        setStart={setStart}
        setEnd={setEnd}
        geojson={geojson}
        onStartSelect={(address, coords) => {
          setStart(coords);
          if (startRef.current) startRef.current.setAddress(address);
        }}
        onEndSelect={(address, coords) => {
          setEnd(coords);
          if (endRef.current) endRef.current.setAddress(address);
        }}
        
      />

      {/* Fullscreen spinner overlay */}
      {loading && <SpinnerPortal />}
    </div>
  );
};

export default RoutePlanner;
