import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Divide, UserCircle, CircleEllipsis, Trash } from "lucide-react";
import {
  fetchBusinessBySlug,
  getBusinessServicesAndWorkers,
} from "@/database/queries";
import AssignWorkerButton from "@/components/Compounds/HandleAssignWorker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { removeWorkerFromService } from "@/database/mutations";
import DeleteWorkerFromService from "../Molecules/DeleteWorkerFromService";

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type businessData = UnwrapPromise<ReturnType<typeof fetchBusinessBySlug>>;
// type User = UserArray[number];

interface serviceWorkerCardsProps {
  business_slug: string;
}

export default async function serviceWorkerCards({
  business_slug,
}: serviceWorkerCardsProps) {
  const slug = business_slug;

  const businessData: businessData = await fetchBusinessBySlug(slug);

  if (!businessData) return <p>Business not found</p>;

  const businessServices = await getBusinessServicesAndWorkers(
    businessData?.business.business_id,
  );

  return (
    <div className=" m-4 flex w-full flex-col items-center justify-center dark:bg-neutral-900">
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full "
      >
        <CarouselContent>
          {businessServices.map((service, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card>
                  <div className="w-full border-b-2">
                    <div className="mx-auto w-fit p-4 font-bold uppercase">
                      {service.service.name}
                    </div>
                  </div>
                  <CardContent className="relative flex aspect-square items-center justify-center p-6">
                    <div className="relative h-full w-full overflow-y-scroll">
                      {/* Display worker names */}
                      {service.users.map((item: any, index: number) => (
                        <div
                          key={index}
                          className=" mb-2 flex justify-between rounded border border-gray-300 p-2"
                        >
                          {item.username}
                          <DeleteWorkerFromService
                            worker_id={service.workers[index].worker_id}
                            service_id={service.service.service_id}
                            user_id={service.users[index].user_id}
                          />
                        </div>
                      ))}
                    </div>
                    {/* "Assign Worker" button */}
                    <div className="absolute bottom-10 z-10 flex w-full items-center justify-center overflow-visible">
                      {/* <div className="absolute h-[60px] w-full bg-black/30 blur-2xl"></div> */}
                      <div className=" shadow-xl">
                        <AssignWorkerButton
                          businessSlug={slug}
                          serviceId={service.service.service_id}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
