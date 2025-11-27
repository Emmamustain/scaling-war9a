import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/database.types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const cookieStore = await cookies();

  const cookiesToSet: Array<{
    name: string;
    value: string;
    options?: any;
  }> = [];

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookiesToSet.push({ name, value, options });
        },
        remove(name: string, options: any) {
          cookiesToSet.push({ name, value: "", options });
        },
      },
    },
  );

  await supabase.auth.signOut();

  const redirectUrl = new URL("/", requestUrl.origin);
  const response = NextResponse.redirect(redirectUrl, {
    status: 301,
  });

  // Apply all cookies
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options || {});
  });

  // Clear role cookie
  response.cookies.delete("role");

  return response;
}
