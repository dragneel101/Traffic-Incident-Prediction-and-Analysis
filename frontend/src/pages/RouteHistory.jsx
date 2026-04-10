import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { History, MapPin, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { getRouteHistory } from "../api/client";
import { getErrorMessage } from "../utils/errorMessages";
import Skeleton from "../components/ui/Skeleton";

const PAGE_SIZE = 10;

const RISK_META = [
  { max: 30,       color: "#10B981", label: "Low"      },
  { max: 60,       color: "#F59E0B", label: "Moderate" },
  { max: Infinity, color: "#EF4444", label: "High"     },
];

function riskInfo(score) {
  return RISK_META.find((r) => score < r.max) ?? RISK_META[2];
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const RouteHistory = () => {
  const [data, setData] = useState({ total: 0, items: [] });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p) => {
    setLoading(true);
    try {
      const result = await getRouteHistory(PAGE_SIZE, p * PAGE_SIZE);
      setData(result);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  const totalPages = Math.ceil(data.total / PAGE_SIZE);

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            Route History
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            All your past route risk predictions.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl bg-gray-800" />
            ))}
          </div>
        ) : data.items.length === 0 ? (
          <div className="dark-card p-10 text-center">
            <History className="w-8 h-8 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No route predictions yet.</p>
            <p className="text-gray-600 text-xs mt-1">Head to the Route Planner to get started.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-4">
              {data.items.map((item) => {
                const risk = item.collision_risk != null ? riskInfo(item.collision_risk) : null;
                return (
                  <div key={item.id} className="dark-card px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MapPin className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {item.start_address || item.start_location || "Unknown"}
                          </p>
                          <p className="text-gray-500 text-xs truncate">
                            to {item.end_address || item.end_location || "Unknown"}
                          </p>
                          <p className="text-gray-700 text-xs mt-1">{formatDate(item.timestamp)}</p>
                        </div>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        {risk ? (
                          <>
                            <p
                              className="text-sm font-bold font-mono"
                              style={{ color: risk.color }}
                            >
                              {item.collision_risk.toFixed(1)}%
                            </p>
                            <p className="text-xs" style={{ color: risk.color }}>
                              {risk.label} risk
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-gray-600">—</p>
                        )}
                        {item.incident_count > 0 && (
                          <p className="text-xs text-orange-400 flex items-center gap-1 justify-end mt-1">
                            <AlertTriangle className="w-3 h-3" />
                            {item.incident_count} incident{item.incident_count !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600">
                  {data.total} total · page {page + 1} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 0}
                    className="btn-secondary flex items-center gap-1 text-sm px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages - 1}
                    className="btn-secondary flex items-center gap-1 text-sm px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RouteHistory;
