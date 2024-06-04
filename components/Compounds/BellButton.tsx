"use client";
import { useEffect, useState } from "react";
import { Bell, Link } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { getNotification } from "@/database/queries";
import { getCurrentSession } from "@/utils/get-current-session";
import { Notifications } from "./Header";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { markAsRead } from "@/database/mutations";
import { revalidatePath } from "next/cache";
import { useRouter } from "next/navigation";

interface BellButtonProps {
  notifications: Notifications;
  user_id: string;
}
export default function BellButton({
  notifications,
  user_id,
}: BellButtonProps) {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button size="icon" className="relative">
            <Bell className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            {notifications.length > 0 && (
              <div className="absolute -bottom-2 -right-2 z-30 rounded-full bg-red-500 p-1 px-2 text-xs text-white">
                {notifications.length}
              </div>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-80" align="end">
          <div className="grid gap-4">
            <div className="h-fit space-y-2 rounded bg-neutral-950 p-4">
              <h4 className="font-medium leading-none text-white">
                Notifications
              </h4>
              <p className="text-muted-foreground text-sm text-white">
                Here are your notifications.
              </p>
            </div>
            {notifications.map((notification, index) => (
              <div key={index} className="p-4 text-sm">
                {notification.message}
              </div>
            ))}
            {!loading ? (
              <div
                onClick={async () => {
                  setLoading(true);
                  markAsRead(user_id);
                  setLoading(false);
                  router.refresh();
                }}
                className="flex items-center justify-end text-sm text-blue-500 underline hover:cursor-pointer"
              >
                Mark as read
              </div>
            ) : (
              <p>loading...</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
