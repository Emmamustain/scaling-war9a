import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Database } from "@/lib/database.types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const supabase = createRouteHandlerClient<Database>({ cookies });

  // console.log(email, password);

  const { error, data: authData } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/sign-in?error=${error.message}`,
      {
        // a 301 status is required to redirect from a POST to a GET route
        status: 301,
      },
    );
  } else {
    const { data: userData, error } = await supabase
      .from("users")
      .select("role")
      .eq("user_id", authData.user.id)
      .single();

    if (error) {
      // console.log(error);
    } else {
      // Set auth cookie with role information
      const role = userData.role as string;
      const cookieStore = cookies();
      cookieStore.set("role", role);
    }
  }

  return NextResponse.redirect(requestUrl.origin + "/discover", {
    // a 301 status is required to redirect from a POST to a GET route
    status: 301,
  });
}
