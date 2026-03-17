"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Star } from "lucide-react";

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
  hourlyDistribution: Array<{ hour: number; count: number }>;
};

export default function AnalyticsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const { data: business, isLoading } = useQuery({
    queryKey: ["owner-business", slug],
    queryFn: () => fetchApi<OwnerBusiness>(`/businesses/${slug}/manage`),
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["owner-analytics", business?.id],
    queryFn: () =>
      fetchApi<BusinessAnalytics>(`/analytics/business/${business!.id}`),
    enabled: !!business?.id,
  });

  if (isLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!business || !analytics) return null;

  const completionRate =
    analytics.totalEntries > 0
      ? Math.round((analytics.totalServed / analytics.totalEntries) * 100)
      : 0;

  const maxHourlyCount = Math.max(
    ...analytics.hourlyDistribution.map((h: { hour: number; count: number }) => h.count),
    1,
  );

  const sortedWorkers = [...analytics.workerPerformance].sort(
    (a, b) => b.served - a.served,
  );

  const topServed = sortedWorkers[0]?.served ?? 1;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <div className="text-3xl font-bold">{analytics.totalEntries}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Total Entries
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <div className="text-3xl font-bold">{completionRate}%</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Completion Rate
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Peak Hours Chart */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Peak Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-28 items-end gap-1">
            {analytics.hourlyDistribution.map(({ hour, count }: { hour: number; count: number }) => {
              const height = (count / maxHourlyCount) * 100;
              return (
                <div
                  key={hour}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <div
                    className="w-full rounded-t bg-primary/60"
                    style={{
                      height: `${height}%`,
                      minHeight: count > 0 ? "4px" : "0",
                    }}
                  />
                  {hour % 4 === 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      {hour}h
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Worker Leaderboard */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Worker Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedWorkers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet</p>
          ) : (
            sortedWorkers.map((w, i) => (
              <div
                key={w.workerId ?? w.workerName}
                className="flex items-center gap-3"
              >
                <span className="w-6 text-center text-sm font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-base font-medium">{w.workerName}</div>
                  <div className="mt-1.5 h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${Math.min((w.served / topServed) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-base font-medium">{w.served}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="size-3 text-yellow-500" />
                    {(w.avgRating ?? 0).toFixed(1)}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
