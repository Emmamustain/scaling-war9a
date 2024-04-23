"use client";

import { ReactElement, useState } from "react";
import { Button } from "../ui/button";
import { Loader } from "lucide-react";

interface AsyncButtonProps {
  children?: ReactElement | string;
}

export default function AsyncButton({ children }: AsyncButtonProps) {
  const [isLoading, SetIsLoading] = useState(false);
  return (
    <div
      onClick={() => SetIsLoading(true)}
      className="flex items-center justify-center"
    >
      {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
      {children ?? "Sign in with Email"}
    </div>
  );
}
