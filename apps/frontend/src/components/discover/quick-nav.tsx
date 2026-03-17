"use client";

import { cn } from "@/lib/utils";
import { Book, Ticket, Timer, Users } from "lucide-react";
import Link from "next/link";
import type { ReactElement } from "react";

export default function QuickNav() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <QuickNavCard
        bgColor="bg-purple-50 dark:bg-neutral-900"
        icon={<Ticket />}
        stat={124}
        description="Queues"
        href="/discover"
      />
      <QuickNavCard
        bgColor="bg-emerald-50 dark:bg-neutral-900"
        icon={<Book />}
        stat={20}
        description="Appointments"
        href="#"
      />
      <QuickNavCard
        bgColor="bg-orange-50 dark:bg-neutral-900"
        icon={<Users />}
        stat={810}
        description="Users"
      />
      <QuickNavCard
        bgColor="bg-yellow-50 dark:bg-neutral-900"
        icon={<Timer />}
        stat={440}
        description="In queue"
      />
    </div>
  );
}

interface QuickNavCardProps {
  bgColor: string;
  icon: ReactElement;
  stat: number | string;
  description: string;
  href?: string;
}

function QuickNavCard({ bgColor, icon, stat, description, href }: QuickNavCardProps) {
  return (
    <div className="w-full rounded bg-neutral-900 p-4 dark:bg-neutral-50">
      <div className="flex items-center gap-4">
        <div className={cn("flex h-16 w-16 items-center justify-center rounded", bgColor)}>
          {icon}
        </div>
        <div>
          <p className="text-xl font-bold text-white dark:text-black">{stat}</p>
          <p className="text-sm text-white dark:text-black">{description}</p>
        </div>
      </div>
      <div className="mt-4">
        {href ? (
          <Link href={href}>
            <p className="text-sm text-white underline hover:opacity-60 dark:text-black">
              View all
            </p>
          </Link>
        ) : (
          <p className="text-sm text-white/60 dark:text-black/60">Stats</p>
        )}
      </div>
    </div>
  );
}
