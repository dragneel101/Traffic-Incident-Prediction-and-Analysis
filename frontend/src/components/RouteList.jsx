import React from "react";
import { Clock, MapPin, AlertTriangle } from "lucide-react";

const positionLabel = (index) =>
  index === 0 ? "Safest Route" : `Alternative ${index + 1}`;

const RISK_META = [
  { max: 0.3,      color: "#10B981", bg: "rgba(16,185,129,0.1)", label: "Low risk"  },
  { max: 0.6,      color: "#F59E0B", bg: "rgba(245,158,11,0.1)", label: "Moderate"  },
  { max: Infinity, color: "#EF4444", bg: "rgba(239,68,68,0.1)",  label: "High risk" },
];

const CONGESTION_META = [
  { max: 0.25, color: "#10B981", label: "Light traffic"    },
  { max: 0.55, color: "#F59E0B", label: "Moderate traffic" },
  { max: 1.01, color: "#EF4444", label: "Heavy traffic"    },
];

function riskInfo(score) {
  return RISK_META.find((r) => score < r.max);
}

function congestionInfo(level) {
  return CONGESTION_META.find((c) => level < c.max) ?? CONGESTION_META[2];
}

function adjustedMin(duration, congestion) {
  return Math.round(duration * (1 + (congestion ?? 0) * 0.8));
}

function formatMin(min) {
  if (!min) return "—";
  return min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}m` : `${min} min`;
}

export default function RouteList({ routes, selectedRouteId, onSelect }) {
  if (!routes || routes.length === 0) return null;

  const sorted = [...routes].sort(
    (a, b) => (a.properties.risk_score ?? 0) - (b.properties.risk_score ?? 0)
  );

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-1">
        Route Options
      </p>

      {sorted.map((feature, sortedIndex) => {
        const props = feature.properties;
        const id = props.route_id;
        const score = props.risk_score ?? 0;
        const cong = props.congestion_level ?? 0;
        const isSelected = selectedRouteId === id;
        const isRec = props.is_recommended;
        const risk = riskInfo(score);
        const congMeta = congestionInfo(cong);
        const rawMin = Math.round(props.duration_min ?? 0);
        const adjMin = adjustedMin(props.duration_min ?? 0, cong);
        const delay = adjMin - rawMin;
        const routeLabel = positionLabel(sortedIndex);

        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`w-full text-left rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer ${
              isSelected
                ? "border-blue-500 bg-gray-800/80 shadow-glow-blue"
                : "border-gray-700/50 bg-gray-900 hover:border-gray-600 hover:bg-gray-800/60"
            }`}
          >
            {/* Top accent bar */}
            <div
              className="h-0.5 w-full transition-all duration-300"
              style={{ backgroundColor: isSelected ? risk.color : "transparent" }}
            />

            <div className="p-4">
              {/* Header row */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center flex-wrap gap-2">
                  <span className={`text-sm font-bold ${isSelected ? "text-white" : "text-gray-300"}`}>
                    {routeLabel}
                  </span>
                  {isRec && (
                    <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full uppercase tracking-wide">
                      Recommended
                    </span>
                  )}
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 border"
                  style={{ color: risk.color, backgroundColor: risk.bg, borderColor: `${risk.color}40` }}
                >
                  {risk.label}
                </span>
              </div>

              {/* Time */}
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-bold text-white font-mono leading-none">
                  {formatMin(adjMin)}
                </span>
                {delay > 0 ? (
                  <span className="text-xs text-orange-400 font-semibold">+{delay} min traffic</span>
                ) : (
                  <span className="text-xs text-emerald-400 font-semibold">No delay</span>
                )}
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                {props.distance_km != null && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {props.distance_km} km
                  </span>
                )}
                {rawMin > 0 && (
                  <span className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-3 h-3" />
                    {formatMin(rawMin)} est.
                  </span>
                )}
                {props.incident_count > 0 && (
                  <span className="flex items-center gap-1 text-red-400 font-semibold ml-auto">
                    <AlertTriangle className="w-3 h-3" />
                    {props.incident_count} incident{props.incident_count !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Risk bar */}
              <div className="mb-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                    Collision Risk
                  </span>
                  <span className="text-[10px] font-bold font-mono" style={{ color: risk.color }}>
                    {(score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
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

              {/* Traffic bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                    Traffic
                  </span>
                  <span className="text-[10px] font-semibold" style={{ color: congMeta.color }}>
                    {congMeta.label}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
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
