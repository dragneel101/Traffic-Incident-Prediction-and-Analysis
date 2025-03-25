// src/components/Route.jsx
import { useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-routing-machine";

const Route = ({ start, end, onRiskData }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!start || !end || !map) return;

    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    const control = L.Routing.control({
      waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
      lineOptions: {
        styles: [{ color: "#3388ff", weight: 5 }],
      },
      createMarker: () => null,
    });

    control.on("routesfound", (e) => {
      if (!e.routes?.[0]) return;
      const coordinates = e.routes[0].coordinates;
      const mockRisks = coordinates.map((pt) => ({
        lat: pt.lat,
        lng: pt.lng,
        risk: Math.random(),
      }));
      onRiskData(mockRisks);
    });

    control.on("routingerror", (err) => {
      console.warn("Routing error:", err);
    });

    control.addTo(map);
    routingControlRef.current = control;

    return () => {
      if (routingControlRef.current && map.hasLayer(routingControlRef.current)) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [start, end, map, onRiskData]);

  return null;
};

export default Route;
