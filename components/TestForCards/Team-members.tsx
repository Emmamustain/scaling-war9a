"use client";

import { getBusinessEmployees } from "@/database/queries";
import MinidenticonImg from "../Atoms/random-pfp";
import custompfpchecker from "@/utils/custom-pfp-checker";
import { ChevronDownIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import ChooseRole from "../Molecules/ChooseRole";

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type employeesData = UnwrapPromise<ReturnType<typeof getBusinessEmployees>>;

interface DemoTeamMembersProps {
  employees: employeesData;
}
export function DemoTeamMembers({ employees }: DemoTeamMembersProps) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>
          Invite your team members to collaborate.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {employees &&
          employees.map((employee, index) => (
            <div
              className="flex items-center justify-between space-x-4"
              key={index}
            >
              <div className="flex items-center space-x-4">
                <Avatar className="h-9 w-9">
                  <MinidenticonImg
                    username={custompfpchecker(
                      employee.users.username ?? "random",
                    )}
                  />
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">
                    {employee.users.username}
                  </p>
                </div>
              </div>
              <ChooseRole employee={employee} />
         
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
