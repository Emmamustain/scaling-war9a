"use client";

import { use } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { useAuthStore } from "@/stores/auth.store";
import { LayoutList, BarChart2, Users, ShieldCheck, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

type WorkerInfo = {
  id: string;
  role: string;
  user: { id: string; displayName: string | null; email: string; avatarUrl: string | null };
};

export default function WorkerSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const pathname = usePathname();
  const { user } = useAuthStore();

  const { data: business } = useQuery({
    queryKey: ["worker-business", slug],
    queryFn: () =>
      fetchApi<{ id: string; name: string; logoUrl: string | null }>(`/businesses/${slug}`),
  });

  const { data: workers } = useQuery({
    queryKey: ["worker-team", business?.id],
    queryFn: () => fetchApi<WorkerInfo[]>(`/businesses/${business!.id}/workers`),
    enabled: !!business?.id,
  });

  const myProfile = workers?.find((w: WorkerInfo) => w.user.id === user?.id);
  const isManager = myProfile?.role === "manager";

  const base = `/worker/${slug}`;
  const tabs = [
    { href: base, label: "Queue", icon: LayoutList },
    { href: `${base}/stats`, label: "Stats", icon: BarChart2 },
    ...(isManager
      ? [
          { href: `${base}/windows`, label: "Windows", icon: Monitor },
          { href: `${base}/team`, label: "Team", icon: Users },
        ]
      : []),
  ];

  return (
    <>
      {/* Compact business header */}
      <div className="border-b bg-card/50 px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          {business?.logoUrl ? (
            <img
              src={business.logoUrl}
              alt=""
              className="size-10 rounded-xl object-cover"
            />
          ) : (
            <div className="size-10 rounded-xl bg-primary/10" />
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-bold text-lg">{business?.name ?? "…"}</h1>
            {myProfile && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                {isManager && <ShieldCheck className="size-3 text-primary" />}
                <span className="capitalize">{myProfile.role}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation pills */}
      <div className="sticky top-16 z-30 border-b bg-background/95 backdrop-blur md:top-[72px] supports-[backdrop-filter]:bg-background/80">
        <nav className="mx-auto flex max-w-2xl gap-2 overflow-x-auto px-4 py-2 scrollbar-hide">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Page content */}
      <div className="mx-auto max-w-2xl px-4 py-4">{children}</div>
    </>
  );
}
