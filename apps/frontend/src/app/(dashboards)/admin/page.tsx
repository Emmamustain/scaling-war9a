"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

type AdminAnalytics = {
  totalUsers: number;
  totalBusinesses: number;
  entriesToday: number;
  activeBusinesses: number;
  topCities: Array<{ city: string; count: number }>;
  topCategories: Array<{ name: string; count: number }>;
};

export default function AdminOverviewPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => fetchApi<AdminAnalytics>("/analytics/admin"),
  });

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Users", value: analytics.totalUsers.toLocaleString() },
          { label: "Businesses", value: analytics.totalBusinesses.toLocaleString() },
          { label: "Entries Today", value: analytics.entriesToday.toLocaleString(), primary: true },
          { label: "Active Businesses", value: analytics.activeBusinesses.toLocaleString() },
        ].map(({ label, value, primary }) => (
          <Card key={label} className="rounded-2xl">
            <CardContent className="pt-4">
              <div className={`text-2xl font-bold ${primary ? "text-primary" : ""}`}>
                {value}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top cities + categories */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Top Cities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.topCities.map(({ city, count }: { city: string; count: number }) => (
                <div
                  key={city}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{city}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
              {analytics.topCities.length === 0 && (
                <p className="text-sm text-muted-foreground">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.topCategories.map(({ name, count }: { name: string; count: number }) => (
                <div
                  key={name}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{name}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
              {analytics.topCategories.length === 0 && (
                <p className="text-sm text-muted-foreground">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
