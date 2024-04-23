"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";

interface ToastWithTitleProps {
  title: string;
  description: string;
  children?: any;
  type?: "button" | "submit" | "reset";
  className?: ClassValue;
}

export function ToastWithTitle({
  title,
  description,
  children,
  className,
  type,
}: ToastWithTitleProps) {
  const { toast } = useToast();

  return (
    <Button
      type={type ?? "button"}
      className={cn(className)}
      onClick={() => {
        toast({
          title: title,
          description: description,
          className: "bg-emerald-400",
        });
      }}
    >
      {children ?? "Show Toast"}
    </Button>
  );
}
