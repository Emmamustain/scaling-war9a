import { ClassNameValue, twMerge } from "tailwind-merge";

interface SectionHeadingProps {
  crown?: string;
  line1: string;
  line2?: string;
  className?: ClassNameValue;
}

export default function SectionHeading({
  crown,
  line1,
  line2,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={twMerge(
        "flex flex-col items-center mt-[60px] text-neutral-800",
        className
      )}
    >
      <p className="mb-4">{crown}</p>
      <p className="font-bold text-7xl">{line1}</p>
      <p className="font-bold text-7xl">{line2}</p>
    </div>
  );
}
