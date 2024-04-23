import { Mail, Scroll, Wallet, Wrench, Scissors, Cross } from "lucide-react";

export const categories = [
  {
    bgColor: "bg-yellow-100",
    icon: <Mail />,
    name: "Post Offices",
    description:
      "Efficiently manage mailing and shipping needs without long queues.",
    href: "/category/post-offices",
  },
  {
    bgColor: "bg-orange-100",
    icon: <Scroll />,
    name: "Government Offices",
    description:
      "Access official government documents and services from local government offices.",
    href: "/category/government-offices",
  },
  {
    bgColor: "bg-green-100",
    icon: <Wallet />,
    name: "Banking Services",
    description:
      "Access banking services and transactions with reduced waiting times.",
    href: "/category/banking-services",
  },
  {
    bgColor: "bg-red-100",
    icon: <Cross />,
    name: "Healthcare",
    description:
      "Book appointments with specialized medical practitioners without delays.",
    href: "/category/healthcare",
  },
  {
    bgColor: "bg-pink-100",
    icon: <Scissors />,
    name: "Barbers",
    description:
      "Get a stylish haircut and grooming services from professional barbers.",
    href: "/category/barbers",
  },
  {
    bgColor: "bg-purple-100",
    icon: <Wrench />, // Replace IconComponent with the icon you want for the new category
    name: "Repair Services",
    description: "Get your electronics repaired by skilled technicians.",
    href: "/category/repair-services",
  },
];
