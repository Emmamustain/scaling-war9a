import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";
import type { Database } from "./lib/database.types";

const excludedPrefixes = [
  "/_next/",
  "/favicon.ico",
  "/images/",
  "/sign-in",
  "/sign-up",
  "/auth",
  "/api",
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });
  const auth = await supabase.auth.getSession();

  // Check auth condition
  if (auth.data.session !== null) {
    // console.log("middleware", auth);
    // Authentication successful, forward request to protected route.
    return res;
  }

  // Auth condition not met, redirect to home page.
  if (
    req.nextUrl.pathname !== "/" &&
    !excludedPrefixes.some((prefix) => req.nextUrl.pathname.startsWith(prefix))
  ) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
}
