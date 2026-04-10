import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Share2, MapPin, AlertTriangle, Clock } from "lucide-react";
import MapView from "../components/MapView";
import RouteList from "../components/RouteList";
import Skeleton from "../components/ui/Skeleton";
import { getSharedRoute } from "../api/client";

const SharedRoute = () => {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getSharedRoute(token);
        setData(result);
        const rec = result.route_data?.features?.find((f) => f.properties?.is_recommended);
        const first = result.route_data?.features?.[0];
        setSelectedRouteId(rec?.properties?.route_id ?? first?.properties?.route_id ?? null);
      } catch (err) {
        const status = err.response?.status;
        if (status === 404) setError("This shared route link does not exist.");
        else if (status === 410) setError("This shared route link has expired.");
        else setError("Failed to load shared route.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-10 px-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <Skeleton className="h-10 w-80 bg-gray-800" />
          <Skeleton className="h-[500px] rounded-2xl bg-gray-800" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 pb-10 px-4 flex items-center justify-center">
        <div className="dark-card p-10 text-center max-w-sm">
          <AlertTriangle className="w-8 h-8 text-orange-400 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">Route unavailable</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <Link to="/" className="btn-primary text-sm px-5 py-2 mt-5 inline-block">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const features = data.route_data?.features ?? [];
  const geojson = features.length > 0 ? data.route_data : null;

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-400" />
            Shared Route
          </h1>
          {(data.start_address || data.end_address) && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 flex-wrap">
              {data.start_address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {data.start_address}
                </span>
              )}
              {data.start_address && data.end_address && (
                <span className="text-gray-700">→</span>
              )}
              {data.end_address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  {data.end_address}
                </span>
              )}
            </div>
          )}
          {data.expires_at && (
            <p className="text-xs text-gray-700 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Expires {new Date(data.expires_at).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 min-w-0">
            <MapView
              geojson={geojson}
              selectedRouteId={selectedRouteId}
              incidents={[]}
              onRouteClick={setSelectedRouteId}
              setStart={() => {}}
              setEnd={() => {}}
            />
          </div>
          <div className="w-full lg:w-96 flex-shrink-0">
            <RouteList
              routes={features}
              selectedRouteId={selectedRouteId}
              onSelect={setSelectedRouteId}
            />
            <div className="mt-4 text-center">
              <Link to="/route-planner" className="btn-primary text-sm px-5 py-2 inline-block">
                Plan Your Own Route
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedRoute;
