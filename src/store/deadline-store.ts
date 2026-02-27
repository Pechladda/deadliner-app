import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { create } from "zustand";

import { db } from "@/src/firebase";
import { Deadline } from "@/src/models/deadline";

const DEADLINES_COLLECTION = "deadlines";

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
      // Firestore is the source of truth for deadlines.
      const deadlinesRef = collection(db, DEADLINES_COLLECTION);
      const deadlinesQuery = query(deadlinesRef, orderBy("dueAt", "asc"));
      const snapshot = await getDocs(deadlinesQuery);

      if (snapshot.empty) {
        set({ deadlines: [] });
        return;
      }

      const loadedDeadlines: Deadline[] = snapshot.docs.map((snapshotDoc) => {
        const data = snapshotDoc.data();
        const dueAt = String(data.dueAt ?? "");
        const colorStatus =
          data.colorStatus === "red" ||
          data.colorStatus === "yellow" ||
          data.colorStatus === "green"
            ? data.colorStatus
            : computeUrgencyColor(dueAt);

        return {
          id: snapshotDoc.id,
          courseName: String(data.courseName ?? ""),
          assignmentName: String(data.assignmentName ?? ""),
          dueDate: String(data.dueDate ?? ""),
          dueTime: String(data.dueTime ?? ""),
          dueAt,
          colorStatus,
          createdAt: String(data.createdAt ?? ""),
          updatedAt: String(data.updatedAt ?? ""),
        };
      });

      // Keep local sort as a safety net if remote ordering changes.
      set({ deadlines: sortByDueAt(loadedDeadlines) });
    } catch {
      // Fail gracefully so UI remains usable.
      set({ deadlines: [] });
    }
  },
  addDeadline: (input) => {
    void (async () => {
      try {
        const nowIso = new Date().toISOString();
        const colorStatus =
          input.colorStatus ?? computeUrgencyColor(input.dueAt);

        await addDoc(collection(db, DEADLINES_COLLECTION), {
          courseName: input.courseName,
          assignmentName: input.assignmentName,
          dueDate: input.dueDate,
          dueTime: input.dueTime,
          dueAt: input.dueAt,
          colorStatus,
          createdAt: nowIso,
          updatedAt: nowIso,
        });

        await get().loadDeadlines();
      } catch {
        // Ignore network/persistence errors to avoid crashing UI.
      }
    })();
  },
  updateDeadline: (id, input) => {
    void (async () => {
      try {
        const nowIso = new Date().toISOString();
        const payload: Partial<Deadline> = {
          ...input,
          updatedAt: nowIso,
        };

        if (input.dueAt) {
          payload.colorStatus = computeUrgencyColor(input.dueAt);
        }

        await updateDoc(doc(db, DEADLINES_COLLECTION, id), payload);
        await get().loadDeadlines();
      } catch {
        // Ignore network/persistence errors to avoid crashing UI.
      }
    })();
  },
  deleteDeadline: (id) => {
    void (async () => {
      try {
        await deleteDoc(doc(db, DEADLINES_COLLECTION, id));

        set((state) => ({
          deadlines: state.deadlines.filter((deadline) => deadline.id !== id),
          selectedDeadlineId:
            state.selectedDeadlineId === id ? null : state.selectedDeadlineId,
        }));
      } catch {
        // Ignore network/persistence errors to avoid crashing UI.
      }
    })();
  },
  setSelectedId: (id) => set({ selectedDeadlineId: id }),
  selectDeadline: (id) => set({ selectedDeadlineId: id }),
  clearSelectedDeadline: () => set({ selectedDeadlineId: null }),
  getDeadlineById: (id) =>
    get().deadlines.find((deadline) => deadline.id === id),
}));
