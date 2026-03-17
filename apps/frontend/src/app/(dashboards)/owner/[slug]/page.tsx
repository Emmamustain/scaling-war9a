"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Guichet = {
  id: string;
  name: string;
  status: "open" | "closed" | "paused";
  service: { id: string; name: string } | null;
};

type BusinessAnalytics = {
  totalEntries: number;
  totalServed: number;
  avgWaitMinutes: number;
  avgRating: number;
  servedToday: number;
  workerPerformance: Array<{
    workerId: string;
    workerName: string;
    served: number;
    avgRating: number;
  }>;
};

export default function OwnerOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const { data: business } = useQuery({
    queryKey: ["owner-business-basic", slug],
    queryFn: () => fetchApi<{ id: string }>(`/businesses/${slug}`),
  });

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["owner-analytics", business?.id],
    queryFn: () =>
      fetchApi<BusinessAnalytics>(`/analytics/business/${business!.id}`),
    enabled: !!business?.id,
  });

  const { data: guichets } = useQuery({
    queryKey: ["owner-guichets", business?.id],
    queryFn: () => fetchApi<Guichet[]>(`/businesses/${business!.id}/guichets`),
    enabled: !!business?.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-4">
      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Served Today",
            value: analytics.servedToday,
            primary: true,
          },
          {
            label: "Avg Wait",
            value: `${Math.round(analytics.avgWaitMinutes)}m`,
          },
          {
            label: "Avg Rating",
            value: `★ ${(analytics.avgRating ?? 0).toFixed(1)}`,
            highlight: true,
          },
          { label: "Total Served", value: analytics.totalServed },
        ].map(({ label, value, primary, highlight }) => (
          <Card key={label} className="rounded-2xl">
            <CardContent className="pt-4">
              <div
                className={cn(
                  "text-2xl font-bold",
                  primary && "text-primary",
                  highlight && "text-yellow-500",
                )}
              >
                {value}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active guichets */}
      {guichets && guichets.length > 0 && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Active Windows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {guichets.map((g: Guichet) => (
              <div
                key={g.id}
                className="flex items-center justify-between rounded-xl p-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-block size-2 rounded-full",
                      g.status === "open"
                        ? "bg-green-500"
                        : g.status === "paused"
                          ? "bg-yellow-500"
                          : "bg-muted-foreground/40",
                    )}
                  />
                  <span className="text-sm font-medium">{g.name}</span>
                  {g.service && (
                    <span className="text-xs text-muted-foreground">
                      — {g.service.name}
                    </span>
                  )}
                </div>
                <Badge
                  variant={
                    g.status === "open"
                      ? "success"
                      : g.status === "paused"
                        ? "warning"
                        : "muted"
                  }
                  className="text-xs capitalize"
                >
                  {g.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Worker performance */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Worker Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.workerPerformance.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No data yet
            </p>
          ) : (
            <div className="space-y-3">
              {[...analytics.workerPerformance]
                .sort((a, b) => b.served - a.served)
                .map((w) => (
                  <div
                    key={w.workerId ?? w.workerName}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium">{w.workerName}</span>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{w.served} served</span>
                      <span className="flex items-center gap-1">
                        <Star className="size-3 text-yellow-500" />
                        {(w.avgRating ?? 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
