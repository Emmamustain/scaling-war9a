"use client";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { searchUsersByName } from "@/database/queries";
import SearchBarAddWorker from "../Molecules/SearchBarAddWorker";
import { Edit } from "lucide-react";
import { useState } from "react";
import SearchBarRemoveWorker from "../Molecules/SearchBarRemoveWorker";

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type UserArray = UnwrapPromise<ReturnType<typeof searchUsersByName>>;
type User = UserArray[number];

interface WorkerOutBusinessProps {
  businessSlug: string;
}

export default function WorkerOutBusiness({
  businessSlug,
}: WorkerOutBusinessProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Drawer open={isOpen}>
      <DrawerTrigger asChild onClick={() => setIsOpen((curr) => !curr)}>
        <Button className=" mt-8 w-72">
          <Edit size={20} className="m-2" /> Remove worker from business
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Remove worker </DrawerTitle>
            <DrawerDescription>bla bla bla</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="flex items-center justify-center space-x-2">
              {/* <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
                onClick={() => onClick(-10)}
                disabled={goal <= 200}
              >
                <span className="sr-only">Decrease</span>
              </Button> */}
              <div className="flex-1 text-center">
                {/* <div className="text-7xl font-bold tracking-tighter">
                  {goal}
                </div> */}
              </div>
              {/* <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
                onClick={() => onClick(10)}
                disabled={goal >= 400}
              >
                <span className="sr-only">Increase</span>
              </Button> */}
            </div>
            <SearchBarRemoveWorker
              setIsOpen={setIsOpen}
              businessSlug={businessSlug}
            />
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
