import { addToQueue, removeFromQueue } from "@/database/mutations";
import { Button } from "../ui/button";
import { revalidatePath } from "next/cache";
import { cn } from "@/lib/utils";
import ConfirmLeavePopover from "./ConfirmActionButton";
import { ArrowLeftToLine } from "lucide-react";

export interface ActionQueueCardProps {
  user_id: string;
  service_id: string;
  position: number;
  alreadyQueued: boolean;
}

export default function ActionQueueCard({
  position,
  user_id,
  service_id,
  alreadyQueued,
}: ActionQueueCardProps) {
  const handleJoin = async () => {
    "use server";
    const mutation = await addToQueue(user_id, service_id);
    revalidatePath(".");
  };

  const handleLeave = async () => {
    "use server";
    const mutation = await removeFromQueue(user_id, service_id);
    revalidatePath(".");
  };
  return (
    <div
      className={cn(
        "relative flex w-full min-w-[400px] flex-col justify-between rounded bg-emerald-200/60",
        alreadyQueued && "bg-red-200/60",
      )}
    >
      {/* Position */}
      <p className="absolute bottom-0 left-4 text-9xl font-bold opacity-10">
        #{position}
      </p>

      {/* User Pic and Name */}
      {/* <div className="flex w-full items-center gap-4 rounded p-4">
        <div className="h-[85px] w-[85px] overflow-hidden rounded-full bg-neutral-900">
          <MinidenticonImg
            username={custompfpchecker(name)}
            className="scale-[0.6]"
          />
        </div>
        <p className="text-lg text-black">{name}</p>
      </div> */}

      {/* Details */}
      {/* <div className="flex items-center gap-4 px-6 pb-4">
        <Badge
          className={cn("w-fit")}
          variant={isPresent ? "default" : "outline"}
        >
          {isPresent ? "Present" : "Not Present"}
        </Badge>
        <p className="text-neutral-400">{source}</p>
      </div> */}

      {/* Action Button */}
      <div className="flex h-full items-center justify-end gap-4 px-6 pb-4">
        <form>
          {!alreadyQueued ? (
            <Button
              className="mt-4 px-8 py-6"
              type="submit"
              formAction={handleJoin}
            >
              Join Queue
            </Button>
          ) : (
            <ConfirmLeavePopover
              buttonText={
                <>
                  <ArrowLeftToLine size={20} />{" "}
                  <p className="pl-2">Leave Queue</p>
                </>
              }
              description="This action cannot be undone. You will lose your position in the queue!"
              cancel="No"
              confirm={"I want to leave the queue."}
              onConfirm={handleLeave}
            />
          )}
        </form>
      </div>
    </div>
  );
}
