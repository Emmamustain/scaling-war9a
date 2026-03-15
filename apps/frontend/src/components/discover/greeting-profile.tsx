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
    <div className="mb-16 mt-24 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="h-[60px] w-[60px] overflow-hidden rounded-full bg-neutral-900 dark:bg-neutral-50">
          <MinidenticonImg
            username={displayName}
            className="scale-75"
          />
        </div>
        <div>
          <h1 className="text-xl font-semibold">
            Welcome Back, {displayName}
            <span className="pl-2 text-2xl">👋</span>
          </h1>
          <p className="opacity-50 text-sm">{quote} — {author}</p>
        </div>
      </div>

      <div className="flex gap-2">
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
