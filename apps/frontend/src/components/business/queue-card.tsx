import MinidenticonImg from "@/components/atoms/minidenticon-img";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface QueueCardProps {
  displayName: string;
  position: number;
  source?: "Web" | "Mobile" | "Added By Business" | "Unknown";
  isPresent: boolean;
  highlight?: boolean;
  className?: string;
}

export default function QueueCard({
  displayName,
  position,
  source = "Web",
  isPresent,
  highlight,
  className,
}: QueueCardProps) {
  return (
    <div
      className={cn(
        "relative flex w-full min-w-[280px] flex-col justify-between rounded bg-white dark:bg-neutral-800",
        highlight && "border-2 border-blue-500 bg-purple-100 dark:bg-purple-900/30",
        className,
      )}
    >
      {/* Big position number in background */}
      <p className="absolute bottom-0 right-0 text-9xl font-bold opacity-10 select-none">
        #{position}
      </p>

      {/* Avatar + Name */}
      <div className="flex w-full items-center gap-4 rounded p-4">
        <div className="h-[85px] w-[85px] shrink-0 overflow-hidden rounded-full bg-neutral-900 dark:bg-neutral-50">
          <MinidenticonImg username={displayName || "anon"} />
        </div>
        <p className="text-lg text-black dark:text-white">{displayName || "Anonymous"}</p>
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-4 px-6 pb-4">
        <Badge variant={isPresent ? "default" : "outline"}>
          {isPresent ? "Present" : "Not Present"}
        </Badge>
        <p className="text-neutral-400 text-sm">{source}</p>
      </div>
    </div>
  );
}
