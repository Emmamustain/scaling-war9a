import { create } from "zustand";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";

type QueueEntry = {
  entryId: string;
  serviceId: string;
  position: number;
  estimatedWaitMinutes: number;
  status: string;
};

type QueueState = {
  entries: Map<string, QueueEntry>;
  isConnected: boolean;
  subscribedServices: Set<string>;
  connect: () => void;
  disconnect: () => void;
  subscribeToService: (serviceId: string) => void;
  subscribeToEntry: (entryId: string) => void;
  unsubscribeFromService: (serviceId: string) => void;
  getEntry: (entryId: string) => QueueEntry | undefined;
};

export const useQueueStore = create<QueueState>((set, get) => ({
  entries: new Map(),
  isConnected: false,
  subscribedServices: new Set(),

  connect: () => {
    const socket = connectSocket();

    socket.on("connect", () => {
      set({ isConnected: true });
      get().subscribedServices.forEach((serviceId) => {
        socket.emit("subscribe:service", { serviceId });
      });
    });

    socket.on("disconnect", () => {
      set({ isConnected: false });
    });

    socket.on("queue:position-update", (data: QueueEntry) => {
      set((state) => {
        const entries = new Map(state.entries);
        entries.set(data.entryId, data);
        return { entries };
      });
    });

    socket.on("queue:called", (data: { entryId: string; guichetName: string }) => {
      set((state) => {
        const entries = new Map(state.entries);
        const entry = entries.get(data.entryId);
        if (entry) {
          entries.set(data.entryId, { ...entry, status: "called" });
        }
        return { entries };
      });
    });
  },

  disconnect: () => {
    const socket = getSocket();
    socket.off("queue:position-update");
    socket.off("queue:called");
    disconnectSocket();
    set({ isConnected: false });
  },

  subscribeToService: (serviceId) => {
    const socket = getSocket();
    socket.emit("subscribe:service", { serviceId });
    set((state) => {
      const subscribedServices = new Set(state.subscribedServices);
      subscribedServices.add(serviceId);
      return { subscribedServices };
    });
  },

  subscribeToEntry: (entryId) => {
    const socket = getSocket();
    socket.emit("subscribe:entry", { entryId });
  },

  unsubscribeFromService: (serviceId) => {
    const socket = getSocket();
    socket.emit("unsubscribe:service", { serviceId });
    set((state) => {
      const subscribedServices = new Set(state.subscribedServices);
      subscribedServices.delete(serviceId);
      return { subscribedServices };
    });
  },

  getEntry: (entryId) => get().entries.get(entryId),
}));
