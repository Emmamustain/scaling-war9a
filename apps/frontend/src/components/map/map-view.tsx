"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import Link from "next/link";

const userIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#2563eb;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function makeBusinessIcon(isOpen: boolean) {
  const bg = isOpen ? "#16a34a" : "#6b7280";
  const border = isOpen ? "#bbf7d0" : "#d1d5db";
  return L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${bg};border:2.5px solid ${border};display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.35)">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

export type MapBusiness = {
  id: string;
  name: string;
  slug: string;
  city: string;
  lat: number;
  lng: number;
  isOpen: boolean;
  logoUrl?: string | null;
  avgWaitTime?: number | null;
  status?: string;
  categories?: Array<{ category: { id: string; name: string } }>;
};

function FlyToUser({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 14, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
}

export default function MapView({
  businesses,
  userPosition,
  onBusinessSelect,
}: {
  businesses: MapBusiness[];
  userPosition: [number, number] | null;
  onBusinessSelect: (b: MapBusiness) => void;
}) {
  const DEFAULT_CENTER: [number, number] = [36.7538, 3.0588]; // Algiers

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={10}
      className="size-full z-0"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userPosition && (
        <Marker position={userPosition} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={(cluster: { getChildCount: () => number }) => {
          const count = cluster.getChildCount();
          return L.divIcon({
            className: "",
            html: `<div style="width:38px;height:38px;border-radius:50%;background:#16a34a;border:3px solid #bbf7d0;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,.3);color:#fff;font-weight:700;font-size:13px;font-family:sans-serif">${count}</div>`,
            iconSize: [38, 38],
            iconAnchor: [19, 19],
          });
        }}
      >
        {businesses.map((business) => (
          <Marker
            key={business.id}
            position={[business.lat, business.lng]}
            icon={makeBusinessIcon(business.isOpen)}
            eventHandlers={{ click: () => onBusinessSelect(business) }}
          >
            <Popup maxWidth={220} className="business-popup">
              <div style={{ fontFamily: "sans-serif", width: 200 }}>
                {business.logoUrl ? (
                  <img
                    src={business.logoUrl}
                    alt={business.name}
                    style={{
                      width: "100%",
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 8,
                      marginBottom: 8,
                      background: "#f0fdf4",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: 100,
                      background: "#f0fdf4",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 32,
                      fontWeight: 700,
                      color: "#16a34a",
                      marginBottom: 8,
                    }}
                  >
                    {business.name[0]}
                  </div>
                )}

                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                  {business.name}
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>
                  {business.city}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                      background: business.isOpen ? "#dcfce7" : "#f3f4f6",
                      color: business.isOpen ? "#16a34a" : "#6b7280",
                    }}
                  >
                    {business.isOpen ? "Open" : "Closed"}
                  </span>
                  {business.avgWaitTime ? (
                    <span style={{ fontSize: 11, color: "#6b7280" }}>
                      ~{business.avgWaitTime}min wait
                    </span>
                  ) : null}
                </div>

                <a
                  href={`/business/${business.slug}`}
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "6px 0",
                    background: "#16a34a",
                    color: "#fff",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  View &amp; Join Queue
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>

      <FlyToUser position={userPosition} />
    </MapContainer>
  );
}
