import React, { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  GeoJSON,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

// ── Marker icons ──────────────────────────────────────────────────────────────
const makeIcon = (color) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

const greenIcon = makeIcon("green");
const redIcon   = makeIcon("red");

// ── Helpers ───────────────────────────────────────────────────────────────────
const getRiskColor = (score) =>
  score < 0.3 ? "#16a34a" : score < 0.6 ? "#ea580c" : "#dc2626";

const getCongestionColor = (level) =>
  level < 0.25 ? "#16a34a" : level < 0.55 ? "#ca8a04" : "#dc2626";

const getCongestionLabel = (level) =>
  level < 0.25 ? "Light traffic" : level < 0.55 ? "Moderate traffic" : "Heavy traffic";

// Traffic-adjusted duration: congestion 0→no delay, 1→80% longer
const adjustedMin = (duration, congestion) =>
  Math.round(duration * (1 + (congestion ?? 0) * 0.8));

const formatMin = (min) =>
  min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}m` : `${min} min`;

// ── Incident meta ─────────────────────────────────────────────────────────────
const INCIDENT_META = {
  ACCIDENT:     { color: "#dc2626", bg: "#fef2f2", icon: "⚠",  label: "Accident"      },
  CONSTRUCTION: { color: "#d97706", bg: "#fffbeb", icon: "🚧", label: "Construction"   },
  ROAD_CLOSURE: { color: "#4b5563", bg: "#f3f4f6", icon: "🚫", label: "Road Closure"   },
  CONGESTION:   { color: "#b45309", bg: "#fef3c7", icon: "🚦", label: "Congestion"     },
};

// ── DivIcon factories ─────────────────────────────────────────────────────────
const createRouteLabelIcon = (props, isSelected) => {
  const dur   = props.duration_min ?? 0;
  const cong  = props.congestion_level ?? 0;
  const adj   = adjustedMin(dur, cong);
  const delay = adj - Math.round(dur);
  const riskC = getRiskColor(props.risk_score ?? 0);

  const bg     = isSelected ? "#1d4ed8" : "#ffffff";
  const fg     = isSelected ? "#ffffff" : "#111827";
  const border = isSelected ? "#1d4ed8" : "#d1d5db";
  const shadow = isSelected
    ? "0 3px 12px rgba(29,78,216,0.45)"
    : "0 2px 8px rgba(0,0,0,0.18)";

  const delayHtml = delay > 0
    ? `<span style="font-size:10px;opacity:0.75;margin-left:3px">(+${delay} min)</span>`
    : "";

  const dotHtml = `<span style="
    display:inline-block;width:8px;height:8px;border-radius:50%;
    background:${isSelected ? "#fff" : riskC};margin-right:5px;vertical-align:middle;
  "></span>`;

  const html = `
    <div style="
      background:${bg};color:${fg};border:2px solid ${border};
      border-radius:999px;padding:5px 12px;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      font-size:13px;font-weight:700;white-space:nowrap;
      box-shadow:${shadow};cursor:pointer;line-height:1.3;
      display:inline-flex;align-items:center;
    ">
      ${dotHtml}${formatMin(adj)}${delayHtml}
    </div>`;

  return L.divIcon({ html, className: "", iconAnchor: [50, 18] });
};

const createIncidentIcon = (type, severity) => {
  const meta = INCIDENT_META[type] ?? { color: "#6b7280", bg: "#f3f4f6", icon: "⚠", label: type };
  const size = 24 + (severity - 1) * 4;
  const html = `
    <div style="
      width:${size}px;height:${size}px;
      background:${meta.color};
      border:2.5px solid #fff;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:${Math.round(size * 0.52)}px;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
      cursor:pointer;
    ">${meta.icon}</div>`;
  return L.divIcon({ html, className: "", iconAnchor: [size / 2, size / 2] });
};

// ── Reverse geocode ───────────────────────────────────────────────────────────
const reverseGeocode = async (lat, lon) => {
  try {
    const res = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      params: { format: "json", lat, lon },
    });
    return res.data.display_name || "";
  } catch {
    return "";
  }
};

// ── Inner helpers ─────────────────────────────────────────────────────────────
const DualMarkerHandler = ({ start, end, setStart, setEnd, onStartSelect, onEndSelect }) => {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      if (!start) {
        const address = await reverseGeocode(lat, lng);
        setStart({ latitude: lat, longitude: lng });
        onStartSelect?.(address, { latitude: lat, longitude: lng });
      } else if (!end) {
        const address = await reverseGeocode(lat, lng);
        setEnd({ latitude: lat, longitude: lng });
        onEndSelect?.(address, { latitude: lat, longitude: lng });
      }
    },
  });
  return null;
};

const AutoFitBounds = ({ geojson }) => {
  const map = useMap();
  const fittedRef = useRef(null); // track which geojson we last fitted

  useEffect(() => {
    if (!geojson?.features?.length) {
      fittedRef.current = null;
      return;
    }
    // only fit if this is a new set of routes
    const key = geojson.features.map((f) => f.properties.route_id).join(",");
    if (fittedRef.current === key) return;
    fittedRef.current = key;

    const bounds = L.latLngBounds([]);
    geojson.features.forEach((f) =>
      f.geometry.coordinates.forEach(([lng, lat]) => bounds.extend([lat, lng]))
    );
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [60, 60] });
  }, [geojson, map]);
  return null;
};

const FitToMarkers = ({ start, end, hasRoutes }) => {
  const map = useMap();
  useEffect(() => {
    if (hasRoutes) return;
    const bounds = L.latLngBounds([]);
    if (start) bounds.extend([start.latitude, start.longitude]);
    if (end)   bounds.extend([end.latitude, end.longitude]);
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [80, 80] });
  }, [start, end, hasRoutes, map]);
  return null;
};

// ── Main component ────────────────────────────────────────────────────────────
const MapView = ({
  start, end, setStart, setEnd,
  geojson,
  selectedRouteId,
  incidents = [],
  onRouteClick,
  onStartSelect, onEndSelect,
}) => {
  const center   = start || end || { latitude: 43.65, longitude: -79.38 };
  const hasRoutes = Boolean(geojson?.features?.length);

  // Selected route data for the traffic strip
  const selectedFeature = geojson?.features?.find(
    (f) => f.properties.route_id === selectedRouteId
  );
  const selProps = selectedFeature?.properties;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-700/50 shadow-card"
         style={{ height: "600px" }}>

      {/* ── Traffic info strip (Google Maps style) ─────────────────────── */}
      {selProps && (
        <div className="absolute top-3 left-3 right-14 z-[999] pointer-events-none">
          <div className="inline-flex items-center gap-3 bg-gray-900/95 backdrop-blur-md border border-gray-700/50
                          rounded-xl shadow-lg px-4 py-2.5 text-sm pointer-events-auto">
            {/* Travel time */}
            <div>
              <span className="text-xl font-bold text-white">
                {formatMin(adjustedMin(selProps.duration_min, selProps.congestion_level))}
              </span>
              {selProps.congestion_level > 0.05 && (
                <span className="ml-1.5 text-xs text-gray-500 font-normal">
                  ({formatMin(Math.round(selProps.duration_min))} without traffic)
                </span>
              )}
            </div>

            <span className="text-gray-700">|</span>

            {/* Distance */}
            <span className="text-gray-300 font-medium">{selProps.distance_km} km</span>

            <span className="text-gray-700">|</span>

            {/* Traffic condition */}
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: getCongestionColor(selProps.congestion_level ?? 0) }}
              />
              <span
                className="text-xs font-semibold"
                style={{ color: getCongestionColor(selProps.congestion_level ?? 0) }}
              >
                {getCongestionLabel(selProps.congestion_level ?? 0)}
              </span>
            </div>

            {/* Incident count */}
            {selProps.incident_count > 0 && (
              <>
                <span className="text-gray-700">|</span>
                <span className="text-xs font-semibold text-red-400">
                  ⚠ {selProps.incident_count} incident{selProps.incident_count !== 1 ? "s" : ""}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      <MapContainer
        center={[center.latitude, center.longitude]}
        zoom={13}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        {/* Base map */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />

        <AutoFitBounds geojson={geojson} />
        <FitToMarkers start={start} end={end} hasRoutes={hasRoutes} />
        <DualMarkerHandler {...{ start, end, setStart, setEnd, onStartSelect, onEndSelect }} />

        {/* ── Routes — non-selected beneath, selected on top ── */}
        {geojson?.features
          ?.slice()
          .sort((a, b) => {
            const aS = a.properties.route_id === selectedRouteId;
            const bS = b.properties.route_id === selectedRouteId;
            return aS ? 1 : bS ? -1 : 0;
          })
          .map((feature) => {
            const props      = feature.properties;
            const id         = props.route_id;
            const isSelected = id === selectedRouteId;
            const score      = props.risk_score ?? 0;
            const cong       = props.congestion_level ?? 0;
            const isRec      = props.is_recommended;

            // All routes show their own risk colour so the map communicates danger at a glance.
            // Selected route is bold/solid; others are dimmed but still coloured.
            const routeColor = getRiskColor(score);
            let color, weight, opacity, dashArray;
            if (isSelected) {
              color     = routeColor;
              weight    = 7;
              opacity   = 1.0;
              dashArray = null;
            } else {
              color     = routeColor;
              weight    = 4;
              opacity   = 0.35;
              dashArray = "8 5";
            }

            return (
              <GeoJSON
                key={`route-${id}-${selectedRouteId}`}
                data={feature}
                style={{ color, weight, opacity, dashArray, lineCap: "round", lineJoin: "round" }}
                onEachFeature={(_, layer) => {
                  // Hover highlight (pure Leaflet — no React re-render)
                  layer.on("mouseover", function () {
                    if (!isSelected) this.setStyle({ weight: 6, opacity: 0.75, color: routeColor });
                    layer.bindTooltip(
                      `<b>Route ${id + 1}</b> · ${formatMin(adjustedMin(props.duration_min, cong))} · ${props.distance_km} km`,
                      { sticky: true, className: "leaflet-route-tooltip" }
                    ).openTooltip();
                  });
                  layer.on("mouseout", function () {
                    if (!isSelected) this.setStyle({ weight, opacity, color, dashArray });
                    layer.closeTooltip();
                  });
                  layer.on("click", () => onRouteClick?.(id));

                  // Click popup
                  layer.bindPopup(`
                    <div style="min-width:180px;font-family:Inter,-apple-system,sans-serif">
                      <div style="font-weight:700;font-size:13px;margin-bottom:8px;color:#F9FAFB">
                        ${isRec ? '<span style="color:#60A5FA;font-size:11px;margin-right:4px">✓ Recommended</span>' : ""}Route ${id + 1}
                      </div>
                      <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px 12px;font-size:11px;color:#9CA3AF">
                        <span>${formatMin(adjustedMin(props.duration_min, cong))}</span>
                        <span>${props.distance_km} km</span>
                        <span style="color:${getRiskColor(score)}">Risk ${(score * 100).toFixed(0)}%</span>
                        <span style="color:${getCongestionColor(cong)}">${getCongestionLabel(cong)}</span>
                        ${props.incident_count > 0 ? `<span style="color:#F87171;grid-column:span 2">${props.incident_count} incident${props.incident_count !== 1 ? "s" : ""}</span>` : ""}
                      </div>
                    </div>
                  `);
                }}
              />
            );
          })}

        {/* ── Active route time label only ── */}
        {geojson?.features?.map((feature) => {
          const props      = feature.properties;
          const id         = props.route_id;
          const isSelected = id === selectedRouteId;
          if (!isSelected) return null; // label only on the active route

          const coords = feature.geometry.coordinates;
          if (!coords?.length) return null;
          const mid = coords[Math.floor(coords.length / 2)];
          const [lng, lat] = mid;

          return (
            <Marker
              key={`label-${id}-${selectedRouteId}`}
              position={[lat, lng]}
              icon={createRouteLabelIcon(props, true)}
              zIndexOffset={500}
            />
          );
        })}

        {/* ── Traffic incident markers ── */}
        {incidents.map((inc, i) => {
          let lat, lng;
          if (inc.geometry?.coordinates) {
            [lng, lat] = inc.geometry.coordinates;
          } else if (inc.lat != null && inc.lon != null) {
            lat = inc.lat;
            lng = inc.lon;
          } else {
            return null;
          }
          if (!lat || !lng) return null;

          const props    = inc.properties ?? inc;
          const type     = props.type ?? "UNKNOWN";
          const severity = props.severity ?? 1;
          const meta     = INCIDENT_META[type] ?? INCIDENT_META.ACCIDENT;
          const size     = 24 + (severity - 1) * 4;

          return (
            <Marker
              key={`inc-${i}`}
              position={[lat, lng]}
              icon={createIncidentIcon(type, severity)}
              zIndexOffset={100}
            >
              <Popup>
                <div style={{ fontFamily: "-apple-system,sans-serif", minWidth: "160px" }}>
                  <div style={{
                    background: meta.bg, border: `1px solid ${meta.color}`,
                    borderRadius: "6px", padding: "6px 10px", marginBottom: "8px",
                    display: "flex", alignItems: "center", gap: "6px",
                  }}>
                    <span style={{ fontSize: "16px" }}>{meta.icon}</span>
                    <strong style={{ color: meta.color, fontSize: "13px" }}>{meta.label}</strong>
                  </div>
                  {props.description && (
                    <p style={{ fontSize: "12px", color: "#374151", margin: "0 0 6px" }}>
                      {props.description}
                    </p>
                  )}
                  <div style={{ fontSize: "11px", color: "#6b7280", display: "flex", gap: "8px" }}>
                    <span>Severity: {"●".repeat(severity)}{"○".repeat(Math.max(0, 4 - severity))}</span>
                    {props.start_time && (
                      <span>Since {new Date(props.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* ── Start / End markers ── */}
        {start && (
          <Marker
            position={[start.latitude, start.longitude]}
            draggable
            icon={greenIcon}
            zIndexOffset={1000}
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                setStart({ latitude: lat, longitude: lng });
              },
            }}
          >
            <Tooltip permanent direction="top" offset={[0, -30]}>
              <strong>Start</strong>
            </Tooltip>
          </Marker>
        )}

        {end && (
          <Marker
            position={[end.latitude, end.longitude]}
            draggable
            icon={redIcon}
            zIndexOffset={1000}
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                setEnd({ latitude: lat, longitude: lng });
              },
            }}
          >
            <Tooltip permanent direction="top" offset={[0, -30]}>
              <strong>End</strong>
            </Tooltip>
          </Marker>
        )}
      </MapContainer>

      {/* ── Incident legend overlay ── */}
      {incidents.length > 0 && (
        <div className="absolute bottom-8 left-3 z-[999] bg-gray-900/95 backdrop-blur-sm border border-gray-700/50
                        rounded-xl shadow-lg px-3 py-2.5 text-xs space-y-1.5">
          <p className="font-semibold text-gray-500 uppercase tracking-wide text-[10px] mb-1.5">
            Live Traffic
          </p>
          {Object.entries(INCIDENT_META).map(([type, meta]) => {
            const count = incidents.filter(
              (i) => (i.properties?.type ?? i.type) === type
            ).length;
            if (!count) return null;
            return (
              <div key={type} className="flex items-center gap-2">
                <span className="text-sm leading-none">{meta.icon}</span>
                <span className="text-gray-300">{meta.label}</span>
                <span className="ml-auto font-bold font-mono" style={{ color: meta.color }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Risk legend ── */}
      {hasRoutes && (
        <div className="absolute bottom-8 right-3 z-[999] bg-gray-900/95 backdrop-blur-sm border border-gray-700/50
                        rounded-xl shadow-lg px-3 py-2.5 text-xs space-y-1.5">
          <p className="font-semibold text-gray-500 uppercase tracking-wide text-[10px] mb-1.5">
            Risk Level
          </p>
          {[
            { color: "#10B981", label: "Low",      hint: "< 30%" },
            { color: "#F59E0B", label: "Moderate", hint: "30–60%" },
            { color: "#EF4444", label: "High",     hint: "> 60%" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }} />
              <span className="text-gray-300">{item.label}</span>
              <span className="ml-auto text-gray-600">{item.hint}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapView;
