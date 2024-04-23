"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { SetStateAction, useState } from "react";
import { addServiceToBusiness } from "@/database/mutations";
import AddServiceForm from "./test";
import { ChangeEvent } from "react";

interface HandleServiceByOwnerProps {
  businessSlug: string;
}

export default function HandleServiceByOwner({
  businessSlug,
}: HandleServiceByOwnerProps) {
  const [serviceName, setServiceName] = useState("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setServiceName(e.target.value);
  };

  const handleButtonClick = async () => {
    try {
      const result = await addServiceToBusiness(serviceName, businessSlug);
      console.log(serviceName); // Log the result of the mutation
    } catch (error) {
      console.error("Error adding service:", error);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className=" mt-8 w-72">Add Service</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add New Service</SheetTitle>
          <SheetDescription>
            Make changes and add new services to your business.
          </SheetDescription>
        </SheetHeader>
        <div className="grid py-4">
          <div className="flex items-center gap-2">
            <Label
              htmlFor="name"
              className="whitespace-nowrap text-left font-semibold"
            >
              Service name
            </Label>
            <Input
              type="name your service"
              value={serviceName}
              onChange={handleInputChange}
              placeholder="Enter service name"
            />
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleButtonClick}>Add Service</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
