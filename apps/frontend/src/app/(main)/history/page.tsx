"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { useAuthStore } from "@/stores/auth.store";
import { Badge } from "@/components/ui/badge";
import { History, CheckCircle2, LogOut, XCircle, Clock, Users } from "lucide-react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

type HistoryEntry = {
  id: string;
  status: "passed" | "left" | "no_show";
  entryTime: string;
  servedAt: string | null;
  serviceId: string;
  serviceName: string;
  businessId: string | undefined;
  businessName: string;
  businessSlug: string;
  businessLogoUrl: string | null;
  groupSize: number;
  position: number | null;
};

const STATUS_CONFIG = {
  passed: { label: "Served", icon: CheckCircle2, variant: "success" as const, color: "text-green-600" },
  left: { label: "Left", icon: LogOut, variant: "muted" as const, color: "text-muted-foreground" },
  no_show: { label: "No-show", icon: XCircle, variant: "warning" as const, color: "text-yellow-600" },
};

export default function HistoryPage() {
  const { isAuthenticated } = useAuthStore();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["queue-history"],
    queryFn: () => fetchApi<HistoryEntry[]>("/queue/history"),
    enabled: isAuthenticated,
  });

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <History className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">Queue History</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted/60" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="py-24 text-center">
          <History className="mx-auto mb-3 size-12 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">No queue history yet</p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Businesses you visit will appear here
          </p>
          <Link href="/discover" className="mt-4 inline-block text-sm text-primary hover:underline">
            Discover businesses →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const cfg = STATUS_CONFIG[entry.status];
            const Icon = cfg.icon;
            return (
              <Link
                key={entry.id}
                href={`/business/${entry.businessSlug}`}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary/40"
              >
                {/* Business logo / initial */}
                {entry.businessLogoUrl ? (
                  <img
                    src={entry.businessLogoUrl}
                    alt=""
                    className="size-12 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                    {entry.businessName[0]}
                  </div>
                )}

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{entry.businessName}</p>
                      <p className="truncate text-xs text-muted-foreground">{entry.serviceName}</p>
                    </div>
                    <Badge variant={cfg.variant} className="shrink-0 text-xs">
                      <Icon className="mr-1 size-3" />
                      {cfg.label}
                    </Badge>
                  </div>

                  <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {formatRelativeTime(entry.entryTime)}
                    </span>
                    {entry.groupSize > 1 && (
                      <span className="flex items-center gap-1">
                        <Users className="size-3" />
                        {entry.groupSize} people
                      </span>
                    )}
                    {entry.position && (
                      <span>Position #{entry.position}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
