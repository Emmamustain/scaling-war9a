"use client";

import { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { useSupabase } from "./supabase-provider";

type UserData = {
  user_id: string;
  username: string;
  role: string | null;
  city: string;
  longitude_user: string | null;
  latitude_user: string | null;
  created_at: string;
  updated_at: string;
};

interface ContextI {
  user: UserData | null | undefined;
  error: any;
  isLoading: boolean;
  mutate: any;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<string | null>;
}

const Context = createContext<ContextI>({
  user: null,
  error: null,
  isLoading: true,
  mutate: null,
  signOut: async () => {},
  signInWithEmail: async (email: string, password: string) => null,
});

export default function SupabaseAuthProvider({
  serverSession,
  children,
}: {
  serverSession?: Session | null;
  children: React.ReactNode;
}) {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(serverSession ?? null);

  const fetchUser = async (): Promise<UserData | null> => {
    if (!session?.user?.id) return null;

    const { data, error } = await supabase
      .from("users")
      .select(
        "user_id, username, role, city, longitude_user, latitude_user, created_at, updated_at",
      )
      .eq("user_id", session.user.id)
      .single<UserData>();

    // console.log("Fetched user data:", data, "Error:", error);

    if (error) throw error;
    return data;
  };

  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR(session ? ["user", session.user.id] : null, fetchUser);

  useEffect(() => {
    // console.log("Auth state - user:", user, "isLoading:", isLoading);
  }, [user, isLoading]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      // console.log("Initial session:", session);
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // console.log("Auth state changed:", event, session);
      setSession(session);
      if (session?.access_token !== serverSession?.access_token) {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, serverSession?.access_token]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return error.message;
    }

    return null;
  };

  const exposed: ContextI = {
    user,
    error,
    isLoading,
    mutate,
    signOut,
    signInWithEmail,
  };

  return <Context.Provider value={exposed}>{children}</Context.Provider>;
}

export const useAuth = () => {
  let context = useContext(Context);
  if (context === undefined) {
    throw new Error("useAuth must be used inside SupabaseAuthProvider");
  } else {
    return context;
  }
};
