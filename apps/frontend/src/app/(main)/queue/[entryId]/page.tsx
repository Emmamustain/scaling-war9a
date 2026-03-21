"use client";

import { use, useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetch";
import { useQueueStore } from "@/stores/queue.store";
import { Button } from "@/components/ui/button";
import {
  Share2,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Megaphone,
  MapPin,
  Navigation,
  Sparkles,
  Bell,
  Users,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { haptic, share } from "@shared/mobile";
import { motion, AnimatePresence } from "motion/react";
import dynamic from "next/dynamic";

const BusinessMap = dynamic(
  () => import("@/components/map/business-map"),
  { ssr: false },
);

// ─── Constants ────────────────────────────────────────────────────────────────

// 220° gauge: arc from lower-left → top → lower-right, gap at bottom
const GAUGE_R = 90;
const GAUGE_CX = 100;
const GAUGE_CY = 110;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_R; // 565.49
const GAUGE_ARC_DEG = 220;
const GAUGE_ARC_LEN = GAUGE_CIRCUMFERENCE * (GAUGE_ARC_DEG / 360); // 345.31
const GAUGE_GAP_LEN = GAUGE_CIRCUMFERENCE - GAUGE_ARC_LEN; // 220.18
// rotate so the arc starts at 160° (lower-left) and ends at 20° (lower-right)
const GAUGE_ROTATE = `rotate(160, ${GAUGE_CX}, ${GAUGE_CY})`;

// ─── Types ────────────────────────────────────────────────────────────────────

type QueueEntryDetail = {
  id: string;
  status: string;
  position: number | null;
  estimatedWaitMinutes: number | null;
  /** Unix ms — computed by server from updatedAt + estimatedWaitMinutes */
  deadlineAt: number;
  groupSize: number;
  priority: string;
  entryTime: string;
  calledAt: string | null;
  service: {
    id: string;
    name: string;
    business: {
      id: string;
      name: string;
      logoUrl: string | null;
      latitude: string | null;
      longitude: string | null;
      location: string;
    };
  };
};

type NeighborhoodEntry = {
  position: number;
  groupSize: number;
  isCurrentUser: boolean;
};

type Neighborhood = {
  userPosition: number;
  totalWaiting: number;
  entries: NeighborhoodEntry[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number) {
  if (km < 0.1) return { label: "You're right there", nearby: true };
  if (km < 0.5) return { label: `${Math.round(km * 1000)} m away`, nearby: true };
  return { label: `${km.toFixed(1)} km away`, nearby: false };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QueueTrackerPage({
  params,
}: {
  params: Promise<{ entryId: string }>;
}) {
  const { entryId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { subscribeToEntry, getEntry, connect } = useQueueStore();

  const [hasCalled, setHasCalled] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | null>(null);
  // Mutable ref so the interval always reads the latest deadline without restarting
  const deadlineRef = useRef<number>(0);

  // ── Data ────────────────────────────────────────────────────────────────────

  const leaveMutation = useMutation({
    mutationFn: () =>
      fetchApi(`/queue/entry/${entryId}/leave`, { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["queue", "my-entries"] });
      toast.success("You've left the queue", {
        description: "Hope to see you back soon!",
      });
      router.push("/discover");
    },
    onError: () => toast.error("Could not leave the queue — please try again."),
  });

  const { data: entry, isLoading } = useQuery({
    queryKey: ["queue-entry", entryId],
    queryFn: () => fetchApi<QueueEntryDetail>(`/queue/entry/${entryId}`),
  });

  const { data: neighborhood } = useQuery({
    queryKey: ["queue-neighborhood", entryId],
    queryFn: () => fetchApi<Neighborhood>(`/queue/entry/${entryId}/neighborhood`),
    refetchInterval: 10000,
    enabled: !!entry,
  });

  const liveEntry = getEntry(entryId);
  const currentPosition = liveEntry?.position ?? entry?.position;
  const currentWait = liveEntry?.estimatedWaitMinutes ?? entry?.estimatedWaitMinutes;
  const currentStatus = liveEntry?.status ?? entry?.status;

  const isWaiting = currentStatus === "waiting";
  const isCalled = currentStatus === "called";
  const isServed = currentStatus === "passed";

  // ── Effects ─────────────────────────────────────────────────────────────────

  // WS connection
  useEffect(() => {
    connect();
    subscribeToEntry(entryId);
  }, [entryId, connect, subscribeToEntry]);

  // "Called" haptic + toast
  useEffect(() => {
    if (isCalled && !hasCalled) {
      setHasCalled(true);
      void haptic("success");
      toast.success("It's your turn! Please proceed to the window.", { duration: 10000 });
    }
  }, [isCalled, hasCalled]);

  // Update ref AND immediately paint the correct secondsLeft whenever we get a
  // new deadline (REST load or WS position update). This avoids the one-render
  // window where the interval's initial tick would read a stale ref (= 0).
  const liveDeadline = liveEntry?.deadlineAt;
  const restDeadline = entry?.deadlineAt;
  useEffect(() => {
    const dl = liveDeadline ?? restDeadline;
    if (!dl) return;
    deadlineRef.current = dl;
    setSecondsLeft(Math.max(0, Math.floor((dl - Date.now()) / 1000)));
  }, [liveDeadline, restDeadline]);

  // Interval only advances the clock — never resets it
  useEffect(() => {
    if (!isWaiting) return;
    const id = setInterval(
      () => setSecondsLeft(Math.max(0, Math.floor((deadlineRef.current - Date.now()) / 1000))),
      1000,
    );
    return () => clearInterval(id);
  }, [isWaiting]);

  // Wake lock — keep screen on while waiting
  useEffect(() => {
    if (!isWaiting) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let wl: any = null;
    const acquire = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        wl = await (navigator as any).wakeLock?.request("screen");
      } catch {
        // not supported or permission denied — silently ignore
      }
    };
    void acquire();
    return () => { wl?.release().catch(() => {}); };
  }, [isWaiting]);

  // Notification permission state
  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setNotifPermission(Notification.permission);
    }
  }, []);

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
    );
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────────

  const handleShare = async () => {
    if (!entry) return;
    await share({
      title: `My queue at ${entry.service.business.name}`,
      text: `I'm in position ${currentPosition} at ${entry.service.name}`,
      url: window.location.href,
    });
  };

  const handleNotifRequest = async () => {
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
    if (perm === "granted") toast.success("Notifications enabled — we'll ping you when it's your turn.");
  };

  // Gauge progress: 0 = just joined, 1 = position #1 (about to be served)
  const totalWaiting = neighborhood?.totalWaiting ?? 0;
  const progress =
    totalWaiting > 0 && currentPosition != null
      ? Math.min(1, (totalWaiting - currentPosition + 1) / totalWaiting)
      : 0;
  const progressLen = progress * GAUGE_ARC_LEN;

  // Countdown
  // null = data not yet loaded; 0 = truly expired
  const countdownDone = secondsLeft === 0 && secondsLeft !== null && isWaiting;
  const secs = secondsLeft ?? 0;
  const mm = Math.floor(secs / 60).toString().padStart(2, "0");
  const ss = (secs % 60).toString().padStart(2, "0");

  // Neighborhood gradient logic
  const userPos = neighborhood?.userPosition ?? currentPosition ?? 0;
  const entriesAbove = neighborhood?.entries.filter((e) => !e.isCurrentUser && e.position < userPos) ?? [];
  const entriesBelow = neighborhood?.entries.filter((e) => !e.isCurrentUser && e.position > userPos) ?? [];
  const showTopGradient = totalWaiting > 6 && entriesAbove.length >= 3;
  const showBottomGradient = totalWaiting > 6 && entriesBelow.length >= 3;

  // Map / proximity
  const bizLat = parseFloat(entry?.service.business.latitude ?? "0");
  const bizLng = parseFloat(entry?.service.business.longitude ?? "0");
  const hasLocation = bizLat !== 0 && bizLng !== 0;
  const distInfo =
    userCoords && hasLocation
      ? formatDistance(haversineKm(userCoords.lat, userCoords.lng, bizLat, bizLng))
      : null;

  // ── Loading / Not-found ─────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg">Queue entry not found</p>
        <Link href="/discover" className="text-primary hover:underline">
          Back to Discover
        </Link>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-md space-y-3 px-4 py-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/business/${entry.service.business.name}`}>
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-2.5">
          {entry.service.business.logoUrl && (
            <img
              src={entry.service.business.logoUrl}
              alt=""
              className="size-8 rounded-lg object-cover"
            />
          )}
          <div className="text-right">
            <p className="text-sm font-semibold leading-none">
              {entry.service.business.name}
            </p>
            <p className="text-xs text-muted-foreground">{entry.service.name}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleShare}>
          <Share2 className="size-4" />
        </Button>
      </div>

      {/* ── Status area ────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* Called */}
        {isCalled && (
          <motion.div
            key="called"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl border border-success/30 bg-success/10 p-8 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
              className="mb-4 inline-flex size-20 items-center justify-center rounded-full bg-success/20"
            >
              <Megaphone className="size-10 text-success" />
            </motion.div>
            <h2 className="mb-1 text-2xl font-bold text-success">It&apos;s Your Turn!</h2>
            <p className="text-sm text-muted-foreground">Please proceed to the service window</p>
          </motion.div>
        )}

        {/* Served */}
        {isServed && (
          <motion.div
            key="served"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl border border-border bg-card p-8 text-center"
          >
            <div className="mb-4 inline-flex size-20 items-center justify-center rounded-full bg-primary/20">
              <CheckCircle className="size-10 text-primary" />
            </div>
            <h2 className="mb-1 text-2xl font-bold">All Done!</h2>
            <p className="text-sm text-muted-foreground">Thank you for using War9a</p>
            <Button className="mt-6" asChild>
              <Link href={`/feedback/${entryId}`}>Leave Feedback</Link>
            </Button>
          </motion.div>
        )}

        {/* Waiting */}
        {isWaiting && (
          <motion.div key="waiting" className="space-y-3">

            {/* ── Gauge + countdown ─────────────────────────────────── */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <p className="pt-5 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Estimated wait
              </p>

              {/*
                aspect-[200/115] locks the container to the SVG viewBox ratio.
                The arc circle sits at cy=110 r=90 — its endpoints at 160° and 20°
                land at y≈141, below the 115-unit clip line, so the gauge "bleeds"
                off the bottom edge giving a dashboard-gauge look.
                The mm:ss floats in the mouth of the gauge via absolute bottom-3.
              */}
              <div className="relative mx-auto aspect-[200/115] w-full max-w-sm px-6">
                <svg
                  viewBox="0 0 200 115"
                  className="absolute inset-0 h-full w-full"
                  style={{ overflow: "hidden" }}
                  aria-hidden="true"
                >
                  <defs>
                    <filter id="arc-glow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="3.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Track arc — use primary at low opacity so it's visible on any bg */}
                  <circle
                    cx={GAUGE_CX}
                    cy={GAUGE_CY}
                    r={GAUGE_R}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                    className="text-primary"
                    strokeOpacity={0.15}
                    strokeDasharray={`${GAUGE_ARC_LEN} ${GAUGE_GAP_LEN}`}
                    transform={GAUGE_ROTATE}
                  />

                  {/* Progress arc */}
                  <motion.circle
                    cx={GAUGE_CX}
                    cy={GAUGE_CY}
                    r={GAUGE_R}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                    className="text-primary"
                    filter="url(#arc-glow)"
                    transform={GAUGE_ROTATE}
                    initial={false}
                    animate={{
                      // Arc = position only. countdownDone only changes the text, not the fill.
                      strokeDasharray: `${progressLen} ${GAUGE_CIRCUMFERENCE - progressLen}`,
                    }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                </svg>

                {/* Timer floats in the gauge mouth */}
                <div className="absolute inset-x-0 bottom-3 flex justify-center">
                  <AnimatePresence mode="wait">
                    {secondsLeft === null ? null : countdownDone ? (
                      <motion.div
                        key="done"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-1"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 1.8 }}
                        >
                          <Sparkles className="size-7 text-primary" />
                        </motion.div>
                        <p className="text-xs font-semibold text-primary">Anytime now</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="counting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-end gap-0.5"
                      >
                        <span className="font-mono text-5xl font-bold tabular-nums leading-none">
                          {mm}
                        </span>
                        <span className="mb-0.5 font-mono text-3xl font-bold leading-none text-muted-foreground">
                          :
                        </span>
                        <span className="font-mono text-5xl font-bold tabular-nums leading-none">
                          {ss}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Position tag below the gauge */}
              <div className="pb-5 pt-3 text-center">
                {currentPosition != null && (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    <span>Position</span>
                    <span className="font-bold">#{currentPosition}</span>
                    {totalWaiting > 0 && (
                      <span className="text-primary/60">of {totalWaiting}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── Stats row ────────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <Clock className="mx-auto mb-1 size-4 text-muted-foreground" />
                <div className="text-sm font-semibold">
                  {currentWait != null ? `~${currentWait}m` : "—"}
                </div>
                <div className="text-xs text-muted-foreground">Wait</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <Users className="mx-auto mb-1 size-4 text-muted-foreground" />
                <div className="text-sm font-semibold">{entry.groupSize}</div>
                <div className="text-xs text-muted-foreground">Group</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <Bell className="mx-auto mb-1 size-4 text-muted-foreground" />
                <div className="text-sm font-semibold capitalize">{entry.priority}</div>
                <div className="text-xs text-muted-foreground">Priority</div>
              </div>
            </div>

            {/* ── Queue neighborhood ───────────────────────────────── */}
            {neighborhood && neighborhood.entries.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="border-b border-border px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Queue
                  </p>
                </div>
                <div className="relative">
                  {showTopGradient && (
                    <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-14 bg-gradient-to-b from-card to-transparent" />
                  )}
                  {showBottomGradient && (
                    <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-14 bg-gradient-to-t from-card to-transparent" />
                  )}
                  <div className="space-y-1 px-3 py-2">
                    {neighborhood.entries.map((neighbor) => (
                      <div
                        key={neighbor.id ?? neighbor.position}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
                          neighbor.isCurrentUser
                            ? "border border-primary/30 bg-primary/10"
                            : "opacity-40",
                        )}
                      >
                        <span
                          className={cn(
                            "w-8 shrink-0 font-mono text-sm font-bold",
                            neighbor.isCurrentUser ? "text-primary" : "text-muted-foreground",
                          )}
                        >
                          #{neighbor.position}
                        </span>
                        <span
                          className={cn(
                            "flex-1 text-sm",
                            neighbor.isCurrentUser
                              ? "font-semibold text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {neighbor.isCurrentUser
                            ? "You"
                            : neighbor.groupSize > 1
                              ? `Group of ${neighbor.groupSize}`
                              : "Person"}
                        </span>
                        {neighbor.groupSize > 1 && (
                          <div
                            className={cn(
                              "flex items-center gap-1",
                              neighbor.isCurrentUser ? "text-primary" : "text-muted-foreground",
                            )}
                          >
                            <Users className="size-3.5" />
                            <span className="text-xs font-medium">{neighbor.groupSize}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Push notification opt-in ─────────────────────────── */}
            {notifPermission === "default" && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bell className="size-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Get notified when it&apos;s your turn</p>
                  <p className="text-xs text-muted-foreground">
                    So you don&apos;t have to keep this page open
                  </p>
                </div>
                <Button size="sm" onClick={handleNotifRequest} className="shrink-0">
                  Enable
                </Button>
              </motion.div>
            )}

            {/* ── Location / Map ───────────────────────────────────── */}
            {hasLocation && (
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-3.5 text-muted-foreground" />
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Location
                    </p>
                  </div>
                  {distInfo && (
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium",
                        distInfo.nearby
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {distInfo.nearby ? "✓ " : ""}{distInfo.label}
                    </span>
                  )}
                </div>

                <div className="h-44 w-full">
                  <BusinessMap lat={bizLat} lng={bizLng} name={entry.service.business.name} zoom={15} />
                </div>

                <div className="flex items-center justify-between px-4 py-3">
                  <p className="truncate text-xs text-muted-foreground">
                    {entry.service.business.location || "See on map"}
                  </p>
                  {(!distInfo || !distInfo.nearby) && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${bizLat},${bizLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-3 flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      <Navigation className="size-3" />
                      Get Directions
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* ── Leave ────────────────────────────────────────────── */}
            <Button
              variant="destructive"
              className="w-full"
              disabled={leaveMutation.isPending}
              onClick={() => leaveMutation.mutate()}
            >
              {leaveMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Leave Queue"
              )}
            </Button>
          </motion.div>
        )}

        {/* Unknown status */}
        {!isWaiting && !isCalled && !isServed && (
          <div className="py-10 text-center">
            <p className="text-sm capitalize text-muted-foreground">
              {currentStatus ?? "Loading…"}
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
