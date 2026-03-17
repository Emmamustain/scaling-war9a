"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth.store";
import { fetchApi } from "@/lib/fetch";
import { toast } from "sonner";
import { Loader2, AtSign, CheckCircle2, XCircle } from "lucide-react";

function validateUsername(value: string): string | null {
  if (value.length < 3) return "Username must be at least 3 characters.";
  if (value.length > 50) return "Username must be at most 50 characters.";
  if (!/^[a-zA-Z0-9_-]+$/.test(value))
    return "Only letters, numbers, underscores and hyphens are allowed.";
  return null;
}

export default function SetupUsernamePage() {
  const router = useRouter();
  const { checkAuth } = useAuthStore();
  const [username, setUsername] = useState("");
  const [isPending, setIsPending] = useState(false);
  const validationError = username.length > 0 ? validateUsername(username) : null;
  const isValid = username.length >= 3 && validationError === null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateUsername(username);
    if (error) {
      toast.error(error);
      return;
    }

    setIsPending(true);
    try {
      await fetchApi("/users/me/username", {
        method: "PATCH",
        body: JSON.stringify({ username }),
      });
      await checkAuth();
      toast.success("Username set successfully!");
      router.push("/discover");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to set username");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Link href="/">
            <Image
              src="/images/logo.svg"
              height={56}
              width={56}
              alt="War9a"
              className="dark:hidden"
            />
            <Image
              src="/images/logo-w.svg"
              height={56}
              width={56}
              alt="War9a"
              className="hidden dark:block"
            />
          </Link>
          <h1 className="text-2xl font-bold">Choose your username</h1>
          <p className="text-sm text-muted-foreground">
            This is how others will find and mention you on War9a.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="yourname"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))
                }
                required
                autoComplete="off"
                autoFocus
                className="pl-9 pr-9"
                minLength={3}
                maxLength={50}
              />
              {username.length > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isValid ? (
                    <CheckCircle2 className="size-4 text-green-500" />
                  ) : (
                    <XCircle className="size-4 text-destructive" />
                  )}
                </div>
              )}
            </div>

            {validationError && (
              <p className="text-xs text-destructive">{validationError}</p>
            )}
            {isValid && (
              <p className="text-xs text-muted-foreground">
                Looks good! Your profile will be at{" "}
                <span className="font-medium text-foreground">
                  war9a.localhost/@{username}
                </span>
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || !isValid}
            size="lg"
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Continue
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Letters, numbers, underscores and hyphens only. Min 3 characters.
        </p>
      </div>
    </div>
  );
}
