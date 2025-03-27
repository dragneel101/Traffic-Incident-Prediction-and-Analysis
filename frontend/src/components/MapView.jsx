import React, { 
  useState,
  useEffect
 } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  Tooltip,
  useMapEvents,
  useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import RiskSegmentPopup from "./RiskSegmentPopup";

//reverse geo-code
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

//to zoom into bounds
const AutoFitBounds = ({ segments }) => {
  const map = useMap();

  useEffect(() => {
    if (!segments || segments.length === 0) return;

    const bounds = L.latLngBounds([]);

    segments.forEach(seg => {
      bounds.extend([seg.segment_start.latitude, seg.segment_start.longitude]);
      bounds.extend([seg.segment_end.latitude, seg.segment_end.longitude]);
    });

    map.fitBounds(bounds, { padding: [50, 50] });
  }, [segments, map]);

  return null;
};


//zoom to bounds when markers are placed
const FitToMarkers = ({ start, end }) => {
  const map = useMap();

  useEffect(() => {
    if (!start && !end) return;

    const bounds = L.latLngBounds([]);

    if (start) bounds.extend([start.latitude, start.longitude]);
    if (end) bounds.extend([end.latitude, end.longitude]);

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [start, end]);

  return null;
};
// Fix default Leaflet icon path
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url),
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url),
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url),
});

// Custom icons
const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Click handler to drop markers
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

// Main component
const MapView = ({ start, end, setStart, setEnd, segments = [], onStartSelect, onEndSelect }) => {
  const center = start || end || { latitude: 43.65, longitude: -79.38 };

  const getColor = (risk) => {
    console.log("🧪 Segment risk:", risk);
    if (risk < 0.2) return "green";
    if (risk < 0.4) return "blue";
    if (risk < 0.6) return "yellow";
    if (risk < 0.8) return "orange";
    return "red";
  };

  return (
    <div className="h-96 mt-6 rounded overflow-hidden shadow-md border">
      <MapContainer
        center={[center.latitude, center.longitude]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        <AutoFitBounds segments={segments} />
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
                console.log("🟢 Updated Start:", lat, lng); // or 🔴 End
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



          {segments.map((seg, idx) => (
            <React.Fragment key={idx}>
              {/* Colored segment */}
              <Polyline
                positions={[
                  [seg.segment_start.latitude, seg.segment_start.longitude],
                  [seg.segment_end.latitude, seg.segment_end.longitude],
                ]}
                pathOptions={{ color: getColor(seg.risk_score), weight: 6 }}
              >
                <Popup>
                  <RiskSegmentPopup riskScore={seg.risk_score} />
                </Popup>
              </Polyline>

              {/* Circle Marker at segment end to highlight boundaries */}
              <CircleMarker
                center={[seg.segment_end.latitude, seg.segment_end.longitude]}
                radius={5}
                pathOptions={{
                  color: "black",
                  weight: 2,
                  fillColor: "white",
                  fillOpacity: 1,
                }}
              />
            </React.Fragment>
          ))}

      </MapContainer>
    </div>
  );
};

export default MapView;
