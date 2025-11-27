"use client";

import { createClient } from "@/utils/supabase-client";
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import type { Database } from "@/lib/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

type SupabaseContext = {
  supabase: SupabaseClient<Database>;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [supabase] = useState(() => createClient());

  return (
    <Context.Provider value={{ supabase }}>
      <>{children}</>
    </Context.Provider>
  );
}

export const useSupabase = () => {
  let context = useContext(Context);
  if (context === undefined) {
    throw new Error("useSupabase must be inside SupabaseProvider.");
  } else {
    return context;
  }
};
