import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import MapView from "./MapView";
import AddressSearch from "./AddressSearch";
import SpinnerPortal from "./SpinnerPortal";
import RouteList from "./RouteList";
import { getMultipleRouteRisks, getTrafficIncidents } from "../api/predict";
import { getSavedLocations, shareRoute } from "../api/client";
import { getErrorMessage } from "../utils/errorMessages";
import { Navigation, RotateCcw, AlertTriangle, Share2, Bookmark, ChevronDown } from "lucide-react";

const RoutePlanner = () => {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [savedLocations, setSavedLocations] = useState([]);
  const [showStartDropdown, setShowStartDropdown] = useState(false);
  const [showEndDropdown, setShowEndDropdown] = useState(false);
  const startRef = useRef();
  const endRef = useRef();

  useEffect(() => {
    getSavedLocations()
      .then(setSavedLocations)
      .catch(() => {});
  }, []);

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

  const handleShare = async () => {
    if (routes.length === 0) return;
    setSharing(true);
    try {
      const startAddr = startRef.current?.getValue?.() || null;
      const endAddr = endRef.current?.getValue?.() || null;
      const result = await shareRoute({
        start_address: startAddr,
        end_address: endAddr,
        route_data: { type: "FeatureCollection", features: routes },
      });
      const shareUrl = `${window.location.origin}/shared/${result.token}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSharing(false);
    }
  };

  const applySavedLocation = (loc, target) => {
    const coords = { latitude: loc.lat, longitude: loc.lon };
    if (target === "start") {
      setStart(coords);
      startRef.current?.setAddress(loc.address);
      setShowStartDropdown(false);
    } else {
      setEnd(coords);
      endRef.current?.setAddress(loc.address);
      setShowEndDropdown(false);
    }
  };

  const geojson = routes.length > 0
    ? { type: "FeatureCollection", features: routes }
    : null;

  const canPredict = start && end && !loading;
  const canShare = routes.length > 0 && !sharing;

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
          <div className="flex-1 min-w-0 order-2 lg:order-1">
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
          <div className="w-full lg:w-96 flex-shrink-0 flex flex-col gap-3 order-1 lg:order-2">
            {/* Address inputs */}
            <div className="dark-card p-4 space-y-3">
              {/* Start address */}
              <div className="relative">
                <AddressSearch label="Start Address" onSelect={(coords) => setStart(coords)} ref={startRef} />
                {savedLocations.length > 0 && (
                  <div className="relative mt-1">
                    <button
                      type="button"
                      onClick={() => { setShowStartDropdown((v) => !v); setShowEndDropdown(false); }}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Bookmark className="w-3 h-3" />
                      Use saved location
                      <ChevronDown className={`w-3 h-3 transition-transform ${showStartDropdown ? "rotate-180" : ""}`} />
                    </button>
                    {showStartDropdown && (
                      <div className="absolute z-50 left-0 mt-1 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
                        {savedLocations.map((loc) => (
                          <button
                            key={loc.id}
                            type="button"
                            onClick={() => applySavedLocation(loc, "start")}
                            className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer"
                          >
                            <span className="font-medium">{loc.label}</span>
                            <span className="text-gray-600 text-xs block truncate">{loc.address}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* End address */}
              <div className="relative">
                <AddressSearch label="End Address" onSelect={(coords) => setEnd(coords)} ref={endRef} />
                {savedLocations.length > 0 && (
                  <div className="relative mt-1">
                    <button
                      type="button"
                      onClick={() => { setShowEndDropdown((v) => !v); setShowStartDropdown(false); }}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Bookmark className="w-3 h-3" />
                      Use saved location
                      <ChevronDown className={`w-3 h-3 transition-transform ${showEndDropdown ? "rotate-180" : ""}`} />
                    </button>
                    {showEndDropdown && (
                      <div className="absolute z-50 left-0 mt-1 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
                        {savedLocations.map((loc) => (
                          <button
                            key={loc.id}
                            type="button"
                            onClick={() => applySavedLocation(loc, "end")}
                            className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer"
                          >
                            <span className="font-medium">{loc.label}</span>
                            <span className="text-gray-600 text-xs block truncate">{loc.address}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

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

              {routes.length > 0 && (
                <button
                  onClick={handleShare}
                  disabled={!canShare}
                  className="w-full flex items-center justify-center gap-2 text-sm py-2 rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors duration-150 cursor-pointer disabled:opacity-50"
                >
                  <Share2 className="w-4 h-4" />
                  {sharing ? "Generating link..." : "Copy share link"}
                </button>
              )}

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
