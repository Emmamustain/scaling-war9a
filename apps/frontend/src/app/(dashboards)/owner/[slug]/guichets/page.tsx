"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Loader2, Monitor, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type OwnerBusiness = {
  id: string;
  name: string;
  slug: string;
  status: string;
  logoUrl: string | null;
  coverUrl: string | null;
  description: string;
  location: string;
  city: string;
  phone: string | null;
  latitude: string | null;
  longitude: string | null;
  isOpen: boolean;
  services: Array<{
    id: string;
    name: string;
    isActive: boolean;
    maxCapacity: number | null;
    averageTime: string | null;
  }>;
  workers: Array<{
    id: string;
    role: string;
    score: number;
    user: {
      id: string;
      displayName: string | null;
      email: string;
      avatarUrl: string | null;
    };
  }>;
  hours: Array<{
    id: string;
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>;
};

type Guichet = {
  id: string;
  name: string;
  status: "open" | "closed" | "paused";
  serviceId: string | null;
  service: { id: string; name: string } | null;
  currentWorkerId: string | null;
  currentWorker: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  } | null;
};

function StatusDot({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-block size-2 rounded-full",
        status === "open"
          ? "bg-green-500"
          : status === "paused"
            ? "bg-yellow-500"
            : "bg-muted-foreground/40",
      )}
    />
  );
}

export default function GuichetsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newGuichetName, setNewGuichetName] = useState("");
  const [newGuichetServiceId, setNewGuichetServiceId] = useState("");
  const [newGuichetWorkerId, setNewGuichetWorkerId] = useState("");

  const { data: business, isLoading } = useQuery({
    queryKey: ["owner-business", slug],
    queryFn: () => fetchApi<OwnerBusiness>(`/businesses/${slug}/manage`),
  });

  const { data: guichets, isLoading: guichetsLoading } = useQuery({
    queryKey: ["owner-guichets", business?.id],
    queryFn: () =>
      fetchApi<Guichet[]>(`/businesses/${business!.id}/guichets`),
    enabled: !!business?.id,
    refetchInterval: 30000,
  });

  // --- Mutations ---

  const addGuichetMutation = useMutation({
    mutationFn: () =>
      fetchApi<{ id: string }>(`/businesses/${business!.id}/guichets`, {
        method: "POST",
        body: JSON.stringify({
          name: newGuichetName,
          serviceId: newGuichetServiceId || undefined,
        }),
      }),
    onSuccess: async (guichet: { id: string }) => {
      if (newGuichetWorkerId) {
        await fetchApi(
          `/businesses/${business!.id}/guichets/${guichet.id}/assign-worker`,
          {
            method: "PUT",
            body: JSON.stringify({ workerId: newGuichetWorkerId }),
          },
        );
      }
      toast.success("Guichet created!");
      setDialogOpen(false);
      setNewGuichetName("");
      setNewGuichetServiceId("");
      setNewGuichetWorkerId("");
      void queryClient.invalidateQueries({ queryKey: ["owner-guichets"] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "Failed to create guichet",
      ),
  });

  const deleteGuichetMutation = useMutation({
    mutationFn: (guichetId: string) =>
      fetchApi(`/businesses/${business!.id}/guichets/${guichetId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Guichet deleted");
      void queryClient.invalidateQueries({ queryKey: ["owner-guichets"] });
    },
  });

  const guichetStatusMutation = useMutation({
    mutationFn: ({
      guichetId,
      status,
    }: {
      guichetId: string;
      status: string;
    }) =>
      fetchApi(
        `/businesses/${business!.id}/guichets/${guichetId}/status`,
        {
          method: "PUT",
          body: JSON.stringify({ status }),
        },
      ),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["owner-guichets"] }),
  });

  const assignServiceMutation = useMutation({
    mutationFn: ({
      guichetId,
      serviceId,
    }: {
      guichetId: string;
      serviceId: string | null;
    }) =>
      fetchApi(
        `/businesses/${business!.id}/guichets/${guichetId}/assign-service`,
        {
          method: "PUT",
          body: JSON.stringify({ serviceId }),
        },
      ),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["owner-guichets"] }),
  });

  const assignWorkerMutation = useMutation({
    mutationFn: ({
      guichetId,
      workerId,
    }: {
      guichetId: string;
      workerId: string | null;
    }) =>
      fetchApi(
        `/businesses/${business!.id}/guichets/${guichetId}/assign-worker`,
        {
          method: "PUT",
          body: JSON.stringify({ workerId }),
        },
      ),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["owner-guichets"] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!business) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {(guichets ?? []).length} guichet
          {(guichets ?? []).length !== 1 ? "s" : ""}
        </p>
        <Button
          className="h-12 rounded-2xl px-6 text-base"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="size-5" />
          New Guichet
        </Button>
      </div>

      {/* Create Guichet Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create Guichet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-base">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                className="h-12 rounded-2xl text-base"
                placeholder="e.g. Window 1, Counter A..."
                value={newGuichetName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGuichetName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base">
                Service{" "}
                <span className="text-sm text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <select
                className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-base"
                value={newGuichetServiceId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewGuichetServiceId(e.target.value)}
              >
                <option value="">-- None --</option>
                {business.services.map((s: OwnerBusiness["services"][number]) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-base">
                Assign Worker{" "}
                <span className="text-sm text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <select
                className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-base"
                value={newGuichetWorkerId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewGuichetWorkerId(e.target.value)}
              >
                <option value="">-- None --</option>
                {(business.workers ?? []).map((w: OwnerBusiness["workers"][number]) => (
                  <option key={w.user.id} value={w.user.id}>
                    {w.user.displayName ?? w.user.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="h-12 rounded-2xl"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="h-12 rounded-2xl"
              onClick={() => addGuichetMutation.mutate()}
              disabled={
                !newGuichetName.trim() || addGuichetMutation.isPending
              }
            >
              {addGuichetMutation.isPending ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Plus className="size-5" />
              )}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Guichet List */}
      {guichetsLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {(guichets ?? []).map((guichet: Guichet) => (
            <Card key={guichet.id} className="rounded-2xl">
              <CardContent className="p-5">
                {/* Header row */}
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <StatusDot status={guichet.status} />
                    <span className="text-base font-medium">
                      {guichet.name}
                    </span>
                    <Badge
                      variant={
                        guichet.status === "open"
                          ? "success"
                          : guichet.status === "paused"
                            ? "warning"
                            : "muted"
                      }
                      className="capitalize text-xs"
                    >
                      {guichet.status}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-10 shrink-0 text-destructive hover:bg-destructive/10"
                    onClick={() => deleteGuichetMutation.mutate(guichet.id)}
                  >
                    <Trash2 className="size-5" />
                  </Button>
                </div>

                {/* Status toggle buttons */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {guichet.status === "closed" && (
                    <Button
                      variant="outline"
                      className="h-10 rounded-xl text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-950"
                      onClick={() =>
                        guichetStatusMutation.mutate({
                          guichetId: guichet.id,
                          status: "open",
                        })
                      }
                      disabled={!guichet.serviceId}
                      title={
                        !guichet.serviceId
                          ? "Assign a service first"
                          : "Open guichet"
                      }
                    >
                      <Power className="size-4 mr-1.5" />
                      Open
                    </Button>
                  )}
                  {guichet.status === "open" && (
                    <>
                      <Button
                        variant="outline"
                        className="h-10 rounded-xl text-yellow-600 border-yellow-200 hover:bg-yellow-50 dark:hover:bg-yellow-950"
                        onClick={() =>
                          guichetStatusMutation.mutate({
                            guichetId: guichet.id,
                            status: "paused",
                          })
                        }
                      >
                        Pause
                      </Button>
                      <Button
                        variant="outline"
                        className="h-10 rounded-xl"
                        onClick={() =>
                          guichetStatusMutation.mutate({
                            guichetId: guichet.id,
                            status: "closed",
                          })
                        }
                      >
                        Close
                      </Button>
                    </>
                  )}
                  {guichet.status === "paused" && (
                    <>
                      <Button
                        variant="outline"
                        className="h-10 rounded-xl text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-950"
                        onClick={() =>
                          guichetStatusMutation.mutate({
                            guichetId: guichet.id,
                            status: "open",
                          })
                        }
                      >
                        <Power className="size-4 mr-1.5" />
                        Resume
                      </Button>
                      <Button
                        variant="outline"
                        className="h-10 rounded-xl"
                        onClick={() =>
                          guichetStatusMutation.mutate({
                            guichetId: guichet.id,
                            status: "closed",
                          })
                        }
                      >
                        Close
                      </Button>
                    </>
                  )}
                </div>

                {/* Service & Worker selectors */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Service
                    </Label>
                    <select
                      className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-base"
                      value={guichet.serviceId ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        assignServiceMutation.mutate({
                          guichetId: guichet.id,
                          serviceId: e.target.value || null,
                        })
                      }
                    >
                      <option value="">-- No service --</option>
                      {business.services.map((s: OwnerBusiness["services"][number]) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Worker
                    </Label>
                    <select
                      className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-base"
                      value={guichet.currentWorkerId ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        assignWorkerMutation.mutate({
                          guichetId: guichet.id,
                          workerId: e.target.value || null,
                        })
                      }
                    >
                      <option value="">-- Unassigned --</option>
                      {(business.workers ?? []).map((w: OwnerBusiness["workers"][number]) => (
                        <option key={w.user.id} value={w.user.id}>
                          {w.user.displayName ?? w.user.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {!guichet.serviceId && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Assign a service before opening this guichet.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Empty State */}
          {(guichets ?? []).length === 0 && (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
              <Monitor className="mx-auto mb-3 size-10 opacity-40" />
              <p className="text-base">
                No guichets yet. Create your first one.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
