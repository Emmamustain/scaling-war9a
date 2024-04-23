"use client";
import { Button } from "@/components/ui/button";
import {
  addUserToBusiness,
  removeWorkerFromBusiness,
} from "@/database/mutations";
import { toast } from "../ui/use-toast";
import {
  fetchBusinessBySlug,
  getBusinessServicesAndWorkers,
} from "@/database/queries";

interface RemoveWorkerButtonProps {
  user_id: string;
  businessSlug: string;

  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function RemoveWorkerButton({
  user_id,
  businessSlug,

  setIsOpen,
}: RemoveWorkerButtonProps) {
  async function handleForm() {
    await removeWorkerFromBusiness(user_id, businessSlug);
    console.log("first");
    toast({
      title: "Operation success",
      description: "Worker removed successfully!",
      className: "bg-emerald-400",
    });
    setIsOpen(false); //closes the drawer
    setTimeout(() => {
      window.location.reload(); // refreshes the page
    }, 800);
  }
  return (
    <form action={handleForm}>
      <Button type="submit" className="w-full">
        Delete
      </Button>
    </form>
  );
}
