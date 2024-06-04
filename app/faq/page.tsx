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
          <Accordion title={"What is war9a ?"} text={"War9a is a smart queue management application designed to streamline and optimize the process of waiting in line for various services. By using cutting-edge technologies, War9a ensures a smooth, efficient, and reliable queuing experience for both customers and businesses. "} />
          <Accordion title={"How does War9a work?"} text={"War9a allows users to join virtual queues from their mobile devices, eliminating the need to physically wait in line. Businesses can manage and monitor their queues through the War9a platform, ensuring a better experience for their customers."} />
          <Accordion title={"What are the main features of War9a?"} text={"War9a offers real-time queue management, appointment scheduling, notifications for queue status, and analytics for businesses to monitor and optimize their services. It also supports user authentication and integrates seamlessly with popular mapping services. "} />
          <Accordion title={"How does War9a improve user experience?"} text={"War9a reduces wait times and the need for physical presence in queues. Users receive real-time updates on their queue status and can plan their visits more effectively. This leads to a more convenient and stress-free experience."} />
          <Accordion title={"How does War9a benefit businesses?"} text={"Businesses can manage customer flow more efficiently, reduce overcrowding, and gain insights through analytics. This helps in improving service delivery, customer satisfaction, and operational efficiency."} />
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
