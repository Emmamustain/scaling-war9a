"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  LogIn,
  LogOut,
  Moon,
  Sun,
  User,
  LayoutDashboard,
  Map,
  ChevronDown,
  Search,
  Clock,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useMyQueueEntries } from "@/hooks/use-my-queue-entries";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { categories } from "@/lib/categories";
import { useState } from "react";

export function MainNav() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { entries: myQueueEntries } = useMyQueueEntries();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    toast.success("Signed out");
    router.push("/");
  };

  const isAdmin =
    user?.role === "admin" || user?.role === "super" || user?.role === "founder";
  const isOwner = user?.role === "owner";
  const isWorker = user?.role === "worker" || user?.role === "manager";

  const dashboardHref = isAdmin
    ? "/admin"
    : isOwner
      ? "/owner"
      : "/worker";

  return (
    <>
      {/* Desktop nav */}
      <header className="sticky top-0 z-40 hidden h-[72px] w-full items-center justify-between border-b border-border bg-background/90 backdrop-blur-md px-8 md:flex">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="duration-200 hover:scale-90">
            <Image
              src="/images/logo-w.svg"
              height={52}
              width={52}
              alt="War9a logo"
              className="hidden dark:block"
            />
            <Image
              src="/images/logo.svg"
              height={52}
              width={52}
              alt="War9a logo"
              className="dark:hidden"
            />
          </Link>

          <nav className="flex items-center gap-1">
            <NavLink href="/discover" active={pathname.startsWith("/discover")}>
              Discover
            </NavLink>

            {isAuthenticated && myQueueEntries.length > 0 && (
              <NavLink
                href={`/queue/${myQueueEntries[0].id}`}
                active={pathname.startsWith("/queue/")}
              >
                <span className="flex items-center gap-1">
                  <Clock className="size-4" />
                  My Queue
                  <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {myQueueEntries.length}
                  </span>
                </span>
              </NavLink>
            )}

            {/* Categories dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button
                className={cn(
                  "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  categoriesOpen
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                Categories <ChevronDown className="size-3" />
              </button>

              {categoriesOpen && (
                <div className="absolute left-0 top-full mt-1 w-[520px] rounded-xl border border-border bg-background p-3 shadow-lg">
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <Link
                        key={cat.name}
                        href={cat.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-secondary",
                          cat.bgColor,
                        )}
                      >
                        <div className="text-foreground/70">{cat.icon}</div>
                        <div>
                          <p className="text-sm font-semibold">{cat.name}</p>
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {cat.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <NavLink href="/map" active={pathname.startsWith("/map")}>
              <Map className="size-4" />
              Map
            </NavLink>

            <NavLink href="/faq" active={pathname === "/faq"}>
              FAQ
            </NavLink>
          </nav>
        </div>

        {/* Center: search */}
        <div className="flex max-w-sm flex-1 items-center px-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="w-full pl-9"
              placeholder="Search businesses…"
              type="search"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  router.push(
                    `/discover?q=${(e.target as HTMLInputElement).value}`,
                  );
                }
              }}
            />
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {(isAdmin || isOwner || isWorker) && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={dashboardHref}>
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/notifications">
                  <Bell className="size-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/profile">
                  <User className="size-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/sign-in">
                  <LogIn className="size-4" />
                  Sign In
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </header>

    </>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

