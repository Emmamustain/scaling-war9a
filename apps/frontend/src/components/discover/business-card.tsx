import MinidenticonImg from "@/components/atoms/minidenticon-img";
import Link from "next/link";

interface BusinessCardProps {
  name: string;
  slug: string;
  address: string;
  avgWaitTime?: number;
  logoUrl?: string | null;
}

function formatWait(minutes: number): string {
  if (!minutes || minutes <= 0) return "No wait";
  if (minutes < 60) return `${minutes} min`;
  return `${Math.round(minutes / 60)}h`;
}

export default function BusinessCard({
  name,
  slug,
  address = "No Address",
  avgWaitTime = 0,
  logoUrl,
}: BusinessCardProps) {
  return (
    <Link href={`/business/${slug}`}>
      <div className="rounded bg-neutral-900 p-3 duration-150 hover:cursor-pointer hover:opacity-80 dark:bg-neutral-50">
        <div className="h-[300px] w-full overflow-hidden bg-neutral-50 dark:bg-neutral-900">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <MinidenticonImg username={name} />
          )}
        </div>
        <div className="mb-2 mt-4 flex items-center justify-between text-white dark:text-black">
          <p className="text-lg">{name}</p>
          <p className="opacity-80">Wait: {formatWait(avgWaitTime)}</p>
        </div>
        <p className="text-base text-white opacity-60 dark:text-black">{address}</p>
      </div>
    </Link>
  );
}
