"use client";

import MinidenticonImg from "@/components/atoms/minidenticon-img";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";
import { History } from "lucide-react";
import Link from "next/link";

const QUOTES = [
  { quote: "Time is the wisest counselor of all", author: "Pericles" },
  { quote: "Lost time is never found again", author: "Benjamin Franklin" },
  { quote: "The secret of getting ahead is getting started", author: "Mark Twain" },
  { quote: "Well begun is half done", author: "Aristotle" },
  { quote: "Patience is bitter, but its fruit is sweet", author: "Aristotle" },
];

function getRandomQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

export default function GreetingProfile() {
  const { user, isAuthenticated } = useAuthStore();
  const { quote, author } = getRandomQuote();
  const displayName = user?.displayName ?? user?.username ?? "New Comer";

  return (
    <div className="mb-6 mt-4 flex items-center justify-between md:mb-16 md:mt-24">
      <div className="flex items-center gap-3">
        <div className="h-[48px] w-[48px] overflow-hidden rounded-full md:h-[60px] md:w-[60px]">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <MinidenticonImg username={displayName} />
          )}
        </div>
        <div>
          <h1 className="text-lg font-semibold md:text-xl">
            Welcome Back, {displayName}
            <span className="pl-2 text-xl md:text-2xl">👋</span>
          </h1>
          <p className="hidden text-sm opacity-50 md:block">{quote} — {author}</p>
        </div>
      </div>

      <div className="hidden gap-2 md:flex">
        <Button asChild>
          <Link href="/history">
            <History size={20} className="mr-2" />
            History
          </Link>
        </Button>
      </div>
    </div>
  );
}
