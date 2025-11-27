import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Database } from "@/lib/database.types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const cookieStore = await cookies();

  // Collect cookies that need to be set
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

  const { error, data: authData } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/sign-in?error=${encodeURIComponent(error.message)}`,
      {
        status: 301,
      },
    );
  }

  // Get user role after successful login
  let role: string | null = null;
  if (authData?.user) {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("user_id", authData.user.id)
      .single<{ role: string }>();

    if (!userError && userData) {
      role = userData.role;
    }
  }

  // Create response with all collected cookies
  const redirectUrl = new URL("/discover", requestUrl.origin);
  const response = NextResponse.redirect(redirectUrl, {
    status: 301,
  });

  // Set all Supabase auth cookies
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options || {});
  });

  // Set role cookie if available
  if (role) {
    response.cookies.set("role", role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}
