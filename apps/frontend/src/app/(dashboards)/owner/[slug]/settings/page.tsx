"use client";

import { use, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { getBackendUrl } from "@/lib/backend-url";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  Loader2,
  Save,
  MapPin,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

type BusinessHour = {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

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
  hours: BusinessHour[];
};

type SettingsForm = {
  name: string;
  description: string;
  phone: string;
  logoUrl: string;
  coverUrl: string;
  location: string;
  city: string;
  latitude: string;
  longitude: string;
  isOpen: boolean;
};

type HourDraft = { openTime: string; closeTime: string; isClosed: boolean };

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildDefaultHours(existing: BusinessHour[]): HourDraft[] {
  return DAYS.map((_, i) => {
    const found = existing.find((h) => h.dayOfWeek === i);
    return {
      openTime: found?.openTime ?? "09:00",
      closeTime: found?.closeTime ?? "17:00",
      isClosed:
        (found?.isClosed ?? false) || (!found && (i === 5 || i === 6)),
    };
  });
}

export default function SettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const queryClient = useQueryClient();

  const [settingsForm, setSettingsForm] = useState<SettingsForm | null>(null);
  const [hoursDraft, setHoursDraft] = useState<HourDraft[] | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const { data: business, isLoading } = useQuery({
    queryKey: ["owner-business", slug],
    queryFn: () => fetchApi<OwnerBusiness>(`/businesses/${slug}/manage`),
    select: (data) => {
      if (!settingsForm) {
        setSettingsForm({
          name: data.name,
          description: data.description ?? "",
          phone: data.phone ?? "",
          logoUrl: data.logoUrl ?? "",
          coverUrl: data.coverUrl ?? "",
          location: data.location ?? "",
          city: data.city ?? "",
          latitude: data.latitude ?? "",
          longitude: data.longitude ?? "",
          isOpen: data.isOpen,
        });
      }
      if (!hoursDraft) {
        setHoursDraft(buildDefaultHours(data.hours));
      }
      return data;
    },
  });

  // --- Mutations ---

  const updateBusinessMutation = useMutation({
    mutationFn: (data: SettingsForm) =>
      fetchApi(`/businesses/${business!.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success("Saved!");
      void queryClient.invalidateQueries({ queryKey: ["owner-business"] });
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to update"),
  });

  const updateHoursMutation = useMutation({
    mutationFn: () =>
      fetchApi(`/businesses/${business!.id}/hours`, {
        method: "PUT",
        body: JSON.stringify({
          hours: hoursDraft!.map((h, i) => ({ ...h, dayOfWeek: i })),
        }),
      }),
    onSuccess: () => toast.success("Hours saved!"),
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "Failed to save hours",
      ),
  });

  // --- Upload helpers ---

  async function uploadImage(file: File, bucket: "logos" | "covers") {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(
      `${getBackendUrl()}/uploads/business/${bucket}`,
      {
        method: "POST",
        credentials: "include",
        body: form,
      },
    );
    if (!res.ok) throw new Error("Upload failed");
    const data = (await res.json()) as { url: string };
    return data.url;
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !settingsForm) return;
    setUploadingLogo(true);
    try {
      const url = await uploadImage(file, "logos");
      setSettingsForm((f) => f && { ...f, logoUrl: url });
      updateBusinessMutation.mutate({ ...settingsForm, logoUrl: url });
      toast.success("Logo uploaded!");
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !settingsForm) return;
    setUploadingCover(true);
    try {
      const url = await uploadImage(file, "covers");
      setSettingsForm((f) => f && { ...f, coverUrl: url });
      updateBusinessMutation.mutate({ ...settingsForm, coverUrl: url });
      toast.success("Cover uploaded!");
    } catch {
      toast.error("Failed to upload cover");
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!business || !settingsForm || !hoursDraft) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
      {/* Open/Close Toggle */}
      <Card className="rounded-2xl">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <div className="text-base font-medium">Open for business</div>
            <div className="mt-0.5 text-sm text-muted-foreground">
              Marks your business as open/closed right now
            </div>
          </div>
          <Switch
            checked={settingsForm.isOpen}
            onCheckedChange={(v: boolean) => {
              setSettingsForm((f) => f && { ...f, isOpen: v });
              updateBusinessMutation.mutate({ ...settingsForm, isOpen: v });
            }}
          />
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Settings className="size-4" /> Basic Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "name", label: "Business Name", type: "text" },
            { key: "description", label: "Description", type: "text" },
            { key: "phone", label: "Phone", type: "tel" },
          ].map(({ key, label, type }) => (
            <div key={key} className="space-y-2">
              <Label className="text-base">{label}</Label>
              <Input
                className="h-12 rounded-2xl text-base"
                type={type}
                value={
                  (settingsForm as unknown as Record<string, string>)[key] ??
                  ""
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSettingsForm(
                    (f) => f && { ...f, [key]: e.target.value },
                  )
                }
              />
            </div>
          ))}
          <Button
            className="h-12 w-full rounded-2xl text-base"
            onClick={() => updateBusinessMutation.mutate(settingsForm)}
            disabled={updateBusinessMutation.isPending}
          >
            {updateBusinessMutation.isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Save className="size-5" />
            )}
            Save Info
          </Button>
        </CardContent>
      </Card>

      {/* Images */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <ImageIcon className="size-4" /> Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Logo */}
          <div className="space-y-3">
            <Label className="text-base">Logo</Label>
            <div className="flex items-center gap-4">
              {settingsForm.logoUrl ? (
                <img
                  src={settingsForm.logoUrl}
                  alt="Logo"
                  className="size-16 shrink-0 rounded-2xl border border-border object-cover"
                  onError={(e) =>
                    (e.currentTarget.style.display = "none")
                  }
                />
              ) : (
                <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 text-2xl font-bold text-muted-foreground">
                  {business.name[0]}
                </div>
              )}
              <div className="flex-1 space-y-1">
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-2xl text-base"
                  disabled={uploadingLogo}
                  onClick={() => logoInputRef.current?.click()}
                >
                  {uploadingLogo ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <ImageIcon className="size-5" />
                  )}
                  {uploadingLogo
                    ? "Uploading..."
                    : settingsForm.logoUrl
                      ? "Replace Logo"
                      : "Upload Logo"}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  JPG, PNG, WebP -- max 5MB
                </p>
              </div>
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>

          {/* Cover */}
          <div className="space-y-3">
            <Label className="text-base">Cover Image</Label>
            {settingsForm.coverUrl ? (
              <img
                src={settingsForm.coverUrl}
                alt="Cover"
                className="h-32 w-full rounded-2xl border border-border object-cover"
                onError={(e) =>
                  (e.currentTarget.style.display = "none")
                }
              />
            ) : (
              <div className="flex h-32 w-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 text-sm text-muted-foreground">
                No cover image yet
              </div>
            )}
            <Button
              variant="outline"
              className="h-12 w-full rounded-2xl text-base"
              disabled={uploadingCover}
              onClick={() => coverInputRef.current?.click()}
            >
              {uploadingCover ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <ImageIcon className="size-5" />
              )}
              {uploadingCover
                ? "Uploading..."
                : settingsForm.coverUrl
                  ? "Replace Cover"
                  : "Upload Cover"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              JPG, PNG, WebP -- max 5MB -- recommended 1200x400
            </p>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <MapPin className="size-4" /> Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              key: "location",
              label: "Address",
              placeholder: "123 Main St",
            },
            { key: "city", label: "City", placeholder: "Annaba" },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-2">
              <Label className="text-base">{label}</Label>
              <Input
                className="h-12 rounded-2xl text-base"
                placeholder={placeholder}
                value={
                  (settingsForm as unknown as Record<string, string>)[key] ??
                  ""
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSettingsForm(
                    (f) => f && { ...f, [key]: e.target.value },
                  )
                }
              />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                key: "latitude",
                label: "Latitude",
                placeholder: "36.9000",
              },
              {
                key: "longitude",
                label: "Longitude",
                placeholder: "7.7667",
              },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-2">
                <Label className="text-base">{label}</Label>
                <Input
                  className="h-12 rounded-2xl text-base"
                  placeholder={placeholder}
                  value={
                    (settingsForm as unknown as Record<string, string>)[
                      key
                    ] ?? ""
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSettingsForm(
                      (f) => f && { ...f, [key]: e.target.value },
                    )
                  }
                />
              </div>
            ))}
          </div>
          <Button
            className="h-12 w-full rounded-2xl text-base"
            onClick={() => updateBusinessMutation.mutate(settingsForm)}
            disabled={updateBusinessMutation.isPending}
          >
            {updateBusinessMutation.isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Save className="size-5" />
            )}
            Save Location
          </Button>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="size-4" /> Business Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS.map((day, i) => {
            const h = hoursDraft[i]!;
            return (
              <div key={day} className="flex items-center gap-3">
                <span className="w-10 shrink-0 text-sm font-medium">
                  {day}
                </span>
                <Switch
                  checked={!h.isClosed}
                  onCheckedChange={(open: boolean) =>
                    setHoursDraft(
                      (d) =>
                        d &&
                        d.map((x, j) =>
                          j === i ? { ...x, isClosed: !open } : x,
                        ),
                    )
                  }
                />
                {h.isClosed ? (
                  <span className="text-sm text-muted-foreground">
                    Closed
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={h.openTime}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setHoursDraft(
                          (d) =>
                            d &&
                            d.map((x, j) =>
                              j === i
                                ? { ...x, openTime: e.target.value }
                                : x,
                            ),
                        )
                      }
                      className="h-12 w-28 rounded-2xl text-base"
                    />
                    <span className="text-sm text-muted-foreground">
                      --
                    </span>
                    <Input
                      type="time"
                      value={h.closeTime}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setHoursDraft(
                          (d) =>
                            d &&
                            d.map((x, j) =>
                              j === i
                                ? { ...x, closeTime: e.target.value }
                                : x,
                            ),
                        )
                      }
                      className="h-12 w-28 rounded-2xl text-base"
                    />
                  </div>
                )}
              </div>
            );
          })}
          <Button
            className="mt-2 h-12 w-full rounded-2xl text-base"
            onClick={() => updateHoursMutation.mutate()}
            disabled={updateHoursMutation.isPending}
          >
            {updateHoursMutation.isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Save className="size-5" />
            )}
            Save Hours
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
