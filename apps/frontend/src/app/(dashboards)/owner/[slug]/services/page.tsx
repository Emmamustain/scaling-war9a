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
import { Plus, Loader2, Monitor } from "lucide-react";
import { toast } from "sonner";
import ServiceQrModal from "@/components/business/service-qr-modal";

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

export default function ServicesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");

  const { data: business, isLoading } = useQuery({
    queryKey: ["owner-business", slug],
    queryFn: () => fetchApi<OwnerBusiness>(`/businesses/${slug}/manage`),
  });

  const addServiceMutation = useMutation({
    mutationFn: () =>
      fetchApi(`/businesses/${business!.id}/services`, {
        method: "POST",
        body: JSON.stringify({ name: newServiceName }),
      }),
    onSuccess: () => {
      toast.success("Service added!");
      setDialogOpen(false);
      setNewServiceName("");
      void queryClient.invalidateQueries({ queryKey: ["owner-business"] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to add service"),
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
          {business.services.length} service
          {business.services.length !== 1 ? "s" : ""}
        </p>
        <Button
          className="h-12 rounded-2xl px-6 text-base"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="size-5" />
          New Service
        </Button>
      </div>

      {/* Create Service Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(o: boolean) => {
          setDialogOpen(o);
          if (!o) setNewServiceName("");
        }}
      >
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create Service</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <div className="space-y-2">
              <Label className="text-base">
                Service Name <span className="text-destructive">*</span>
              </Label>
              <Input
                className="h-12 rounded-2xl text-base"
                placeholder="e.g. General Consultation, Passport Renewal..."
                value={newServiceName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewServiceName(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                  e.key === "Enter" &&
                  newServiceName.trim() &&
                  addServiceMutation.mutate()
                }
                autoFocus
              />
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
              onClick={() => addServiceMutation.mutate()}
              disabled={!newServiceName.trim() || addServiceMutation.isPending}
            >
              {addServiceMutation.isPending ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Plus className="size-5" />
              )}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service List */}
      <div className="space-y-3">
        {business.services.map((service: OwnerBusiness["services"][number]) => (
          <Card key={service.id} className="rounded-2xl">
            <CardContent className="flex items-center justify-between p-5">
              <div className="min-w-0 flex-1">
                <div className="text-base font-medium">{service.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Avg time: {service.averageTime ?? "10"}min · Capacity:{" "}
                  {service.maxCapacity ?? "Unlimited"}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3 pl-4">
                <Badge variant={service.isActive ? "success" : "muted"}>
                  {service.isActive ? "Active" : "Inactive"}
                </Badge>
                <ServiceQrModal
                  serviceId={service.id}
                  serviceName={service.name}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {business.services.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
            <Monitor className="mx-auto mb-3 size-10 opacity-40" />
            <p className="text-base">No services yet. Create your first one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
