"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Ban, CheckCircle, Loader2, ChevronLeft, ChevronRight, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type AdminUser = {
  id: string;
  email: string;
  displayName: string | null;
  username: string;
  role: string;
  isBanned: boolean;
  avatarUrl: string | null;
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

  const LIMIT = 20;
  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Users</h2>
        <p className="text-sm text-muted-foreground">
          {data?.total ?? 0} total users
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-16 text-center text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((user: AdminUser) => (
                  <TableRow key={user.id}>
                    <TableCell className="pr-0">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary overflow-hidden">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="size-full object-cover" />
                        ) : (
                          (user.displayName ?? user.username).charAt(0).toUpperCase()
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {user.displayName ?? user.username}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isBanned ? "destructive" : "success"}>
                        {user.isBanned ? "Banned" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          title="Copy ID"
                          onClick={() => {
                            void navigator.clipboard.writeText(user.id);
                            toast.success("ID copied");
                          }}
                        >
                          <Copy className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          title="View profile"
                          asChild
                        >
                          <Link href={`/profile/${user.username}`} target="_blank">
                            <ExternalLink className="size-3.5" />
                          </Link>
                        </Button>
                        {user.isBanned ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => unbanMutation.mutate(user.id)}
                            disabled={unbanMutation.isPending}
                          >
                            <CheckCircle className="mr-1.5 size-3.5" />
                            Unban
                          </Button>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              banMutation.mutate({ userId: user.id, reason: "Admin action" })
                            }
                            disabled={banMutation.isPending}
                          >
                            <Ban className="mr-1.5 size-3.5" />
                            Ban
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {(data?.hasNextPage || page > 1) && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!data?.hasNextPage}
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
