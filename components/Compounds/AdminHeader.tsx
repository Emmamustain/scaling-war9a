"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Menu,
  LayoutDashboard,
  Building,
  Verified,
  Settings,
  DiscIcon,
} from "lucide-react";

import { atom, useAtom } from "jotai";
import Link from "next/link";

export const openAtom = atom(true);

interface AdminHeaderProps {
  active: "dashboard" | "businesses" | "verifications" | "settings";
}

export default function AdminHeader({ active }: AdminHeaderProps) {
  const [open, setOpen] = useAtom(openAtom);

  return (
    <header
      className={cn(
        "absolute left-0 top-0 flex h-screen w-[300px] flex-col items-center justify-between border-r-2 border-neutral-700 bg-neutral-800 py-12 duration-500",
        open ? "" : "-translate-x-[300px]",
      )}
    >
      {/* Close Toggle */}
      <div
        className="absolute -right-14 top-0 flex h-14 w-14 items-center justify-center rounded-br-lg border-2 border-t-0 border-neutral-700 border-l-neutral-800 bg-neutral-800"
        onClick={() => setOpen(!open)}
      >
        <Menu color="white" />
      </div>

      {/* Branding */}
      <div className="flex w-full flex-col gap-14 px-8">
        <div className="flex scale-[1.2] items-center justify-center gap-4">
          <Image
            src="/images/logo-w.svg"
            height={40}
            width={40}
            alt="war9a logo"
          />
          <p className="font-semibold text-white">Dashboard</p>
        </div>
        {/* Navigation */}
        <div className="flex flex-col items-center">
          <nav className="mt-12 flex w-full flex-col items-center gap-4">
            <Link className="w-full" href="/admin">
              <div
                className={cn(
                  active === "dashboard" && "bg-neutral-700",
                  "flex w-full items-center gap-4 rounded-lg p-4 text-white hover:bg-neutral-700",
                )}
              >
                <LayoutDashboard />
                <p>Dashboard</p>
              </div>
            </Link>
            <Link className="w-full" href="/admin/businesses">
              <div
                className={cn(
                  active === "businesses" && "bg-neutral-700",
                  "flex w-full items-center gap-4 rounded-lg p-4 text-white hover:bg-neutral-700",
                )}
              >
                <Building />
                <p>Businesses</p>
              </div>
            </Link>
            <Link className="w-full" href="/admin">
              <div
                className={cn(
                  active === "verifications" && "bg-neutral-700",
                  "flex w-full items-center gap-4 rounded-lg p-4 text-white hover:bg-neutral-700",
                )}
              >
                <Verified />
                <p>Verifications</p>
              </div>
            </Link>
            <Link className="w-full" href="/admin">
              <div
                className={cn(
                  active === "settings" && "bg-neutral-700",
                  "flex w-full items-center gap-4 rounded-lg p-4 text-white hover:bg-neutral-700",
                )}
              >
                <Settings />
                <p>Settings</p>
              </div>
            </Link>
          </nav>
        </div>
      </div>

      <div className="w-full px-8">
        <div className="flex w-full items-center gap-4 rounded-lg p-4 text-white hover:bg-neutral-700">
          <DiscIcon />
          <a href="#">Disconnect</a>
        </div>
      </div>
    </header>
  );
}
