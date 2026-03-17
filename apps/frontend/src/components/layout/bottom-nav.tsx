"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Bell, User, QrCode, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();

  const isAdmin = user?.role === "admin" || user?.role === "super" || user?.role === "founder";
  const isOwner = user?.role === "owner";
  const isWorker = user?.role === "worker" || user?.role === "manager";
  const isDashboardUser = isAdmin || isOwner || isWorker;

  const dashboardHref = isAdmin ? "/admin" : isOwner ? "/owner" : "/worker";

  const middleItem = isDashboardUser
    ? { href: dashboardHref, icon: LayoutDashboard, label: "Dashboard", authRequired: false }
    : { href: "/join", icon: QrCode, label: "Scan", authRequired: false };

  const navItems = [
    { href: "/discover", icon: Home, label: "Discover", authRequired: false },
    { href: "/map", icon: MapPin, label: "Map", authRequired: false },
    middleItem,
    { href: "/notifications", icon: Bell, label: "Alerts", authRequired: true },
    { href: "/profile", icon: User, label: "Profile", authRequired: false },
  ];

  return (
    <nav className="safe-area-bottom fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          if (item.authRequired && !isAuthenticated) return null;

          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={!isAuthenticated && item.href === "/profile" ? "/sign-in" : item.href}
              className={cn(
                "flex min-w-[44px] flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className={cn("size-5", isActive && "fill-primary/20")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
