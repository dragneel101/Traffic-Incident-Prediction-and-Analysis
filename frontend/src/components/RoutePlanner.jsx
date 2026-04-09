import React, { useState, useRef } from "react";
import { toast } from "react-toastify";
import MapView from "./MapView";
import AddressSearch from "./AddressSearch";
import SpinnerPortal from "./SpinnerPortal";
import RouteList from "./RouteList";
import { getMultipleRouteRisks, getTrafficIncidents } from "../api/predict";
import { getErrorMessage } from "../utils/errorMessages";

const RoutePlanner = () => {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [routes, setRoutes] = useState([]);           // GeoJSON features array
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [incidents, setIncidents] = useState([]);     // traffic incident features
  const [loading, setLoading] = useState(false);
  const startRef = useRef();
  const endRef = useRef();

  const handlePredict = async () => {
    if (!start || !end) return;
    setLoading(true);
    try {
      const geojson = await getMultipleRouteRisks({ start, end });
      const features = geojson?.features ?? [];
      setRoutes(features);

      // Auto-select the recommended route
      const rec = features.find((f) => f.properties.is_recommended);
      setSelectedRouteId(rec ? rec.properties.route_id : features[0]?.properties.route_id ?? null);

      // Fetch traffic incidents around the midpoint of the journey
      const midLat = (start.latitude + end.latitude) / 2;
      const midLon = (start.longitude + end.longitude) / 2;
      try {
        const incidentGeoJson = await getTrafficIncidents(midLat, midLon, 10);
        setIncidents(incidentGeoJson?.features ?? []);
      } catch {
        setIncidents([]); // non-critical — map still works without incidents
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStart(null);
    setEnd(null);
    setRoutes([]);
    setSelectedRouteId(null);
    setIncidents([]);
    startRef.current?.clear();
    endRef.current?.clear();
  };

  // Build a GeoJSON FeatureCollection from routes for MapView
  const geojson = routes.length > 0
    ? { type: "FeatureCollection", features: routes }
    : null;

  return (
    <div className="mt-6 px-4">
      <h2 className="text-xl font-semibold mb-4 text-indigo-600">Route-Based Risk Planner</h2>

      {/* Desktop: map left 60% / sidebar right 40% | Mobile: stacked */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* Map */}
        <div className="flex-1 min-w-0">
          <MapView
            start={start}
            end={end}
            setStart={setStart}
            setEnd={setEnd}
            geojson={geojson}
            selectedRouteId={selectedRouteId}
            incidents={incidents}
            onRouteClick={setSelectedRouteId}
            onStartSelect={(address, coords) => {
              setStart(coords);
              startRef.current?.setAddress(address);
            }}
            onEndSelect={(address, coords) => {
              setEnd(coords);
              endRef.current?.setAddress(address);
            }}
          />
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-96 flex-shrink-0 flex flex-col gap-3">
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

          <div className="flex gap-2">
            <button
              className="flex-1 bg-indigo-600 text-white py-2 rounded font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              onClick={handlePredict}
              disabled={!start || !end || loading}
            >
              {loading ? "Calculating..." : "Predict Route Risk"}
            </button>
            <button
              className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>

          {!start && !end && (
            <p className="text-sm text-gray-400">
              Search for addresses above or click the map to drop start and end pins.
            </p>
          )}

          {/* Route list — only shown after prediction */}
          <RouteList
            routes={routes}
            selectedRouteId={selectedRouteId}
            onSelect={setSelectedRouteId}
          />

        </div>
      </div>

      {loading && <SpinnerPortal />}
    </div>
  );
};

export default RoutePlanner;
