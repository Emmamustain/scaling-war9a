"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import SectionHeading from "@/components/atoms/section-heading";
import BusinessCard from "@/components/discover/business-card";
import { CategoryCard } from "@/components/discover/category-card";
import GreetingProfile from "@/components/discover/greeting-profile";
import MyQueueCard from "@/components/discover/my-queue-card";
import { categories } from "@/lib/categories";

type BusinessItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  city: string;
  location: string;
  logoUrl: string | null;
  avgWaitTime: number | null;
  featured: boolean;
  categories: Array<{ category: { id: string; name: string } }>;
  services: Array<{ id: string; name: string }>;
};

type BusinessListResponse = {
  data: BusinessItem[];
  total: number;
  hasNextPage: boolean;
};

export default function DiscoverPage() {
  const { isAuthenticated } = useAuthStore();
  const [search, setSearch] = useState("");

  const { data: featuredData } = useQuery({
    queryKey: ["businesses-featured"],
    queryFn: () =>
      fetchApi<BusinessListResponse>("/businesses", {
        params: { featured: true, limit: 6 },
      }),
  });

  const { data: searchData, isLoading: isSearching } = useQuery({
    queryKey: ["businesses-search", search],
    queryFn: () =>
      fetchApi<BusinessListResponse>("/businesses", {
        params: { search, limit: 12 },
      }),
    enabled: search.length > 0,
  });

  const displayBusinesses = search ? searchData?.data : featuredData?.data;

  return (
    <main className="flex min-h-screen flex-col px-6 dark:bg-neutral-900 lg:px-24">
      {/* Greeting */}
      {isAuthenticated && <GreetingProfile />}

      {/* Your active queue - prominent when in one */}
      {isAuthenticated && (
        <div className="mt-6">
          <MyQueueCard />
        </div>
      )}

      {/* Search */}
      <div className="relative mt-10 max-w-xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search businesses..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Featured / Search Results */}
      <SectionHeading
        text={search ? `Results for "${search}"` : "Featured"}
        className="mb-3 mt-14"
      />
      {isSearching ? (
        <div className="flex items-center justify-center py-10">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : displayBusinesses && displayBusinesses.length > 0 ? (
        <div className="grid h-fit w-full grid-cols-1 items-start justify-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayBusinesses.map((business) => (
            <BusinessCard
              key={business.id}
              name={business.name}
              slug={business.slug}
              address={business.location}
              avgWaitTime={business.avgWaitTime ?? 0}
              logoUrl={business.logoUrl}
            />
          ))}
        </div>
      ) : !search ? (
        <p className="text-muted-foreground">No featured businesses yet.</p>
      ) : (
        <p className="text-muted-foreground">No results found.</p>
      )}

      {/* Categories */}
      {!search && (
        <>
          <SectionHeading text="Categories" className="mb-3 mt-14" />
          <div className="grid h-fit w-full grid-cols-1 items-start justify-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <CategoryCard
                key={index}
                name={category.name}
                bgColor={category.bgColor}
                icon={category.icon}
                description={category.description}
                href={category.href}
              />
            ))}
          </div>
        </>
      )}

      <div className="mt-16" />
    </main>
  );
}
