import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  GeoJSON,
  CircleMarker,
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

// ── Risk colour helpers ────────────────────────────────────────────────────────
// Thresholds match RouteList and RiskLegend exactly
const getRiskColor = (score) =>
  score < 0.3 ? "#4caf50" : score < 0.6 ? "#ff9800" : "#f44336";

// ── Incident colours ──────────────────────────────────────────────────────────
const INCIDENT_COLORS = {
  ACCIDENT:      "#f44336",
  CONSTRUCTION:  "#ff9800",
  ROAD_CLOSURE:  "#9e9e9e",
  CONGESTION:    "#ff5722",
};

// ── Reverse geocode via Nominatim ─────────────────────────────────────────────
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

// ── Inner map components ──────────────────────────────────────────────────────
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
  useEffect(() => {
    if (!geojson?.features?.length) return;
    const bounds = L.latLngBounds([]);
    geojson.features.forEach((f) =>
      f.geometry.coordinates.forEach(([lng, lat]) => bounds.extend([lat, lng]))
    );
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50] });
  }, [geojson, map]);
  return null;
};

const FitToMarkers = ({ start, end }) => {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds([]);
    if (start) bounds.extend([start.latitude, start.longitude]);
    if (end)   bounds.extend([end.latitude, end.longitude]);
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50] });
  }, [start, end, map]);
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
  const center = start || end || { latitude: 43.65, longitude: -79.38 };
  const [showTraffic, setShowTraffic] = useState(true);

  return (
    <div className="relative rounded shadow-md border" style={{ height: "600px" }}>
      {/* Traffic layer toggle */}
      <div className="absolute top-3 right-3 z-[999]">
        <button
          onClick={() => setShowTraffic((v) => !v)}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded shadow hover:bg-blue-700"
        >
          {showTraffic ? "Hide Traffic" : "Show Traffic"}
        </button>
      </div>

      <MapContainer
        center={[center.latitude, center.longitude]}
        zoom={13}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          attribution="© OpenStreetMap, © CartoDB"
        />

        {showTraffic && (
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=h,traffic&x={x}&y={y}&z={z}"
            attribution="Traffic data © Google"
            opacity={0.7}
          />
        )}

        <AutoFitBounds geojson={geojson} />
        <FitToMarkers start={start} end={end} />
        <DualMarkerHandler {...{ start, end, setStart, setEnd, onStartSelect, onEndSelect }} />

        {/* Start marker */}
        {start && (
          <Marker
            position={[start.latitude, start.longitude]}
            draggable
            icon={greenIcon}
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

        {/* End marker */}
        {end && (
          <Marker
            position={[end.latitude, end.longitude]}
            draggable
            icon={redIcon}
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

        {/* Routes */}
        {geojson?.features?.map((feature) => {
          const props = feature.properties;
          const id = props.route_id;
          const isSelected = id === selectedRouteId;
          const isRec = props.is_recommended;
          const score = props.risk_score ?? 0;

          let color, weight, opacity;
          if (isRec || isSelected) {
            color  = getRiskColor(score);
            weight = isRec ? 6 : 5;
            opacity = 0.9;
          } else {
            color  = "#9e9e9e";
            weight = 2;
            opacity = 0.4;
          }

          return (
            <GeoJSON
              key={`${id}-${selectedRouteId}`}
              data={feature}
              style={{ color, weight, opacity }}
              onEachFeature={(_, layer) => {
                layer.bindPopup(`
                  <b>${isRec ? "✓ Recommended — " : ""}Route ${id + 1}</b><br/>
                  Risk: <b>${(score * 100).toFixed(1)}%</b><br/>
                  ${props.distance_km != null ? `Distance: <b>${props.distance_km} km</b><br/>` : ""}
                  ${props.duration_min != null ? `Duration: <b>${props.duration_min} min</b><br/>` : ""}
                  ${props.incident_count > 0 ? `Incidents: <b>${props.incident_count}</b>` : ""}
                `);
                layer.on("click", () => onRouteClick?.(id));
              }}
            />
          );
        })}

        {/* Traffic incident markers */}
        {incidents.map((inc, i) => {
          const { lat, lon: lng } = inc.geometry
            ? {
                lat: inc.geometry.coordinates[1],
                lon: inc.geometry.coordinates[0],
              }
            : { lat: 0, lon: 0 };

          const props = inc.properties ?? {};
          const color = INCIDENT_COLORS[props.type] ?? "#9e9e9e";
          const severityRadius = 6 + (props.severity ?? 1) * 2;

          return (
            <CircleMarker
              key={i}
              center={[lat, lng]}
              radius={severityRadius}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.8, weight: 1 }}
            >
              <Popup>
                <strong>{props.type?.replace("_", " ") ?? "Incident"}</strong><br />
                {props.description}<br />
                {props.start_time && (
                  <span className="text-xs text-gray-500">
                    Reported: {new Date(props.start_time).toLocaleTimeString()}
                  </span>
                )}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
