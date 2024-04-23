import * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AsyncButton from "../Molecules/AsyncButton";
import { Button } from "../ui/button";
import { Alert } from "../ui/alert";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: string;
}

export function SignUpForm({
  className,
  error = undefined,
  ...props
}: UserAuthFormProps) {
  return (
    <div className={cn("grid gap-6 ", className)} {...props}>
      <form action={"/auth/sign-up"} method="POST">
        {error && (
          <Alert
            variant={"destructive"}
            className="my-4 bg-red-400 p-2 text-center text-sm text-white"
          >
            {error}
          </Alert>
        )}
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="Email"
              name="email"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
            />
            <Label className="sr-only" htmlFor="email">
              Password
            </Label>
            <Input
              id="password"
              placeholder="Password"
              name="password"
              type="password"
              autoCapitalize="none"
              autoCorrect="off"
              className="my-1"
            />
            <Input
              id="password-again"
              placeholder="Password Again"
              name="password-again"
              type="password"
              autoCapitalize="none"
              autoCorrect="off"
              className="my-1"
            />
          </div>
          <Button>
            <AsyncButton>Sign up with Email</AsyncButton>
          </Button>
        </div>
      </form>
      {/* <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" type="button" disabled={isLoading}>
        {isLoading ? (
          <Loader className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <KeyRound className="mr-2 h-4 w-4" />
        )}
        Google
      </Button> */}
    </div>
  );
}
