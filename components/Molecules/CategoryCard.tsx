import { cn } from "@/lib/utils";
import type { ClassValue } from "class-variance-authority/types";
import Link from "next/link";
import type { ReactElement } from "react";

interface CategoryCardProps {
  bgColor: ClassValue;
  icon: ReactElement;
  stat: number | string;
  description: string;
  href: string;
}

export function CategoryCard({
  bgColor,
  icon,
  stat,
  description,
  href,
}: CategoryCardProps) {
  return (
    <Link href={href}>
      <div className="w-full rounded bg-neutral-900 p-4 hover:cursor-pointer hover:opacity-80 dark:bg-neutral-50">
        <div className={"flex items-center gap-4"}>
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center",
              bgColor,
            )}
          >
            {icon}
          </div>
          <div>
            <p className="text-xl font-bold text-white dark:text-black">
              {stat}
            </p>
            <p className="text-sm text-white dark:text-black">{description}</p>
          </div>
        </div>
        <div>
          <p className="mt-4 text-sm text-white underline hover:cursor-pointer hover:opacity-60 dark:text-black">
            View all
          </p>
        </div>
      </div>
    </Link>
  );
}
