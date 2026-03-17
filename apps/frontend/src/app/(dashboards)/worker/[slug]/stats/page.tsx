"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { useAuthStore } from "@/stores/auth.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

type BusinessWorker = {
  id: string;
  role: string;
  score: number;
  user: {
    id: string;
    displayName: string | null;
    email: string;
    avatarUrl: string | null;
  };
};

// Matches the actual API response shape from /analytics/business/:id
type BusinessAnalytics = {
  summary: {
    totalEntries: number;
    servedEntries: number;
    avgWaitMinutes: number;
    avgRating: number;
    servedRate: number;
  };
  dailyTrend: Array<{ date: string; count: string; avg_wait: string }>;
  workerPerformance: Array<{
    id: string;
    display_name: string | null;
    username: string;
    customers_served: string;
    avg_service_time: string | null;
    score: number;
  }>;
};

export default function WorkerStatsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { user } = useAuthStore();

  const { data: business } = useQuery({
    queryKey: ["worker-business", slug],
    queryFn: () =>
      fetchApi<{ id: string; name: string }>(`/businesses/${slug}`),
  });

  const { data: workers } = useQuery({
    queryKey: ["worker-team", business?.id],
    queryFn: () =>
      fetchApi<BusinessWorker[]>(`/businesses/${business!.id}/workers`),
    enabled: !!business?.id,
  });

  const { data: analytics, isLoading, isError } = useQuery({
    queryKey: ["worker-analytics", business?.id],
    queryFn: () =>
      fetchApi<BusinessAnalytics>(`/analytics/business/${business!.id}`),
    enabled: !!business?.id,
  });

  const myWorkerProfile = workers?.find((w: BusinessWorker) => w.user.id === user?.id);
  const isManager = myWorkerProfile?.role === "manager";

  // Match by user id (id field in workerPerformance rows)
  const myStats = analytics?.workerPerformance.find((w: BusinessAnalytics["workerPerformance"][number]) => w.id === user?.id);

  // Compute today's served from dailyTrend
  const today = new Date().toISOString().split("T")[0];
  const todayEntry = analytics?.dailyTrend.find((d: BusinessAnalytics["dailyTrend"][number]) => d.date === today);
  const servedToday = Number(todayEntry?.count ?? 0);

  if (!business || isLoading || !workers) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
        <AlertCircle className="size-8 text-destructive" />
        <p className="font-medium">Could not load analytics</p>
        <p className="text-sm">Make sure you have access to this business.</p>
      </div>
    );
  }

  // Sort performance by customers_served desc
  const sortedPerformance = analytics
    ? [...analytics.workerPerformance].sort(
        (a, b) => Number(b.customers_served) - Number(a.customers_served),
      )
    : [];

  const topServed = Number(sortedPerformance[0]?.customers_served ?? 1) || 1;

  return (
    <div className="space-y-4">
      {/* My profile card */}
      {myWorkerProfile && (
        <div className="flex items-center gap-4 rounded-2xl border bg-card p-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
            {getInitials(
              myWorkerProfile.user.displayName ?? myWorkerProfile.user.email,
            )}
          </div>
          <div>
            <div className="text-lg font-semibold">
              {myWorkerProfile.user.displayName ?? myWorkerProfile.user.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isManager && <ShieldCheck className="size-3.5 text-primary" />}
              <span className="capitalize">{myWorkerProfile.role}</span>
            </div>
            {(myWorkerProfile.score ?? 0) > 0 && (
              <div className="mt-0.5 text-sm font-medium text-yellow-600">
                ★ {myWorkerProfile.score} points
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats grid */}
      {isManager ? (
        <div className="grid grid-cols-3 gap-3">
          <Card className="rounded-2xl">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-primary">
                {servedToday}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Today</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold">
                {analytics?.summary.servedEntries ?? 0}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold">
                {analytics?.summary.avgRating
                  ? `★ ${analytics.summary.avgRating.toFixed(1)}`
                  : "—"}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Rating</div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <Card className="rounded-2xl">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold text-primary">
                {myStats ? Number(myStats.customers_served) : 0}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Served</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold">
                {servedToday}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Today</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="pt-4 text-center">
              <div className="text-3xl font-bold">
                {myStats?.score ? `★ ${myStats.score}` : "—"}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Score</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leaderboard */}
      {sortedPerformance.length > 0 && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">
              {isManager ? "All Workers" : "Team Leaderboard"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sortedPerformance.map((w, i) => {
              const isMe = w.id === user?.id;
              const served = Number(w.customers_served);
              return (
                <div
                  key={w.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl p-3",
                    isMe && "bg-primary/5 ring-1 ring-primary/20",
                  )}
                >
                  <span className="w-6 text-center text-sm font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div
                      className={cn(
                        "truncate text-sm font-medium",
                        isMe && "text-primary",
                      )}
                    >
                      {w.display_name ?? w.username}
                      {isMe && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          (you)
                        </span>
                      )}
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary/60 transition-all"
                        style={{
                          width: `${Math.min((served / topServed) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-semibold">{served} served</div>
                    {(w.score ?? 0) > 0 && (
                      <div className="text-xs text-muted-foreground">
                        ★ {w.score} pts
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
