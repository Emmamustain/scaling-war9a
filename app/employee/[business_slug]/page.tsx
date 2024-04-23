import Footer from "@/components/Compounds/Footer";
import Header from "@/components/Compounds/Header";
import BusinessDataList from "@/components/Compounds/BusinessDataList";
import BusinessHeader from "@/components/Compounds/BusinessHeader";
import ActionQueueCard from "@/components/Molecules/ActionQueueCard";
import QueueCard from "@/components/Molecules/QueueCard";
import {
  fetchBusinessBySlug,
  getBusinessServices,
  getQueue,
  getUserData,
  getWorkerServiceId,
} from "@/database/queries";
import { cn } from "@/lib/utils";
import { Frown, HourglassIcon, Smile } from "lucide-react";
import Link from "next/link";
import ActionQueueWorkerSide from "@/components/Molecules/ActionQueueWorkerSide";
import { removeFromQueue } from "@/database/mutations";
import { Button } from "@/components/ui/button";
import ConfirmLeavePopover from "@/components/Molecules/ConfirmActionButton";
import { ArrowLeftToLine } from "lucide-react";
import { getCurrentSession } from "@/utils/get-current-session";

interface employeeProps {
  params: { business_slug: string };
}

export default async function employee({ params }: employeeProps) {
  const slug = params.business_slug;

  const businessData = await fetchBusinessBySlug(slug);

  if (!businessData) return <p>Business not found</p>;

  const businessServices = await getBusinessServices(
    businessData?.business.business_id,
  );

  const session = await getCurrentSession();
  const worker_user_id = session.data.session?.user.id; // THIS IS NOT THE WORKER_ID!!!!!

  // const selectedService = "edahabiya";

  const userData = await getUserData();

  // const service_id = await businessServices.find(
  //   (service) => service.name === selectedService,
  // )?.service_id;

  // const serviceData = await getWorkerServiceId(worker_user_id ?? "");

  // if (!serviceData) {
  //   return <p>Service data not found for the user</p>;
  // }

  // const { service_id, name: selectedService } = serviceData;
  const serviceData = await getWorkerServiceId(worker_user_id ?? ""); //THE QUERY TO GET THE SERVICE_ID from GUICHET_SERVICES

  const queueData = (await getQueue(serviceData.service_id ?? "")) ?? [];
  const sortedQueue = queueData.sort(
    (a, b) =>
      a.queue_entries.updated_at.getTime() -
      b.queue_entries.updated_at.getTime(),
  );

  const alreadyQueued =
    (userData &&
      sortedQueue.some(
        (queueEntry) => queueEntry.users.user_id === userData.user_id,
      )) ??
    false;

  // const nextUser = await removeFromQueue(sortedQueue[0].users.user_id, service_id as string);

  return (
    <main className="flex min-h-screen flex-col px-24 dark:bg-neutral-900">
      <Header />

      {/* Business Header */}
      <BusinessHeader name={businessData.business.name} slug={slug} />

      {/* Business Info */}
      <BusinessDataList
        name={businessData.business.name}
        categories={businessData.categories}
        phone={businessData.business.phone ?? "Not Available"}
        reputation={{ positive: 120, negative: 20 }}
        description={businessData.business.description}
      />

      {/* Virtual Queues */}
      <div className="mt-12 grid w-full grid-cols-[repeat(auto-fit,minmax(50px,1fr))] items-center gap-10 ">
        <div
          className={cn(
            "rounded-t-lg bg-neutral-50 p-3 text-center font-semibold capitalize text-black/30 duration-300 hover:cursor-pointer hover:bg-neutral-200/60 hover:text-black ",
            "bg-neutral-200/60 text-black",
          )}
        >
          {serviceData.name}
        </div>
      </div>

      {/* Queue Cards */}
      {businessServices.length > 0 && (
        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-4 bg-neutral-200/60 p-4 pt-8">
          {serviceData.service_id && userData && (
            <ActionQueueWorkerSide
              position={
                !alreadyQueued
                  ? sortedQueue.length + 1 // If not already in the queue, their position is at the end.
                  : sortedQueue.findIndex(
                      (entry) => entry.users.user_id === userData.user_id,
                    ) + 1
              }
              service_id={serviceData.service_id}
              user_id={userData.user_id}
              alreadyQueued={alreadyQueued}
              businessSlug={slug}
            />
          )}
          {sortedQueue.length > 0 &&
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

          {sortedQueue.length === 0 && (
            <div className="relative flex h-[157px] w-full min-w-[400px] flex-col justify-center rounded bg-white">
              <HourglassIcon
                size={80}
                className="mb-2 w-full text-center text-neutral-400"
              />
              <p className="text-center text-xl font-bold text-neutral-400">
                No one in the queue for the moment.
              </p>
            </div>
          )}
        </div>
      )}

      <Footer />
    </main>
  );
}
