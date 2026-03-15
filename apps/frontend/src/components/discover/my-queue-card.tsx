"use client";

import Link from "next/link";
import { useMyQueueEntries } from "@/hooks/use-my-queue-entries";
import { Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MyQueueCard() {
  const { entries, isLoading } = useMyQueueEntries();

  if (isLoading || entries.length === 0) return null;

  const entry = entries[0];

  return (
    <Link
      href={`/queue/${entry.id}`}
      className={cn(
        "flex items-center justify-between rounded-xl border-2 border-primary/30 bg-primary/5 p-4 transition-colors hover:bg-primary/10",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
          <Clock className="size-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            You&apos;re in queue
          </p>
          <p className="font-semibold">
            {entry.businessName} — {entry.serviceName}
          </p>
          <p className="text-xs text-muted-foreground">
            Position #{entry.position} · ~{entry.estimatedWaitMinutes} min wait
          </p>
        </div>
      </div>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
    </Link>
  );
}
