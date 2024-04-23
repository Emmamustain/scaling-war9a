import { Button } from "@/components/ui/button";
import { addUserToBusiness } from "@/database/mutations";
import { toast } from "../ui/use-toast";

interface AddWorkerButtonProps {
  user_id: string;
  businessSlug: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function AddWorkerButton({
  user_id,
  businessSlug,
  setIsOpen,
}: AddWorkerButtonProps) {
  async function handleForm() {
    await addUserToBusiness(user_id, businessSlug);
    console.log("first");
    toast({
      title: "Operation success",
      description: "Worker added successfully!",
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
