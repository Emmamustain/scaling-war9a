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
  businessSlug: string;
}

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

export type UserData = UnwrapPromise<ReturnType<typeof getUserData>>;
export type QueueEntryData = UnwrapPromise<ReturnType<typeof getQueue>>;

export default async function ActionQueueWorkerSide({
  user_id,
  service_id,
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

  let onlyFiveEntries = sortedQueue.filter(
    (entry, index) => index >= 1 && index <= 5,
  );

  const nextUsers = onlyFiveEntries.map((entry) => entry.users);

  const nextUser = async () => {
    "use server";
    const mutation = await removeUserFromQueue(
      sortedQueue[0].users.user_id,
      nextUsers,
    );
    const increment = await incrementWorkerScore(
      user_data.data.session?.user.id ?? "",
    );
    revalidatePath(".");
  };
  return (
    <div
      className={cn(
        "relative flex w-full min-w-[400px] flex-col justify-between rounded bg-emerald-200/60",
      )}
    >
      {/* Position */}
      <p className="absolute bottom-0 left-4 text-9xl font-bold opacity-10">
        #0
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
          <Button
            className="mt-4 px-8 py-6"
            type="submit"
            formAction={nextUser}
          >
            Next
          </Button>
        </form>
      </div>
    </div>
  );
}
