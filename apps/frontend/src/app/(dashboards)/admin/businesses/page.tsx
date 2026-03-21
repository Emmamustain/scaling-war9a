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
import { Search, CheckCircle, Star, Loader2, XCircle, ChevronLeft, ChevronRight, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { cn, getInitials } from "@/lib/utils";
import Link from "next/link";

type AdminBusiness = {
  id: string;
  name: string;
  slug: string;
  status: string;
  featured: boolean;
  city: string;
  logoUrl: string | null;
  owner: { displayName: string | null; email: string };
  createdAt: string;
};

type PaginatedResponse<T> = {
  data: T[];
  total: number;
  hasNextPage: boolean;
};

const statusVariant = (status: string) => {
  if (status === "active") return "success" as const;
  if (status === "pending") return "warning" as const;
  return "secondary" as const;
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
    mutationFn: (id: string) =>
      fetchApi(`/admin/businesses/${id}/approve`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Business approved");
      void queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/admin/businesses/${id}/suspend`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Business suspended");
      void queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
    },
  });

  const featureMutation = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      fetchApi(`/admin/businesses/${id}/feature`, {
        method: "PUT",
        body: JSON.stringify({ featured }),
      }),
    onSuccess: (_, { featured }) => {
      toast.success(featured ? "Business featured" : "Business unfeatured");
      void queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
    },
  });

  const LIMIT = 20;
  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Businesses</h2>
        <p className="text-sm text-muted-foreground">
          {data?.total ?? 0} total businesses
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search businesses..."
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
                <TableHead>Business</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center text-muted-foreground">
                    No businesses found.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((biz: AdminBusiness) => (
                  <TableRow key={biz.id}>
                    <TableCell className="pr-0">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-bold overflow-hidden">
                        {biz.logoUrl ? (
                          <img src={biz.logoUrl} alt="" className="size-full object-cover" />
                        ) : (
                          <span className="text-muted-foreground">{getInitials(biz.name)}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{biz.name}</TableCell>
                    <TableCell className="text-muted-foreground">{biz.city}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {biz.owner.displayName ?? biz.owner.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(biz.status)} className="capitalize">
                        {biz.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() =>
                          featureMutation.mutate({ id: biz.id, featured: !biz.featured })
                        }
                        disabled={featureMutation.isPending}
                        title={biz.featured ? "Unfeature" : "Feature"}
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
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(biz.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          title="Copy ID"
                          onClick={() => {
                            void navigator.clipboard.writeText(biz.id);
                            toast.success("ID copied");
                          }}
                        >
                          <Copy className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          title="Open business page"
                          asChild
                        >
                          <Link href={`/business/${biz.slug}`} target="_blank">
                            <ExternalLink className="size-3.5" />
                          </Link>
                        </Button>
                        {biz.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => approveMutation.mutate(biz.id)}
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle className="mr-1.5 size-3.5" />
                            Approve
                          </Button>
                        )}
                        {biz.status === "active" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => suspendMutation.mutate(biz.id)}
                            disabled={suspendMutation.isPending}
                          >
                            <XCircle className="mr-1.5 size-3.5" />
                            Suspend
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
