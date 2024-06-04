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

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Example dashboard app built using the components.",
};

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type businessData = UnwrapPromise<ReturnType<typeof fetchBusinessBySlug>>;

type employeesData = UnwrapPromise<ReturnType<typeof getBusinessEmployees>>;

// type User = UserArray[number];

interface DashboardPageProps {
  params: { business_slug: string };
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const slug = params.business_slug;

  const businessData: businessData = await fetchBusinessBySlug(slug);
  const employees: employeesData = await getBusinessEmployees(slug);

  if (!businessData) return <p>Business not found</p>;
  const businessServices = await getBusinessServicesAndWorkers(
    businessData?.business.business_id,
  );
  return (
    <>
      <div className="md:hidden">
        <Image
          src="/examples/dashboard-light.png"
          width={1280}
          height={866}
          alt="Dashboard"
          className="block dark:hidden"
        />
        <Image
          src="/examples/dashboard-dark.png"
          width={1280}
          height={866}
          alt="Dashboard"
          className="hidden dark:block"
        />
      </div>
      <div className="hidden flex-col md:flex">
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
              <div className="flex items-center space-x-2">
                <CalendarDateRangePicker />
                <Button>Download</Button>
              </div>
            </div>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Team</TabsTrigger>
               
                <TabsTrigger value="notifications">
                  Queue management
                </TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Revenue
                      </CardTitle>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="text-muted-foreground h-4 w-4"
                      >
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$45,231.89</div>
                      <p className="text-muted-foreground text-xs">
                        +20.1% from last month
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Subscriptions
                      </CardTitle>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="text-muted-foreground h-4 w-4"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">+2350</div>
                      <p className="text-muted-foreground text-xs">
                        +180.1% from last month
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Sales
                      </CardTitle>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="text-muted-foreground h-4 w-4"
                      >
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <path d="M2 10h20" />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">+12,234</div>
                      <p className="text-muted-foreground text-xs">
                        +19% from last month
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Active Now
                      </CardTitle>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="text-muted-foreground h-4 w-4"
                      >
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">+573</div>
                      <p className="text-muted-foreground text-xs">
                        +201 since last hour
                      </p>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-4">
                    <CardHeader>
                      <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                      <Overview />
                    </CardContent>
                  </Card>
                  <Card className="col-span-3">
                    <CardHeader>
                      <CardTitle>Best Scores</CardTitle>
                      <CardDescription>
                        Here's the best scores of the month.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RecentScores employees={employees} />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="analytics" className="space-y-4">
                <div>
                  <div className="flex justify-between">
                    <HandleAddWorker businessSlug={slug} />
                    <WorkerOutBusiness businessSlug={slug} />
                  </div>
                  <DemoTeamMembers employees={employees} />
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
