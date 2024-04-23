import Header from "@/components/Compounds/Header";
import Accordion from "@/components/Landing/Accordion";
import BusinessTag from "@/components/Landing/BusinessTag";
import TagButton from "@/components/Landing/TagButton";
import SectionHeading from "@/components/Landing/SectionHeading";
import {
  StethoscopeIcon,
  Landmark,
  CalendarCheck,
  Coins,
  Store,
  GraduationCap,
} from "lucide-react";
import Footer from "@/components/Compounds/Footer";
import Image from "next/image";
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col dark:bg-neutral-900">
      <div className="px-24">
        <Header />
      </div>

      {/* body */}
      <div className="flex  h-screen w-full">
        <div className=" flex w-1/2 flex-col items-center justify-center gap-12 px-10">
          <p className="text-7xl font-bold">
            Virtual waitlists without the wait
          </p>

          <p className="text-neutral-500">
            Revamp your customer flow with hassle-free virtual queues,
            intelligent wait times, and automated queue management. Set up a
            virtual waitlist in minutes.
          </p>
          <div className="self-start rounded-[30px] bg-blue-700 px-[20px] py-[10px] font-semibold text-white transition-transform hover:scale-95 hover:opacity-90">
            <a href="#">Try it free</a>
          </div>
        </div>
      </div>
      {/* black box */}
      <div className="flex h-[40vh] items-center justify-center bg-neutral-800">
        <div className="flex w-[45%] flex-col items-center ">
          <p className="text-center text-5xl font-bold text-white ">
            End-to-end customer flow management built for:
          </p>
          <div className="mr-10 mt-8 flex gap-3 ">
            <TagButton
              text="Waitlist"
              className="border-white text-white hover:border-transparent"
            />
            <TagButton
              text="test"
              className="border-white text-white hover:border-transparent"
            />
            <TagButton
              text="Waitlist"
              className="border-white text-white hover:border-transparent"
            />
          </div>
        </div>
      </div>
      {/* third box */}
      <div className=" h-screen w-full bg-blue-50  ">
        {/* first part */}
        <SectionHeading
          crown="FOR CUSTOMERS"
          line1="Get rid of lines."
          line2="Make customers happy."
        />
        {/* second part  */}
        <div className="mt-[40px] flex h-[60vh] w-full ">
          {/* left "ways to join a waitlist" */}
          <div className=" flex w-[50%] flex-col items-center ">
            {/* Accordion */}
            <div className="mt-10 w-full pl-10">
              <Accordion
                title={"Many ways to join a waitlist"}
                text={
                  "Customers can join your virtual queue from anywhere – and with any device. Choose from many options (or offer them all"
                }
              />
              <Accordion
                title={"Precise wait time estimates"}
                text={
                  "Powered by AI, Waitwhile gives accurate wait times, so everyone knows what to expect."
                }
              />
              <Accordion
                title={"Easy two-way communication"}
                text={
                  "Guests can wait from anywhere. They receive regular updates and a ping when it’s their turn. If they’re running late, they can easily text or chat and Waitwhile will take care of the rest."
                }
                divider={false}
              />
            </div>
          </div>
          {/* right "animation" */}
          <div className="w-[50%] bg-blue-200"></div>
        </div>
      </div>
      {/* forth box */}
      <section className=" h-screen w-full bg-blue-50  ">
        {/* first part */}
        <div className=" flex flex-col items-center text-neutral-800">
          <SectionHeading
            crown="FOR ADMIN"
            line1="Waitlist management has never"
            line2="been this easy"
          />
        </div>
        {/* second part  */}
        <div className="mt-[40px] flex h-[60vh] w-full ">
          {/* left "animation" */}
          <div className="w-[50%] bg-green-200 "></div>
          {/* right "Customize your waitlist " */}
          <div className=" w-[50%] ">
            <div className="mt-10 w-full pl-14 ">
              <Accordion
                title={"Customize your waitlist from start to finish"}
                text={
                  "With flexible settings, make your waitlists work like your business runs. Design the perfect flows and keep things fully on-brand"
                }
              />
              <Accordion
                title={"Waitlists and appointments – in one place"}
                text={
                  "Waitwhile merges walk-ins and appointments, making the wait fair for everyone. Run as many waitlists as you need – across multiple locations. Define how, where, and when your customers can join."
                }
              />
              <Accordion
                title={"Get the information you need"}
                text={
                  "Decide what data you want to collect and store customer notes to make business personal. Keep tabs on business performance metrics with at-a-glance dashboards."
                }
                divider={false}
              />
            </div>
          </div>
        </div>
      </section>
      {/* fifeth box */}
      <div className=" h-screen w-full bg-blue-50  ">
        {/* first part */}
        <div className=" flex flex-col items-center text-neutral-800">
          <SectionHeading
            crown="FOR STAFF"
            line1="Better tech, happier staff"
          />
        </div>
        {/* second part  */}
        <div className="mt-[40px] flex h-[60vh] w-full justify-center gap-5">
          <div className=" w-[25%] ">
            <div className="h-[55%] w-full overflow-hidden">
              <Image
                src="/waitlist.svg"
                width={250}
                height={250}
                className="object-fit h-full w-full"
                alt=""
              />
            </div>
            <p className="mb-5 text-2xl font-bold">
              Ready to go in a matter of minutes
            </p>
            <p>
              Set up a waitlist in no time. Waitwhile is cloud-based so there’s
              no download required. Use any device.
            </p>
          </div>

          <div className=" w-[25%] ">
            <div className="h-[55%] w-full overflow-hidden">
              <Image
                src="/peoples.svg"
                width={250}
                height={250}
                className="object-fit h-full w-full"
                alt=""
              />
            </div>
            <p className="text-2xl font-bold">More meaningful face time </p>
            <p className="mb-5 text-2xl font-bold">with customers</p>
            <p>
              Repetitive tasks like notifications and updates run on autopilot.
              Flexible dashboards put staff in control so they never miss a
              beat.
            </p>
          </div>
          <div className="w-[25%] ">
            <div className="mb h-[55%] w-full overflow-hidden">
              <Image
                src="/progress-bar.svg"
                width={250}
                height={250}
                className="object-fit h-full w-full"
                alt=""
              />
            </div>
            <p className="mb-5 text-2xl font-bold">
              Turn your waitlist on and off
            </p>
            <p>
              Use your waitlist only when you need it. With automatic capacity
              management, Waitwhile prompts customers to wait in a virtual line
              when you’re full.
            </p>
          </div>
        </div>
      </div>
      {/* Second black box */}
      <div className="flex h-[80vh] flex-col justify-between bg-neutral-800 p-8">
        {/* text part */}
        <div className=" h-[30vh] w-[60%]">
          <p className="mb-6 mt-10 text-[#58C1A2]">
            WAITLISTS FOR ANY TYPE OF BUSINESS
          </p>
          <h4 className=" text-4xl font-bold text-white">
            Waitwhile powers end-to-end customer flows for thousands of
            companies across virtually every industry around the world.
          </h4>
        </div>
        {/* buttons part */}
        <div className=" flex h-1/4  w-[80%] flex-col justify-between text-xl font-bold text-white">
          <div className="flex w-[90%] justify-between ">
            <BusinessTag
              text="Healthcare"
              icon={<StethoscopeIcon size={30} />}
            />
            <BusinessTag text="Government" icon={<Landmark size={30} />} />
            <BusinessTag text="Events" icon={<CalendarCheck size={30} />} />
          </div>

          <div className="flex w-[93%] justify-between">
            <BusinessTag text="Financial Services" icon={<Coins size={30} />} />
            <BusinessTag text="Retail" icon={<Store size={30} />} />
            <BusinessTag text="Education" icon={<GraduationCap size={30} />} />
          </div>
        </div>

        <div className="py-4 text-xl font-bold text-white">
          <BusinessTag text="See all industries" />
        </div>
      </div>
      {/* 5th part */}
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex w-[45%] flex-col items-center justify-between ">
          <div className=" mt-10">
            <p className="text-center text-6xl font-bold ">See how</p>
            <div className="flex gap-2 text-center text-6xl font-bold">
              <p className=" text-center text-6xl font-bold text-blue-700">
                War9a
              </p>
              <p> works</p>
            </div>
          </div>
          <div className="mr-10 flex h-[30vh] flex-col items-center justify-center gap-3">
            <div className="flex gap-3">
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
            <div className="flex gap-3">
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
      <div className="flex h-[90vh] flex-col items-center bg-black ">
        <SectionHeading
          className="mb-10 mt-[120px] text-white"
          line1="Boost your sales with the"
          line2="perfect customer flow"
        />
        <p className="text-center text-2xl text-white ">
          Join the thousands of companies using Waitwhile
        </p>
        <div>
          <TagButton
            text="Try it free"
            className="text-bold mb-6 mt-24 w-fit border-white 
        bg-white text-black hover:bg-white"
          />
          <p className="text-xs text-white">No credit card required</p>
        </div>
      </div>
      <div className="border-b-[1px] "></div>
      <Footer />
    </main>
  );
}
