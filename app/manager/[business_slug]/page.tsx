// import Footer from "@/components/Compounds/Footer";
// import Header from "@/components/Compounds/Header";
// import * as React from "react";

// import { Divide, UserCircle } from "lucide-react";
// import {
//   fetchBusinessBySlug,
//   getBusinessEmployees,
//   getBusinessServicesAndWorkers,
// } from "@/database/queries";
// import WorkerToBusiness from "@/components/Compounds/HandleAddWorker";
// import ServiceWorkerCards from "@/components/Compounds/ServiceWorkerCards";
// import WorkerOutBusiness from "@/components/Compounds/HandleRemoveWorker";

// type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

// type businessData = UnwrapPromise<ReturnType<typeof fetchBusinessBySlug>>;
// // type User = UserArray[number];

// interface ManagerPageProps {
//   params: { business_slug: string };
// }

// export default async function Manager({ params }: ManagerPageProps) {
//   const slug = params.business_slug;
//   const employeesData = await getBusinessEmployees(slug);

//   const businessData: businessData = await fetchBusinessBySlug(slug);

//   if (!businessData) return <p>Business not found</p>;

//   const businessServices = await getBusinessServicesAndWorkers(
//     businessData?.business.business_id,
//   );

//   // console.log(businessServices);

//   return (
//     <div className="flex min-h-screen flex-col px-24 dark:bg-neutral-900">
//       <Header />
//       <div className="flex justify-between">
//         <WorkerToBusiness businessSlug={slug} />
//         <WorkerOutBusiness businessSlug={slug} />
//       </div>
//       {/* <ul>
//         {employeesData.map((employee, index) => (
//           <li key={index}>{employee.users.username}</li>
//         ))}
//       </ul> */}
//       <div className="flex w-full flex-wrap">
//         {employeesData.map((employee, index) => (
//           <div
//             key={index}
//             className="flex w-[300px] items-center justify-center"
//           >
//             <div className="flex h-full w-[40%] items-center justify-center">
//               <UserCircle className="h-[70px] w-[70%]" />
//             </div>
//             <div className="mx-2">{employee.users.username}</div>
//             <div className="flex h-full w-[60%] flex-col justify-center  p-3 text-sm font-medium">
//               <div className="mb-2">Score :</div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <ServiceWorkerCards business_slug={slug} />

//       <Footer />
//     </div>
//   );
// }

import { Metadata } from "next";
import Image from "next/image";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDateRangePicker } from "@/components/Test/Date-range-picker";
import { MainNav } from "@/components/Test/Main-nav";
import { Overview } from "@/components/Test/Overview";

import { Search } from "@/components/Test/Search";
import TeamSwitcher from "@/components/Test/Team-switchers";
import { UserNav } from "@/components/Test/User-nav";
import Header from "@/components/Compounds/Header";
import { DemoTeamMembers } from "@/components/TestForCards/Team-members";
import {
  fetchBusinessBySlug,
  getBusinessEmployees,
  getBusinessServicesAndWorkers,
} from "@/database/queries";
import HandleAddWorker from "@/components/Compounds/HandleAddWorker";
import ChooseRole from "@/components/Molecules/ChooseRole";
import HandleServiceByOwner from "@/components/Compounds/HandleServicesByOwner";
import WorkerToBusiness from "@/components/Compounds/HandleAddWorker";
import ServiceWorkerCards from "@/components/Compounds/ServiceWorkerCards";
import RecentScores from "@/components/Molecules/RecentScores";
import HandleRemoveService from "@/components/Compounds/HandleRemoveService";
import WorkerOutBusiness from "@/components/Compounds/HandleRemoveWorker";
import { DemoTeamMembersManager } from "@/components/TestForCards/Team-membersManager";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Example dashboard app built using the components.",
};

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type businessData = UnwrapPromise<ReturnType<typeof fetchBusinessBySlug>>;

type employeesData = UnwrapPromise<ReturnType<typeof getBusinessEmployees>>;

// type User = UserArray[number];

interface ManagerPageProps {
  params: { business_slug: string };
}

export default async function ManagerPage({ params }: ManagerPageProps) {
  const slug = params.business_slug;

  const businessData: businessData = await fetchBusinessBySlug(slug);
  const employees: employeesData = await getBusinessEmployees(slug);

  if (!businessData) return <p>Business not found</p>;
  const businessServices = await getBusinessServicesAndWorkers(
    businessData?.business.business_id,
  );
  return (
    <>
      <div className=" flex flex-col">
        {/* <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <TeamSwitcher />
            <MainNav className="mx-6" />
            <div className="ml-auto flex items-center space-x-4">
              <Search />
              <UserNav />
            </div>
          </div>
        </div> */}
        <div className="px-20">
          <Header />

          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>
            <Tabs defaultValue="analytics" className="space-y-4">
              <TabsList>
                <TabsTrigger value="analytics">Team</TabsTrigger>
                <TabsTrigger value="notifications">
                  Queue management
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analytics" className="space-y-4">
                <div>
                  <div className="flex justify-between">
                    <HandleAddWorker businessSlug={slug} />
                    <WorkerOutBusiness businessSlug={slug} />
                  </div>
                  <DemoTeamMembersManager employees={employees} />
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-4">
                <div>
                  <div className="flex justify-between">
                    <HandleServiceByOwner businessSlug={slug} />
                    <HandleRemoveService businessSlug={slug} />
                  </div>
                  <ServiceWorkerCards business_slug={slug} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
