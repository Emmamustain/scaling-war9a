"use client";

import { use, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { useQueueStore } from "@/stores/queue.store";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronRight,
  Check,
  SkipForward,
  Loader2,
  UserPlus,
  Trash2,
  Users,
  Monitor,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { cn, getInitials } from "@/lib/utils";
import { haptic } from "@shared/mobile";

type QueueEntry = {
  id: string;
  position: number | null;
  groupSize: number;
  priority: string;
  status: string;
  entryTime: string;
  notes: string | null;
  user: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
    username: string;
  } | null;
};

type BusinessGuichet = {
  id: string;
  name: string;
  status: string;
  serviceId: string | null;
  service: { id: string; name: string } | null;
  currentWorker: { id: string; displayName: string | null } | null;
};

type WorkerInfo = {
  id: string;
  role: string;
  user: {
    id: string;
    displayName: string | null;
    email: string;
    avatarUrl: string | null;
  };
};

// ─── Walk-in dialog (shared) ───

function WalkInDialog({
  open,
  onOpenChange,
  serviceId,
  serviceName,
  guichetId,
  businessId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  serviceId: string;
  serviceName: string;
  guichetId: string;
  businessId: string;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [group, setGroup] = useState(1);
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<"normal" | "priority" | "urgent">("normal");

  const mutation = useMutation({
    mutationFn: () =>
      fetchApi(`/queue/service/${serviceId}/walk-in`, {
        method: "POST",
        body: JSON.stringify({
          name: name || undefined,
          groupSize: group,
          notes: notes || undefined,
          priority,
        }),
      }),
    onSuccess: () => {
      toast.success("Customer added!");
      setName("");
      setGroup(1);
      setNotes("");
      setPriority("normal");
      onOpenChange(false);
      onSuccess();
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to add"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Walk-in Customer</DialogTitle>
        </DialogHeader>
        <p className="-mt-2 text-sm text-muted-foreground">{serviceName}</p>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Name (optional)</Label>
            <Input
              placeholder="Customer name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              className="h-12 text-base"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Group Size</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={group}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGroup(Number(e.target.value))}
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <select
                className="h-12 w-full rounded-lg border border-border bg-background px-3 text-base"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as typeof priority)
                }
              >
                <option value="normal">Normal</option>
                <option value="priority">Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Input
              placeholder="e.g. Elderly, wheelchair…"
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
              className="h-12 text-base"
            />
          </div>
          <Button
            className="h-14 w-full text-lg font-semibold"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <UserPlus className="size-5" />
            )}
            Add to Queue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Status change confirmation dialog ───

const STATUS_LABELS: Record<string, { label: string; description: string; color: string }> = {
  open: {
    label: "Open",
    description: "The window will start accepting customers from the queue.",
    color: "text-green-600",
  },
  paused: {
    label: "Paused",
    description: "The queue is paused. No new customers will be called until you reopen.",
    color: "text-yellow-600",
  },
  closed: {
    label: "Closed",
    description: "The window will be closed and stop serving customers.",
    color: "text-destructive",
  },
};

function StatusConfirmDialog({
  pendingStatus,
  onConfirm,
  onCancel,
  isPending,
}: {
  pendingStatus: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const info = pendingStatus ? STATUS_LABELS[pendingStatus] : null;
  return (
    <Dialog open={!!pendingStatus} onOpenChange={(open: boolean) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-yellow-500" />
            Change window status?
          </DialogTitle>
          {info && (
            <DialogDescription className="pt-1">
              <span className={cn("font-semibold", info.color)}>
                Set to {info.label}.{" "}
              </span>
              {info.description}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" className="h-12 flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="h-12 flex-1"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Manager: individual guichet card ───

function ManagerGuichetCard({
  guichet,
  businessId,
}: {
  guichet: BusinessGuichet;
  businessId: string;
}) {
  const queryClient = useQueryClient();
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const { data: queue, refetch: refetchQueue } = useQuery({
    queryKey: ["manager-queue", guichet.service?.id],
    queryFn: () =>
      fetchApi<QueueEntry[]>(`/queue/service/${guichet.service!.id}/entries`),
    enabled: !!guichet.service?.id,
    refetchInterval: 10000,
  });

  const callNextMutation = useMutation({
    mutationFn: () =>
      fetchApi<QueueEntry>(`/queue/service/${guichet.service!.id}/call-next`, {
        method: "POST",
        body: JSON.stringify({ guichetId: guichet.id }),
      }),
    onSuccess: () => {
      void haptic("success");
      toast.success("Called next!");
      void refetchQueue();
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed"),
  });

  const markServedMutation = useMutation({
    mutationFn: (entryId: string) =>
      fetchApi(`/queue/entry/${entryId}/served`, { method: "PUT" }),
    onSuccess: () => {
      void haptic("light");
      toast.success("Marked as served");
      void refetchQueue();
    },
  });

  const markNoShowMutation = useMutation({
    mutationFn: (entryId: string) =>
      fetchApi(`/queue/entry/${entryId}/no-show`, { method: "PUT" }),
    onSuccess: () => {
      toast.success("Marked as no-show");
      void refetchQueue();
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) =>
      fetchApi(`/businesses/${businessId}/guichets/${guichet.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["worker-guichets"] }),
  });

  const calledEntry = queue?.find((e: QueueEntry) => e.status === "called");
  const waitingQueue = queue?.filter((e: QueueEntry) => e.status === "waiting") ?? [];

  const statusColor =
    guichet.status === "open"
      ? "bg-green-500"
      : guichet.status === "paused"
        ? "bg-yellow-500"
        : "bg-muted-foreground/40";

  return (
    <div className="rounded-2xl border bg-card">
      {/* Card header: name + service + status toggle */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <span
          className={cn("inline-block size-2.5 shrink-0 rounded-full", statusColor)}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{guichet.name}</span>
            {guichet.service && (
              <span className="truncate text-sm text-muted-foreground">
                · {guichet.service.name}
              </span>
            )}
          </div>
          {guichet.currentWorker && (
            <p className="text-xs text-muted-foreground">
              {guichet.currentWorker.displayName ?? "Worker"}
            </p>
          )}
        </div>
        {/* Status toggle in header */}
        <div className="flex gap-1 rounded-xl bg-secondary/80 p-1">
          {(["open", "paused", "closed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                if (guichet.status !== s) setPendingStatus(s);
              }}
              disabled={statusMutation.isPending}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all",
                guichet.status === s
                  ? s === "open"
                    ? "bg-green-500 text-white shadow-sm"
                    : s === "paused"
                      ? "bg-yellow-500 text-white shadow-sm"
                      : "bg-muted-foreground text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 p-4">
        {/* No service configured */}
        {!guichet.service ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No service assigned to this window
          </p>
        ) : (
          <>
            {/* Currently serving */}
            {calledEntry && (
              <div className="rounded-xl border border-green-500/30 bg-green-50 p-3 dark:bg-green-950/20">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
                  Now Serving
                </p>
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-sm font-bold text-green-700 dark:text-green-300">
                    {getInitials(calledEntry.user?.displayName)}
                  </div>
                  <div>
                    <div className="font-semibold">
                      {calledEntry.user?.displayName ??
                        calledEntry.notes ??
                        "Anonymous"}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>×{calledEntry.groupSize}</span>
                      {calledEntry.priority !== "normal" && (
                        <Badge variant="warning" className="text-xs capitalize">
                          {calledEntry.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="h-12 bg-green-600 font-bold hover:bg-green-700"
                    onClick={() => markServedMutation.mutate(calledEntry.id)}
                    disabled={markServedMutation.isPending}
                  >
                    {markServedMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Check className="size-4" />
                    )}
                    Done
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 font-bold text-destructive hover:bg-destructive/10"
                    onClick={() => markNoShowMutation.mutate(calledEntry.id)}
                    disabled={markNoShowMutation.isPending}
                  >
                    {markNoShowMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <SkipForward className="size-4" />
                    )}
                    No-show
                  </Button>
                </div>
              </div>
            )}

            {/* Waiting count — big section */}
            <div className="rounded-xl border bg-secondary/40 py-5 text-center">
              <div className="text-5xl font-black tabular-nums text-primary">
                {waitingQueue.length}
              </div>
              <div className="mt-1 text-sm font-medium text-muted-foreground">
                {waitingQueue.length === 1 ? "person waiting" : "people waiting"}
              </div>
            </div>

            {/* Call next */}
            <Button
              className="h-14 w-full text-lg font-bold"
              onClick={() => callNextMutation.mutate()}
              disabled={
                waitingQueue.length === 0 ||
                !!calledEntry ||
                callNextMutation.isPending ||
                guichet.status !== "open"
              }
            >
              {callNextMutation.isPending ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <ChevronRight className="size-5" />
              )}
              Call Next
            </Button>

            {/* Walk-in */}
            <Button
              variant="outline"
              className="h-10 w-full text-sm"
              onClick={() => setWalkInOpen(true)}
            >
              <UserPlus className="size-4" />
              Add Walk-in
            </Button>

            <StatusConfirmDialog
              pendingStatus={pendingStatus}
              onConfirm={() => {
                if (pendingStatus) statusMutation.mutate(pendingStatus);
                setPendingStatus(null);
              }}
              onCancel={() => setPendingStatus(null)}
              isPending={statusMutation.isPending}
            />

            {/* Waiting list preview (first 3) */}
            {waitingQueue.length > 0 && (
              <div className="space-y-1.5">
                {waitingQueue.slice(0, 3).map((entry: QueueEntry, i: number) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2 text-sm"
                  >
                    <span className="w-5 shrink-0 text-center font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {entry.user?.displayName ?? entry.notes ?? "Walk-in"}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      ×{entry.groupSize}
                    </span>
                    {entry.priority !== "normal" && (
                      <span className="shrink-0 text-xs capitalize text-orange-500">
                        {entry.priority}
                      </span>
                    )}
                  </div>
                ))}
                {waitingQueue.length > 3 && (
                  <p className="text-center text-xs text-muted-foreground">
                    +{waitingQueue.length - 3} more
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Walk-in dialog */}
      {guichet.service && (
        <WalkInDialog
          open={walkInOpen}
          onOpenChange={setWalkInOpen}
          serviceId={guichet.service.id}
          serviceName={guichet.service.name}
          guichetId={guichet.id}
          businessId={businessId}
          onSuccess={() =>
            void queryClient.invalidateQueries({
              queryKey: ["manager-queue", guichet.service?.id],
            })
          }
        />
      )}
    </div>
  );
}

/// ─── Manager view: tabbed guichets ───

function ManagerQueueView({
  business,
  guichets,
}: {
  business: { id: string; name: string };
  guichets: BusinessGuichet[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    guichets[0]?.id ?? null,
  );

  // Keep selection valid if guichets change
  const selected = guichets.find((g) => g.id === selectedId) ?? guichets[0];

  if (guichets.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed py-16 text-center">
        <Monitor className="mx-auto mb-3 size-12 opacity-20" />
        <p className="font-medium text-muted-foreground">No windows configured</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add guichets in the Guichets tab to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Guichet tabs */}
      {guichets.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {guichets.map((g) => {
            const statusColor =
              g.status === "open"
                ? "bg-green-500"
                : g.status === "paused"
                  ? "bg-yellow-500"
                  : "bg-muted-foreground/40";
            return (
              <button
                key={g.id}
                onClick={() => setSelectedId(g.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-medium transition-all",
                  selected?.id === g.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground",
                )}
              >
                <span className={cn("inline-block size-2 rounded-full", statusColor)} />
                {g.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Selected guichet card */}
      {selected && (
        <ManagerGuichetCard key={selected.id} guichet={selected} businessId={business.id} />
      )}
    </div>
  );
}

// ─── Worker view: focused single-queue, assigned windows only ───

function WorkerQueueView({
  business,
  assignedGuichets = [],
  guichetsLoading,
}: {
  business: { id: string; name: string };
  assignedGuichets?: BusinessGuichet[];
  guichetsLoading: boolean;
}) {
  const queryClient = useQueryClient();
  const { connect, subscribeToService } = useQueueStore();
  const [activeGuichetId, setActiveGuichetId] = useState<string | null>(null);
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  // Auto-select first assigned guichet
  useEffect(() => {
    if (assignedGuichets.length > 0 && !activeGuichetId) {
      setActiveGuichetId(assignedGuichets[0].id);
    }
  }, [assignedGuichets, activeGuichetId]);

  const activeGuichet = assignedGuichets.find((g) => g.id === activeGuichetId);

  const { data: queue, refetch: refetchQueue } = useQuery({
    queryKey: ["worker-queue", activeGuichet?.service?.id],
    queryFn: () =>
      fetchApi<QueueEntry[]>(
        `/queue/service/${activeGuichet!.service!.id}/entries`,
      ),
    enabled: !!activeGuichet?.service?.id,
    refetchInterval: 10000,
  });

  const { data: analytics } = useQuery({
    queryKey: ["worker-analytics", business.id],
    queryFn: () =>
      fetchApi<{ summary: { servedEntries: number } }>(`/analytics/business/${business.id}`),
  });

  useEffect(() => {
    if (activeGuichet?.service?.id) {
      connect();
      subscribeToService(activeGuichet.service.id);
    }
  }, [activeGuichet?.service?.id, connect, subscribeToService]);

  const callNextMutation = useMutation({
    mutationFn: () =>
      fetchApi<QueueEntry>(
        `/queue/service/${activeGuichet!.service!.id}/call-next`,
        {
          method: "POST",
          body: JSON.stringify({ guichetId: activeGuichetId }),
        },
      ),
    onSuccess: () => {
      void haptic("success");
      toast.success("Called next customer!");
      void refetchQueue();
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to call next"),
  });

  const markServedMutation = useMutation({
    mutationFn: (entryId: string) =>
      fetchApi(`/queue/entry/${entryId}/served`, { method: "PUT" }),
    onSuccess: () => {
      void haptic("light");
      toast.success("Marked as served");
      void refetchQueue();
    },
  });

  const markNoShowMutation = useMutation({
    mutationFn: (entryId: string) =>
      fetchApi(`/queue/entry/${entryId}/no-show`, { method: "PUT" }),
    onSuccess: () => {
      toast.success("Marked as no-show");
      void refetchQueue();
    },
  });

  const leaveQueueMutation = useMutation({
    mutationFn: (entryId: string) =>
      fetchApi(`/queue/entry/${entryId}/leave`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Removed from queue");
      void refetchQueue();
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ status }: { status: string }) =>
      fetchApi(`/businesses/${business.id}/guichets/${activeGuichetId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["worker-guichets"] }),
  });

  const calledEntry = queue?.find((e: QueueEntry) => e.status === "called");
  const waitingQueue = queue?.filter((e: QueueEntry) => e.status === "waiting") ?? [];

  if (guichetsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  // No windows assigned to this worker
  if (assignedGuichets.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed py-16 text-center">
        <Users className="mx-auto mb-3 size-12 opacity-20" />
        <p className="font-medium text-muted-foreground">No window assigned</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask your manager to assign you to a window.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Window tabs (if multiple assigned) */}
      {assignedGuichets.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {assignedGuichets.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGuichetId(g.id)}
              className={cn(
                "shrink-0 rounded-full border-2 px-4 py-2 text-sm font-medium transition-all",
                activeGuichetId === g.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground",
              )}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      {/* Status bar */}
      {activeGuichet && (
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-3">
          <div className="flex gap-1 rounded-xl bg-secondary/80 p-1">
            {(["open", "paused", "closed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  if (activeGuichet.status !== s) setPendingStatus(s);
                }}
                disabled={
                  statusMutation.isPending ||
                  (s === "open" && !activeGuichet.service)
                }
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all",
                  activeGuichet.status === s
                    ? s === "open"
                      ? "bg-green-500 text-white shadow-sm"
                      : s === "paused"
                        ? "bg-yellow-500 text-white shadow-sm"
                        : "bg-muted-foreground text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-primary">
                {waitingQueue.length}
              </div>
              <div className="text-[10px] text-muted-foreground">Waiting</div>
            </div>
            <div>
              <div className="text-lg font-bold">
                {analytics?.summary.servedEntries ?? 0}
              </div>
              <div className="text-[10px] text-muted-foreground">Served</div>
            </div>
          </div>
        </div>
      )}

      <StatusConfirmDialog
        pendingStatus={pendingStatus}
        onConfirm={() => {
          if (pendingStatus) statusMutation.mutate({ status: pendingStatus });
          setPendingStatus(null);
        }}
        onCancel={() => setPendingStatus(null)}
        isPending={statusMutation.isPending}
      />

      {/* Currently serving */}
      {calledEntry && (
        <div className="rounded-2xl border-2 border-green-500/30 bg-green-50 p-4 dark:bg-green-950/20">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">
            Now Serving
          </p>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-full bg-green-500/20 text-xl font-bold text-green-700 dark:text-green-300">
              {getInitials(calledEntry.user?.displayName)}
            </div>
            <div>
              <div className="text-xl font-semibold">
                {calledEntry.user?.displayName ??
                  calledEntry.notes ??
                  "Anonymous"}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Group of {calledEntry.groupSize}</span>
                {calledEntry.priority !== "normal" && (
                  <Badge variant="warning" className="text-xs capitalize">
                    {calledEntry.priority}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              className="h-14 bg-green-600 text-lg font-bold hover:bg-green-700"
              onClick={() => markServedMutation.mutate(calledEntry.id)}
              disabled={markServedMutation.isPending}
            >
              {markServedMutation.isPending ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Check className="size-5" />
              )}
              Done
            </Button>
            <Button
              variant="outline"
              className="h-14 text-lg font-bold text-destructive hover:bg-destructive/10"
              onClick={() => markNoShowMutation.mutate(calledEntry.id)}
              disabled={markNoShowMutation.isPending}
            >
              {markNoShowMutation.isPending ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <SkipForward className="size-5" />
              )}
              Skip
            </Button>
          </div>
        </div>
      )}

      {/* CALL NEXT — most important button */}
      <Button
        className={cn(
          "h-16 w-full text-xl font-bold shadow-lg",
          !calledEntry && waitingQueue.length > 0
            ? "bg-primary hover:bg-primary/90"
            : "",
        )}
        onClick={() => callNextMutation.mutate()}
        disabled={
          waitingQueue.length === 0 ||
          !!calledEntry ||
          callNextMutation.isPending ||
          activeGuichet?.status !== "open" ||
          !activeGuichet?.service
        }
      >
        {callNextMutation.isPending ? (
          <Loader2 className="size-6 animate-spin" />
        ) : (
          <ChevronRight className="size-6" />
        )}
        Call Next{waitingQueue.length > 0 ? ` (${waitingQueue.length})` : ""}
      </Button>

      {/* Add walk-in */}
      <Button
        variant="outline"
        className="h-12 w-full text-base font-medium"
        onClick={() => setWalkInOpen(true)}
        disabled={!activeGuichet?.service}
      >
        <UserPlus className="size-5" />
        Add Walk-in
      </Button>

      {/* Waiting list */}
      {waitingQueue.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Waiting ({waitingQueue.length})
          </h3>
          {waitingQueue.map((entry: QueueEntry, i: number) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 rounded-2xl border bg-card p-3"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-muted-foreground">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">
                  {entry.user?.displayName ?? entry.notes ?? "Walk-in"}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>×{entry.groupSize}</span>
                  {entry.priority !== "normal" && (
                    <span className="capitalize text-orange-500">
                      {entry.priority}
                    </span>
                  )}
                  {!entry.user && <span className="opacity-60">walk-in</span>}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => leaveQueueMutation.mutate(entry.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {waitingQueue.length === 0 && !calledEntry && (
        <div className="rounded-2xl border-2 border-dashed py-16 text-center text-muted-foreground">
          <Users className="mx-auto mb-3 size-12 opacity-20" />
          <p className="font-medium">No one in queue</p>
          <p className="mt-1 text-sm">
            Customers will appear here when they join
          </p>
        </div>
      )}

      {/* Walk-in dialog */}
      {activeGuichet?.service && (
        <WalkInDialog
          open={walkInOpen}
          onOpenChange={setWalkInOpen}
          serviceId={activeGuichet.service.id}
          serviceName={activeGuichet.service.name}
          guichetId={activeGuichetId!}
          businessId={business.id}
          onSuccess={() => void refetchQueue()}
        />
      )}
    </div>
  );
}

// ─── Root page: determines role and branches ───

export default function WorkerQueuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { user } = useAuthStore();

  const { data: business } = useQuery({
    queryKey: ["worker-business", slug],
    queryFn: () =>
      fetchApi<{ id: string; name: string; logoUrl: string | null }>(
        `/businesses/${slug}`,
      ),
  });

  const { data: workers } = useQuery({
    queryKey: ["worker-team", business?.id],
    queryFn: () =>
      fetchApi<WorkerInfo[]>(`/businesses/${business!.id}/workers`),
    enabled: !!business?.id,
  });

  const { data: guichets, isLoading: guichetsLoading } = useQuery({
    queryKey: ["worker-guichets", business?.id],
    queryFn: () =>
      fetchApi<BusinessGuichet[]>(`/businesses/${business!.id}/guichets`),
    enabled: !!business?.id,
    refetchInterval: 20000,
  });

  const myProfile = workers?.find((w: WorkerInfo) => w.user.id === user?.id);
  const isManager = myProfile?.role === "manager";

  // Filter to only the guichets assigned to this worker
  const assignedGuichets = (guichets ?? []).filter(
    (g: BusinessGuichet) => g.currentWorker?.id === user?.id,
  );

  if (!business || guichetsLoading || !workers) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isManager) {
    return (
      <ManagerQueueView business={business} guichets={guichets ?? []} />
    );
  }

  return (
    <WorkerQueueView
      business={business}
      assignedGuichets={assignedGuichets}
      guichetsLoading={guichetsLoading}
    />
  );
}
