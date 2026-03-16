"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, ApiError } from "@/lib/fetch";
import { useAuthStore } from "@/stores/auth.store";
import ForfeitQueueDialog from "@/components/queue/forfeit-queue-dialog";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Clock,
  Loader2,
  ChevronUp,
  ChevronDown,
  User,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn, formatWaitTime } from "@/lib/utils";

type ServiceStatus = {
  serviceId: string;
  serviceName: string;
  businessName: string;
  businessSlug: string;
  waitingCount: number;
  estimatedWaitMinutes: number;
  status: string;
  maxCapacity: number | null;
};

const PRIORITY_OPTIONS = [
  { id: "normal", label: "Normal" },
  { id: "priority", label: "Priority (Elderly/Disabled)" },
  { id: "urgent", label: "Urgent" },
] as const;

export default function JoinQueuePage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = use(params);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [groupSize, setGroupSize] = useState(1);
  const [forfeitEntry, setForfeitEntry] = useState<{
    id: string;
    serviceName: string;
    businessName: string;
    businessSlug: string;
    position: number;
  } | null>(null);
  const [priority, setPriority] = useState<"normal" | "priority" | "urgent">("normal");
  const [anonymousName, setAnonymousName] = useState("");
  const [anonymousPhone, setAnonymousPhone] = useState("");

  const { data: status, isLoading } = useQuery({
    queryKey: ["join-service-status", serviceId],
    queryFn: () => fetchApi<ServiceStatus>(`/queue/service/${serviceId}/status`),
    refetchInterval: 15000,
  });

  const joinMutation = useMutation({
    mutationFn: () =>
      fetchApi<{ id: string }>(`/queue/service/${serviceId}/join`, {
        method: "POST",
        body: JSON.stringify({
          groupSize,
          priority,
          ...(!isAuthenticated && {
            anonymous: true,
            anonymousName: anonymousName.trim() || undefined,
            anonymousPhone: anonymousPhone.trim() || undefined,
          }),
        }),
      }),
    onSuccess: (entry: { id: string }) => {
      toast.success("Joined queue!");
      void queryClient.invalidateQueries({ queryKey: ["queue", "my-entries"] });
      router.push(`/queue/${entry.id}`);
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
      void queryClient.invalidateQueries({ queryKey: ["queue", "my-entries"] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to leave queue"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!status) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg">Service not found</p>
        <Link href="/discover" className="text-primary hover:underline">
          Back to Discover
        </Link>
      </div>
    );
  }

  const isClosed = status.status !== "open";
  const isFull =
    status.maxCapacity != null && status.waitingCount >= status.maxCapacity;

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <div className="mb-8 text-center">
        <Badge
          variant={isClosed ? "muted" : "success"}
          className="mb-3 capitalize text-sm"
        >
          {status.status}
        </Badge>
        <h1 className="text-2xl font-bold">{status.serviceName}</h1>
        <p className="text-muted-foreground">{status.businessName}</p>
      </div>

      <div className="mb-8 flex justify-center gap-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{status.waitingCount}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="size-3" />
            Waiting
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">
            ~{formatWaitTime(status.estimatedWaitMinutes)}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            Est. wait
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">Group Size</label>
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg border border-border p-2 hover:bg-secondary disabled:opacity-50"
              onClick={() => setGroupSize((n) => Math.max(1, n - 1))}
              disabled={groupSize <= 1}
            >
              <ChevronDown className="size-4" />
            </button>
            <span className="min-w-8 text-center text-xl font-bold">{groupSize}</span>
            <button
              className="rounded-lg border border-border p-2 hover:bg-secondary disabled:opacity-50"
              onClick={() => setGroupSize((n) => Math.min(10, n + 1))}
              disabled={groupSize >= 10}
            >
              <ChevronUp className="size-4" />
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Priority</label>
          <div className="flex flex-col gap-2">
            {PRIORITY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setPriority(opt.id)}
                className={cn(
                  "rounded-xl border p-3 text-left text-sm transition-colors",
                  priority === opt.id
                    ? "border-primary bg-primary/10 font-medium"
                    : "border-border hover:bg-secondary/50",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {!isAuthenticated && (
          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="size-4" />
              Anonymous Join (Optional)
            </div>
            <Input
              placeholder="Your name"
              value={anonymousName}
              onChange={(e) => setAnonymousName(e.target.value)}
            />
            <Input
              placeholder="Phone number"
              value={anonymousPhone}
              onChange={(e) => setAnonymousPhone(e.target.value)}
              type="tel"
            />
            <p className="text-xs text-muted-foreground">
              Or{" "}
              <Link href="/sign-in" className="text-primary hover:underline">
                sign in
              </Link>{" "}
              for a better experience
            </p>
          </div>
        )}

        <Button
          className="w-full"
          size="lg"
          disabled={isClosed || isFull || joinMutation.isPending}
          onClick={() => joinMutation.mutate()}
        >
          {joinMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isFull ? (
            "Queue Full"
          ) : isClosed ? (
            "Service Closed"
          ) : isAuthenticated ? (
            <span className="flex items-center gap-2">
              <UserCheck className="size-4" />
              Join Queue
            </span>
          ) : (
            "Join as Guest"
          )}
        </Button>
      </div>

      <ForfeitQueueDialog
        open={!!forfeitEntry}
        onOpenChange={(open) => !open && setForfeitEntry(null)}
        currentEntry={forfeitEntry}
        onConfirm={() => {
          if (forfeitEntry)
            leaveMutation.mutate({ entryId: forfeitEntry.id, forForfeit: true });
        }}
        isPending={leaveMutation.isPending || joinMutation.isPending}
      />
    </div>
  );
}
