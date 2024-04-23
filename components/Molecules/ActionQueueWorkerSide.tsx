import {
  addToQueue,
  incrementWorkerScore,
  removeFromQueue,
  removeUserFromQueue,
} from "@/database/mutations";
import { Button } from "../ui/button";
import { revalidatePath } from "next/cache";
import { cn } from "@/lib/utils";
import ConfirmLeavePopover from "./ConfirmActionButton";
import { ArrowLeftToLine } from "lucide-react";
import {
  fetchBusinessBySlug,
  getBusinessServices,
  getQueue,
  getUserData,
} from "@/database/queries";
import { getCurrentSession } from "@/utils/get-current-session";

export interface ActionQueueWorkerSideProps {
  user_id: string;
  service_id: string;
  position: number;
  alreadyQueued: boolean;
  businessSlug: string;
}

export default async function ActionQueueWorkerSide({
  position,
  user_id,
  service_id,
  alreadyQueued,
  businessSlug,
}: ActionQueueWorkerSideProps) {
  const businessData = await fetchBusinessBySlug(businessSlug);

  if (!businessData) return <p>Business not found</p>;

  const businessServices = await getBusinessServices(
    businessData?.business.business_id,
  );
  const userData = await getUserData();

  const queueData = (await getQueue(service_id ?? "")) ?? [];
  const sortedQueue = queueData.sort(
    (a, b) =>
      a.queue_entries.updated_at.getTime() -
      b.queue_entries.updated_at.getTime(),
  );

  const user_data = await getCurrentSession();
  console.log("userdata", user_data.data.session?.user.id);

  const nextUser = async () => {
    "use server";
    const mutation = await removeUserFromQueue(sortedQueue[0].users.user_id);
    const increment = await incrementWorkerScore(
      user_data.data.session?.user.id ?? "",
    );
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
        #{position - 1}
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
              formAction={nextUser}
            >
              Next
            </Button>
          ) : (
            <ConfirmLeavePopover
              buttonText={
                <>
                  <ArrowLeftToLine size={20} /> <p className="pl-2">Next</p>
                </>
              }
              description="This action cannot be undone. Do you want to remove this client ?"
              cancel="No"
              confirm={"I want to remove this client"}
              onConfirm={nextUser}
            />
          )}
        </form>
      </div>
    </div>
  );
}
