"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
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
import { AlertTriangle, Loader2, Infinity } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type BusinessGuichet = {
  id: string;
  name: string;
  status: string;
  serviceId: string | null;
  service: {
    id: string;
    name: string;
    maxCapacity: number | null;
  } | null;
  currentWorker: { id: string; displayName: string | null } | null;
};

type BusinessWorker = {
  id: string;
  role: string;
  user: { id: string; displayName: string | null; email: string };
};

const STATUS_LABELS: Record<string, { label: string; description: string }> = {
  open: {
    label: "Open",
    description: "The window will start accepting customers from the queue.",
  },
  paused: {
    label: "Paused",
    description: "Queue paused — no new customers will be called until reopened.",
  },
  closed: {
    label: "Closed",
    description: "The window will be closed and stop serving customers.",
  },
};

const INFINITE_CAP = 9999;

export default function WindowsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const queryClient = useQueryClient();
  const [pendingStatus, setPendingStatus] = useState<{
    guichetId: string;
    status: string;
  } | null>(null);

  const { data: business } = useQuery({
    queryKey: ["worker-business", slug],
    queryFn: () =>
      fetchApi<{ id: string; name: string }>(`/businesses/${slug}`),
  });

  const { data: guichets, isLoading } = useQuery({
    queryKey: ["worker-guichets", business?.id],
    queryFn: () =>
      fetchApi<BusinessGuichet[]>(`/businesses/${business!.id}/guichets`),
    enabled: !!business?.id,
  });

  const { data: workers } = useQuery({
    queryKey: ["worker-team", business?.id],
    queryFn: () =>
      fetchApi<BusinessWorker[]>(`/businesses/${business!.id}/workers`),
    enabled: !!business?.id,
  });

  const statusMutation = useMutation({
    mutationFn: ({ guichetId, status }: { guichetId: string; status: string }) =>
      fetchApi(`/businesses/${business!.id}/guichets/${guichetId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      toast.success("Status updated");
      void queryClient.invalidateQueries({ queryKey: ["worker-guichets"] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed"),
  });

  const assignWorkerMutation = useMutation({
    mutationFn: ({ guichetId, workerId }: { guichetId: string; workerId: string | null }) =>
      fetchApi(`/businesses/${business!.id}/guichets/${guichetId}/assign-worker`, {
        method: "PUT",
        body: JSON.stringify({ workerId }),
      }),
    onSuccess: () => {
      toast.success("Worker assigned");
      void queryClient.invalidateQueries({ queryKey: ["worker-guichets"] });
    },
  });

  const capMutation = useMutation({
    mutationFn: ({ serviceId, maxCapacity }: { serviceId: string; maxCapacity: number }) =>
      fetchApi(`/businesses/${business!.id}/services/${serviceId}`, {
        method: "PUT",
        body: JSON.stringify({ maxCapacity }),
      }),
    onSuccess: () => {
      toast.success("Queue cap updated");
      void queryClient.invalidateQueries({ queryKey: ["worker-guichets"] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(guichets ?? []).map((guichet: BusinessGuichet) => (
        <GuichetCard
          key={guichet.id}
          guichet={guichet}
          workers={workers ?? []}
          onStatusChange={(status) =>
            setPendingStatus({ guichetId: guichet.id, status })
          }
          onWorkerAssign={(workerId) =>
            assignWorkerMutation.mutate({ guichetId: guichet.id, workerId })
          }
          onCapChange={(maxCapacity) => {
            if (!guichet.service) return;
            capMutation.mutate({ serviceId: guichet.service.id, maxCapacity });
          }}
          isAssignPending={assignWorkerMutation.isPending}
          isCapPending={capMutation.isPending}
        />
      ))}

      {guichets?.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed py-16 text-center text-sm text-muted-foreground">
          No windows configured yet.
        </div>
      )}

      {/* Status confirm dialog */}
      <Dialog
        open={!!pendingStatus}
        onOpenChange={(open: boolean) => !open && setPendingStatus(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-yellow-500" />
              Change window status?
            </DialogTitle>
            {pendingStatus && (
              <DialogDescription>
                <span className="font-semibold">
                  Set to {STATUS_LABELS[pendingStatus.status]?.label}.{" "}
                </span>
                {STATUS_LABELS[pendingStatus.status]?.description}
              </DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="h-12 flex-1"
              onClick={() => setPendingStatus(null)}
            >
              Cancel
            </Button>
            <Button
              className="h-12 flex-1"
              disabled={statusMutation.isPending}
              onClick={() => {
                if (pendingStatus) {
                  statusMutation.mutate(pendingStatus);
                }
                setPendingStatus(null);
              }}
            >
              {statusMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GuichetCard({
  guichet,
  workers,
  onStatusChange,
  onWorkerAssign,
  onCapChange,
  isAssignPending,
  isCapPending,
}: {
  guichet: BusinessGuichet;
  workers: BusinessWorker[];
  onStatusChange: (status: string) => void;
  onWorkerAssign: (workerId: string | null) => void;
  onCapChange: (maxCapacity: number) => void;
  isAssignPending: boolean;
  isCapPending: boolean;
}) {
  const currentCap = guichet.service?.maxCapacity ?? 200;
  const isInfinite = currentCap >= INFINITE_CAP;
  const [capValue, setCapValue] = useState(isInfinite ? 200 : currentCap);

  const statusColor =
    guichet.status === "open"
      ? "bg-green-500"
      : guichet.status === "paused"
        ? "bg-yellow-500"
        : "bg-muted-foreground/40";

  return (
    <div className="rounded-2xl border bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <span className={cn("inline-block size-2.5 shrink-0 rounded-full", statusColor)} />
        <div className="min-w-0 flex-1">
          <span className="font-semibold">{guichet.name}</span>
          {guichet.service && (
            <span className="ml-2 text-sm text-muted-foreground">
              · {guichet.service.name}
            </span>
          )}
        </div>
        <Badge
          variant={
            guichet.status === "open"
              ? "success"
              : guichet.status === "paused"
                ? "warning"
                : "muted"
          }
          className="shrink-0 capitalize"
        >
          {guichet.status}
        </Badge>
      </div>

      <div className="space-y-4 p-4">
        {/* Status control */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Window Status</Label>
          <div className="flex gap-1 rounded-xl bg-secondary/80 p-1">
            {(["open", "paused", "closed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  if (guichet.status !== s) onStatusChange(s);
                }}
                className={cn(
                  "flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition-all",
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

        {/* Worker assignment */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Assigned Worker</Label>
          <select
            className="h-12 w-full rounded-xl border border-border bg-background px-3 text-base"
            value={guichet.currentWorker?.id ?? ""}
            onChange={(e) => onWorkerAssign(e.target.value || null)}
            disabled={isAssignPending}
          >
            <option value="">— Unassigned —</option>
            {workers.map((w) => (
              <option key={w.user.id} value={w.user.id}>
                {w.user.displayName ?? w.user.email} ({w.role})
              </option>
            ))}
          </select>
        </div>

        {/* Queue cap — only if service is assigned */}
        {guichet.service && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Queue Capacity</Label>
            {/* Mode toggle */}
            <div className="flex gap-2 rounded-xl border p-1">
              <button
                onClick={() => {
                  if (isInfinite) onCapChange(capValue > 0 ? capValue : 200);
                }}
                className={cn(
                  "flex-1 rounded-lg py-2 text-sm font-semibold transition-all",
                  !isInfinite
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Capped
              </button>
              <button
                onClick={() => {
                  if (!isInfinite) onCapChange(INFINITE_CAP);
                }}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all",
                  isInfinite
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Infinity className="size-4" />
                Infinite
              </button>
            </div>

            {/* Cap value input — only shown in capped mode */}
            {!isInfinite && (
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  max={9998}
                  value={capValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCapValue(Number(e.target.value))}
                  className="h-12 flex-1 text-base"
                  placeholder="Max people in queue"
                />
                <Button
                  className="h-12 px-5"
                  disabled={isCapPending || capValue < 1}
                  onClick={() => onCapChange(capValue)}
                >
                  {isCapPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
