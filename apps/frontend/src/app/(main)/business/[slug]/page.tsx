"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { useAuthStore } from "@/stores/auth.store";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronLeft, Clock, Users, Frown, Smile, ThumbsDown, ThumbsUp, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { share } from "@shared/mobile";
import BusinessHeader from "@/components/business/business-header";
import QueueCard from "@/components/business/queue-card";
import ActionQueueCard from "@/components/business/action-queue-card";
import QrModal from "@/components/business/qr-modal";
import ForfeitQueueDialog from "@/components/queue/forfeit-queue-dialog";
import { ApiError } from "@/lib/fetch";
import dynamic from "next/dynamic";

const BusinessMap = dynamic(() => import("@/components/map/business-map"), { ssr: false });

type QueueEntry = {
  id: string;
  status: string;
  position: number | null;
  present: boolean;
  groupSize: number;
  priority: string;
  user: { id: string; displayName: string | null; username: string } | null;
};

type ServiceStatus = {
  waitingCount: number;
  estimatedWaitMinutes: number;
  openGuichets: number;
  status: string;
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
  latitude: string | null;
  longitude: string | null;
  categories: Array<{ category: { id: string; name: string } }>;
  services: Array<{
    id: string;
    name: string;
    description: string | null;
    averageTime: string | null;
    maxCapacity: number | null;
    isActive: boolean;
  }>;
  hours: Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>;
};

export default function BusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [forfeitEntry, setForfeitEntry] = useState<{
    id: string;
    serviceName: string;
    businessName: string;
    businessSlug: string;
    position: number;
  } | null>(null);

  const { data: business, isLoading } = useQuery({
    queryKey: ["business", slug],
    queryFn: () => fetchApi<BusinessDetail>(`/businesses/${slug}`),
  });

  const activeService = business?.services.find((s: BusinessDetail["services"][number]) => s.id === selectedServiceId) ?? null;
  const serviceId = activeService?.id ?? null;

  const { data: queue } = useQuery({
    queryKey: ["queue-entries", serviceId],
    queryFn: () =>
      fetchApi<QueueEntry[]>(`/queue/service/${serviceId}/entries`),
    enabled: !!serviceId,
    refetchInterval: 10000,
  });

  const { data: serviceStatus } = useQuery({
    queryKey: ["service-status", serviceId],
    queryFn: () =>
      fetchApi<ServiceStatus>(`/queue/service/${serviceId}/status`),
    enabled: !!serviceId,
    refetchInterval: 15000,
  });

  const myEntry = user && queue?.find((e: QueueEntry) => e.user?.id === user.id);
  const waitingQueue = queue?.filter((e: QueueEntry) => e.status === "waiting") ?? [];

  const joinMutation = useMutation({
    mutationFn: () =>
      fetchApi<{ id: string }>(`/queue/service/${serviceId}/join`, {
        method: "POST",
        body: JSON.stringify({}),
      }),
    onSuccess: () => {
      toast.success("Joined queue successfully!");
      void queryClient.invalidateQueries({ queryKey: ["queue-entries", serviceId] });
      void queryClient.invalidateQueries({ queryKey: ["service-status", serviceId] });
      void queryClient.invalidateQueries({ queryKey: ["queue", "my-entries"] });
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 409) {
        const d = err.data as { code?: string; currentEntry?: typeof forfeitEntry } | undefined;
        if (d?.code === "ALREADY_IN_OTHER_QUEUE" && d?.currentEntry) {
          setForfeitEntry(d.currentEntry);
          return;
        }
      }
      toast.error(err instanceof Error ? err.message : "Failed to join queue");
    },
  });

  const leaveMutation = useMutation({
    mutationFn: ({
      entryId,
      forForfeit,
    }: {
      entryId: string;
      forForfeit?: boolean;
    }) => fetchApi(`/queue/entry/${entryId}/leave`, { method: "DELETE" }),
    onSuccess: (_, vars) => {
      if (vars?.forForfeit) {
        setForfeitEntry(null);
        joinMutation.mutate();
      } else {
        toast.success("Left the queue");
      }
      void queryClient.invalidateQueries({ queryKey: ["queue-entries", serviceId] });
      void queryClient.invalidateQueries({ queryKey: ["service-status", serviceId] });
      void queryClient.invalidateQueries({ queryKey: ["queue", "my-entries"] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to leave queue"),
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-xl font-bold">Business not found</p>
        <Link href="/discover" className="text-primary hover:underline">
          Back to Discover
        </Link>
      </div>
    );
  }

  const lat = parseFloat(business.latitude ?? "0");
  const lng = parseFloat(business.longitude ?? "0");

  return (
    <main className="flex min-h-screen flex-col lg:px-24">
      {/* Business Header — cover + round logo */}
      <BusinessHeader
        name={business.name}
        slug={business.slug}
        logoUrl={business.logoUrl}
        coverUrl={business.coverUrl}
      />

      {/* Actions row */}
      <div className="flex justify-end gap-2 px-6 py-3">
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="size-4" />
        </Button>
        <QrModal slug={business.slug} businessName={business.name} />
      </div>

      {/* Collapsible Business Info */}
      <div className="mt-2 px-6">
        <button
          className="flex items-center gap-1 text-base font-semibold text-gray-900 dark:text-white duration-150 hover:scale-[0.99] hover:opacity-70"
          onClick={() => setInfoOpen((v) => !v)}
        >
          Business Information
          <ChevronDown
            className={cn("transition-transform duration-300", infoOpen && "rotate-180")}
          />
        </button>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
          Business details and applications.
        </p>

        {infoOpen && (
          <div className="mt-4 border-t border-gray-100 dark:border-gray-700">
            <dl className="divide-y divide-gray-100 dark:divide-gray-700">
              <InfoRow label="Business Name" value={business.name} />
              <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium text-gray-900 dark:text-gray-200">Categories</dt>
                <dd className="mt-1 flex flex-wrap gap-2 sm:col-span-2 sm:mt-0">
                  {business.categories.map(({ category }: { category: { id: string; name: string } }) => (
                    <Badge key={category.id}>{category.name}</Badge>
                  ))}
                </dd>
              </div>
              <InfoRow label="Phone" value={business.phone ?? "Not Available"} />
              <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium text-gray-900 dark:text-gray-200">Reputation</dt>
                <dd className="mt-1 flex gap-6 sm:col-span-2 sm:mt-0">
                  <span className="flex items-center gap-1 text-sm">
                    120 <ThumbsUp color="#baceab" size={18} />
                  </span>
                  <span className="flex items-center gap-1 text-sm">
                    20 <ThumbsDown color="#ceabab" size={18} />
                  </span>
                </dd>
              </div>
              <InfoRow label="About" value={business.description} />
            </dl>

            {lat !== 0 && lng !== 0 && (
              <div className="mt-4 h-[400px] w-full overflow-hidden rounded-xl">
                <BusinessMap lat={lat} lng={lng} name={business.name} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 1 — choose a service */}
      {!selectedServiceId && (
        <div className="mt-12 px-6">
          {business.services.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 opacity-40">
              <Frown size={80} />
              <p className="text-xl font-bold">No Services Available</p>
            </div>
          ) : (
            <>
              <h2 className="mb-6 text-2xl font-bold">Choose a service</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {business.services.map((service: BusinessDetail["services"][number]) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedServiceId(service.id)}
                    className="group flex flex-col items-start gap-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-6 text-left transition-all duration-200 hover:border-blue-500 hover:shadow-md active:scale-[0.98]"
                  >
                    <div className="flex w-full items-center justify-between">
                      <p className="text-lg font-semibold capitalize group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {service.name}
                      </p>
                      <ChevronLeft className="size-5 rotate-180 text-neutral-400 group-hover:text-blue-500 transition-colors" />
                    </div>

                    {service.description && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                        {service.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-neutral-400">
                      {service.averageTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5" />
                          ~{service.averageTime} min avg
                        </span>
                      )}
                      {service.maxCapacity && (
                        <span className="flex items-center gap-1">
                          <Users className="size-3.5" />
                          Up to {service.maxCapacity}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 2 — queue view for selected service */}
      {selectedServiceId && activeService && (
        <div className="mt-8 px-6">
          {/* Back + service title */}
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={() => setSelectedServiceId(null)}
              className="flex items-center gap-1 text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="size-4" />
              All services
            </button>
            <span className="text-neutral-300 dark:text-neutral-600">/</span>
            <h2 className="text-xl font-bold capitalize">{activeService.name}</h2>
            {serviceStatus && (
              <span
                className={cn(
                  "ml-auto text-xs font-medium px-2 py-1 rounded-full",
                  serviceStatus.status === "open"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
                )}
              >
                {serviceStatus.waitingCount} waiting · ~{serviceStatus.estimatedWaitMinutes} min
              </span>
            )}
          </div>

          {/* Queue grid */}
          <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 rounded-xl bg-neutral-200/60 dark:bg-neutral-800/60 p-4 pt-8">
            <ActionQueueCard
              position={
                myEntry
                  ? (waitingQueue.findIndex((e: QueueEntry) => e.id === myEntry.id) + 1) || 1
                  : waitingQueue.length + 1
              }
              alreadyQueued={!!myEntry}
              isPending={joinMutation.isPending || leaveMutation.isPending}
              isAuthenticated={isAuthenticated}
              isOpen={business.isOpen}
              onJoin={() => joinMutation.mutate()}
              onLeave={() =>
                myEntry &&
                leaveMutation.mutate({ entryId: myEntry.id })
              }
            />

            {waitingQueue.length > 0 ? (
              waitingQueue.map((entry: QueueEntry, index: number) => (
                <QueueCard
                  key={entry.id}
                  displayName={entry.user?.displayName ?? entry.user?.username ?? "Anonymous"}
                  position={index + 1}
                  isPresent={entry.present}
                  highlight={entry.user?.id === user?.id}
                />
              ))
            ) : (
              <div className="relative flex h-[157px] w-full min-w-[280px] flex-col justify-center rounded bg-white dark:bg-neutral-700">
                <Smile size={80} className="mb-2 w-full text-center text-neutral-400" />
                <p className="text-center text-xl font-bold text-neutral-400">
                  Be the first to join!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <ForfeitQueueDialog
        open={!!forfeitEntry}
        onOpenChange={(open: boolean) => !open && setForfeitEntry(null)}
        currentEntry={forfeitEntry}
        onConfirm={() =>
          forfeitEntry &&
          leaveMutation.mutate({
            entryId: forfeitEntry.id,
            forForfeit: true,
          })
        }
        isPending={leaveMutation.isPending || joinMutation.isPending}
      />
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
      <dt className="text-sm font-medium text-gray-900 dark:text-gray-200">{label}</dt>
      <dd className="mt-1 text-sm text-gray-700 dark:text-gray-300 sm:col-span-2 sm:mt-0">{value}</dd>
    </div>
  );
}
