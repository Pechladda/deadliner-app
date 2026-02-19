import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { Deadline } from "@/src/models/Deadline";

const DEADLINES_STORAGE_KEY = "deadliner:deadlines";

export function computeUrgencyColor(dueAt: string): "red" | "yellow" | "green" {
  const dueMs = new Date(dueAt).getTime();

  if (Number.isNaN(dueMs)) {
    return "green";
  }

  const hoursLeft = (dueMs - Date.now()) / (1000 * 60 * 60);

  if (hoursLeft <= 24) {
    return "red";
  }

  if (hoursLeft <= 72) {
    return "yellow";
  }

  return "green";
}

async function saveDeadlinesToStorage(deadlines: Deadline[]): Promise<void> {
  try {
    await AsyncStorage.setItem(
      DEADLINES_STORAGE_KEY,
      JSON.stringify(deadlines),
    );
  } catch {
    // keep app usable even if persistence fails
  }
}

function sortByDueAt(deadlines: Deadline[]): Deadline[] {
  return [...deadlines].sort((a, b) => {
    const aMs = new Date(a.dueAt).getTime();
    const bMs = new Date(b.dueAt).getTime();

    const safeA = Number.isNaN(aMs) ? Number.POSITIVE_INFINITY : aMs;
    const safeB = Number.isNaN(bMs) ? Number.POSITIVE_INFINITY : bMs;

    return safeA - safeB;
  });
}

interface DeadlineState {
  deadlines: Deadline[];
  selectedDeadlineId: string | null;
  loadDeadlines: () => Promise<void>;
  addDeadline: (deadline: Omit<Deadline, "id" | "createdAt">) => void;
  deleteDeadline: (id: string) => void;
  setSelectedId: (id: string | null) => void;

  updateDeadline: (id: string, input: Partial<Deadline>) => void;
  selectDeadline: (id: string) => void;
  clearSelectedDeadline: () => void;
  getDeadlineById: (id: string) => Deadline | undefined;
}

export const useDeadlineStore = create<DeadlineState>((set, get) => ({
  deadlines: [],
  selectedDeadlineId: null,
  loadDeadlines: async () => {
    try {
      const raw = await AsyncStorage.getItem(DEADLINES_STORAGE_KEY);
      if (!raw) {
        set({ deadlines: [] });
        return;
      }

      const parsed = JSON.parse(raw) as Deadline[];
      const normalized = Array.isArray(parsed) ? sortByDueAt(parsed) : [];
      set({ deadlines: normalized });
    } catch {
      set({ deadlines: [] });
    }
  },
  addDeadline: (input) => {
    const nowIso = new Date().toISOString();
    const created: Deadline = {
      ...input,
      id: String(Date.now()),
      createdAt: nowIso,
      updatedAt: input.updatedAt ?? nowIso,
      colorStatus: computeUrgencyColor(input.dueAt),
    };

    const nextDeadlines = sortByDueAt([...get().deadlines, created]);
    set({ deadlines: nextDeadlines });
    void saveDeadlinesToStorage(nextDeadlines);
  },
  updateDeadline: (id, input) => {
    const nextDeadlines = sortByDueAt(
      get().deadlines.map((deadline) => {
        if (deadline.id !== id) {
          return deadline;
        }

        const nextDueAt = input.dueAt ?? deadline.dueAt;

        return {
          ...deadline,
          ...input,
          dueAt: nextDueAt,
          colorStatus: computeUrgencyColor(nextDueAt),
          updatedAt: new Date().toISOString(),
        };
      }),
    );

    set({ deadlines: nextDeadlines });
    void saveDeadlinesToStorage(nextDeadlines);
  },
  deleteDeadline: (id) => {
    const nextDeadlines = get().deadlines.filter(
      (deadline) => deadline.id !== id,
    );
    void saveDeadlinesToStorage(nextDeadlines);
    set((state) => ({
      deadlines: nextDeadlines,
      selectedDeadlineId:
        state.selectedDeadlineId === id ? null : state.selectedDeadlineId,
    }));
  },
  setSelectedId: (id) => set({ selectedDeadlineId: id }),
  selectDeadline: (id) => set({ selectedDeadlineId: id }),
  clearSelectedDeadline: () => set({ selectedDeadlineId: null }),
  getDeadlineById: (id) =>
    get().deadlines.find((deadline) => deadline.id === id),
}));
