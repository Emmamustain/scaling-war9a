"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch";
import { useAuthStore } from "@/stores/auth.store";

export type MyQueueEntry = {
  id: string;
  serviceId: string;
  serviceName: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  position: number;
  status: string;
  estimatedWaitMinutes: number;
};

export function useMyQueueEntries() {
  const { isAuthenticated, user } = useAuthStore();

  const { data = [], ...rest } = useQuery({
    queryKey: ["queue", "my-entries", user?.id],
    queryFn: () => fetchApi<MyQueueEntry[]>("/queue/my-entries"),
    enabled: isAuthenticated && !!user?.id,
  });

  return { entries: data ?? [], ...rest };
}
