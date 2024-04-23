import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import MinidenticonImg from "../Atoms/random-pfp";
import custompfpchecker from "@/utils/custom-pfp-checker";
import getRandomQuote from "@/utils/get-quote";
import { getUserData } from "@/database/queries";
import EditProfilePopover from "../Molecules/EditProfilePopover";

export default async function GreetingProfile() {
  const userData = await getUserData();
  const { quote, author } = getRandomQuote();

  return (
    <div className="mb-16 mt-24 flex items-center justify-between">
      {/* Profile Pic + Greeting */}
      <div className=" flex items-center gap-4">
        <div className="h-[60px] w-[60px] overflow-hidden rounded-full bg-neutral-900 dark:bg-neutral-50">
          <MinidenticonImg
            username={custompfpchecker(userData?.username ?? "random")}
            className="scale-75"
          />
        </div>
        <div>
          <h1 className="text-xl font-semibold">
            Welcome Back, {userData?.username ?? "New Comer"}
            <span className="pl-2 text-2xl">👋</span>
          </h1>
          <p className="opacity-50">{quote + "." + author}</p>
        </div>
      </div>
      {/* CTA buttons */}
      <div className="flex gap-2">
        <Button>
          <History size={20} className="mr-2" /> History
        </Button>

        <EditProfilePopover />
      </div>
    </div>
  );
}
