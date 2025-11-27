import { createClient } from "./supabase-server";

export async function getCurrentSession() {
  const supabase = await createClient();
  return await supabase.auth.getSession();
}
