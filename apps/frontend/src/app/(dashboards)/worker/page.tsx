"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { Loader2, Briefcase, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type WorkerBusiness = {
  id: string;
  name: string;
  slug: string;
  status: string;
  logoUrl: string | null;
  city: string;
  workerRole: string;
};

export default function WorkerIndexPage() {
  const router = useRouter();

  const { data: businesses, isLoading } = useQuery({
    queryKey: ["worker-businesses"],
    queryFn: () => fetchApi<WorkerBusiness[]>("/businesses/worker"),
  });

  // Auto-redirect when there is exactly one business
  useEffect(() => {
    if (businesses?.length === 1) {
      router.replace(`/worker/${businesses[0].slug}`);
    }
  }, [businesses, router]);

  if (isLoading || businesses?.length === 1) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!businesses || businesses.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
          <Briefcase className="size-8 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold">No assignments yet</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You haven&apos;t been assigned to any business.
          </p>
        </div>
        <a href="/discover" className="text-sm text-primary hover:underline">
          Back to Discover
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Your Workplaces</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a business to open your dashboard.
        </p>
      </div>

      <div className="space-y-3">
        {businesses.map((biz: WorkerBusiness) => (
          <button
            key={biz.id}
            onClick={() => router.push(`/worker/${biz.slug}`)}
            className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-secondary/50"
          >
            {biz.logoUrl ? (
              <img
                src={biz.logoUrl}
                alt=""
                className="size-12 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted">
                <Briefcase className="size-5 text-muted-foreground" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{biz.name}</p>
              <p className="text-xs text-muted-foreground">{biz.city}</p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Badge variant="secondary" className="text-xs capitalize">
                {biz.workerRole}
              </Badge>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
