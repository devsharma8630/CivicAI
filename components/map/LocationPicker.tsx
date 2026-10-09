"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

const icon = L.divIcon({
  className: "",
  html: `<div style="width:20px;height:20px;border-radius:9999px;background:#059669;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMapEvents({});
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export function LocationPicker({
  latitude,
  longitude,
  onChange,
}: {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />;

  return (
    <div className="h-72 overflow-hidden rounded-2xl border border-slate-200">
      <MapContainer center={[latitude, longitude]} zoom={16} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[latitude, longitude]}
          icon={icon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target as L.Marker;
              const pos = marker.getLatLng();
              onChange(pos.lat, pos.lng);
            },
          }}
        />
        <ClickHandler onChange={onChange} />
        <Recenter lat={latitude} lng={longitude} />
      </MapContainer>
    </div>
  );
}
