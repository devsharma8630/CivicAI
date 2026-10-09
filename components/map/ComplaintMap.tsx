"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import type { Complaint } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/format";

const icon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:9999px;background:#059669;border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,0.15)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function criticalIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:9999px;background:#dc2626;border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,0.15)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
  }, [points, map]);
  return null;
}

export function ComplaintMap({
  complaints,
  linkPrefix = "/dashboard/complaints",
  height = "100%",
}: {
  complaints: Complaint[];
  linkPrefix?: string;
  height?: string;
}) {
  const points: [number, number][] = complaints.map((c) => [c.latitude, c.longitude]);
  const center: [number, number] = points[0] ?? [28.6139, 77.209];

  return (
    <div style={{ height }} className="overflow-hidden rounded-2xl border border-slate-200">
      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {complaints.map((c) => (
          <Marker
            key={c.id}
            position={[c.latitude, c.longitude]}
            icon={c.severity === "CRITICAL" ? criticalIcon() : icon}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">{c.title}</p>
                <p>{c.category} &middot; {c.severity}</p>
                <p>Priority {c.priority_score} &middot; {STATUS_LABELS[c.status]}</p>
                <Link href={`${linkPrefix}/${c.id}`} className="text-emerald-700 underline">
                  View details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
