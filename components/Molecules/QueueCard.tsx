import custompfpchecker from "@/utils/custom-pfp-checker";
import MinidenticonImg from "../Atoms/random-pfp";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import type { ClassValue } from "clsx";

export interface QueueCardProps {
  name: string;
  position: number;
  source: "Web" | "Mobile" | "Added By Business" | "Unknown";
  isPresent: boolean;
  className?: ClassValue;
}

export default function QueueCard({
  name,
  position,
  source = "Unknown",
  isPresent,
  className,
}: QueueCardProps) {
  return (
    <div
      className={cn(
        "relative flex  w-full min-w-[400px] flex-col justify-between rounded bg-white",
        className,
      )}
    >
      {/* Position */}
      <p className="absolute bottom-0 right-0 text-9xl font-bold opacity-10">
        #{position}
      </p>

      {/* User Pic and Name */}
      <div className="flex w-full items-center gap-4 rounded p-4">
        <div className="h-[85px] w-[85px] overflow-hidden rounded-full bg-neutral-900">
          <MinidenticonImg
            username={custompfpchecker(name)}
            className="scale-[0.6]"
          />
        </div>
        <p className="text-lg text-black">{name}</p>
      </div>

      {/* Details */}
      <div className="flex items-center gap-4 px-6 pb-4">
        <Badge
          className={cn("w-fit")}
          variant={isPresent ? "default" : "outline"}
        >
          {isPresent ? "Present" : "Not Present"}
        </Badge>
        <p className="text-neutral-400">{source}</p>
      </div>
    </div>
  );
}
