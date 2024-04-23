"use client";
import * as React from "react";
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

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type businessData = UnwrapPromise<ReturnType<typeof fetchBusinessBySlug>>;
// type User = UserArray[number];

interface DeleteWorkerFromServiceProps {
  worker_id: string;
  service_id: string;
  user_id: string;
}

export default function DeleteWorkerFromService({
  worker_id,
  service_id,
  user_id,
}: DeleteWorkerFromServiceProps) {
  async function handleForm() {
    await removeWorkerFromService(worker_id, service_id, user_id);
    console.log("first");
  }

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <CircleEllipsis size={20} className="cursor-pointer" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-32">
          <DropdownMenuItem onClick={() => handleForm()}>
            <Trash size={16} className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
