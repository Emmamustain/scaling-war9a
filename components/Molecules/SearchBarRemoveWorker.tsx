"use client";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";

import {
  fetchBusinessBySlug,
  getBusinessServicesAndWorkers,
  searchUsersByName,
} from "@/database/queries";
import Link from "next/link";

import AddWorkerButton from "./AddWorkerButton";
import RemoveWorkerButton from "./RemoveWorkerButton";

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type UserArray = UnwrapPromise<ReturnType<typeof searchUsersByName>>;
type User = UserArray[number];

interface SearchBarRemoveWorkerProps {
  businessSlug: string;

  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SearchBarRemoveWorker({
  businessSlug,

  setIsOpen,
}: SearchBarRemoveWorkerProps) {
  const [searchTerm, setSearchTerm] = useState("js");
  const [results, setResults] = useState<UserArray>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedUser, setSelectedUser] = useState<User>();
  const [searchValue, setSearchValue] = useState("");

  const fetchResults = async (debouncedSearchTerm: string, limit?: number) => {
    const results = await searchUsersByName(debouncedSearchTerm, limit);
    setResults(results);
  };

  useEffect(() => {
    fetchResults(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full max-w-[600px]">
        <Popover>
          <PopoverTrigger className="w-full">
            <Input
              className="w-full focus-visible:outline-none focus-visible:ring-0"
              placeholder="Search"
              type="search"
              value={searchValue}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSearchValue(e.target.value);
              }}
            />
          </PopoverTrigger>
          <PopoverContent
            className="w-[600px]"
            autoFocus={false}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {results.length > 0
              ? results.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedUser(result);
                      setSearchValue(result.username);
                    }}
                  >
                    <p className="w-full rounded p-4 text-sm even:bg-neutral-100/40 hover:cursor-pointer hover:bg-neutral-100">
                      {result.username}
                    </p>
                  </div>
                ))
              : "No results."}
          </PopoverContent>
        </Popover>
      </div>
      <RemoveWorkerButton
        setIsOpen={setIsOpen}
        user_id={selectedUser?.user_id ?? ""}
        businessSlug={businessSlug}
      />
    </div>
  );
}
