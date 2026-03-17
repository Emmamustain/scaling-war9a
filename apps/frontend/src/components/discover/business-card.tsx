import MinidenticonImg from "@/components/atoms/minidenticon-img";
import Link from "next/link";

interface BusinessCardProps {
  name: string;
  slug: string;
  address: string;
  avgWaitTime?: number;
  logoUrl?: string | null;
  variant?: "featured" | "list";
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
  variant = "list",
}: BusinessCardProps) {
  return (
    <Link href={`/business/${slug}`} className="block">
      {/* ── Mobile: featured card (tall portrait, text overlay) ── */}
      {variant === "featured" && (
        <div className="relative w-[72vw] shrink-0 overflow-hidden rounded-2xl bg-muted md:hidden">
          <div className="aspect-[3/4] w-full">
            {logoUrl ? (
              <img src={logoUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <MinidenticonImg username={name} />
            )}
          </div>
          {/* gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3">
            <p className="truncate font-semibold text-white">{name}</p>
            <div className="mt-0.5 flex items-center justify-between">
              <p className="truncate text-xs text-white/70">{address}</p>
              <span className="ml-2 shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                ~{formatWait(avgWaitTime)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile: list card (full-width horizontal) ── */}
      {variant === "list" && (
        <div className="flex gap-3 rounded-xl border border-border bg-card p-3 transition-opacity active:opacity-70 md:hidden">
          <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
            {logoUrl ? (
              <img src={logoUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <MinidenticonImg username={name} />
            )}
          </div>
          <div className="flex min-w-0 flex-col justify-center gap-0.5">
            <p className="truncate font-semibold">{name}</p>
            <p className="truncate text-sm text-muted-foreground">{address}</p>
            <p className="text-xs font-medium text-primary">~{formatWait(avgWaitTime)} wait</p>
          </div>
        </div>
      )}

      {/* ── Desktop: tall portrait card ── */}
      <div className="hidden rounded bg-neutral-900 p-3 duration-150 hover:cursor-pointer hover:opacity-80 dark:bg-neutral-50 md:block">
        <div className="h-[300px] w-full overflow-hidden bg-neutral-50 dark:bg-neutral-900">
          {logoUrl ? (
            <img src={logoUrl} alt={name} className="h-full w-full object-cover" />
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
