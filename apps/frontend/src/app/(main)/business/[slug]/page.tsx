"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { useAuthStore } from "@/stores/auth.store";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronLeft, Clock, Users, Frown, Smile, ThumbsDown, ThumbsUp, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
    <main className="flex min-h-screen flex-col">
      {/* ── Mobile top bar: back + share ── */}
      <div className="flex items-center justify-between px-4 py-2 md:hidden">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 rounded-full p-1.5 text-sm text-muted-foreground hover:bg-secondary"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="size-8" onClick={handleShare}>
            <Share2 className="size-4" />
          </Button>
          <QrModal slug={business.slug} businessName={business.name} />
        </div>
      </div>

      {/* ── Business Header ── */}
      <BusinessHeader
        name={business.name}
        slug={business.slug}
        logoUrl={business.logoUrl}
        coverUrl={business.coverUrl}
        isOpen={business.isOpen}
        city={business.city}
      />

      {/* ── Desktop actions row ── */}
      <div className="hidden justify-end gap-2 px-6 py-3 md:flex lg:px-24">
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="size-4" />
        </Button>
        <QrModal slug={business.slug} businessName={business.name} />
      </div>

      <div className="px-4 md:px-6 lg:px-24">
        {/* Step 1 — choose a service */}
        {!selectedServiceId && (
          <div className="mt-2 md:mt-12">
            {business.services.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 opacity-40">
                <Frown size={80} />
                <p className="text-xl font-bold">No Services Available</p>
              </div>
            ) : (
              <>
                <h2 className="mb-3 text-lg font-bold md:mb-6 md:text-2xl">Choose a service</h2>
                <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {business.services.map((service: BusinessDetail["services"][number]) => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedServiceId(service.id)}
                      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm active:scale-[0.98] md:flex-col md:items-start md:gap-3 md:border-2 md:border-neutral-200 md:bg-white md:p-6 md:dark:border-neutral-700 md:dark:bg-neutral-800"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 md:hidden">
                        <Users className="size-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold capitalize group-hover:text-primary transition-colors md:text-lg">
                            {service.name}
                          </p>
                          <ChevronLeft className="size-4 rotate-180 text-muted-foreground md:size-5" />
                        </div>
                        {service.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1 md:mt-2 md:text-sm md:line-clamp-2">
                            {service.description}
                          </p>
                        )}
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground md:mt-3">
                          {service.averageTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" />
                              ~{service.averageTime} min
                            </span>
                          )}
                          {service.maxCapacity && (
                            <span className="flex items-center gap-1">
                              <Users className="size-3" />
                              {service.maxCapacity} max
                            </span>
                          )}
                        </div>
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
          <div className="mt-2 md:mt-8">
            {/* Back + service title */}
            <div className="mb-4 flex items-center gap-2 md:mb-6 md:gap-3">
              <button
                onClick={() => setSelectedServiceId(null)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="size-4" />
                Back
              </button>
              <span className="text-muted-foreground/40">/</span>
              <h2 className="text-base font-bold capitalize md:text-xl">{activeService.name}</h2>
              {serviceStatus && (
                <span
                  className={cn(
                    "ml-auto text-xs font-medium px-2 py-1 rounded-full",
                    serviceStatus.status === "open"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
                  )}
                >
                  {serviceStatus.waitingCount} waiting
                </span>
              )}
            </div>

            {/* Queue area */}
            <div className="space-y-3 md:grid md:w-full md:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] md:gap-4 md:space-y-0 md:rounded-xl md:bg-neutral-200/60 md:p-4 md:pt-8 md:dark:bg-neutral-800/60">
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
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card py-8 md:h-[157px] md:min-w-[280px] md:rounded md:border-0 md:bg-white md:dark:bg-neutral-700">
                  <Smile size={48} className="text-muted-foreground/40 md:mb-2" />
                  <p className="font-semibold text-muted-foreground">
                    Be the first to join!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Business Info (collapsible, below services) ── */}
        <div className="mt-6 border-t border-border pt-4 md:mt-8">
          <button
            className="flex w-full items-center justify-between text-sm font-semibold md:text-base"
            onClick={() => setInfoOpen((v) => !v)}
          >
            About this business
            <ChevronDown
              className={cn("size-4 transition-transform duration-200", infoOpen && "rotate-180")}
            />
          </button>

          {infoOpen && (
            <div className="mt-3 space-y-3 text-sm">
              {business.description && (
                <p className="text-muted-foreground">{business.description}</p>
              )}
              <div className="flex flex-wrap gap-1.5">
                {business.categories.map(({ category }: { category: { id: string; name: string } }) => (
                  <Badge key={category.id} variant="secondary">{category.name}</Badge>
                ))}
              </div>
              {business.phone && (
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Phone:</span> {business.phone}
                </p>
              )}
              <div className="flex gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="size-4 text-green-500" /> 120
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsDown className="size-4 text-red-400" /> 20
                </span>
              </div>
              {lat !== 0 && lng !== 0 && (
                <div className="h-[200px] w-full overflow-hidden rounded-xl md:h-[400px]">
                  <BusinessMap lat={lat} lng={lng} name={business.name} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8" />

      <ForfeitQueueDialog
        open={!!forfeitEntry}
        onOpenChange={(open: boolean) => !open && setForfeitEntry(null)}
        currentEntry={forfeitEntry}
        onConfirm={() => {
          if (forfeitEntry)
            leaveMutation.mutate({ entryId: forfeitEntry.id, forForfeit: true });
        }}
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
