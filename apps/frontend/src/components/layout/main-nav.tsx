"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, Bell, User, LogOut, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function MainNav() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    router.push("/");
  };

  const isAdmin =
    user?.role === "admin" || user?.role === "super" || user?.role === "founder";
  const isOwner = user?.role === "owner";
  const isWorker =
    user?.role === "worker" || user?.role === "manager";

  return (
    <header className="sticky top-0 z-40 hidden border-b border-border bg-background/80 backdrop-blur-md md:block">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Clock className="size-4" />
            </div>
            <span className="text-lg font-bold">War9a</span>
          </Link>

          <div className="flex items-center gap-1">
            <NavLink href="/discover" active={pathname.startsWith("/discover")}>
              Discover
            </NavLink>
            <NavLink href="/map" active={pathname.startsWith("/map")}>
              Map
            </NavLink>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {(isAdmin || isOwner || isWorker) && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={isAdmin ? "/admin" : isOwner ? "/owner" : "/worker"}>
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
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
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
        "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
