"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, Users, Loader2, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { cn, formatWaitTime } from "@/lib/utils";
import type { TCategory } from "@shared/types";

type BusinessWithStats = {
  id: string;
  name: string;
  slug: string;
  description: string;
  city: string;
  logoUrl: string | null;
  coverUrl: string | null;
  avgWaitTime: number | null;
  featured: boolean;
  status: string;
  categories: Array<{ category: TCategory }>;
  services: Array<{ id: string; name: string }>;
};

type BusinessListResponse = {
  data: BusinessWithStats[];
  total: number;
  hasNextPage: boolean;
};

const CITIES = ["All", "Annaba", "Alger", "Oran", "Constantine", "Blida"];

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["businesses", search, selectedCity, page],
    queryFn: () =>
      fetchApi<BusinessListResponse>("/businesses", {
        params: {
          search: search || undefined,
          city: selectedCity !== "All" ? selectedCity : undefined,
          page,
          limit: 12,
        },
      }),
    placeholderData: (prev) => prev,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Discover Businesses</h1>
        <p className="text-muted-foreground">
          Find and join virtual queues near you
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search businesses..."
            value={search}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <SlidersHorizontal className="size-4" />
          Filters
        </Button>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CITIES.map((city) => (
          <button
            key={city}
            onClick={() => handleCityChange(city)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              selectedCity === city
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            )}
          >
            {city}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : data?.data.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg text-muted-foreground">No businesses found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <>
          <div
            className={cn(
              "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
              isFetching && "opacity-60",
            )}
          >
            {data?.data.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>

          {(data?.hasNextPage || page > 1) && (
            <div className="mt-8 flex justify-center gap-3">
              {page > 1 && (
                <Button variant="outline" onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
              )}
              {data?.hasNextPage && (
                <Button onClick={() => setPage((p) => p + 1)}>
                  Load More
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BusinessCard({ business }: { business: BusinessWithStats }) {
  const waitTime = business.avgWaitTime ?? 0;

  return (
    <Link href={`/business/${business.slug}`}>
      <div className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
        <div className="relative h-40 overflow-hidden bg-secondary">
          {business.coverUrl ? (
            <img
              src={business.coverUrl}
              alt={business.name}
              className="size-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-4xl font-bold text-muted-foreground/30">
              {business.name[0]?.toUpperCase()}
            </div>
          )}
          {business.featured && (
            <Badge className="absolute right-2 top-2" variant="default">
              Featured
            </Badge>
          )}
          {business.logoUrl && (
            <div className="absolute -bottom-6 left-4 size-12 overflow-hidden rounded-xl border-2 border-background bg-background">
              <img
                src={business.logoUrl}
                alt=""
                className="size-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="p-4 pt-8">
          <h3 className="mb-1 font-semibold text-foreground">{business.name}</h3>
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {business.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="size-3" />
                {business.city}
              </span>
              {waitTime > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatWaitTime(waitTime)} avg
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="size-3" />
                {business.services.length} services
              </span>
            </div>
          </div>

          {business.categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {business.categories.slice(0, 2).map(({ category }) => (
                <Badge key={category.id} variant="secondary" className="text-xs">
                  {category.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
