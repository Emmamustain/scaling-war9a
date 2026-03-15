"use client";

import { use, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Users,
  Plus,
  Loader2,
  Trash2,
  ShieldCheck,
  UserCog,
  Search,
  UserPlus,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

type OwnerBusiness = {
  id: string;
  name: string;
  slug: string;
  status: string;
  logoUrl: string | null;
  coverUrl: string | null;
  description: string;
  location: string;
  city: string;
  phone: string | null;
  latitude: string | null;
  longitude: string | null;
  isOpen: boolean;
  services: Array<{
    id: string;
    name: string;
    isActive: boolean;
    maxCapacity: number | null;
    averageTime: string | null;
  }>;
  workers: Array<{
    id: string;
    role: string;
    score: number;
    user: {
      id: string;
      displayName: string | null;
      email: string;
      avatarUrl: string | null;
    };
  }>;
  hours: Array<{
    id: string;
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>;
};

export default function TeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [workerSearch, setWorkerSearch] = useState("");
  const [workerRole, setWorkerRole] = useState<"worker" | "manager">("worker");
  const [provisionMode, setProvisionMode] = useState(false);
  const [provisionName, setProvisionName] = useState("");
  const [provisionEmail, setProvisionEmail] = useState("");
  const [tempCredentials, setTempCredentials] = useState<{
    email: string;
    tempPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: business, isLoading } = useQuery({
    queryKey: ["owner-business", slug],
    queryFn: () => fetchApi<OwnerBusiness>(`/businesses/${slug}/manage`),
  });

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(workerSearch), 300);
    return () => clearTimeout(t);
  }, [workerSearch]);

  const { data: userSearchResults, isFetching: searchFetching } = useQuery({
    queryKey: ["user-search", debouncedSearch],
    queryFn: () =>
      fetchApi<
        Array<{
          id: string;
          displayName: string | null;
          email: string;
          avatarUrl: string | null;
          username: string;
        }>
      >(`/users/search?q=${encodeURIComponent(debouncedSearch)}`),
    enabled: debouncedSearch.length >= 2,
  });

  // --- Mutations ---

  const addWorkerMutation = useMutation({
    mutationFn: (userId: string) =>
      fetchApi(`/businesses/${business!.id}/workers`, {
        method: "POST",
        body: JSON.stringify({ userId, role: workerRole }),
      }),
    onSuccess: () => {
      toast.success("Worker added!");
      setDialogOpen(false);
      setWorkerSearch("");
      void queryClient.invalidateQueries({ queryKey: ["owner-business"] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "Failed to add worker",
      ),
  });

  const provisionWorkerMutation = useMutation({
    mutationFn: () =>
      fetchApi<{ tempPassword: string; user: { email: string } }>(
        `/businesses/${business!.id}/workers/provision`,
        {
          method: "POST",
          body: JSON.stringify({
            email: provisionEmail,
            displayName: provisionName,
            role: workerRole,
          }),
        },
      ),
    onSuccess: (data: { tempPassword: string; user: { email: string } }) => {
      setTempCredentials({
        email: data.user.email,
        tempPassword: data.tempPassword,
      });
      void queryClient.invalidateQueries({ queryKey: ["owner-business"] });
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "Failed to create account",
      ),
  });

  const removeWorkerMutation = useMutation({
    mutationFn: (workerId: string) =>
      fetchApi(`/businesses/${business!.id}/workers/${workerId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Worker removed");
      void queryClient.invalidateQueries({ queryKey: ["owner-business"] });
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ workerId, role }: { workerId: string; role: string }) =>
      fetchApi(`/businesses/${business!.id}/workers/${workerId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role }),
      }),
    onSuccess: () => {
      toast.success("Role updated");
      void queryClient.invalidateQueries({ queryKey: ["owner-business"] });
    },
  });

  function resetDialog() {
    setWorkerSearch("");
    setProvisionMode(false);
    setProvisionName("");
    setProvisionEmail("");
    setTempCredentials(null);
    setWorkerRole("worker");
    setCopied(false);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!business) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {(business.workers ?? []).length} member
          {(business.workers ?? []).length !== 1 ? "s" : ""}
        </p>
        <Button
          className="h-12 rounded-2xl px-6 text-base"
          onClick={() => {
            setDialogOpen(true);
            resetDialog();
          }}
        >
          <UserPlus className="size-5" />
          Add Member
        </Button>
      </div>

      {/* Add / Provision Worker Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(o: boolean) => {
          setDialogOpen(o);
          if (!o) resetDialog();
        }}
      >
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {provisionMode ? "Create War9a Account" : "Add Team Member"}
            </DialogTitle>
          </DialogHeader>

          {tempCredentials ? (
            /* Credentials screen after provisioning */
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                Account created! Share these credentials with{" "}
                <strong>{tempCredentials.email}</strong> -- they should change
                the password after first login.
              </p>
              <div className="space-y-3 rounded-2xl border border-border bg-muted/50 p-5 font-mono text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{tempCredentials.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Password</span>
                  <span className="font-bold tracking-widest">
                    {tempCredentials.tempPassword}
                  </span>
                </div>
              </div>
              <Button
                className="h-12 w-full rounded-2xl text-base"
                variant="outline"
                onClick={() => {
                  void navigator.clipboard.writeText(
                    `Email: ${tempCredentials.email}\nPassword: ${tempCredentials.tempPassword}`,
                  );
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? (
                  <Check className="size-5" />
                ) : (
                  <Copy className="size-5" />
                )}
                {copied ? "Copied!" : "Copy credentials"}
              </Button>
              <DialogFooter>
                <Button
                  className="h-12 rounded-2xl"
                  onClick={() => setDialogOpen(false)}
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          ) : provisionMode ? (
            /* Create new account form */
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-base">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  className="h-12 rounded-2xl text-base"
                  placeholder="e.g. Ahmed Bensaid"
                  value={provisionName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProvisionName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  className="h-12 rounded-2xl text-base"
                  type="email"
                  placeholder="worker@example.com"
                  value={provisionEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProvisionEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base">Role</Label>
                <select
                  className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-base"
                  value={workerRole}
                  onChange={(e) =>
                    setWorkerRole(e.target.value as "worker" | "manager")
                  }
                >
                  <option value="worker">Worker</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                <Button
                  variant="ghost"
                  className="h-12 rounded-2xl sm:mr-auto"
                  onClick={() => setProvisionMode(false)}
                >
                  Back to search
                </Button>
                <Button
                  className="h-12 rounded-2xl"
                  onClick={() => provisionWorkerMutation.mutate()}
                  disabled={
                    !provisionName.trim() ||
                    !provisionEmail.trim() ||
                    provisionWorkerMutation.isPending
                  }
                >
                  {provisionWorkerMutation.isPending ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <UserPlus className="size-5" />
                  )}
                  Create & Add
                </Button>
              </DialogFooter>
            </div>
          ) : (
            /* Search existing users */
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-base">Role to assign</Label>
                <select
                  className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-base"
                  value={workerRole}
                  onChange={(e) =>
                    setWorkerRole(e.target.value as "worker" | "manager")
                  }
                >
                  <option value="worker">Worker</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-12 rounded-2xl pl-11 text-base"
                  placeholder="Search by name, email or username..."
                  value={workerSearch}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWorkerSearch(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Search results */}
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {searchFetching && (
                  <div className="flex justify-center py-6">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  </div>
                )}
                {!searchFetching &&
                  debouncedSearch.length >= 2 &&
                  (userSearchResults ?? []).length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        No users found for &quot;{debouncedSearch}&quot;
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4 h-10 rounded-xl"
                        onClick={() => {
                          setProvisionMode(true);
                          setProvisionEmail(
                            debouncedSearch.includes("@")
                              ? debouncedSearch
                              : "",
                          );
                        }}
                      >
                        <UserPlus className="size-4" />
                        Create a War9a account for them
                      </Button>
                    </div>
                  )}
                {(userSearchResults ?? []).map((u: { id: string; displayName: string | null; email: string; avatarUrl: string | null; username: string }) => {
                  const alreadyAdded = (business.workers ?? []).some(
                    (w: OwnerBusiness["workers"][number]) => w.user.id === u.id,
                  );
                  return (
                    <button
                      key={u.id}
                      disabled={alreadyAdded || addWorkerMutation.isPending}
                      onClick={() => addWorkerMutation.mutate(u.id)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-border p-4 text-left transition-colors hover:bg-secondary/50 disabled:opacity-50"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {(u.displayName ?? u.email)[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-base font-medium">
                          {u.displayName ?? u.username}
                        </div>
                        <div className="truncate text-sm text-muted-foreground">
                          {u.email}
                        </div>
                      </div>
                      {alreadyAdded ? (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          Already added
                        </span>
                      ) : (
                        <Plus className="size-5 shrink-0 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>

              {debouncedSearch.length < 2 && (
                <p className="py-2 text-center text-sm text-muted-foreground">
                  Type at least 2 characters to search
                </p>
              )}

              <div className="border-t border-border pt-4">
                <button
                  className="flex w-full items-center gap-2 rounded-2xl p-3 text-sm text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
                  onClick={() => setProvisionMode(true)}
                >
                  <UserPlus className="size-4" />
                  Worker not on War9a yet? Create an account for them
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Team List */}
      <div className="space-y-3">
        {(business.workers ?? []).map((worker: OwnerBusiness["workers"][number]) => (
          <div
            key={worker.id}
            className="flex items-center justify-between rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-full bg-secondary text-sm font-bold">
                {(
                  worker.user.displayName ?? worker.user.email
                )[0]?.toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 text-base font-medium">
                  {worker.user.displayName ?? worker.user.email}
                  {worker.role === "manager" && (
                    <ShieldCheck className="size-4 text-primary" />
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {worker.user.email}
                </div>
                {(worker.score ?? 0) > 0 && (
                  <div className="text-xs text-yellow-600">
                    Score: {worker.score}
                  </div>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 pl-2">
              <Button
                variant="outline"
                className="h-10 rounded-xl gap-1.5 text-sm"
                onClick={() =>
                  changeRoleMutation.mutate({
                    workerId: worker.id,
                    role:
                      worker.role === "manager" ? "worker" : "manager",
                  })
                }
                disabled={changeRoleMutation.isPending}
              >
                <UserCog className="size-4" />
                {worker.role === "manager" ? "Demote" : "Promote"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-10 text-destructive hover:bg-destructive/10"
                onClick={() => removeWorkerMutation.mutate(worker.id)}
              >
                <Trash2 className="size-5" />
              </Button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {(business.workers ?? []).length === 0 && (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
            <Users className="mx-auto mb-3 size-10 opacity-40" />
            <p className="text-base">No team members yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
