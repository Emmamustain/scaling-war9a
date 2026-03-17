"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { BarChart2, Users, Building2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { href: "/admin", label: "Overview", icon: BarChart2 },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/businesses", label: "Businesses", icon: Building2 },
  ];

  return (
    <>
      {/* Admin header */}
      <div className="border-b bg-card/50 px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">Platform management</p>
          </div>
        </div>
      </div>

      {/* Navigation pills - sticky */}
      <div className="sticky top-16 z-30 border-b bg-background/95 backdrop-blur md:top-[72px] supports-[backdrop-filter]:bg-background/80">
        <nav className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-2 scrollbar-hide">
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

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-4">{children}</div>
    </>
  );
}
