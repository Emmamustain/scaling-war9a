"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 min — data stays fresh across tab switches
            gcTime: 1000 * 60 * 10,   // keep cache for 10 min
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnMount: false,     // don't re-fetch if cached data exists
            refetchOnReconnect: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
