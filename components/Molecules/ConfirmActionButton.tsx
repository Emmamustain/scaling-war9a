"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeftToLine } from "lucide-react";
import type { ReactElement } from "react";

interface ConfirmActionButtonProps {
  buttonText?: ReactElement | string;
  title?: string;
  description?: string;
  cancel?: string;
  confirm?: string;
  onConfirm?: () => void;
}

export default function ConfirmActionButton({
  buttonText = "Open Alert",
  title = "Are you absolutely sure?",
  description = "This action cannot be undone.",
  cancel = "Cancel",
  confirm = "Confirm",
  onConfirm = () => console.log("Pressed Confirm!"),
}: ConfirmActionButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="mt-4 px-8 py-6">{buttonText}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancel}</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm()}>
            {confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
