"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Loader2 } from "lucide-react";
import { MainNav } from "@/components/layout/main-nav";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function DashboardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/sign-in");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MainNav />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}
