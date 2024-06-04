import Image from "next/image";
import { ThemeToggle } from "../Molecules/ThemeToggle";
import { Button } from "../ui/button";
import { Bell, LogIn, Menu, User } from "lucide-react";
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
import {
  getNotification,
  getUserRoleAndBusinessSlug,
} from "@/database/queries";
import BellButton from "./BellButton";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

export type Notifications = UnwrapPromise<ReturnType<typeof getNotification>>;

const Header = async () => {
  const session = await getCurrentSession();
  const getRoleAndBusinessId = await getUserRoleAndBusinessSlug(
    session.data.session?.user.id ?? null,
  );
  const userId = session.data.session?.user.id as string; // Assuming session.data.session?.user.id is always a string
  const notifications = await getNotification(userId);
  console.log("Notifications", notifications);

  return (
    <>
      <div className="hidden h-[100px] w-full items-center justify-between border-b-2 border-b-neutral-200 md:flex">
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
          {/* <Button variant={"outline"}>
          <Bell size={23} />
        </Button> */}
          {session.data.session?.user && (
            <BellButton notifications={notifications} user_id={userId} />
          )}
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
                    <Link
                      href={"/manager/" + getRoleAndBusinessId.business_slug}
                    >
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

      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button
            variant="default"
            size="icon"
            className="absolute right-4 top-4 h-fit w-fit shrink-0 border-2 border-gray-700 bg-black p-[10px] md:hidden"
          >
            <Menu className="h-6 w-6" color="white" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          

          <nav className="grid gap-6 text-lg font-medium">
            <NavigationDropDown />
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
          </nav>
          
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Header;
