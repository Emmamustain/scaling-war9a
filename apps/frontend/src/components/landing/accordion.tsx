"use client";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AccordionProps {
  title: string;
  text: string;
  className?: string;
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
    <div className="w-[90%]">
      <div
        className={cn("flex w-full justify-between border-b-neutral-300 p-4 cursor-pointer", className)}
        onClick={() => setOpen(!open)}
      >
        <p className="text-2xl font-bold text-gray-900">{title}</p>
        <ChevronDown className={cn("transition-transform duration-300", open && "rotate-180")} />
      </div>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          open ? "max-h-[200px]" : "max-h-0",
        )}
      >
        <p className="p-6">{text}</p>
      </div>
      {divider && <div className="w-full border-[1px] border-gray-200" />}
    </div>
  );
}
