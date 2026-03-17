import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  crown?: string;
  line1: string;
  line2?: string;
  className?: string;
}

export default function SectionHeading({
  crown,
  line1,
  line2,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center mt-[60px] text-neutral-800",
        className,
      )}
    >
      {crown && <p className="mb-4 text-sm tracking-widest font-semibold">{crown}</p>}
      <p className="font-bold text-7xl">{line1}</p>
      {line2 && <p className="font-bold text-7xl">{line2}</p>}
    </div>
  );
}
