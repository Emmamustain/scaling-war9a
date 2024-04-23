import {
  Globe,
  ChevronDown,
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  LinkedinIcon,
} from "lucide-react";
import TagButton from "./TagButton";
import Link from "next/link";

const navigation = {
  company: ["About us", "Press", "Blog", "Contact"],
  ressources: [
    "Help Center",
    "API",
    "Developers",
    "Status Page",
    "Product Updates",
    "Search Waitlist",
  ],
  products: [
    "Overview",
    "Waitlist",
    "Appointments",
    "Customer Insights",
    "Automation",
    "Guest Messaging",
    "Analytics",
    "Integrations",
    "Download",
  ],
  customers: ["Case Studies", "Industries"],
};

// const nav ={
//     desktop: ["Fetouh", "I love you", "SO MUUUUCH"],
//     mobile:["My papaty","<3"],

// }

export default function Footer() {
  return (
    <footer className="h-[70vh] bg-black px-[2%]">
      <div className="border-b-[1px] border-b-gray-800 ">
        {/* top part */}
        <div className="flex mt-10 p-10 justify-between">
          <div className=" text-3xl font-bold text-white">
            <h4>Drop us a line </h4>
            <h4 className="text-orange-300">hello@waitwhile.com</h4>
          </div>
          <div className="flex justify-between w-[60%] mr-20 ">
            <div className="flex flex-col text-white">
              <p className="font-bold">Company</p>
              {navigation.company.map((navItem, index) => (
                <a href="#" key={index}>
                  {navItem}
                </a>
              ))}
              <div className="flex gap-2">
                <a href="#">Carrers</a>
                <TagButton
                  text="We’re hiring!"
                  className="text-black bg-neutral-50 text-[11px] py-1 px-2 border-0
                  hover:bg-neutral-300"
                />
              </div>
            </div>
            <div className="flex flex-col text-white">
              <p className="font-bold">Resources</p>
              {navigation.ressources.map((navItem, index) => (
                <a href="#" key={index}>
                  {navItem}
                </a>
              ))}
            </div>
            <div className="flex flex-col text-white">
              <p className="font-bold">Product </p>
              {navigation.products.map((navItem, index) => (
                <a href="#" key={index}>
                  {navItem}
                </a>
              ))}
            </div>
            <div className="flex flex-col text-white">
              <p className="font-bold">Customers</p>
              {navigation.customers.map((navItem, index) => (
                <a href="#" key={index}>
                  {navItem}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* bottom part */}
      <div className="text-white flex items-center gap-6 p-10 justify-between">
        <div className="text-white flex gap-6 text-sm">
          <a href="#">Security</a>
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">GDPR</a>
          <div className="flex items-center gap-2">
            <Globe size={17} /> <a href="#">United States</a>{" "}
            <ChevronDown size={17} />
          </div>
        </div>
        <div className="flex gap-4">
          <a href="#">
            <FacebookIcon size={20} />
          </a>
          <a href="#">
            <InstagramIcon size={20} />
          </a>
          <a href="#">
            <TwitterIcon size={20} />
          </a>
          <a href="#">
            <LinkedinIcon size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}
