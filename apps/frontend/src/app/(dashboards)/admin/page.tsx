"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Users,
  Building2,
  Activity,
  Search,
  Ban,
  CheckCircle,
  Star,
  Shield,
  Loader2,
  UserCog,
  BarChart2,
} from "lucide-react";
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

type AdminBusiness = {
  id: string;
  name: string;
  slug: string;
  status: string;
  featured: boolean;
  city: string;
  owner: { displayName: string | null; email: string };
  createdAt: string;
};

type AdminAnalytics = {
  totalUsers: number;
  totalBusinesses: number;
  entriesToday: number;
  activeBusinesses: number;
  topCities: Array<{ city: string; count: number }>;
  topCategories: Array<{ name: string; count: number }>;
};

type PaginatedResponse<T> = {
  data: T[];
  total: number;
  hasNextPage: boolean;
};

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "businesses">("overview");
  const [userSearch, setUserSearch] = useState("");
  const [businessSearch, setBusinessSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [businessPage, setBusinessPage] = useState(1);

  const { data: analytics } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => fetchApi<AdminAnalytics>("/analytics/admin"),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users", userSearch, userPage],
    queryFn: () =>
      fetchApi<PaginatedResponse<AdminUser>>("/admin/users", {
        params: { search: userSearch || undefined, page: userPage, limit: 20 },
      }),
    enabled: activeTab === "users",
    placeholderData: (prev) => prev,
  });

  const { data: businessesData, isLoading: bizLoading } = useQuery({
    queryKey: ["admin-businesses", businessSearch, businessPage],
    queryFn: () =>
      fetchApi<PaginatedResponse<AdminBusiness>>("/admin/businesses", {
        params: { search: businessSearch || undefined, page: businessPage, limit: 20 },
      }),
    enabled: activeTab === "businesses",
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

  const approveMutation = useMutation({
    mutationFn: (businessId: string) =>
      fetchApi(`/admin/businesses/${businessId}/approve`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Business approved");
      void queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (businessId: string) =>
      fetchApi(`/admin/businesses/${businessId}/suspend`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Business suspended");
      void queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
    },
  });

  const featureMutation = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      fetchApi(`/admin/businesses/${id}/feature`, {
        method: "POST",
        body: JSON.stringify({ featured }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      fetchApi(`/admin/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role }),
      }),
    onSuccess: () => {
      toast.success("Role updated");
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const TABS = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "users", label: "Users", icon: Users },
    { id: "businesses", label: "Businesses", icon: Building2 },
  ] as const;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Shield className="size-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Platform management</p>
        </div>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-border bg-secondary/50 p-1 scrollbar-hide">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              activeTab === id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && analytics && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Users</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{analytics.totalBusinesses.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Businesses</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{analytics.entriesToday.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Entries Today</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{analytics.activeBusinesses.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Active Businesses</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Top Cities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.topCities.map(({ city, count }) => (
                    <div key={city} className="flex items-center justify-between text-sm">
                      <span>{city}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Top Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.topCategories.map(({ name, count }) => (
                    <div key={name} className="flex items-center justify-between text-sm">
                      <span>{name}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                setUserPage(1);
              }}
              className="pl-9"
            />
          </div>

          {usersLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-6 animate-spin" />
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="p-3 text-left font-medium">User</th>
                    <th className="p-3 text-left font-medium">Role</th>
                    <th className="p-3 text-left font-medium">Status</th>
                    <th className="p-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {usersData?.data.map((user) => (
                    <tr key={user.id} className="bg-card">
                      <td className="p-3">
                        <div className="font-medium">{user.displayName ?? user.username}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary" className="capitalize">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={user.isBanned ? "destructive" : "success"}>
                          {user.isBanned ? "Banned" : "Active"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-1">
                          {user.isBanned ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => unbanMutation.mutate(user.id)}
                            >
                              <CheckCircle className="size-3 mr-1" />
                              Unban
                            </Button>
                          ) : (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                banMutation.mutate({ userId: user.id, reason: "Admin action" })
                              }
                            >
                              <Ban className="size-3 mr-1" />
                              Ban
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {(usersData?.hasNextPage || userPage > 1) && (
            <div className="flex justify-center gap-2">
              {userPage > 1 && (
                <Button variant="outline" size="sm" onClick={() => setUserPage((p) => p - 1)}>
                  Prev
                </Button>
              )}
              {usersData?.hasNextPage && (
                <Button size="sm" onClick={() => setUserPage((p) => p + 1)}>
                  Next
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "businesses" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search businesses..."
              value={businessSearch}
              onChange={(e) => {
                setBusinessSearch(e.target.value);
                setBusinessPage(1);
              }}
              className="pl-9"
            />
          </div>

          {bizLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {businessesData?.data.map((biz) => (
                <div
                  key={biz.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
                >
                  <div>
                    <div className="font-medium">{biz.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {biz.city} · by {biz.owner.displayName ?? biz.owner.email}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        biz.status === "active"
                          ? "success"
                          : biz.status === "pending"
                            ? "warning"
                            : "muted"
                      }
                      className="capitalize"
                    >
                      {biz.status}
                    </Badge>
                    {biz.featured && <Badge>Featured</Badge>}
                    <div className="flex gap-1">
                      {biz.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => approveMutation.mutate(biz.id)}
                        >
                          <CheckCircle className="size-3 mr-1" />
                          Approve
                        </Button>
                      )}
                      {biz.status === "active" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => suspendMutation.mutate(biz.id)}
                        >
                          Suspend
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          featureMutation.mutate({ id: biz.id, featured: !biz.featured })
                        }
                      >
                        <Star className={cn("size-3", biz.featured && "fill-yellow-500 text-yellow-500")} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
