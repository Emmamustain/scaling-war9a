import { createServerClient } from "@supabase/ssr";
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
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({ name, value, ...options });
          res = NextResponse.next({
            request: { headers: req.headers },
          });
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          req.cookies.set({ name, value: "", ...options });
          res = NextResponse.next({
            request: { headers: req.headers },
          });
          res.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return res;
  }

  if (
    req.nextUrl.pathname !== "/" &&
    !excludedPrefixes.some((prefix) => req.nextUrl.pathname.startsWith(prefix))
  ) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}
