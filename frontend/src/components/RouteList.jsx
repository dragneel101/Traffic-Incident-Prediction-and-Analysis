import React from "react";

const RISK_LABELS = [
  { max: 0.3,  label: "Low",    bg: "bg-green-100",  text: "text-green-800",  dot: "bg-green-500"  },
  { max: 0.6,  label: "Medium", bg: "bg-orange-100", text: "text-orange-800", dot: "bg-orange-500" },
  { max: Infinity, label: "High", bg: "bg-red-100",  text: "text-red-800",   dot: "bg-red-500"    },
];

function riskInfo(score) {
  return RISK_LABELS.find((r) => score < r.max);
}

export default function RouteList({ routes, selectedRouteId, onSelect }) {
  if (!routes || routes.length === 0) return null;

  return (
    <div className="space-y-3 mt-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        Route Options
      </h3>
      {routes.map((feature) => {
        const props = feature.properties;
        const id = props.route_id;
        const score = props.risk_score ?? 0;
        const isSelected = selectedRouteId === id;
        const isRec = props.is_recommended;
        const info = riskInfo(score);

        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`w-full text-left rounded-lg border-2 p-3 transition-all cursor-pointer
              ${isSelected
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50"
              }`}
          >
            {/* Header row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${info.dot}`} />
                <span className="font-medium text-gray-800 text-sm">
                  Route {id + 1}
                </span>
                {isRec && (
                  <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full font-medium">
                    Recommended
                  </span>
                )}
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${info.bg} ${info.text}`}>
                {info.label}
              </span>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>
                Risk: <strong className="text-gray-700">{(score * 100).toFixed(1)}%</strong>
              </span>
              {props.distance_km != null && (
                <span>
                  <strong className="text-gray-700">{props.distance_km} km</strong>
                </span>
              )}
              {props.duration_min != null && (
                <span>
                  <strong className="text-gray-700">{props.duration_min} min</strong>
                </span>
              )}
              {props.incident_count > 0 && (
                <span className="text-red-500">
                  {props.incident_count} incident{props.incident_count !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
