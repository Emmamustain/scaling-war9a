import { cn } from "@/lib/utils";
import { ClassValue } from "class-variance-authority/types";
import { Overpass } from "next/font/google";

interface SectionHeadingProps {
  text: string;
  className?: ClassValue;
}

const overpass = Overpass({ subsets: ["latin"] });

export default function SectionHeading({
  text,
  className,
}: SectionHeadingProps) {
  return (
    <p
      className={cn(overpass.className, "text-[22px] font-semibold", className)}
    >
      {text}
    </p>
  );
}
