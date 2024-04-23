"use client";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { ClassNameValue, twMerge } from "tailwind-merge";

interface AccordionProps {
  title: string;
  text: string;
  className?: ClassNameValue;
  divider?: boolean;
}
export default function Accordion({
  title,
  text,
  className,
  divider = true,
}: AccordionProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-[90%] ">
      {/* Title */}
      <div
        className={twMerge(
          "flex w-full justify-between border-b-neutral-300 p-4 ",
        )}
        onClick={() => setOpen(!open)}
      >
        <p className="text-2xl font-bold text-gray-900 ">{title}</p>
        <ChevronDown />
      </div>

      <div
        className={twMerge(
          "h-[100px] overflow-hidden duration-300",
          open ? "" : "h-0",
        )}
      >
        <p className="p-6 ">{text}</p>
      </div>
      {divider && <div className="w-full border-[1px] border-gray-200"></div>}
    </div>
  );
}
