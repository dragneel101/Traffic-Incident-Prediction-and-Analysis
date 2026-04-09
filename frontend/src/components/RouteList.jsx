import React from "react";

// Position-based labels after sorting safest-first
const positionLabel = (index) =>
  index === 0 ? "Safest Route" : `Alternative ${index + 1}`;

const RISK_META = [
  { max: 0.3,       color: "#16a34a", bg: "#f0fdf4", label: "Low risk"    },
  { max: 0.6,       color: "#ea580c", bg: "#fff7ed", label: "Moderate"    },
  { max: Infinity,  color: "#dc2626", bg: "#fef2f2", label: "High risk"   },
];

const CONGESTION_META = [
  { max: 0.25, color: "#16a34a", width: "25%",  label: "Light traffic"    },
  { max: 0.55, color: "#ca8a04", width: "55%",  label: "Moderate traffic" },
  { max: 1.01, color: "#dc2626", width: "90%",  label: "Heavy traffic"    },
];

function riskInfo(score) {
  return RISK_META.find((r) => score < r.max);
}

function congestionInfo(level) {
  return CONGESTION_META.find((c) => level < c.max) ?? CONGESTION_META[2];
}

// Traffic-adjusted duration
function adjustedMin(duration, congestion) {
  return Math.round(duration * (1 + (congestion ?? 0) * 0.8));
}

function formatMin(min) {
  if (!min) return "—";
  return min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}m` : `${min} min`;
}

export default function RouteList({ routes, selectedRouteId, onSelect }) {
  if (!routes || routes.length === 0) return null;

  // Safest (lowest risk_score) first
  const sorted = [...routes].sort(
    (a, b) => (a.properties.risk_score ?? 0) - (b.properties.risk_score ?? 0)
  );

  return (
    <div className="space-y-2 mt-3">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">
        Route Options
      </h3>

      {sorted.map((feature) => {
        const props    = feature.properties;
        const id       = props.route_id;
        const score    = props.risk_score ?? 0;
        const cong     = props.congestion_level ?? 0;
        const isSelected = selectedRouteId === id;
        const isRec    = props.is_recommended;
        const risk     = riskInfo(score);
        const congMeta = congestionInfo(cong);
        const rawMin   = Math.round(props.duration_min ?? 0);
        const adjMin   = adjustedMin(props.duration_min ?? 0, cong);
        const delay    = adjMin - rawMin;
        const sortedIndex = sorted.indexOf(feature);
        const routeLabel  = positionLabel(sortedIndex);

        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`w-full text-left rounded-xl border-2 transition-all duration-150 overflow-hidden
              ${isSelected
                ? "border-blue-500 shadow-md"
                : "border-gray-200 hover:border-blue-300 hover:shadow-sm bg-white"
              }`}
          >
            {/* Coloured top bar for selected */}
            {isSelected && (
              <div
                className="h-1 w-full"
                style={{ backgroundColor: risk.color }}
              />
            )}

            <div className={`p-3 ${isSelected ? "bg-blue-50" : "bg-white"}`}>
              {/* Header row */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center flex-wrap gap-1.5">
                  <span className={`text-sm font-bold ${isSelected ? "text-blue-700" : "text-gray-800"}`}>
                    {routeLabel}
                  </span>
                  {isRec && (
                    <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                      Recommended
                    </span>
                  )}
                </div>

                {/* Risk badge */}
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: risk.bg, color: risk.color }}
                >
                  {risk.label}
                </span>
              </div>

              {/* Time row — primary info */}
              <div className="flex items-baseline gap-2 mb-2">
                <span
                  className="text-2xl font-bold leading-none"
                  style={{ color: isSelected ? "#1d4ed8" : "#111827" }}
                >
                  {formatMin(adjMin)}
                </span>
                {delay > 0 && (
                  <span className="text-xs text-red-500 font-semibold">
                    +{delay} min traffic
                  </span>
                )}
                {delay === 0 && (
                  <span className="text-xs text-green-600 font-semibold">
                    No delay
                  </span>
                )}
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-2.5">
                {props.distance_km != null && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {props.distance_km} km
                  </span>
                )}
                {rawMin > 0 && (
                  <span className="text-gray-400">
                    {formatMin(rawMin)} est.
                  </span>
                )}
                {props.incident_count > 0 && (
                  <span className="flex items-center gap-1 text-red-500 font-semibold ml-auto">
                    ⚠ {props.incident_count} incident{props.incident_count !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Risk score bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                    Collision Risk
                  </span>
                  <span
                    className="text-[10px] font-bold tabular-nums"
                    style={{ color: risk.color }}
                  >
                    {(score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(score * 100).toFixed(1)}%`,
                      backgroundColor: risk.color,
                      minWidth: score > 0 ? "4px" : "0",
                    }}
                  />
                </div>
              </div>

              {/* Traffic congestion bar */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                    Traffic
                  </span>
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: congMeta.color }}
                  >
                    {congMeta.label}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round(cong * 100)}%`,
                      backgroundColor: congMeta.color,
                      minWidth: cong > 0 ? "4px" : "0",
                    }}
                  />
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
