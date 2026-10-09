"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import type { Complaint } from "@/lib/types";

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
  }, [points, map]);
  return null;
}

const CELL = 0.01;

export function DensityMap({ complaints }: { complaints: Complaint[] }) {
  const cells = useMemo(() => {
    const map = new Map<string, { lat: number; lng: number; count: number }>();
    for (const c of complaints) {
      const lat = Math.round(c.latitude / CELL) * CELL;
      const lng = Math.round(c.longitude / CELL) * CELL;
      const key = `${lat},${lng}`;
      const existing = map.get(key);
      if (existing) existing.count += 1;
      else map.set(key, { lat, lng, count: 1 });
    }
    return Array.from(map.values());
  }, [complaints]);

  const maxCount = Math.max(1, ...cells.map((c) => c.count));
  const points: [number, number][] = complaints.map((c) => [c.latitude, c.longitude]);
  const center: [number, number] = points[0] ?? [28.6139, 77.209];

  return (
    <div className="h-[600px] overflow-hidden rounded-2xl border border-slate-200">
      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBounds points={points} />
        {cells.map((cell, i) => {
          const intensity = cell.count / maxCount;
          return (
            <CircleMarker
              key={i}
              center={[cell.lat, cell.lng]}
              radius={10 + intensity * 30}
              pathOptions={{
                color: "#dc2626",
                fillColor: "#dc2626",
                fillOpacity: 0.15 + intensity * 0.5,
                weight: 0,
              }}
            >
              <Tooltip>{cell.count} complaint{cell.count === 1 ? "" : "s"} in this area</Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
