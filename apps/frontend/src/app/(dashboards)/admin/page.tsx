"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, Building2, CalendarCheck, TrendingUp } from "lucide-react";

type AdminAnalytics = {
  totalUsers: number;
  totalBusinesses: number;
  entriesToday: number;
  activeBusinesses: number;
  topCities: Array<{ city: string; count: number }>;
  topCategories: Array<{ name: string; count: number }>;
};

const stats = (a: AdminAnalytics) => [
  { label: "Total Users", value: a.totalUsers, icon: Users, color: "text-blue-500" },
  { label: "Active Businesses", value: a.activeBusinesses, icon: Building2, color: "text-green-500" },
  { label: "Entries Today", value: a.entriesToday, icon: CalendarCheck, color: "text-primary" },
  { label: "Total Businesses", value: a.totalBusinesses, icon: TrendingUp, color: "text-orange-500" },
];

export default function AdminOverviewPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => fetchApi<AdminAnalytics>("/analytics/admin"),
  });

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Overview</h2>
        <p className="text-sm text-muted-foreground">Platform-wide statistics</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats(analytics).map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <Icon className={`size-4 ${color}`} />
              </div>
              <p className="mt-2 text-3xl font-bold">{value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top cities + categories */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Top Cities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topCities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet.</p>
              ) : (
                analytics.topCities.map(({ city, count }: { city: string; count: number }, i) => {
                  const max = analytics.topCities[0]?.count ?? 1;
                  const pct = Math.round((Number(count) / Number(max)) * 100);
                  return (
                    <div key={city} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{city}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-secondary">
                        <div
                          className="h-1.5 rounded-full bg-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet.</p>
              ) : (
                analytics.topCategories.map(({ name, count }: { name: string; count: number }) => {
                  const max = analytics.topCategories[0]?.count ?? 1;
                  const pct = Math.round((Number(count) / Number(max)) * 100);
                  return (
                    <div key={name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{name}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-secondary">
                        <div
                          className="h-1.5 rounded-full bg-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
