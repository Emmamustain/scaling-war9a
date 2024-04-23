import { Database } from "@/lib/database.types";
import { cookies } from "next/headers";
import { createClient } from "./supabase-server";

export async function getCurrentSession() {
  "use server";
  const supabaseServerClient = createClient();
  const userData = await supabaseServerClient.auth.getSession();
  return userData;
}
