"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons with webpack
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = L.divIcon({
  className: "",
  html: `<div class="size-4 rounded-full bg-primary border-2 border-white shadow-lg"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const openIcon = L.divIcon({
  className: "",
  html: `<div class="size-8 rounded-full bg-success/20 border-2 border-success flex items-center justify-center text-success font-bold text-xs shadow">Q</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const closedIcon = L.divIcon({
  className: "",
  html: `<div class="size-8 rounded-full bg-muted/20 border-2 border-muted-foreground/30 flex items-center justify-center text-muted-foreground font-bold text-xs shadow">Q</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userPosition && (
        <Marker position={userPosition} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {businesses.map((business) => (
        <Marker
          key={business.id}
          position={[business.lat, business.lng]}
          icon={business.isOpen ? openIcon : closedIcon}
          eventHandlers={{
            click: () => onBusinessSelect(business),
          }}
        >
          <Popup>
            <strong>{business.name}</strong>
            <br />
            {business.city}
          </Popup>
        </Marker>
      ))}

      <FlyToUser position={userPosition} />
    </MapContainer>
  );
}
