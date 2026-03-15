"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { getCurrentPosition } from "@shared/mobile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Loader2, X, Clock } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { formatWaitTime } from "@/lib/utils";
import dynamic from "next/dynamic";
import type { MapBusiness } from "@/components/map/map-view";

const MapView = dynamic(() => import("@/components/map/map-view"), { ssr: false });

export default function MapPage() {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<MapBusiness | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const { data: businesses, isLoading } = useQuery({
    queryKey: ["map-businesses"],
    queryFn: () => fetchApi<{ data: Array<{ id: string; name: string; slug: string; city: string; latitude: string | null; longitude: string | null; isOpen: boolean; logoUrl: string | null; avgWaitTime: number | null; status: string; categories: Array<{ category: { id: string; name: string } }> }> }>("/businesses?limit=50"),
    staleTime: 60000,
  });

  const handleLocate = async () => {
    setLocationLoading(true);
    try {
      const pos = await getCurrentPosition();
      setUserPosition([pos.latitude, pos.longitude]);
    } catch (err) {
      const code = (err as GeolocationPositionError)?.code;
      if (code === 1) {
        toast.error("Location access denied — please allow it in your browser settings");
      } else if (code === 3) {
        toast.error("Location request timed out — try again");
      } else {
        toast.error("Could not get your location");
      }
    } finally {
      setLocationLoading(false);
    }
  };

  const mapBusinesses: MapBusiness[] = (businesses?.data ?? [])
    .filter((b) => b.latitude && b.longitude)
    .map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      city: b.city,
      lat: parseFloat(b.latitude!),
      lng: parseFloat(b.longitude!),
      isOpen: b.isOpen,
      logoUrl: b.logoUrl,
      avgWaitTime: b.avgWaitTime,
      status: b.status,
      categories: b.categories,
    }));

  return (
    <div className="relative h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)]">
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : (
        <MapView
          businesses={mapBusinesses}
          userPosition={userPosition}
          onBusinessSelect={setSelectedBusiness}
        />
      )}

      <Button
        className="absolute bottom-4 right-4 z-[1000] shadow-lg"
        size="sm"
        onClick={handleLocate}
        disabled={locationLoading}
      >
        {locationLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <MapPin className="size-4" />
        )}
        My Location
      </Button>

      {selectedBusiness && (
        <div className="absolute bottom-16 left-4 right-4 z-[1000] mx-auto max-w-sm rounded-2xl border border-border bg-card p-4 shadow-xl">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h3 className="font-bold">{selectedBusiness.name}</h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3" />
                {selectedBusiness.city}
              </div>
            </div>
            <button
              onClick={() => setSelectedBusiness(null)}
              className="rounded-full p-1 hover:bg-secondary"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <Badge variant={selectedBusiness.isOpen ? "success" : "muted"}>
              {selectedBusiness.isOpen ? "Open" : "Closed"}
            </Badge>
            {selectedBusiness.avgWaitTime && (
              <Badge variant="secondary">
                <Clock className="mr-1 size-3" />
                ~{formatWaitTime(selectedBusiness.avgWaitTime)} wait
              </Badge>
            )}
          </div>

          <Button className="w-full" asChild>
            <Link href={`/business/${selectedBusiness.slug}`}>View & Join Queue</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
