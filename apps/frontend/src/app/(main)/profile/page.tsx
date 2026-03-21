"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { useAuthStore } from "@/stores/auth.store";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  LogOut,
  Bell,
  Moon,
  Globe,
  ChevronRight,
  Loader2,
  Camera,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { getInitials } from "@/lib/utils";

export default function ProfilePage() {
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { getBackendUrl } = await import("@/lib/backend-url");
      const uploadRes = await fetch(`${getBackendUrl()}/uploads/avatar`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { url } = await uploadRes.json() as { url: string };
      await fetchApi("/users/me/avatar", {
        method: "PATCH",
        body: JSON.stringify({ avatarUrl: url }),
      });
      await checkAuth();
      toast.success("Avatar updated!");
    } catch {
      toast.error("Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const { data: myBusinesses } = useQuery({
    queryKey: ["my-businesses"],
    queryFn: () => fetchApi<Array<{ id: string; name: string; slug: string }>>("/businesses/mine"),
    enabled: isAuthenticated,
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      fetchApi("/users/me/profile", {
        method: "PATCH",
        body: JSON.stringify({ displayName, phone }),
      }),
    onSuccess: () => {
      toast.success("Profile updated!");
      setEditing(false);
      void checkAuth();
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to update profile"),
  });

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <User className="mx-auto mb-4 size-16 text-muted-foreground/50" />
        <h2 className="mb-2 text-xl font-bold">Not Signed In</h2>
        <p className="mb-6 text-muted-foreground">Sign in to manage your profile</p>
        <Button asChild>
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8 space-y-6">
      <div className="flex flex-col items-center gap-4 pb-4">
        <div className="relative">
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <button
            className="group relative flex size-20 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary overflow-hidden"
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarUploading}
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="size-full rounded-full object-cover" />
            ) : (
              getInitials(user?.displayName)
            )}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              {avatarUploading ? (
                <Loader2 className="size-5 animate-spin text-white" />
              ) : (
                <Camera className="size-5 text-white" />
              )}
            </div>
          </button>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">{user?.displayName ?? user?.username}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <Badge variant="secondary" className="mt-1 capitalize">{user?.role}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {editing ? (
            <>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Display Name</label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Phone</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+213 XX XX XX XX"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  className="flex-1"
                  onClick={() => updateMutation.mutate()}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : "Save"}
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">Display Name</span>
                <span className="text-sm font-medium">{user?.displayName ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">Phone</span>
                <span className="text-sm font-medium">{user?.phone ?? "—"}</span>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-1" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {myBusinesses && myBusinesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">My Businesses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {myBusinesses.map((biz) => (
              <Link
                key={biz.id}
                href={`/owner/${biz.slug}`}
                className="flex items-center justify-between rounded-lg bg-secondary/50 p-3 hover:bg-secondary"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{biz.name}</span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/create-business">+ New Business</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <button
            className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-secondary/50"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <div className="flex items-center gap-3 text-sm">
              <Moon className="size-4 text-muted-foreground" />
              Dark Mode
            </div>
            <div
              className={`h-5 w-9 rounded-full transition-colors ${theme === "dark" ? "bg-primary" : "bg-secondary"}`}
            >
              <div
                className={`size-5 rounded-full bg-white shadow transition-transform ${theme === "dark" ? "translate-x-4" : "translate-x-0"}`}
              />
            </div>
          </button>

          <Link
            href="/settings/notifications"
            className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-secondary/50"
          >
            <div className="flex items-center gap-3 text-sm">
              <Bell className="size-4 text-muted-foreground" />
              Notifications
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>

          <Link
            href="/settings/language"
            className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-secondary/50"
          >
            <div className="flex items-center gap-3 text-sm">
              <Globe className="size-4 text-muted-foreground" />
              Language
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>

      <Button
        variant="destructive"
        className="w-full"
        onClick={handleLogout}
      >
        <LogOut className="size-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}
