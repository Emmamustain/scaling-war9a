"use client";

import { createClient } from "@/utils/supabase-client";
import { toast } from "../ui/use-toast";
import { QueueEntryData, UserData } from "../Molecules/ActionQueueWorkerSide";
import QueueCard from "../Molecules/QueueCard";

export interface BusinessQueueProps {
  sortedQueue: QueueEntryData;
  userData: UserData;
}
export default async function BusinessQueue({
  sortedQueue,
  userData,
}: BusinessQueueProps) {
  const supabase = createClient();
  supabase
    .channel("notifications")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications" },
      (payload) => {
        // console.log("New message: ", payload.new.message);
        toast({
          title: "Notification received",
          description: payload.new.message,
          className: "bg-emerald-400",
        });
      },
    )
    .subscribe();
  return (
    <>
      {sortedQueue &&
        sortedQueue.length > 0 &&
        sortedQueue.map((card, index) => (
          <QueueCard
            key={index}
            className={
              card.users.user_id === userData?.user_id &&
              "border-[2px] border-white bg-purple-200"
            }
            name={card.users.username}
            isPresent={card.queue_entries.present ?? false}
            source={"Web"}
            position={index + 1}
          />
        ))}
    </>
  );
}
