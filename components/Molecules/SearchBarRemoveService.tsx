"use client";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";

import { searchServiceByName } from "@/database/queries";
import Link from "next/link";

import AddWorkerButton from "./AddWorkerButton";
import RemoveServiceButton from "./RemoveServiceButton";

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type UserArray = UnwrapPromise<ReturnType<typeof searchServiceByName>>;
type User = UserArray[number];

interface SearchBarRemoveServiceProps {
  businessSlug: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SearchBarRemoveService({
  businessSlug,
  setIsOpen,
}: SearchBarRemoveServiceProps) {
  const [searchTerm, setSearchTerm] = useState("js");
  const [results, setResults] = useState<UserArray>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedService, setSelectedService] = useState<User>();
  const [searchValue, setSearchValue] = useState("");

  const fetchResults = async (debouncedSearchTerm: string, limit?: number) => {
    const results = await searchServiceByName(
      debouncedSearchTerm,
      businessSlug,
      limit,
    );
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
                      setSelectedService(result);
                      setSearchValue(result.name);
                    }}
                  >
                    <p className="w-full rounded p-4 text-sm even:bg-neutral-100/40 hover:cursor-pointer hover:bg-neutral-100">
                      {result.name}
                    </p>
                  </div>
                ))
              : "No results."}
          </PopoverContent>
        </Popover>
      </div>
      <RemoveServiceButton
        setIsOpen={setIsOpen}
        service_id={selectedService?.service_id ?? ""}
        businessSlug={businessSlug}
      />
    </div>
  );
}
