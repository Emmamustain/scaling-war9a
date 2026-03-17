"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Loader2 } from "lucide-react";
import { getInitials } from "@/lib/utils";

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

export default function WorkerTeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const { data: business } = useQuery({
    queryKey: ["worker-business", slug],
    queryFn: () =>
      fetchApi<{ id: string; name: string }>(`/businesses/${slug}`),
  });

  const { data: workers, isLoading } = useQuery({
    queryKey: ["worker-team", business?.id],
    queryFn: () =>
      fetchApi<BusinessWorker[]>(`/businesses/${business!.id}/workers`),
    enabled: !!business?.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {(workers ?? []).map((worker: BusinessWorker) => (
        <div
          key={worker.id}
          className="flex items-center gap-3 rounded-2xl border bg-card p-4"
        >
          <div className="flex size-11 items-center justify-center rounded-full bg-secondary text-sm font-bold">
            {getInitials(worker.user.displayName ?? worker.user.email)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 font-medium">
              {worker.user.displayName ?? worker.user.email}
              {worker.role === "manager" && (
                <ShieldCheck className="size-3.5 text-primary" />
              )}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {worker.user.email}
            </div>
          </div>
          <Badge variant="secondary" className="shrink-0 capitalize">
            {worker.role}
          </Badge>
        </div>
      ))}

      {workers?.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed py-16 text-center text-sm text-muted-foreground">
          No team members yet.
        </div>
      )}
    </div>
  );
}
