import { Button } from "@/components/ui/button";
import { addUserToBusiness, assignWorkerToService } from "@/database/mutations";
import { toast } from "../ui/use-toast";

interface AssignWorkerButtonProps {
  worker_id: string;
  businessSlug: string;
  serviceId: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function AssignorkerButton({
  worker_id,
  businessSlug,
  serviceId,
  setIsOpen,
}: AssignWorkerButtonProps) {
  async function handleForm() {
    const additionResult = await assignWorkerToService(worker_id, serviceId);
    if (additionResult != false) {
      toast({
        title: "Operation success",
        description: "Worker assigned successfully!",
        className: "bg-emerald-400",
      });
    } else {
      toast({
        title: "Operation Failed",
        description: "Worker is already assigned to a service!",
        className: "bg-red-400",
      });
    }

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
