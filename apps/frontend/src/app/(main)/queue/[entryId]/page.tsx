"use client";

import { use, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { useQueueStore } from "@/stores/queue.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Users,
  Bell,
  Share2,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn, formatWaitTime } from "@/lib/utils";
import { haptic, share } from "@shared/mobile";
import { motion, AnimatePresence } from "motion/react";

type QueueEntryDetail = {
  id: string;
  status: string;
  position: number | null;
  estimatedWaitMinutes: number | null;
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
    };
  };
};

export default function QueueTrackerPage({
  params,
}: {
  params: Promise<{ entryId: string }>;
}) {
  const { entryId } = use(params);
  const { subscribeToEntry, getEntry, connect } = useQueueStore();
  const [hasCalled, setHasCalled] = useState(false);

  const { data: entry, isLoading } = useQuery({
    queryKey: ["queue-entry", entryId],
    queryFn: () => fetchApi<QueueEntryDetail>(`/queue/entry/${entryId}`),
  });

  const liveEntry = getEntry(entryId);

  const currentPosition = liveEntry?.position ?? entry?.position;
  const currentWait =
    liveEntry?.estimatedWaitMinutes ?? entry?.estimatedWaitMinutes;
  const currentStatus = liveEntry?.status ?? entry?.status;

  useEffect(() => {
    connect();
    subscribeToEntry(entryId);
  }, [entryId, connect, subscribeToEntry]);

  useEffect(() => {
    if (currentStatus === "called" && !hasCalled) {
      setHasCalled(true);
      void haptic("success");
      toast.success("It's your turn! Please proceed to the window.", {
        duration: 10000,
      });
    }
  }, [currentStatus, hasCalled]);

  const handleShare = async () => {
    if (!entry) return;
    await share({
      title: `My queue at ${entry.service.business.name}`,
      text: `I'm in position ${currentPosition} at ${entry.service.name}`,
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

  const isWaiting = currentStatus === "waiting";
  const isCalled = currentStatus === "called";
  const isServed = currentStatus === "passed";
  const isLeft = currentStatus === "left";

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/business/${entry.service.business.name}`}>
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" onClick={handleShare}>
          <Share2 className="size-4" />
        </Button>
      </div>

      <div className="text-center">
        {entry.service.business.logoUrl && (
          <img
            src={entry.service.business.logoUrl}
            alt=""
            className="mx-auto mb-4 size-16 rounded-xl object-cover"
          />
        )}
        <h1 className="text-xl font-bold">{entry.service.business.name}</h1>
        <p className="text-muted-foreground">{entry.service.name}</p>
      </div>

      <AnimatePresence mode="wait">
        {isCalled ? (
          <motion.div
            key="called"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="my-8 text-center"
          >
            <div className="mb-4 inline-flex size-24 items-center justify-center rounded-full bg-success/20">
              <Megaphone className="size-12 text-success" />
            </div>
            <h2 className="mb-2 text-3xl font-bold text-success">
              It&apos;s Your Turn!
            </h2>
            <p className="text-muted-foreground">
              Please proceed to the service window
            </p>
          </motion.div>
        ) : isServed ? (
          <motion.div
            key="served"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="my-8 text-center"
          >
            <div className="mb-4 inline-flex size-24 items-center justify-center rounded-full bg-primary/20">
              <CheckCircle className="size-12 text-primary" />
            </div>
            <h2 className="mb-2 text-3xl font-bold">All Done!</h2>
            <p className="text-muted-foreground">
              Thank you for using War9a
            </p>
            <Button className="mt-6" asChild>
              <Link href={`/feedback/${entryId}`}>Leave Feedback</Link>
            </Button>
          </motion.div>
        ) : isWaiting ? (
          <motion.div
            key="waiting"
            className="my-8 text-center"
          >
            <div className="relative mb-6 inline-flex size-36 items-center justify-center">
              <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-secondary"
                />
                <motion.circle
                  cx="70"
                  cy="70"
                  r="60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="text-primary"
                  strokeDasharray={`${2 * Math.PI * 60}`}
                  strokeDashoffset={`${2 * Math.PI * 60 * (1 - Math.min((currentPosition ?? 1) / 20, 1))}`}
                  initial={false}
                  animate={{
                    strokeDashoffset: `${2 * Math.PI * 60 * (1 - Math.min((currentPosition ?? 1) / 20, 1))}`,
                  }}
                  transition={{ duration: 0.5 }}
                />
              </svg>
              <div>
                <div className="text-5xl font-bold text-primary">
                  {currentPosition ?? "?"}
                </div>
                <div className="text-xs text-muted-foreground">position</div>
              </div>
            </div>

            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <div className="text-center">
                <Clock className="mx-auto mb-1 size-4" />
                <div className="font-medium text-foreground">
                  {currentWait != null ? formatWaitTime(currentWait) : "—"}
                </div>
                <div className="text-xs">Est. wait</div>
              </div>
              <div className="text-center">
                <Users className="mx-auto mb-1 size-4" />
                <div className="font-medium text-foreground">
                  {entry.groupSize}
                </div>
                <div className="text-xs">Group size</div>
              </div>
              <div className="text-center">
                <Bell className="mx-auto mb-1 size-4" />
                <div className="font-medium text-foreground capitalize">
                  {entry.priority}
                </div>
                <div className="text-xs">Priority</div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="my-8 text-center">
            <Badge variant="muted" className="text-sm">
              {currentStatus}
            </Badge>
          </div>
        )}
      </AnimatePresence>

      {isWaiting && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
            You&apos;ll receive a notification when it&apos;s your turn.
            Keep this page open or enable push notifications.
          </div>
          <Button variant="destructive" className="w-full" asChild>
            <Link href={`/queue/${entryId}/leave`}>Leave Queue</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
