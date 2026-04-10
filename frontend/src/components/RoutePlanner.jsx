import React, { useState, useRef } from "react";
import { toast } from "react-toastify";
import MapView from "./MapView";
import AddressSearch from "./AddressSearch";
import SpinnerPortal from "./SpinnerPortal";
import RouteList from "./RouteList";
import { getMultipleRouteRisks, getTrafficIncidents } from "../api/predict";
import { getErrorMessage } from "../utils/errorMessages";
import { Navigation, RotateCcw, AlertTriangle } from "lucide-react";

const RoutePlanner = () => {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [incidents, setIncidents] = useState([]);
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

      const rec = features.find((f) => f.properties.is_recommended);
      setSelectedRouteId(rec ? rec.properties.route_id : features[0]?.properties.route_id ?? null);

      const midLat = (start.latitude + end.latitude) / 2;
      const midLon = (start.longitude + end.longitude) / 2;
      try {
        const incidentGeoJson = await getTrafficIncidents(midLat, midLon, 10);
        setIncidents(incidentGeoJson?.features ?? []);
      } catch {
        setIncidents([]);
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

  const geojson = routes.length > 0
    ? { type: "FeatureCollection", features: routes }
    : null;

  const canPredict = start && end && !loading;

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-400" />
            Route Risk Planner
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Search addresses or click the map to set start and end points.
          </p>
        </div>

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
            {/* Address inputs */}
            <div className="dark-card p-4 space-y-3">
              <AddressSearch label="Start Address" onSelect={(coords) => setStart(coords)} ref={startRef} />
              <AddressSearch label="End Address" onSelect={(coords) => setEnd(coords)} ref={endRef} />

              <div className="flex gap-2 pt-1">
                <button
                  className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2.5"
                  onClick={handlePredict}
                  disabled={!canPredict}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      Predict Route Risk
                    </>
                  )}
                </button>
                <button
                  className="btn-secondary flex items-center gap-2 text-sm px-3 py-2.5"
                  onClick={handleReset}
                  aria-label="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {!start && !end && (
                <div className="flex items-start gap-2 text-xs text-gray-600 pt-1">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>Search for addresses above or click the map to drop start and end pins.</span>
                </div>
              )}
            </div>

            {/* Route list */}
            <RouteList
              routes={routes}
              selectedRouteId={selectedRouteId}
              onSelect={setSelectedRouteId}
            />
          </div>
        </div>
      </div>

      {loading && <SpinnerPortal />}
    </div>
  );
};

export default RoutePlanner;
