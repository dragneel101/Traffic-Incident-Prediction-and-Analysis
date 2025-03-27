import React, { useState, useEffect } from "react";
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMapEvents,
  useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import RiskSegmentPopup from "./RiskSegmentPopup";

// ---------------------- 🔄 Reverse Geocode Helper ----------------------
const reverseGeocode = async (latitude, longitude) => {
  try {
    const res = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      params: { format: "json", lat: latitude, lon: longitude },
      headers: { "Accept-Language": "en" },
    });
    return res.data.display_name || "";
  } catch (err) {
    console.error(err);
    return "";
  }
};

// ---------------------- 🔍 Auto Fit Bounds ----------------------
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

// ---------------------- 🗺️ Zoom to Markers ----------------------
const FitToMarkers = ({ start, end }) => {
  const map = useMap();
  useEffect(() => {
    if (!start && !end) return;
    const bounds = L.latLngBounds([]);
    if (start) bounds.extend([start.latitude, start.longitude]);
    if (end) bounds.extend([end.latitude, end.longitude]);
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50] });
  }, [start, end]);
  return null;
};

// ---------------------- 📍 Icons ----------------------
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url),
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url),
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url),
});

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

// ---------------------- 🖱️ Click to Drop Start/End Markers ----------------------
const DualMarkerHandler = ({ start, end, setStart, setEnd, onStartSelect, onEndSelect }) => {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      const address = await reverseGeocode(lat, lng);

      if (!start) {
        setStart({ latitude: lat, longitude: lng });
        if (onStartSelect) onStartSelect(address, { latitude: lat, longitude: lng });
      } else if (!end) {
        setEnd({ latitude: lat, longitude: lng });
        if (onEndSelect) onEndSelect(address, { latitude: lat, longitude: lng });
      }
    },
  });
  return null;
};

// ---------------------- 🗺️ Main Component ----------------------
const MapView = ({ start, end, setStart, setEnd, geojson = null, onStartSelect, onEndSelect }) => {
  const center = start || end || { latitude: 43.65, longitude: -79.38 };

  // Risk level color mapping
  const getRiskLevel = (score) => {
    if (score < 0.3) return "low";
    if (score < 0.6) return "medium";
    return "high";
  };

  const RISK_COLORS = {
    low: "#4caf50",
    medium: "#ff9800",
    high: "#f44336"
  };

  // 🔥 Identify safest (lowest risk) route
  const mainRouteIndex =
    geojson?.features?.length > 0
      ? geojson.features.reduce((bestIdx, feature, idx, arr) =>
          feature.properties.risk_score < arr[bestIdx].properties.risk_score ? idx : bestIdx, 0)
      : -1;

  return (
    <div className="h-96 mt-6 rounded overflow-hidden shadow-md border">
      <MapContainer
        center={[center.latitude, center.longitude]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        {/* Map base tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {/* Dynamic map zooms */}
        <AutoFitBounds geojson={geojson} />
        <FitToMarkers start={start} end={end} />
        <DualMarkerHandler
          start={start}
          end={end}
          setStart={setStart}
          setEnd={setEnd}
          onStartSelect={onStartSelect}
          onEndSelect={onEndSelect}
        />

        {/* Start Marker */}
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

        {/* End Marker */}
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

        {/* 🚦 Render Routes with Risk Color + Main Highlight */}
        {geojson?.features?.map((feature, index) => {
          const risk = getRiskLevel(feature.properties.risk_score);
          const isMain = index === mainRouteIndex;

          return (
            <GeoJSON
              key={index}
              data={feature}
              style={{
                color: isMain ? RISK_COLORS[risk] : "#555555",
                weight: isMain ? 6 : 4,
                opacity: isMain ? 0.9 : 0.8,
                dashArray: null
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
