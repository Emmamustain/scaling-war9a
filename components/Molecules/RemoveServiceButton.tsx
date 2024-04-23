import { Button } from "@/components/ui/button";
import {
  addUserToBusiness,
  removeServiceFromBusiness,
} from "@/database/mutations";
import { toast } from "../ui/use-toast";

interface RemoveServiceButtonProps {
  service_id: string;
  businessSlug: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function RemoveServiceButton({
  service_id,
  businessSlug,
  setIsOpen,
}: RemoveServiceButtonProps) {
  async function handleForm() {
    await removeServiceFromBusiness(service_id, businessSlug);
    console.log("first");
    toast({
      title: "Operation success",
      description: "Service removed successfully!",
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
        Submit
      </Button>
    </form>
  );
}
