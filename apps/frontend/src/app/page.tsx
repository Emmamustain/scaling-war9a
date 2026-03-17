import Image from "next/image";
import Link from "next/link";
import {
  StethoscopeIcon,
  Landmark,
  CalendarCheck,
  Coins,
  Store,
  GraduationCap,
} from "lucide-react";
import { MainNav } from "@/components/layout/main-nav";
import Footer from "@/components/layout/footer";
import Accordion from "@/components/landing/accordion";
import BusinessTag from "@/components/landing/business-tag";
import TagButton from "@/components/landing/tag-button";
import SectionHeading from "@/components/landing/section-heading";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col dark:bg-neutral-900">
      <MainNav />

      {/* Hero */}
      <div className="flex h-[calc(100vh-72px)] w-full relative overflow-hidden">
        <div className="flex w-full flex-col items-start justify-center gap-10 px-16 md:w-1/2 relative overflow-hidden">
          <p className="text-5xl font-bold leading-tight md:text-7xl">
            Virtual waitlists without the wait
          </p>
          <p className="text-neutral-500 text-lg max-w-md">
            Revamp your customer flow with hassle-free virtual queues,
            intelligent wait times, and automated queue management. Set up a
            virtual waitlist in minutes.
          </p>
          <div className="flex gap-4">
            <Link
              href="/sign-up"
              className="rounded-[30px] bg-blue-700 px-6 py-3 font-semibold text-white transition-transform hover:scale-95 hover:opacity-90"
            >
              Try it free
            </Link>
            <Link
              href="/discover"
              className="rounded-[30px] border border-neutral-300 px-6 py-3 font-semibold transition-transform hover:scale-95 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Discover businesses
            </Link>
          </div>
        </div>
        <Image
          src="/images/hand.svg"
          height={1450}
          width={1450}
          alt=""
          className="absolute -right-[600px] top-0 contrast-[1.5] hidden md:block"
        />
      </div>

      {/* Built for section */}
      <div className="flex min-h-[40vh] items-center justify-center bg-neutral-900 py-16">
        <div className="flex w-full max-w-2xl flex-col items-center px-6">
          <p className="text-center text-4xl font-bold text-white md:text-5xl">
            End-to-end customer flow management built for:
          </p>
          <div className="mr-10 mt-8 flex flex-wrap justify-center gap-3">
            <TagButton
              text="Waitlist"
              className="border-white text-white hover:border-transparent"
            />
            <TagButton
              text="Appointments"
              className="border-white text-white hover:border-transparent"
            />
            <TagButton
              text="Any Business"
              className="border-white text-white hover:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* For Customers */}
      <div className="min-h-screen w-full bg-blue-50 dark:bg-blue-950/20">
        <SectionHeading
          crown="FOR CUSTOMERS"
          line1="Get rid of lines."
          line2="Make customers happy."
        />
        <div className="mt-10 flex h-[60vh] w-full">
          <div className="flex w-full flex-col items-center md:w-1/2">
            <div className="flex h-full w-full flex-col justify-center pl-10">
              <Accordion
                title="Many ways to join a waitlist"
                text="Customers can join your virtual queue from anywhere – and with any device. Choose from many options (or offer them all)."
              />
              <Accordion
                title="Precise wait time estimates"
                text="Powered by AI, War9a gives accurate wait times, so everyone knows what to expect."
              />
              <Accordion
                title="Easy two-way communication"
                text="Guests can wait from anywhere. They receive regular updates and a ping when it's their turn. If they're running late, they can easily text or chat and War9a will take care of the rest."
                divider={false}
              />
            </div>
          </div>
          <div className="hidden w-1/2 md:block">
            <Image
              src="/images/time.svg"
              height={1450}
              width={1450}
              alt=""
              className="h-full w-full hue-rotate-[120deg]"
            />
          </div>
        </div>
      </div>

      {/* For Admin */}
      <section className="min-h-screen w-full bg-blue-50 dark:bg-blue-950/20">
        <div className="flex flex-col items-center text-neutral-800 dark:text-neutral-200">
          <SectionHeading
            crown="FOR ADMIN"
            line1="Waitlist management has never"
            line2="been this easy"
          />
        </div>
        <div className="mt-10 flex h-[60vh] w-full">
          <div className="hidden w-1/2 items-center justify-center md:flex">
            <Image
              src="/images/dashboard.svg"
              height={1450}
              width={1450}
              alt=""
              className="h-[500px] w-[500px] hue-rotate-[120deg] pt-10"
            />
          </div>
          <div className="flex w-full flex-col justify-center md:w-1/2">
            <div className="w-full pl-6 md:pl-14">
              <Accordion
                title="Customize your waitlist from start to finish"
                text="With flexible settings, make your waitlists work like your business runs. Design the perfect flows and keep things fully on-brand."
              />
              <Accordion
                title="Waitlists and appointments – in one place"
                text="War9a merges walk-ins and appointments, making the wait fair for everyone. Run as many waitlists as you need – across multiple locations."
              />
              <Accordion
                title="Get the information you need"
                text="Decide what data you want to collect and store customer notes to make business personal. Keep tabs on business performance metrics with at-a-glance dashboards."
                divider={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* For Staff */}
      <div className="min-h-screen w-full bg-blue-50 dark:bg-blue-950/20">
        <div className="flex flex-col items-center text-neutral-800 dark:text-neutral-200">
          <SectionHeading crown="FOR STAFF" line1="Better tech, happier staff" />
        </div>
        <div className="mt-10 flex h-[60vh] w-full justify-center gap-8 px-8">
          <div className="w-full max-w-[280px]">
            <div className="h-[55%] w-full overflow-hidden">
              <Image
                src="/images/waitlist.svg"
                width={250}
                height={250}
                className="h-full w-full object-contain"
                alt=""
              />
            </div>
            <p className="mb-3 text-xl font-bold md:text-2xl">
              Ready to go in a matter of minutes
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Set up a waitlist in no time. War9a is cloud-based so there&apos;s
              no download required. Use any device.
            </p>
          </div>
          <div className="hidden w-full max-w-[280px] md:block">
            <div className="h-[55%] w-full overflow-hidden">
              <Image
                src="/images/peoples.svg"
                width={250}
                height={250}
                className="h-full w-full object-contain"
                alt=""
              />
            </div>
            <p className="mb-3 text-xl font-bold md:text-2xl">
              More meaningful face time with customers
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Repetitive tasks like notifications and updates run on autopilot.
              Flexible dashboards put staff in control.
            </p>
          </div>
          <div className="hidden w-full max-w-[280px] lg:block">
            <div className="h-[55%] w-full overflow-hidden">
              <Image
                src="/images/progress-bar.svg"
                width={250}
                height={250}
                className="h-full w-full object-contain"
                alt=""
              />
            </div>
            <p className="mb-3 text-xl font-bold md:text-2xl">
              Turn your waitlist on and off
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Use your waitlist only when you need it. With automatic capacity
              management, War9a prompts customers to wait virtually when you&apos;re full.
            </p>
          </div>
        </div>
      </div>

      {/* Industries */}
      <div className="flex min-h-[calc(100vh-400px)] flex-col justify-between bg-neutral-900 px-8 py-16 md:px-[200px]">
        <div className="h-auto w-full md:w-[60%]">
          <p className="mb-6 text-[#58C1A2] text-sm font-semibold tracking-widest">
            WAITLISTS FOR ANY TYPE OF BUSINESS
          </p>
          <h4 className="text-3xl font-bold text-white md:text-4xl">
            War9a powers end-to-end customer flows for thousands of companies
            across virtually every industry.
          </h4>
        </div>
        <div className="mt-10 flex w-full flex-col gap-6 text-xl font-bold text-white md:w-[80%]">
          <div className="flex flex-wrap justify-between gap-4">
            <BusinessTag text="Healthcare" icon={<StethoscopeIcon size={24} />} />
            <BusinessTag text="Government" icon={<Landmark size={24} />} />
            <BusinessTag text="Events" icon={<CalendarCheck size={24} />} />
          </div>
          <div className="flex flex-wrap justify-between gap-4">
            <BusinessTag text="Financial Services" icon={<Coins size={24} />} />
            <BusinessTag text="Retail" icon={<Store size={24} />} />
            <BusinessTag text="Education" icon={<GraduationCap size={24} />} />
          </div>
        </div>
        <div className="mt-8">
          <BusinessTag text="See all industries" />
        </div>
      </div>

      {/* How War9a works */}
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="flex w-full max-w-2xl flex-col items-center justify-between">
          <div className="text-center">
            <p className="text-5xl font-bold md:text-6xl">See how</p>
            <div className="flex justify-center gap-2 text-5xl font-bold md:text-6xl">
              <p className="text-blue-700">War9a</p>
              <p> works</p>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center gap-3">
            <div className="flex flex-wrap justify-center gap-3">
              <TagButton text="Waitlist" className="hover:text-white" />
              <TagButton
                text="Appointments"
                className="hover:bg-[#58c1a2] hover:text-white"
              />
              <TagButton
                text="Customer insights"
                className="hover:bg-[#af2896] hover:text-white"
              />
              <TagButton
                text="Automation"
                className="hover:bg-[#f67b37] hover:text-white"
              />
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <TagButton
                text="Messaging"
                className="hover:bg-[#d92d26] hover:text-white"
              />
              <TagButton
                text="Analytics"
                className="hover:bg-[#f285f5] hover:text-white"
              />
              <TagButton
                text="Integrations"
                className="hover:bg-[#22461d] hover:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex min-h-[90vh] flex-col items-center bg-black px-4">
        <SectionHeading
          className="mb-10 mt-[120px] text-white"
          line1="Boost your sales with the"
          line2="perfect customer flow"
        />
        <p className="text-center text-xl text-white md:text-2xl">
          Join the thousands of companies using War9a
        </p>
        <div className="mt-24 flex flex-col items-center">
          <Link
            href="/sign-up"
            className="rounded-[30px] border border-white bg-white px-8 py-3 font-bold text-black hover:bg-white/90 transition-opacity"
          >
            Try it free
          </Link>
          <p className="mt-4 text-xs text-white/60">No credit card required</p>
        </div>
      </div>

      <div className="border-b border-neutral-800" />
      <Footer />
    </main>
  );
}
