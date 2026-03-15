"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Users,
  Activity,
  Star,
  Clock,
  Settings,
  Plus,
  Trash2,
  QrCode,
  Loader2,
  TrendingUp,
  BarChart2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type OwnerBusiness = {
  id: string;
  name: string;
  slug: string;
  status: string;
  logoUrl: string | null;
  services: Array<{ id: string; name: string; isActive: boolean; maxCapacity: number | null }>;
  workers: Array<{
    id: string;
    role: string;
    user: { id: string; displayName: string | null; email: string; avatarUrl: string | null };
  }>;
};

type BusinessAnalytics = {
  totalEntries: number;
  totalServed: number;
  avgWaitMinutes: number;
  avgRating: number;
  servedToday: number;
  workerPerformance: Array<{ workerId: string; workerName: string; served: number; avgRating: number }>;
  hourlyDistribution: Array<{ hour: number; count: number }>;
};

export default function OwnerDashboard({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "services" | "workers" | "analytics">("overview");
  const [newWorkerEmail, setNewWorkerEmail] = useState("");
  const [newServiceName, setNewServiceName] = useState("");

  const { data: business, isLoading } = useQuery({
    queryKey: ["owner-business", slug],
    queryFn: () => fetchApi<OwnerBusiness>(`/businesses/${slug}`),
  });

  const { data: analytics } = useQuery({
    queryKey: ["owner-analytics", business?.id],
    queryFn: () =>
      fetchApi<BusinessAnalytics>(`/analytics/business/${business!.id}`),
    enabled: !!business?.id,
  });

  const addWorkerMutation = useMutation({
    mutationFn: () =>
      fetchApi(`/businesses/${business!.id}/workers`, {
        method: "POST",
        body: JSON.stringify({ email: newWorkerEmail, role: "worker" }),
      }),
    onSuccess: () => {
      toast.success("Worker added!");
      setNewWorkerEmail("");
      void queryClient.invalidateQueries({ queryKey: ["owner-business"] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to add worker"),
  });

  const removeWorkerMutation = useMutation({
    mutationFn: (workerId: string) =>
      fetchApi(`/businesses/${business!.id}/workers/${workerId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Worker removed");
      void queryClient.invalidateQueries({ queryKey: ["owner-business"] });
    },
  });

  const addServiceMutation = useMutation({
    mutationFn: () =>
      fetchApi(`/businesses/${business!.id}/services`, {
        method: "POST",
        body: JSON.stringify({ name: newServiceName }),
      }),
    onSuccess: () => {
      toast.success("Service added!");
      setNewServiceName("");
      void queryClient.invalidateQueries({ queryKey: ["owner-business"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!business) return null;

  const TABS = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "services", label: "Services", icon: Settings },
    { id: "workers", label: "Team", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
  ] as const;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{business.name}</h1>
          <Badge
            variant={
              business.status === "active"
                ? "success"
                : business.status === "pending"
                  ? "warning"
                  : "muted"
            }
            className="mt-1 capitalize"
          >
            {business.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/api/qr/business/${business.slug}`} target="_blank">
              <QrCode className="size-4 mr-1" />
              QR Code
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/business/${business.slug}`}>View Public</Link>
          </Button>
        </div>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-border bg-secondary/50 p-1 scrollbar-hide">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              activeTab === id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && analytics && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{analytics.servedToday}</div>
                <div className="text-xs text-muted-foreground">Served Today</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{Math.round(analytics.avgWaitMinutes)}m</div>
                <div className="text-xs text-muted-foreground">Avg Wait</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-1 text-2xl font-bold">
                  <Star className="size-4 text-yellow-500" />
                  {analytics.avgRating.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Avg Rating</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{analytics.totalServed}</div>
                <div className="text-xs text-muted-foreground">Total Served</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Worker Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.workerPerformance.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet</p>
              ) : (
                <div className="space-y-3">
                  {analytics.workerPerformance.map((worker) => (
                    <div key={worker.workerId} className="flex items-center justify-between">
                      <span className="text-sm">{worker.workerName}</span>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{worker.served} served</span>
                        <span className="flex items-center gap-1">
                          <Star className="size-3 text-yellow-500" />
                          {worker.avgRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "services" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="New service name..."
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addServiceMutation.mutate()}
            />
            <Button
              onClick={() => addServiceMutation.mutate()}
              disabled={!newServiceName.trim() || addServiceMutation.isPending}
            >
              {addServiceMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {business.services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
              >
                <div>
                  <div className="font-medium">{service.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Capacity: {service.maxCapacity ?? "Unlimited"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={service.isActive ? "success" : "muted"}>
                    {service.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/api/qr/service/${service.id}`} target="_blank">
                      <QrCode className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "workers" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Worker email..."
              value={newWorkerEmail}
              onChange={(e) => setNewWorkerEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addWorkerMutation.mutate()}
              type="email"
            />
            <Button
              onClick={() => addWorkerMutation.mutate()}
              disabled={!newWorkerEmail.trim() || addWorkerMutation.isPending}
            >
              {addWorkerMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {business.workers.map((worker) => (
              <div
                key={worker.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-bold">
                    {(worker.user.displayName ?? worker.user.email)[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">
                      {worker.user.displayName ?? worker.user.email}
                    </div>
                    <div className="text-xs text-muted-foreground">{worker.user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {worker.role}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => removeWorkerMutation.mutate(worker.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "analytics" && analytics && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{analytics.totalEntries}</div>
                <div className="text-xs text-muted-foreground">Total Entries</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">
                  {analytics.totalEntries > 0
                    ? Math.round((analytics.totalServed / analytics.totalEntries) * 100)
                    : 0}%
                </div>
                <div className="text-xs text-muted-foreground">Completion Rate</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Peak Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 h-24">
                {analytics.hourlyDistribution.map(({ hour, count }) => {
                  const max = Math.max(...analytics.hourlyDistribution.map((h) => h.count));
                  const height = max > 0 ? (count / max) * 100 : 0;
                  return (
                    <div key={hour} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-primary/60"
                        style={{ height: `${height}%`, minHeight: count > 0 ? "4px" : "0" }}
                      />
                      {hour % 4 === 0 && (
                        <span className="text-xs text-muted-foreground">{hour}h</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
