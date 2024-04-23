"use client";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { searchBusinessesByName } from "@/database/queries";
import Link from "next/link";

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type business = UnwrapPromise<ReturnType<typeof searchBusinessesByName>>;

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("js");
  const [results, setResults] = useState<business>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchResults = async (debouncedSearchTerm: string, limit?: number) => {
    const results = await searchBusinessesByName(debouncedSearchTerm, limit);
    setResults(results);
  };

  useEffect(() => {
    fetchResults(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  return (
    <div className="w-full max-w-[600px]">
      <Popover>
        <PopoverTrigger className="w-full">
          <Input
            className="w-full focus-visible:outline-none focus-visible:ring-0"
            placeholder="Search"
            type="search"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </PopoverTrigger>
        <PopoverContent
          className="w-[600px]"
          autoFocus={false}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {results.length > 0
            ? results.map((result, index) => (
                <Link key={index} href={"/business/" + result.slug}>
                  <p className="w-full rounded p-4 text-sm even:bg-neutral-100/40 hover:cursor-pointer hover:bg-neutral-100">
                    {result.name}
                  </p>
                </Link>
              ))
            : "No results."}
        </PopoverContent>
      </Popover>
    </div>
  );
}
