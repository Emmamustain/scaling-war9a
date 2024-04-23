import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
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
  const supabase = createRouteHandlerClient<Database>({ cookies });

  if (password !== passwordAgain) {
    return NextResponse.redirect(
      `${requestUrl.origin}/sign-up?error=Passwords Did Not Match`,
      {
        // a 301 status is required to redirect from a POST to a GET route
        status: 301,
      },
    );
  }

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${requestUrl.origin}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/sign-up?error=Could not authenticate user?detailed=${error}`,
      {
        // a 301 status is required to redirect from a POST to a GET route
        status: 301,
      },
    );
  }

  // console.log(data.user?.id);

  if (data.user?.id !== null && data.user?.id !== undefined) {
    const result = addUser(data.user?.id, email.split("@")[0]);
  }

  return NextResponse.redirect(
    `${requestUrl.origin}/sign-in?message=Check email to continue sign in process`,
    {
      // a 301 status is required to redirect from a POST to a GET route
      status: 301,
    },
  );
}
