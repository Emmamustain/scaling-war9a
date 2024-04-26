import Image from "next/image";
import { ThemeToggle } from "../Molecules/ThemeToggle";
import { Button } from "../ui/button";
import { Bell, LogIn, User } from "lucide-react";
import { NavigationDropDown } from "../Molecules/Navigation";
import SearchBar from "../Molecules/SearchBar";
import Link from "next/link";
import { getCurrentSession } from "@/utils/get-current-session";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { getUserRoleAndBusinessSlug } from "@/database/queries";

const Header = async () => {
  const session = await getCurrentSession();
  const getRoleAndBusinessId = await getUserRoleAndBusinessSlug(
    session.data.session?.user.id ?? null,
  );

  return (
    <div className="flex h-[100px] w-full items-center justify-between border-b-2 border-b-neutral-200">
      <div className="flex">
        <Link href="/" className="duration-200 hover:scale-90">
          <Image
            src="/images/logo-w.svg"
            height={70}
            width={70}
            alt="war9a logo"
            className="hidden dark:block"
          />
          <Image
            src="/images/logo.svg"
            height={70}
            width={70}
            alt="war9a logo"
            className="dark:hidden"
          />
        </Link>
        <nav className="ml-8 flex">
          <NavigationDropDown />
        </nav>
      </div>
      <SearchBar />

      <div className="flex gap-4">
        <Button variant={"outline"}>
          <Bell size={23} />
        </Button>
        {!session.data.session ? (
          <Link href={"/sign-up"}>
            <Button>
              <LogIn size={18} className="mr-2" />
              Sign Up
            </Button>
          </Link>
        ) : (
          <form action={"/auth/sign-out"} method="POST">
            <Button type="submit">
              <LogIn size={18} className="mr-2" />
              Sign Out
            </Button>
          </form>
        )}
        {/* <Button variant={"outline"}>Sign Up</Button> */}
        <ThemeToggle />
        {getRoleAndBusinessId && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon">
                <User className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />

                <span className="sr-only">Profile</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {getRoleAndBusinessId.user_role === "owner" && (
                <DropdownMenuItem>
                  <Link href={"/owner/" + getRoleAndBusinessId.business_slug}>
                    Owner
                  </Link>
                </DropdownMenuItem>
              )}
              {getRoleAndBusinessId.user_role === "manager" && (
                <DropdownMenuItem>
                  <Link href={"/manager/" + getRoleAndBusinessId.business_slug}>
                    Manage
                  </Link>
                </DropdownMenuItem>
              )}
              {getRoleAndBusinessId.user_role === "worker" && (
                <DropdownMenuItem>
                  <Link
                    href={"/employee/" + getRoleAndBusinessId.business_slug}
                  >
                    Worker
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default Header;
