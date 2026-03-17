"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import BusinessCard from "@/components/discover/business-card";
import { Loader2 } from "lucide-react";
import Link from "next/link";

type BusinessItem = {
  id: string;
  name: string;
  slug: string;
  location: string;
  city: string;
  logoUrl: string | null;
  avgWaitTime: number | null;
};

type BusinessListResponse = {
  data: BusinessItem[];
  total: number;
};

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  // Format slug for display e.g. "post-offices" → "Post Offices"
  const title = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const { data, isLoading } = useQuery({
    queryKey: ["category-businesses", slug],
    queryFn: () =>
      fetchApi<BusinessListResponse>("/businesses", {
        params: { category: slug, limit: 24 },
      }),
  });

  return (
    <main className="flex min-h-screen flex-col px-6 dark:bg-neutral-900 lg:px-24">
      <div className="mt-8 mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/discover" className="hover:underline">
          Discover
        </Link>
        <span>/</span>
        <span>{title}</span>
      </div>

      <h1 className="mb-8 text-3xl font-bold">{title}</h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : data?.data.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <p>No businesses found in this category yet.</p>
          <Link href="/discover" className="mt-4 inline-block text-primary hover:underline">
            Back to Discover
          </Link>
        </div>
      ) : (
        <div className="grid h-fit w-full grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.data.map((business: BusinessItem) => (
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
      )}
    </main>
  );
}
