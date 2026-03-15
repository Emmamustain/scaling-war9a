"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  consumed: boolean;
  createdAt: string;
  link: string | null;
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () =>
      fetchApi<{ data: Notification[]; total: number }>("/notifications?limit=50"),
  });

  const markAllMutation = useMutation({
    mutationFn: () =>
      fetchApi("/notifications/mark-all-read", { method: "PUT" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/notifications/${id}/read`, { method: "PUT" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unread = data?.data.filter((n) => !n.consumed) ?? [];

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unread.length > 0 && (
            <p className="text-sm text-muted-foreground">{unread.length} unread</p>
          )}
        </div>
        {unread.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
          >
            <CheckCheck className="size-4 mr-1" />
            Mark All Read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : data?.data.length === 0 ? (
        <div className="py-20 text-center">
          <Bell className="mx-auto mb-3 size-10 text-muted-foreground/30" />
          <p className="text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data?.data.map((notif) => (
            <button
              key={notif.id}
              className="w-full rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-secondary/50"
              onClick={() => {
                if (!notif.consumed) markReadMutation.mutate(notif.id);
                if (notif.link) window.location.href = notif.link;
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {!notif.consumed && (
                    <div className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  )}
                  {notif.consumed && <div className="mt-1.5 size-2 shrink-0" />}
                  <div>
                    <div className="font-medium text-sm">{notif.title}</div>
                    <div className="text-sm text-muted-foreground">{notif.body}</div>
                  </div>
                </div>
                <div className="shrink-0 text-xs text-muted-foreground">
                  {formatRelativeTime(notif.createdAt)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
