import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  text: string;
  className?: string;
}

export default function SectionHeading({ text, className }: SectionHeadingProps) {
  return (
    <p className={cn("text-[22px] font-semibold", className)}>{text}</p>
  );
}
