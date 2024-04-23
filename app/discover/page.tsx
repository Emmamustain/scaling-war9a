import SectionHeading from "@/components/Atoms/section-heading";
import ClosestBusinesses from "@/components/Compounds/ClosestBusinesses";
import Footer from "@/components/Compounds/Footer";
import GreetingProfile from "@/components/Compounds/GreetingProfile";
import Header from "@/components/Compounds/Header";
import QuickNav from "@/components/Compounds/QuickNav";
import ServiceCard from "@/components/Molecules/BusinessCard";
import { CategoryCard } from "@/components/Molecules/CategoryCard";
import { getAverageTime, getFeaturedBusinesses } from "@/database/queries";
import { categories } from "@/lib/global_vars";

export default function Discover() {
  return (
    <main className="flex min-h-screen flex-col px-24 dark:bg-neutral-900">
      <Header />

      {/* Greeting */}
      <GreetingProfile />

      {/* Quick Nav */}
      <QuickNav />

      {/* Featured Businesses */}
      <SectionHeading text="Featured" className="mb-3 mt-14" />
      <FeaturedBusinesses />

      {/* Businesses by Categories */}
      <SectionHeading text="Categories" className="mb-3 mt-14" />
      <div className="grid h-fit w-full grid-cols-3  items-start justify-start gap-4">
        {categories.map((category, index) => (
          <CategoryCard
            key={index}
            stat={category.name}
            bgColor={category.bgColor}
            icon={category.icon}
            description={category.description}
            href={category.href}
          />
        ))}
      </div>

      {/* Closest Businesses */}
      <SectionHeading text="Closest to you" className="mb-3 mt-14" />
      <ClosestBusinesses />
      <Footer />
    </main>
  );
}

async function FeaturedBusinesses() {
  const featuredBusinesses = await getFeaturedBusinesses();
  // Fetch average time for each featured business
  // const businessesWithAverageTime = await Promise.all(
  //   featuredBusinesses.map(async (business) => {
  //     try {
  //       const serviceId = await fetchServiceBybusinessId(business.business_id);
  //       const avgWaitTime = serviceId ? await getAverageTime(serviceId) : 0;
  //       return { ...business, avgWaitTime };
  //     } catch (error) {
  //       console.error("Error fetching average time for business:", error);
  //       return { ...business, avgWaitTime: 0 };
  //     }
  //   })
  // );

  return (
    <div className="grid h-fit w-full grid-cols-3  items-start justify-start gap-4">
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
