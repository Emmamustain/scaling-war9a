"use client";
import { lazyGetClosestBusinesses } from "@/database/queries";
import LoadMore from "@/components/Molecules/LoadMore";
import ServiceCard from "@/components/Molecules/BusinessCard";
import { useEffect, useState } from "react";

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type business = UnwrapPromise<ReturnType<typeof lazyGetClosestBusinesses>>;

export default function ClosestBusinesses() {
  const [closestBusinesses, setClosestBusinesses] = useState<business>([]);
  const [offset, setOffset] = useState(0);
  const [fetchedAll, setFetchedAll] = useState(false);

  const fetchNextBatch = async (batchSize: number) => {
    const newBusinesses = await lazyGetClosestBusinesses(batchSize, offset);
    if (newBusinesses.length < batchSize) {
      setFetchedAll(true);
    }
    setOffset(offset + batchSize);
    setClosestBusinesses((prevBusinesses) => [
      ...prevBusinesses,
      ...newBusinesses,
    ]);
  };

  useEffect(() => {
    fetchNextBatch(5);
  }, []); // Empty dependency array to run once on mount

  return (
    <div className="grid h-fit w-full grid-cols-3  items-start justify-start gap-4">
      {closestBusinesses.map((business) => (
        <ServiceCard
          key={business.name}
          name={business.name}
          slug={business.slug}
          address={business.location}
          avgWaitTime={business.avgWaitTime ?? 0}
        />
      ))}
      {!fetchedAll && <LoadMore action={() => fetchNextBatch(3)} />}
    </div>
  );
}
