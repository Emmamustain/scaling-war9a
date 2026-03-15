"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeftToLine, Loader2 } from "lucide-react";

interface ActionQueueCardProps {
  position: number;
  alreadyQueued: boolean;
  isPending: boolean;
  onJoin: () => void;
  onLeave: () => void;
  isAuthenticated: boolean;
  isOpen: boolean;
}

export default function ActionQueueCard({
  position,
  alreadyQueued,
  isPending,
  onJoin,
  onLeave,
  isAuthenticated,
  isOpen,
}: ActionQueueCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-fit min-h-[150px] w-full min-w-[280px] flex-col justify-center rounded",
        alreadyQueued ? "bg-red-200/60 dark:bg-red-900/30" : "bg-emerald-200/60 dark:bg-emerald-900/30",
      )}
    >
      {/* Big position # in background */}
      <p className="absolute bottom-0 left-4 text-9xl font-bold opacity-10 select-none">
        #{position}
      </p>

      <div className="flex h-full items-center justify-end gap-4 px-6 py-4">
        {!isAuthenticated ? (
          <Button className="mt-4 px-8 py-6" asChild>
            <a href="/sign-in">Sign in to join</a>
          </Button>
        ) : !isOpen ? (
          <p className="font-semibold text-neutral-500">Business is closed</p>
        ) : !alreadyQueued ? (
          <Button
            className="mt-4 px-8 py-6"
            onClick={onJoin}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Join Queue
          </Button>
        ) : (
          <Button
            variant="destructive"
            className="mt-4 px-8 py-6"
            onClick={onLeave}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowLeftToLine size={20} />
            )}
            Leave Queue
          </Button>
        )}
      </div>
    </div>
  );
}
