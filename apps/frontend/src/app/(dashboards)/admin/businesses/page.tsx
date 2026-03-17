"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle, Star, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

type PaginatedResponse<T> = {
  data: T[];
  total: number;
  hasNextPage: boolean;
};

export default function AdminBusinessesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-businesses", search, page],
    queryFn: () =>
      fetchApi<PaginatedResponse<AdminBusiness>>("/admin/businesses", {
        params: { search: search || undefined, page, limit: 20 },
      }),
    placeholderData: (prev) => prev,
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
    onSuccess: (_, variables) => {
      toast.success(variables.featured ? "Business featured" : "Business unfeatured");
      void queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
    },
  });

  const statusBadgeVariant = (status: string) => {
    if (status === "active") return "success" as const;
    if (status === "pending") return "warning" as const;
    return "muted" as const;
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search businesses..."
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
          {data?.data.map((biz: AdminBusiness) => (
            <div
              key={biz.id}
              className="rounded-2xl border border-border bg-card p-4"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-medium">{biz.name}</span>
                    <Badge
                      variant={statusBadgeVariant(biz.status)}
                      className="shrink-0 capitalize"
                    >
                      {biz.status}
                    </Badge>
                    {biz.featured && (
                      <Badge className="shrink-0 gap-1 bg-yellow-500/10 text-yellow-600">
                        <Star className="size-3 fill-yellow-500 text-yellow-500" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {biz.city}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Owner: {biz.owner.displayName ?? biz.owner.email}
                  </p>
                </div>

                {/* Feature toggle */}
                <Button
                  variant="outline"
                  size="icon"
                  className="size-10 shrink-0"
                  onClick={() =>
                    featureMutation.mutate({
                      id: biz.id,
                      featured: !biz.featured,
                    })
                  }
                  disabled={featureMutation.isPending}
                >
                  <Star
                    className={cn(
                      "size-4",
                      biz.featured
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-muted-foreground",
                    )}
                  />
                </Button>
              </div>

              {/* Actions */}
              <div className="mt-3 flex gap-2">
                {biz.status === "pending" && (
                  <Button
                    variant="outline"
                    className="h-10 flex-1"
                    onClick={() => approveMutation.mutate(biz.id)}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle className="mr-1.5 size-4" />
                    Approve
                  </Button>
                )}
                {biz.status === "active" && (
                  <Button
                    variant="destructive"
                    className="h-10 flex-1"
                    onClick={() => suspendMutation.mutate(biz.id)}
                    disabled={suspendMutation.isPending}
                  >
                    <XCircle className="mr-1.5 size-4" />
                    Suspend
                  </Button>
                )}
              </div>
            </div>
          ))}

          {data?.data.length === 0 && (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No businesses found.
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
