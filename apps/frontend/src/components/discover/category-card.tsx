import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ReactElement } from "react";

interface CategoryCardProps {
  bgColor: string;
  icon: ReactElement;
  name: string;
  description: string;
  href: string;
}

export function CategoryCard({
  bgColor,
  icon,
  name,
  description,
  href,
}: CategoryCardProps) {
  return (
    <Link href={href}>
      <div className="w-full rounded bg-neutral-900 p-4 hover:cursor-pointer hover:opacity-80 duration-150 dark:bg-neutral-50">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded",
              bgColor,
            )}
          >
            {icon}
          </div>
          <div>
            <p className="text-xl font-bold text-white dark:text-black">{name}</p>
            <p className="text-sm text-white/70 dark:text-black/70">{description}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-white underline hover:opacity-60 dark:text-black">
          View all
        </p>
      </div>
    </Link>
  );
}
