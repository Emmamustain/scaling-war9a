"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { BarChart2, Users, Building2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Overview", icon: BarChart2 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/businesses", label: "Businesses", icon: Building2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 border-r bg-card/50 md:flex md:flex-col">
        <div className="flex items-center gap-2.5 border-b px-4 py-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="size-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">Admin</p>
            <p className="text-xs text-muted-foreground">Platform management</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-2">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile top nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background md:hidden">
        <nav className="flex">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
