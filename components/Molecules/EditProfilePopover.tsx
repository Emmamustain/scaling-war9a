import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { modifyUserProfile } from "@/database/mutations";
import { Check, Edit } from "lucide-react";
import { ToastWithTitle } from "./ToastWithTitle";
import { getCurrentSession } from "@/utils/get-current-session";

async function modifyUsername(formData: FormData) {
  "use server";
  const username = String(formData.get("username"));
  const session = await getCurrentSession();
  const result = await modifyUserProfile(
    session.data.session?.user.id ?? "",
    username,
  );
}

export default function EditProfilePopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button>
          <Edit size={20} className="mr-2" /> Edit Profile
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Modify Profile</h4>
            <p className="text-muted-foreground text-sm">
              Set your username here.
            </p>
          </div>
          <div className="relative grid w-full gap-2">
            <form
              className="relative grid w-full grid-cols-3 items-center gap-4"
              action={modifyUsername}
            >
              <Label htmlFor="width">Username</Label>
              <Input
                id="width"
                placeholder="Username"
                name="username"
                className="col-span-2 h-8"
              />
              <ToastWithTitle
                title="Profile Modification"
                description="Changes will appear on the next page refresh. Press ⌘R."
                className="col-span-3"
                type="submit"
              >
                <Check size={20} className="mr-2" /> Confirm Edit
              </ToastWithTitle>
            </form>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
