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
import SearchBarRemoveService from "../Molecules/SearchBarRemoveService";

interface HandleRemoveServiceProps {
  businessSlug: string;
}

export default function HandleRemoveService({
  businessSlug,
}: HandleRemoveServiceProps) {
  const [serviceName, setServiceName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

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
        <Button className=" mt-8 w-72">Remove Service</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Remove service from the business</SheetTitle>
          <SheetDescription>
            You can remove services from your business.
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
            <SearchBarRemoveService
              businessSlug={businessSlug}
              setIsOpen={setIsOpen}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
