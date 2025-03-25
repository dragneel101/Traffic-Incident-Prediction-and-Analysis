import React, { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import Route from "./Route"; // We'll split this out
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const RoutePlanner = () => {
  const [start, setStart] = useState([43.6532, -79.3832]);
  const [end, setEnd] = useState([43.651070, -79.347015]);
  const [riskPoints, setRiskPoints] = useState([]);

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4 text-indigo-600">
        🛣️ Route-Based Risk Planner (Mock)
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <label>
          Start Latitude:
          <input
            type="number"
            value={start[0]}
            onChange={(e) => setStart([parseFloat(e.target.value), start[1]])}
            className="input"
          />
        </label>
        <label>
          Start Longitude:
          <input
            type="number"
            value={start[1]}
            onChange={(e) => setStart([start[0], parseFloat(e.target.value)])}
            className="input"
          />
        </label>
        <label>
          End Latitude:
          <input
            type="number"
            value={end[0]}
            onChange={(e) => setEnd([parseFloat(e.target.value), end[1]])}
            className="input"
          />
        </label>
        <label>
          End Longitude:
          <input
            type="number"
            value={end[1]}
            onChange={(e) => setEnd([end[0], parseFloat(e.target.value)])}
            className="input"
          />
        </label>
      </div>

      <MapContainer
        center={start}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: "500px", width: "100%" }}
        className="rounded shadow"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        <Route start={start} end={end} onRiskData={setRiskPoints} />
      </MapContainer>
    </div>
  );
};

export default RoutePlanner;
