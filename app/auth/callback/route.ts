import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/discover";

  // Create response first so we can set cookies on it
  const redirectUrl = new URL(next, requestUrl.origin);
  let response = NextResponse.redirect(redirectUrl);

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            // Set cookies on the response object - preserve Supabase's exact options
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options || {});
            });
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        `${requestUrl.origin}/sign-in?error=${encodeURIComponent(error.message)}`,
      );
    }
  }

  return response;
}
