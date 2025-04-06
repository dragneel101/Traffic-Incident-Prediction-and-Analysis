import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  GeoJSON,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import RiskSegmentPopup from "./RiskSegmentPopup";

// Icons
const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Reverse geocode
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

// Marker click logic
const DualMarkerHandler = ({ start, end, setStart, setEnd, onStartSelect, onEndSelect }) => {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      const address = await reverseGeocode(lat, lng);
      if (!start) {
        setStart({ latitude: lat, longitude: lng });
        onStartSelect?.(address, { latitude: lat, longitude: lng });
      } else if (!end) {
        setEnd({ latitude: lat, longitude: lng });
        onEndSelect?.(address, { latitude: lat, longitude: lng });
      }
    },
  });
  return null;
};

// Bounds handlers
const AutoFitBounds = ({ geojson }) => {
  const map = useMap();
  useEffect(() => {
    if (!geojson?.features?.length) return;
    const bounds = L.latLngBounds([]);
    geojson.features.forEach((f) =>
      f.geometry.coordinates.forEach(([lng, lat]) => bounds.extend([lat, lng]))
    );
    bounds.isValid() && map.fitBounds(bounds, { padding: [50, 50] });
  }, [geojson, map]);
  return null;
};

const FitToMarkers = ({ start, end }) => {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds([]);
    if (start) bounds.extend([start.latitude, start.longitude]);
    if (end) bounds.extend([end.latitude, end.longitude]);
    bounds.isValid() && map.fitBounds(bounds, { padding: [50, 50] });
  }, [start, end]);
  return null;
};

const getRiskLevel = (score) => (score < 0.3 ? "low" : score < 0.6 ? "medium" : "high");
const RISK_COLORS = { low: "#4caf50", medium: "#ff9800", high: "#f44336" };

const MapView = ({ start, end, setStart, setEnd, geojson, onStartSelect, onEndSelect }) => {
  const center = start || end || { latitude: 43.65, longitude: -79.38 };
  const [showTraffic, setShowTraffic] = useState(true);

  const mainRouteIndex =
    geojson?.features?.reduce((bestIdx, feature, idx, arr) =>
      feature.properties.risk_score < arr[bestIdx].properties.risk_score ? idx : bestIdx, 0) ?? -1;

  return (
    <div className="relative mt-6 rounded shadow-md border h-[600px]"> {/* Increased height */}
      {/* Toggle Button */}
      <div className="absolute top-3 right-3 z-[999]">
        <button
          onClick={() => setShowTraffic((prev) => !prev)}
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
        {/* Optional: comment out OSM base
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /> */}

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          attribution='©OpenStreetMap, ©CartoDB'
        />

        {showTraffic && (
          <TileLayer
            url="https://mt1.google.com/vt/lyrs=h,traffic&x={x}&y={y}&z={z}"
            attribution="Traffic data © Google"
            opacity={0.8}
          />
        )}

        <AutoFitBounds geojson={geojson} />
        <FitToMarkers start={start} end={end} />
        <DualMarkerHandler {...{ start, end, setStart, setEnd, onStartSelect, onEndSelect }} />

        {/* Markers */}
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
        {geojson?.features?.map((feature, index) => {
          const risk = getRiskLevel(feature.properties.risk_score);
          const isMain = index === mainRouteIndex;
          return (
            <GeoJSON
              key={index}
              data={feature}
              style={{
                color: isMain ? RISK_COLORS[risk] : "#555",
                weight: isMain ? 6 : 4,
                opacity: isMain ? 0.9 : 0.6,
              }}
              onEachFeature={(feature, layer) => {
                const props = feature.properties;
                layer.bindPopup(`
                  <b>Route ${props.route_id}</b><br>
                  Risk Score: ${props.risk_score}<br>
                  Distance: ${(props.distance / 1000).toFixed(2)} km<br>
                  Duration: ${(props.duration / 60).toFixed(1)} min
                `);
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
