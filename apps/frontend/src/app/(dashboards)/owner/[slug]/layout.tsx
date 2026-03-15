"use client";

import { use } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  LayoutList,
  Monitor,
  Users,
  BarChart2,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import QrModal from "@/components/business/qr-modal";

type OwnerBusinessBasic = {
  id: string;
  name: string;
  slug: string;
  status: string;
  logoUrl: string | null;
  isOpen: boolean;
};

export default function OwnerSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const pathname = usePathname();

  const { data: business } = useQuery({
    queryKey: ["owner-business-basic", slug],
    queryFn: () => fetchApi<OwnerBusinessBasic>(`/businesses/${slug}`),
  });

  const base = `/owner/${slug}`;
  const tabs = [
    { href: base, label: "Overview", icon: Activity },
    { href: `${base}/services`, label: "Services", icon: LayoutList },
    { href: `${base}/guichets`, label: "Guichets", icon: Monitor },
    { href: `${base}/team`, label: "Team", icon: Users },
    { href: `${base}/analytics`, label: "Analytics", icon: BarChart2 },
    { href: `${base}/settings`, label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Business header */}
      <div className="border-b bg-card/50 px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          {business?.logoUrl ? (
            <img
              src={business.logoUrl}
              alt=""
              className="size-10 rounded-xl object-cover"
            />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
              {business?.name?.[0] ?? "…"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold">
              {business?.name ?? "…"}
            </h1>
            <div className="flex items-center gap-2">
              {business && (
                <>
                  <Badge
                    variant={
                      business.status === "active"
                        ? "success"
                        : business.status === "pending"
                          ? "warning"
                          : "muted"
                    }
                    className="capitalize text-[10px]"
                  >
                    {business.status}
                  </Badge>
                  <span
                    className={cn(
                      "flex items-center gap-1 text-xs",
                      business.isOpen
                        ? "text-green-600"
                        : "text-muted-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block size-1.5 rounded-full",
                        business.isOpen
                          ? "bg-green-500"
                          : "bg-muted-foreground/40",
                      )}
                    />
                    {business.isOpen ? "Open" : "Closed"}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            {business && (
              <QrModal slug={business.slug} businessName={business.name} />
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/business/${slug}`}>View</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation pills */}
      <div className="sticky top-16 z-30 border-b bg-background/95 backdrop-blur md:top-[72px] supports-[backdrop-filter]:bg-background/80">
        <nav className="mx-auto flex max-w-3xl gap-1.5 overflow-x-auto px-4 py-2 scrollbar-hide">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
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
      <div className="mx-auto max-w-3xl px-4 py-4">{children}</div>
    </>
  );
}
