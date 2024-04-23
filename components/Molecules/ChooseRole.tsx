"use client";

import * as React from "react";
import { Check, ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getBusinessEmployees } from "@/database/queries";
import { UserRole, changeEmployeeRole } from "@/database/mutations";

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type employeesData = UnwrapPromise<ReturnType<typeof getBusinessEmployees>>;
type Employee = employeesData[number];
interface ChooseRoleProps {
  employee: Employee;
}
export default function ChooseRole({ employee }: ChooseRoleProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(employee.workers.role as string);

  async function handleClick(itemValue: string) {
    console.log("Selected value:", itemValue);
    setValue(itemValue);
    setOpen(false);
    await changeEmployeeRole(employee.workers.worker_id, itemValue as UserRole);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="ml-auto"
        >
          {value ? value : "Select a role..."}
          <ChevronDownIcon className="text-muted-foreground ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search role..." />
          <CommandEmpty>No role found.</CommandEmpty>
          <CommandGroup>
            <CommandItem
              value="Manager"
              onSelect={(value) => handleClick(value.toLowerCase())}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === "Manager" ? "opacity-100" : "opacity-0",
                )}
              />
              Manager
            </CommandItem>
            <CommandItem
              value="Worker"
              onSelect={(value) => handleClick(value.toLowerCase())}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === "Worker" ? "opacity-100" : "opacity-0",
                )}
              />
              Worker
            </CommandItem>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
