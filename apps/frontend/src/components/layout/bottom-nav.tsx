"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Bell, User, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

const navItems = [
  { href: "/discover", icon: Home, label: "Discover" },
  { href: "/map", icon: MapPin, label: "Map" },
  { href: "/join", icon: QrCode, label: "Scan" },
  { href: "/notifications", icon: Bell, label: "Alerts" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  return (
    <nav className="safe-area-bottom fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const showAuth = item.href === "/notifications" || item.href === "/profile";

          if (showAuth && !isAuthenticated && item.href === "/notifications") {
            return null;
          }

          return (
            <Link
              key={item.href}
              href={
                showAuth && !isAuthenticated ? "/sign-in" : item.href
              }
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
