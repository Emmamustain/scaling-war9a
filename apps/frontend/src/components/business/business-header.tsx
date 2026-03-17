import { Copy } from "lucide-react";
import MinidenticonImg from "@/components/atoms/minidenticon-img";
import Image from "next/image";

interface BusinessHeaderProps {
  name: string;
  slug: string;
  logoUrl?: string | null;
  coverUrl?: string | null;
  isOpen?: boolean;
  city?: string;
}

export default function BusinessHeader({
  name,
  slug,
  logoUrl,
  coverUrl,
  isOpen,
  city,
}: BusinessHeaderProps) {
  return (
    <>
      {/* ── Mobile: compact inline header ── */}
      <div className="flex items-center gap-3 px-4 py-3 md:hidden">
        <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={name}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          ) : (
            <MinidenticonImg username={name} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold">{name}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {city && <span>{city}</span>}
            {isOpen !== undefined && (
              <span
                className={
                  isOpen
                    ? "font-medium text-green-600 dark:text-green-400"
                    : "font-medium text-red-500"
                }
              >
                {isOpen ? "Open" : "Closed"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Desktop: full cover + logo ── */}
      <div className="hidden md:block">
        <div className="relative h-[320px] overflow-hidden bg-black">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt=""
              fill
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="mx-10 -mt-12 flex flex-col items-center gap-2 lg:flex-row lg:justify-start lg:gap-6">
          <div className="z-10 h-44 w-44 overflow-hidden rounded-full border-2 bg-black">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={name}
                width={400}
                height={400}
                className="h-full w-full object-cover"
              />
            ) : (
              <MinidenticonImg username={name} />
            )}
          </div>
          <div className="mt-6">
            <p className="flex justify-center text-2xl font-semibold lg:justify-start">
              {name}
            </p>
            <div className="flex cursor-pointer gap-2 opacity-60 transition-opacity hover:opacity-100">
              <p>{"war9a.localhost/business/" + slug}</p>
              <Copy size={18} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
