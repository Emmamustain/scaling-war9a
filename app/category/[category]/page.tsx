import SectionHeading from "@/components/Atoms/section-heading";
import ClosestBusinesses from "@/components/Compounds/ClosestBusinesses";
import Footer from "@/components/Compounds/Footer";
import GreetingProfile from "@/components/Compounds/GreetingProfile";
import Header from "@/components/Compounds/Header";
import QuickNav from "@/components/Compounds/QuickNav";
import ServiceCard from "@/components/Molecules/BusinessCard";
import { CategoryCard } from "@/components/Molecules/CategoryCard";
import {
  getBusinessByCategories,
  getFeaturedBusinesses,
} from "@/database/queries";
import { Cross, Mail, Scissors, Scroll, Wallet, Wrench } from "lucide-react";

interface CategoryProps {
  params: { category: string };
}

export default async function Category({ params }: CategoryProps) {
  console.log(params.category);
  const categoryBusinesses = await getBusinessByCategories(params.category);
  return (
    <main className="flex min-h-screen flex-col px-24 dark:bg-neutral-900">
      <Header />
      <div className="mt-6 grid h-fit w-full grid-cols-3 items-start justify-start gap-4">
        {categoryBusinesses.map((business) => (
          <ServiceCard
            key={business.businesses.business_id}
            name={business.businesses.name}
            slug={business.businesses.slug}
            address={business.businesses.location}
            avgWaitTime={business.businesses.avgWaitTime ?? 0}
          />
        ))}
      </div>
      <Footer />
    </main>
  );
}
