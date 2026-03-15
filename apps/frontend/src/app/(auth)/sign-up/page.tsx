"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";
import { Clock, Loader2 } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const { checkAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setIsPending(true);
    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });
      if (result.error) {
        throw new Error(result.error.message ?? "Sign up failed");
      }
      await checkAuth();
      toast.success("Account created! Welcome to War9a!");
      router.push("/discover");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Clock className="size-5" />
            </div>
            <span className="text-2xl font-bold">War9a</span>
          </Link>
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Join War9a and skip the line
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="name">
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Ahmed Benali"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="ahmed@example.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending} size="lg">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Create Account
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          By creating an account you agree to our Terms of Service.
        </p>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
