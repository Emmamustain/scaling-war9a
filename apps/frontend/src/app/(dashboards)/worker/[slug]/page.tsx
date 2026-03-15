"use client";

import { use, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { useQueueStore } from "@/stores/queue.store";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  ChevronRight,
  CheckSquare,
  Clock,
  Loader2,
  Power,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatWaitTime, getInitials } from "@/lib/utils";
import { haptic } from "@shared/mobile";

type QueueEntry = {
  id: string;
  position: number | null;
  groupSize: number;
  priority: string;
  status: string;
  entryTime: string;
  user: { id: string; displayName: string | null; avatarUrl: string | null; username: string } | null;
};

type BusinessGuichet = {
  id: string;
  name: string;
  status: string;
  service: { id: string; name: string } | null;
  currentWorker: { id: string; displayName: string | null } | null;
};

export default function WorkerDashboard({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { connect, subscribeToService } = useQueueStore();
  const [activeGuichetId, setActiveGuichetId] = useState<string | null>(null);

  const { data: business } = useQuery({
    queryKey: ["worker-business", slug],
    queryFn: () => fetchApi<{ id: string; name: string }>(`/businesses/${slug}`),
  });

  const { data: guichets } = useQuery({
    queryKey: ["worker-guichets", business?.id],
    queryFn: () => fetchApi<BusinessGuichet[]>(`/businesses/${business!.id}/guichets`),
    enabled: !!business?.id,
  });

  const activeGuichet = guichets?.find((g) => g.id === activeGuichetId);

  const { data: queue, refetch: refetchQueue } = useQuery({
    queryKey: ["worker-queue", activeGuichet?.service?.id],
    queryFn: () =>
      fetchApi<QueueEntry[]>(`/queue/service/${activeGuichet!.service!.id}/entries`),
    enabled: !!activeGuichet?.service?.id,
    refetchInterval: 15000,
  });

  const callNextMutation = useMutation({
    mutationFn: (guichetId: string) =>
      fetchApi<QueueEntry>(`/queue/service/${activeGuichet!.service!.id}/call-next`, {
        method: "POST",
        body: JSON.stringify({ guichetId }),
      }),
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

  const statusMutation = useMutation({
    mutationFn: ({ guichetId, status }: { guichetId: string; status: string }) =>
      fetchApi(`/businesses/${business?.id}/guichets/${guichetId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["worker-guichets"] });
    },
  });

  useEffect(() => {
    if (activeGuichet?.service?.id) {
      connect();
      subscribeToService(activeGuichet.service.id);
    }
  }, [activeGuichet?.service?.id, connect, subscribeToService]);

  const calledEntry = queue?.find((e) => e.status === "called");
  const waitingQueue = queue?.filter((e) => e.status === "waiting") ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Worker Dashboard</h1>
        <p className="text-muted-foreground">{business?.name}</p>
      </div>

      <div className="mb-6">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">MY WINDOWS</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {guichets?.map((guichet) => (
            <button
              key={guichet.id}
              onClick={() => setActiveGuichetId(guichet.id)}
              className={cn(
                "rounded-xl border p-4 text-left transition-all",
                activeGuichetId === guichet.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/50",
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{guichet.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {guichet.service?.name ?? "No service"}
                  </div>
                </div>
                <Badge
                  variant={
                    guichet.status === "open"
                      ? "success"
                      : guichet.status === "paused"
                        ? "warning"
                        : "muted"
                  }
                  className="capitalize"
                >
                  {guichet.status}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeGuichet && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{activeGuichet.name}</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  statusMutation.mutate({
                    guichetId: activeGuichet.id,
                    status: activeGuichet.status === "open" ? "paused" : "open",
                  })
                }
              >
                <Power className="size-4 mr-1" />
                {activeGuichet.status === "open" ? "Pause" : "Open"}
              </Button>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-primary">{waitingQueue.length}</div>
                <div className="text-xs text-muted-foreground">Waiting</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold">{calledEntry ? 1 : 0}</div>
                <div className="text-xs text-muted-foreground">Called</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <Clock className="mx-auto mb-1 size-5 text-muted-foreground" />
                <div className="text-xs text-muted-foreground">Active</div>
              </CardContent>
            </Card>
          </div>

          {calledEntry && (
            <Card className="mb-4 border-success/50 bg-success/5">
              <CardHeader>
                <CardTitle className="text-sm text-success">Currently Called</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold">
                      {getInitials(calledEntry.user?.displayName)}
                    </div>
                    <div>
                      <div className="font-medium">
                        {calledEntry.user?.displayName ?? "Anonymous"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Group of {calledEntry.groupSize}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => markServedMutation.mutate(calledEntry.id)}
                    disabled={markServedMutation.isPending}
                  >
                    {markServedMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckSquare className="size-4" />
                    )}
                    Served
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-medium">Queue ({waitingQueue.length})</h3>
            <Button
              size="sm"
              onClick={() => callNextMutation.mutate(activeGuichet.id)}
              disabled={
                waitingQueue.length === 0 ||
                !!calledEntry ||
                callNextMutation.isPending ||
                activeGuichet.status !== "open"
              }
            >
              {callNextMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ChevronRight className="size-4" />
              )}
              Call Next
            </Button>
          </div>

          <div className="space-y-2">
            {waitingQueue.length === 0 ? (
              <div className="rounded-xl border border-border bg-card py-12 text-center text-muted-foreground">
                <Users className="mx-auto mb-2 size-8 opacity-50" />
                <p>No one waiting</p>
              </div>
            ) : (
              waitingQueue.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-muted-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {entry.user?.displayName ?? "Anonymous"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Group of {entry.groupSize}
                      {entry.priority !== "normal" && (
                        <span className="ml-2 capitalize text-warning">
                          · {entry.priority}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
