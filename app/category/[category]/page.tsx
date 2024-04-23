import SectionHeading from "@/components/Atoms/section-heading";
import ClosestBusinesses from "@/components/Compounds/ClosestBusinesses";
import Footer from "@/components/Compounds/Footer";
import GreetingProfile from "@/components/Compounds/GreetingProfile";
import Header from "@/components/Compounds/Header";
import QuickNav from "@/components/Compounds/QuickNav";
import ServiceCard from "@/components/Molecules/BusinessCard";
import { CategoryCard } from "@/components/Molecules/CategoryCard";
import { getFeaturedBusinesses } from "@/database/queries";
import { Cross, Mail, Scissors, Scroll, Wallet, Wrench } from "lucide-react";

interface CategoryProps {
  params: { category: string };
}

export default function Category({ params }: CategoryProps) {
  return (
    <main className="flex min-h-screen flex-col px-24 dark:bg-neutral-900">
      <Header />
      <FeaturedBusinesses />
      <Footer />
    </main>
  );
}

async function FeaturedBusinesses() {
  const featuredBusinesses = await getFeaturedBusinesses();
  return (
    <div className="mt-6 grid h-fit w-full grid-cols-3 items-start justify-start gap-4">
      {featuredBusinesses.map((business) => (
        <ServiceCard
          key={business.name}
          name={business.name}
          slug={business.slug}
          address={business.location}
          avgWaitTime={business.avgWaitTime ?? 0}
        />
      ))}
    </div>
  );
}
