"use client";

import { use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Clock,
  Users,
  QrCode,
  Share2,
  Loader2,
  Phone,
  Star,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn, formatWaitTime, getStatusColor } from "@/lib/utils";
import { share } from "@shared/mobile";

type ServiceWithStatus = {
  id: string;
  name: string;
  description: string | null;
  averageTime: string | null;
  maxCapacity: number | null;
  isActive: boolean;
};

type BusinessDetail = {
  id: string;
  name: string;
  slug: string;
  description: string;
  city: string;
  location: string;
  phone: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  avgWaitTime: number | null;
  featured: boolean;
  status: string;
  isOpen: boolean;
  categories: Array<{ category: { id: string; name: string } }>;
  services: ServiceWithStatus[];
  hours: Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>;
};

type QueueStatus = {
  waitingCount: number;
  estimatedWaitMinutes: number;
  openGuichets: number;
  status: string;
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function BusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: business, isLoading } = useQuery({
    queryKey: ["business", slug],
    queryFn: () => fetchApi<BusinessDetail>(`/businesses/${slug}`),
  });

  const { data: serviceStatuses } = useQuery({
    queryKey: ["business-service-statuses", business?.id],
    queryFn: async () => {
      if (!business?.services.length) return {};
      const statusMap: Record<string, QueueStatus> = {};
      await Promise.all(
        business.services.map(async (service) => {
          try {
            const status = await fetchApi<QueueStatus>(
              `/queue/service/${service.id}/status`,
            );
            statusMap[service.id] = status;
          } catch {
            // service status unavailable
          }
        }),
      );
      return statusMap;
    },
    enabled: !!business,
    refetchInterval: 30000,
  });

  const joinMutation = useMutation({
    mutationFn: (serviceId: string) =>
      fetchApi<{ id: string }>(`/queue/service/${serviceId}/join`, { method: "POST", body: JSON.stringify({}) }),
    onSuccess: () => {
      toast.success("Joined queue successfully!");
      void queryClient.invalidateQueries({ queryKey: ["business-service-statuses"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to join queue");
    },
  });

  const handleShare = async () => {
    if (!business) return;
    await share({
      title: business.name,
      text: `Join the virtual queue at ${business.name} on War9a`,
      url: window.location.href,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg">Business not found</p>
        <Link href="/discover" className="text-primary hover:underline">
          Back to Discover
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="relative h-48 overflow-hidden bg-secondary">
          {business.coverUrl ? (
            <img
              src={business.coverUrl}
              alt={business.name}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-6xl font-bold text-muted-foreground/20">
              {business.name[0]?.toUpperCase()}
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-4">
              {business.logoUrl && (
                <img
                  src={business.logoUrl}
                  alt=""
                  className="size-16 rounded-xl border-2 border-background object-cover shadow-md"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{business.name}</h1>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {business.city}
                  {business.location && ` · ${business.location}`}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="size-4" />
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link href={`/api/qr/business/${business.slug}`} target="_blank">
                  <QrCode className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <Badge
              variant={business.isOpen ? "success" : "muted"}
              className="capitalize"
            >
              {business.isOpen ? "Open Now" : "Closed"}
            </Badge>
            {business.featured && <Badge variant="default">Featured</Badge>}
            {business.categories.map(({ category }) => (
              <Badge key={category.id} variant="secondary">
                {category.name}
              </Badge>
            ))}
          </div>

          <p className="mb-4 text-muted-foreground">{business.description}</p>

          {business.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="size-4" />
              <a href={`tel:${business.phone}`} className="hover:underline">
                {business.phone}
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Services</h2>
        {business.services.length === 0 ? (
          <p className="text-muted-foreground">No services available</p>
        ) : (
          business.services.map((service) => {
            const status = serviceStatuses?.[service.id];
            const isFull =
              status &&
              service.maxCapacity &&
              status.waitingCount >= service.maxCapacity;

            return (
              <div
                key={service.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    {service.description && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      status?.status === "open"
                        ? "success"
                        : status?.status === "paused"
                          ? "warning"
                          : "muted"
                    }
                    className="capitalize"
                  >
                    {status?.status ?? "closed"}
                  </Badge>
                </div>

                {status && (
                  <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="size-3.5" />
                      {status.waitingCount} waiting
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      ~{formatWaitTime(status.estimatedWaitMinutes)} wait
                    </span>
                    {service.maxCapacity && (
                      <span className="text-xs">
                        {service.maxCapacity - status.waitingCount} slots left
                      </span>
                    )}
                  </div>
                )}

                <Button
                  className="w-full"
                  disabled={
                    !business.isOpen ||
                    status?.status === "closed" ||
                    !!isFull ||
                    joinMutation.isPending
                  }
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast.info("Please sign in to join the queue");
                      return;
                    }
                    joinMutation.mutate(service.id);
                  }}
                >
                  {joinMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : isFull ? (
                    "Queue Full"
                  ) : !business.isOpen ? (
                    "Business Closed"
                  ) : (
                    "Join Queue"
                  )}
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
