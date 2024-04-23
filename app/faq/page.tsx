import Footer from "@/components/Compounds/Footer";

import Header from "@/components/Compounds/Header";
import Accordion from "@/components/Landing/Accordion";
import TagButton from "@/components/Landing/TagButton";
import { Button } from "@/components/ui/button";
export default function Faq() {
  return (
    <main className="flex min-h-screen flex-col px-24 dark:bg-neutral-900">
      <Header />
      <div className="mt-12 ">
        {/* title */}
        <h1 className="flex justify-center text-[75px] ">
          Frequently Asked Questions
        </h1>
        <p className="flex justify-center text-base text-gray-400">
          Welcome to our FAQ page! We&apos;ve compiled a list of commonly asked
          questions to provide you witk quick and informative answers.{" "}
        </p>
        <div className="flex flex-col items-center p-20">
          <Accordion title={"What is war9a ?"} text={"bla bla bla "} />
          <Accordion title={"hey"} text={"bla bla bla "} />
          <Accordion title={"hey"} text={"bla bla bla "} />
          <Accordion title={"hey"} text={"bla bla bla "} />
          <Accordion title={"hey"} text={"bla bla bla "} />
        </div>
      </div>
      <div className="flex h-[300px] w-full flex-col  items-center ">
        <div className="flex h-full w-[80%] flex-col items-center rounded-lg bg-gray-100 ">
          <h1 className="mt-12 flex text-2xl font-semibold">
            Still have a question?
          </h1>
          <p className="mt-3 px-4 text-sm text-gray-500">
            You can submit your question or request through our contact form.
            Please provide as much details as possible so that we can assist you
            effectively.
          </p>
          <Button className="mt-12">Get in touch</Button>
        </div>
      </div>

      <Footer />
    </main>
  );
}
