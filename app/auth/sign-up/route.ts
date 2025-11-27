import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/database.types";
import { addUser } from "@/database/mutations";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const passwordAgain = String(formData.get("password-again"));

  if (password !== passwordAgain) {
    return NextResponse.redirect(
      `${requestUrl.origin}/sign-up?error=Passwords Did Not Match`,
      {
        status: 301,
      },
    );
  }

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

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${requestUrl.origin}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/sign-up?error=Could not authenticate user&detailed=${error.message}`,
      {
        status: 301,
      },
    );
  }

  if (data.user?.id) {
    await addUser(data.user.id, email.split("@")[0]);
  }

  const response = NextResponse.redirect(
    `${requestUrl.origin}/sign-in?message=Check email to continue sign in process`,
    {
      status: 301,
    },
  );

  // Apply all cookies
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options || {});
  });

  return response;
}
