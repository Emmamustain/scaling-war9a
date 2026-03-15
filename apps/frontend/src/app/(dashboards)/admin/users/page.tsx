"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Ban, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type AdminUser = {
  id: string;
  email: string;
  displayName: string | null;
  username: string;
  role: string;
  isBanned: boolean;
  createdAt: string;
};

type PaginatedResponse<T> = {
  data: T[];
  total: number;
  hasNextPage: boolean;
};

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, page],
    queryFn: () =>
      fetchApi<PaginatedResponse<AdminUser>>("/admin/users", {
        params: { search: search || undefined, page, limit: 20 },
      }),
    placeholderData: (prev) => prev,
  });

  const banMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      fetchApi(`/admin/users/${userId}/ban`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      toast.success("User banned");
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const unbanMutation = useMutation({
    mutationFn: (userId: string) =>
      fetchApi(`/admin/users/${userId}/unban`, { method: "POST" }),
    onSuccess: () => {
      toast.success("User unbanned");
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="h-12 pl-10 text-base"
        />
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {data?.data.map((user: AdminUser) => (
            <div
              key={user.id}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-start gap-3">
                {/* Avatar initial */}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {(user.displayName ?? user.username).charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">
                      {user.displayName ?? user.username}
                    </span>
                    <Badge variant="secondary" className="shrink-0 capitalize">
                      {user.role}
                    </Badge>
                    <Badge
                      variant={user.isBanned ? "destructive" : "success"}
                      className="shrink-0"
                    >
                      {user.isBanned ? "Banned" : "Active"}
                    </Badge>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="mt-3">
                {user.isBanned ? (
                  <Button
                    variant="outline"
                    className="h-10 w-full"
                    onClick={() => unbanMutation.mutate(user.id)}
                    disabled={unbanMutation.isPending}
                  >
                    <CheckCircle className="mr-1.5 size-4" />
                    Unban
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    className="h-10 w-full"
                    onClick={() =>
                      banMutation.mutate({
                        userId: user.id,
                        reason: "Admin action",
                      })
                    }
                    disabled={banMutation.isPending}
                  >
                    <Ban className="mr-1.5 size-4" />
                    Ban
                  </Button>
                )}
              </div>
            </div>
          ))}

          {data?.data.length === 0 && (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No users found.
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {(data?.hasNextPage || page > 1) && (
        <div className="flex gap-3">
          {page > 1 && (
            <Button
              variant="outline"
              className="h-10 flex-1"
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>
          )}
          {data?.hasNextPage && (
            <Button
              className="h-10 flex-1"
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
