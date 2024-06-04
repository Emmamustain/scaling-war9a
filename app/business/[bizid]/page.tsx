import BusinessDataList from "@/components/Compounds/BusinessDataList";
import BusinessHeader from "@/components/Compounds/BusinessHeader";
import BusinessQueue from "@/components/Compounds/BusinessQueue";
import Header from "@/components/Compounds/Header";
import ActionQueueCard from "@/components/Molecules/ActionQueueCard";
import QueueCard from "@/components/Molecules/QueueCard";
import { toast } from "@/components/ui/use-toast";
import {
  fetchBusinessBySlug,
  getBusinessServices,
  getQueue,
  getUserData,
} from "@/database/queries";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase-server";
import { Frown, Smile } from "lucide-react";
import Link from "next/link";

interface BusinessPageProps {
  params: { bizid: string };
  searchParams: { service?: string };
}

export default async function BusinessPage({
  params,
  searchParams,
}: BusinessPageProps) {
  const name = params.bizid.replaceAll("%20", " ");
  const slug = params.bizid;

  const businessData = await fetchBusinessBySlug(slug);

  if (!businessData) return <p>Business not found</p>;

  const businessServices = await getBusinessServices(
    businessData?.business.business_id,
  );

  const selectedService = searchParams.service ?? businessServices[0]?.name;

  const userData = await getUserData();

  const service_id = await businessServices.find(
    (service) => service.name === selectedService,
  )?.service_id;

  const queueData = (await getQueue(service_id ?? "")) ?? [];
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

  return (
    <main className="flex min-h-screen flex-col lg:px-24">
      <Header />

      {/* Business Header */}
      <BusinessHeader
        name={businessData.business.name}
        slug={slug}
        image={businessData.business.image ?? undefined}
        secondImage={businessData.business.cover_image ?? undefined}
      />

      {/* Business Info */}
      <BusinessDataList
        name={businessData.business.name}
        categories={businessData.categories}
        phone={businessData.business.phone ?? "Not Available"}
        reputation={{ positive: 120, negative: 20 }}
        description={businessData.business.description}
        marker= {{lat: +(businessData.business.latitude ?? 0), lng: +(businessData.business.longitude ?? 0)}}
      />

      {/* Virtual Queues */}
      <div className="scale-85 mt-12 grid w-full grid-cols-[repeat(auto-fit,minmax(50px,1fr))] items-center gap-2 lg:gap-10 ">
        {businessServices.length > 0 ? (
          businessServices.map((service, index) => (
            <Link
              key={index}
              href={{
                pathname: `./${slug}`,
                query: { service: service.name },
              }}
              className={cn(
                "rounded-t-lg bg-neutral-50 p-3 text-center text-xs font-semibold capitalize text-black/30 duration-300 hover:cursor-pointer hover:bg-neutral-200/60 hover:text-black lg:text-base ",
                selectedService === service.name &&
                  "bg-neutral-200/60 text-black",
              )}
            >
              {service.name}
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 opacity-40">
            <Frown size={200} />
            <p className="text-xl font-bold">No Services Available Currently</p>
          </div>
        )}
      </div>

      {/* Queue Cards */}
      {businessServices.length > 0 && (
        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-4 bg-neutral-200/60 p-1 pt-8 lg:p-4">
          {service_id && userData && (
            <ActionQueueCard
              position={
                !alreadyQueued
                  ? sortedQueue.length + 1 // If not already in the queue, their position is at the end.
                  : sortedQueue.findIndex(
                      (entry) => entry.users.user_id === userData.user_id,
                    ) + 1
              }
              service_id={service_id}
              user_id={userData.user_id}
              alreadyQueued={alreadyQueued}
            />
          )}
          <BusinessQueue sortedQueue={sortedQueue} userData={userData} />

          {sortedQueue.length === 0 && (
            <div className="relative flex h-[157px] w-full min-w-[400px] flex-col justify-center rounded bg-white">
              <Smile
                size={80}
                className="mb-2 w-full text-center text-neutral-400"
              />
              <p className="text-center text-xl font-bold text-neutral-400">
                Be the first to join!
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
