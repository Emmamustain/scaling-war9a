"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Bell, History, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";
import BusinessCard from "@/components/discover/business-card";
import MyQueueCard from "@/components/discover/my-queue-card";
import { categories } from "@/lib/categories";
import MinidenticonImg from "@/components/atoms/minidenticon-img";
import Link from "next/link";

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

const LIMIT = 20;
const CITIES = ["Annaba", "Algiers", "Oran", "Constantine", "Setif", "Batna"];

function useInfiniteBusinesses(params: Record<string, string | number | boolean | undefined>, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ["businesses-infinite", params],
    queryFn: ({ pageParam }) =>
      fetchApi<BusinessListResponse>("/businesses", {
        params: { ...params, page: pageParam, limit: LIMIT },
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasNextPage ? allPages.length + 1 : undefined,
    enabled,
  });
}

function useSentinel(onIntersect: () => void, enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onIntersect(); },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, onIntersect]);
  return ref;
}

export default function DiscoverPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [city, setCity] = useState("Annaba");
  const displayName = user?.displayName ?? user?.username;

  const isFiltered = !!search || !!selectedCategory;

  // Featured — static, horizontal carousel
  const { data: featuredData } = useQuery({
    queryKey: ["businesses-featured"],
    queryFn: () =>
      fetchApi<BusinessListResponse>("/businesses", {
        params: { featured: true, limit: 10 },
      }),
    enabled: !isFiltered,
  });

  // Nearby — infinite scroll (default view)
  const {
    data: nearbyData,
    fetchNextPage: fetchNextNearby,
    hasNextPage: hasMoreNearby,
    isFetchingNextPage: loadingMoreNearby,
  } = useInfiniteBusinesses({}, !isFiltered);

  const nearbyItems = nearbyData?.pages.flatMap((p) => p.data) ?? [];

  // Filtered / search — infinite scroll
  const {
    data: filteredData,
    fetchNextPage: fetchNextFiltered,
    hasNextPage: hasMoreFiltered,
    isFetchingNextPage: loadingMoreFiltered,
    isLoading: isLoadingFiltered,
  } = useInfiniteBusinesses(
    search ? { search } : { category: selectedCategory ?? undefined },
    isFiltered,
  );

  const filteredItems = filteredData?.pages.flatMap((p) => p.data) ?? [];

  // Sentinel refs
  const nearbySentinelRef = useSentinel(
    () => { if (hasMoreNearby && !loadingMoreNearby) void fetchNextNearby(); },
    !isFiltered && hasMoreNearby,
  );
  const filteredSentinelRef = useSentinel(
    () => { if (hasMoreFiltered && !loadingMoreFiltered) void fetchNextFiltered(); },
    isFiltered && hasMoreFiltered,
  );

  return (
    <main className="flex min-h-screen flex-col">
      {/* ── Top section ── */}
      <div className="px-4 md:px-6 lg:px-24">
        {/* ── Mobile header row: avatar + greeting + action icons ── */}
        <div className="flex items-center justify-between pt-2 md:hidden">
          <div className="flex items-center gap-3.5">
            {isAuthenticated && user ? (
              <div className="size-16 shrink-0 overflow-hidden rounded-full border-2 border-primary/20 bg-muted">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={displayName ?? ""} className="h-full w-full object-cover" />
                ) : (
                  <MinidenticonImg username={user.username} />
                )}
              </div>
            ) : (
              <div className="size-16 shrink-0 rounded-full bg-muted" />
            )}
            <div>
              <p className="text-sm text-muted-foreground">
                {isAuthenticated ? "Welcome back 👋" : "Hello there 👋"}
              </p>
              <p className="text-xl font-bold leading-tight">
                {displayName ?? "Guest"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              href="/notifications"
              className="flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
            >
              <Bell className="size-5" />
            </Link>
            <Link
              href="/profile"
              className="flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
            >
              <History className="size-5" />
            </Link>
          </div>
        </div>

        {/* ── Desktop greeting ── */}
        {isAuthenticated && displayName && (
          <div className="mt-1 hidden md:block">
            <p className="text-3xl font-bold md:text-4xl">
              Welcome Back,{" "}
              <span className="text-2xl font-semibold md:text-3xl">{displayName}</span>
              {" "}👋
            </p>
          </div>
        )}

        {/* Location selector */}
        <div className="mt-3 flex items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0 text-primary" />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-transparent text-sm font-medium text-muted-foreground focus:outline-none"
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Active queue banner */}
        {isAuthenticated && (
          <div className="mt-2">
            <MyQueueCard />
          </div>
        )}

        {/* Search */}
        <div className="relative mt-3 w-full md:mt-6 md:max-w-xl">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search businesses..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(e.target.value);
              if (e.target.value) setSelectedCategory(null);
            }}
            className="h-11 rounded-xl pl-9 text-base"
          />
        </div>
      </div>

      {/* ── Category chips ── */}
      {!search && (
        <div className="mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:px-6 lg:px-24">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              !selectedCategory
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                selectedCategory === cat.name
                  ? "bg-foreground text-background"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="[&>svg]:size-3.5">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Filtered / search results ── */}
      {isFiltered && (
        <div className="mt-4 px-4 md:px-6 lg:px-24">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold md:text-xl">
              {search ? `Results for "${search}"` : selectedCategory}
            </h2>
            {filteredItems.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {filteredItems.length} places
              </span>
            )}
          </div>

          {isLoadingFiltered ? (
            <div className="flex items-center justify-center py-10">
              <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredItems.length > 0 ? (
            <>
              {/* Mobile: list */}
              <div className="flex flex-col gap-2 md:hidden">
                {filteredItems.map((b) => (
                  <BusinessCard
                    key={b.id}
                    name={b.name}
                    slug={b.slug}
                    address={b.location}
                    avgWaitTime={b.avgWaitTime ?? 0}
                    logoUrl={b.logoUrl}
                    variant="list"
                  />
                ))}
              </div>
              {/* Desktop: grid */}
              <div className="hidden gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((b) => (
                  <BusinessCard
                    key={b.id}
                    name={b.name}
                    slug={b.slug}
                    address={b.location}
                    avgWaitTime={b.avgWaitTime ?? 0}
                    logoUrl={b.logoUrl}
                  />
                ))}
              </div>

              {/* Sentinel + loading indicator */}
              <div ref={filteredSentinelRef} className="py-4 flex justify-center">
                {loadingMoreFiltered && (
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="mb-3 size-10 text-muted-foreground/30" />
              <p className="font-medium text-muted-foreground">
                {search ? "No results found" : `No businesses in ${selectedCategory}`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Default two-section layout ── */}
      {!isFiltered && (
        <>
          {/* Featured — horizontal scroll carousel */}
          {featuredData?.data && featuredData.data.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between px-4 md:px-6 lg:px-24">
                <h2 className="text-base font-semibold md:text-xl">Featured</h2>
                <span className="text-xs text-muted-foreground">
                  {featuredData.data.length} places
                </span>
              </div>

              {/* Mobile: horizontal scroll with gradient edges */}
              <div className="relative md:hidden">
                <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-6 bg-gradient-to-r from-background to-transparent" />
                <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-12 bg-gradient-to-l from-background to-transparent" />
                <div className="flex gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {featuredData.data.map((b) => (
                    <BusinessCard
                      key={b.id}
                      name={b.name}
                      slug={b.slug}
                      address={b.location}
                      avgWaitTime={b.avgWaitTime ?? 0}
                      logoUrl={b.logoUrl}
                      variant="featured"
                    />
                  ))}
                </div>
              </div>

              {/* Desktop: grid */}
              <div className="hidden gap-3 px-6 md:grid md:grid-cols-2 lg:grid-cols-3 lg:px-24">
                {featuredData.data.map((b) => (
                  <BusinessCard
                    key={b.id}
                    name={b.name}
                    slug={b.slug}
                    address={b.location}
                    avgWaitTime={b.avgWaitTime ?? 0}
                    logoUrl={b.logoUrl}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Nearby — infinite scroll */}
          {nearbyItems.length > 0 && (
            <div className="mt-6 px-4 md:px-6 lg:px-24">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold md:text-xl">Nearby</h2>
                <span className="text-xs text-muted-foreground">
                  {nearbyItems.length} places
                </span>
              </div>

              {/* Mobile: list */}
              <div className="flex flex-col gap-2 md:hidden">
                {nearbyItems.map((b) => (
                  <BusinessCard
                    key={b.id}
                    name={b.name}
                    slug={b.slug}
                    address={b.location}
                    avgWaitTime={b.avgWaitTime ?? 0}
                    logoUrl={b.logoUrl}
                    variant="list"
                  />
                ))}
              </div>

              {/* Desktop: grid */}
              <div className="hidden gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
                {nearbyItems.map((b) => (
                  <BusinessCard
                    key={b.id}
                    name={b.name}
                    slug={b.slug}
                    address={b.location}
                    avgWaitTime={b.avgWaitTime ?? 0}
                    logoUrl={b.logoUrl}
                  />
                ))}
              </div>

              {/* Sentinel + loading indicator */}
              <div ref={nearbySentinelRef} className="py-4 flex justify-center">
                {loadingMoreNearby && (
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-16" />
    </main>
  );
}
