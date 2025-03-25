// src/components/MapView.jsx
import React from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default icon path issues in some bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url),
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url),
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url),
});

const LocationMarker = ({ position, onUpdate }) => {
  useMapEvents({
    dragend(e) {
      const { lat, lng } = e.target.getCenter();
      onUpdate({ lat, lng });
    },
  });

  return (
    <Marker
      draggable={true}
      position={[position.lat, position.lng]}
      eventHandlers={{
        dragend: (e) => {
          const { lat, lng } = e.target.getLatLng();
          onUpdate({ lat, lng });
        },
      }}
    />
  );
};

const MapView = ({ latitude, longitude, onChange }) => {
  const handleUpdate = ({ lat, lng }) => {
    onChange({ latitude: lat, longitude: lng });
  };

  return (
    <div className="h-96 mt-6 rounded overflow-hidden shadow-md border">
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker
          position={{ lat: latitude, lng: longitude }}
          onUpdate={handleUpdate}
        />
      </MapContainer>
    </div>
  );
};

export default MapView;
