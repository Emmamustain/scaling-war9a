"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
type CurrentEntry = {
  id: string;
  serviceName: string;
  businessName: string;
  businessSlug: string;
  position: number;
};

interface ForfeitQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEntry: CurrentEntry | null;
  onConfirm: () => void | Promise<void>;
  isPending?: boolean;
}

export default function ForfeitQueueDialog({
  open,
  onOpenChange,
  currentEntry,
  onConfirm,
  isPending,
}: ForfeitQueueDialogProps) {
  if (!currentEntry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave your current queue?</DialogTitle>
          <DialogDescription>
            You&apos;re in the queue at{" "}
            <strong>{currentEntry.businessName}</strong> — {currentEntry.serviceName}{" "}
            (position #{currentEntry.position}). Joining another queue will forfeit
            your spot. You can always rejoin later.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Leave &amp; Join New Queue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
