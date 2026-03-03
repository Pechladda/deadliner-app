import AsyncStorage from "@react-native-async-storage/async-storage";
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
import {
  cancelAllNotifications,
  cancelNotification,
  hasNotificationPermission,
  requestPermission,
  scheduleDeadlineNotification,
} from "@/src/services/notification-service";

const deadlinesCollection = "deadlines";
const NOTIFICATIONS_ENABLED_STORAGE_KEY = "@deadliner/notifications-enabled";

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
  completedDeadlines: Deadline[];
  selectedDeadlineId: string | null;
  notificationsEnabled: boolean;
  hasNotificationPermission: boolean;
  hydrateNotificationsSetting: () => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  loadDeadlines: () => Promise<void>;
  addDeadline: (deadline: Omit<Deadline, "id" | "createdAt">) => void;
  deleteDeadline: (id: string) => void;
  completeDeadline: (id: string) => void;
  undoCompletedDeadline: (id: string) => void;
  deleteCompletedDeadline: (id: string) => void;
  setSelectedId: (id: string | null) => void;

  updateDeadline: (id: string, input: Partial<Deadline>) => void;
  selectDeadline: (id: string) => void;
  clearSelectedDeadline: () => void;
  getDeadlineById: (id: string) => Deadline | undefined;
}

export const useDeadlineStore = create<DeadlineState>((set, get) => ({
  deadlines: [],
  completedDeadlines: [],
  selectedDeadlineId: null,
  notificationsEnabled: true,
  hasNotificationPermission: true,
  hydrateNotificationsSetting: async () => {
    try {
      const storedValue = await AsyncStorage.getItem(
        NOTIFICATIONS_ENABLED_STORAGE_KEY,
      );

      const notificationsEnabled = storedValue !== "false";
      set({ notificationsEnabled });

      if (!notificationsEnabled) {
        set({ hasNotificationPermission: true });
        return;
      }

      const granted = await hasNotificationPermission();
      set({ hasNotificationPermission: granted });
    } catch {
      set({ notificationsEnabled: true, hasNotificationPermission: false });
    }
  },
  setNotificationsEnabled: async (enabled) => {
    set({ notificationsEnabled: enabled });

    try {
      await AsyncStorage.setItem(
        NOTIFICATIONS_ENABLED_STORAGE_KEY,
        String(enabled),
      );
    } catch {
      // Ignore local persistence errors to avoid crashing UI.
    }

    if (!enabled) {
      try {
        await cancelAllNotifications();
      } catch {
        // Ignore cancellation errors.
      }

      set((state) => ({
        deadlines: state.deadlines.map((deadline) => ({
          ...deadline,
          notificationId: undefined,
        })),
        completedDeadlines: state.completedDeadlines.map((deadline) => ({
          ...deadline,
          notificationId: undefined,
        })),
        hasNotificationPermission: true,
      }));

      return;
    }

    const granted = await requestPermission();
    set({ hasNotificationPermission: granted });
  },
  loadDeadlines: async () => {
    try {
      // Firestore is the source of truth for deadlines.
      const deadlinesRef = collection(db, deadlinesCollection);
      const deadlinesQuery = query(deadlinesRef, orderBy("dueAt", "asc"));
      const snapshot = await getDocs(deadlinesQuery);

      if (snapshot.empty) {
        set({ deadlines: [], completedDeadlines: [] });
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
          reminder:
            data.reminder === "5m" ||
            data.reminder === "30m" ||
            data.reminder === "1h" ||
            data.reminder === "1d"
              ? data.reminder
              : null,
          notificationId:
            typeof data.notificationId === "string" && data.notificationId
              ? data.notificationId
              : undefined,
          completedAt:
            typeof data.completedAt === "string" && data.completedAt
              ? data.completedAt
              : undefined,
        };
      });

      const activeDeadlines = loadedDeadlines.filter(
        (deadline) => !deadline.completedAt,
      );
      const doneDeadlines = loadedDeadlines
        .filter((deadline) => Boolean(deadline.completedAt))
        .sort((a, b) => {
          const aMs = new Date(a.completedAt ?? "").getTime();
          const bMs = new Date(b.completedAt ?? "").getTime();

          const safeA = Number.isNaN(aMs) ? Number.NEGATIVE_INFINITY : aMs;
          const safeB = Number.isNaN(bMs) ? Number.NEGATIVE_INFINITY : bMs;

          return safeB - safeA;
        });

      // Keep local sort as a safety net if remote ordering changes.
      set({
        deadlines: sortByDueAt(activeDeadlines),
        completedDeadlines: doneDeadlines,
      });
    } catch {
      // Fail gracefully so UI remains usable.
      set({ deadlines: [], completedDeadlines: [] });
    }
  },
  addDeadline: (input) => {
    void (async () => {
      try {
        const nowIso = new Date().toISOString();
        const colorStatus =
          input.colorStatus ?? computeUrgencyColor(input.dueAt);
        const reminder = input.reminder ?? null;
        let notificationId: string | undefined;

        if (
          get().notificationsEnabled &&
          get().hasNotificationPermission &&
          reminder
        ) {
          const scheduledId = await scheduleDeadlineNotification({
            assignmentName: input.assignmentName,
            dueAt: input.dueAt,
            reminder,
          });
          notificationId = scheduledId ?? undefined;
        }

        await addDoc(collection(db, deadlinesCollection), {
          courseName: input.courseName,
          assignmentName: input.assignmentName,
          dueDate: input.dueDate,
          dueTime: input.dueTime,
          dueAt: input.dueAt,
          reminder,
          notificationId: notificationId ?? null,
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
        const existing =
          get().deadlines.find((deadline) => deadline.id === id) ??
          get().completedDeadlines.find((deadline) => deadline.id === id);

        if (!existing) {
          return;
        }

        const nowIso = new Date().toISOString();
        const mergedReminder = input.reminder ?? existing.reminder ?? null;
        const mergedDueAt = input.dueAt ?? existing.dueAt;

        if (existing.notificationId) {
          try {
            await cancelNotification(existing.notificationId);
          } catch {
            // Ignore cancellation errors.
          }
        }

        let notificationId: string | undefined;
        if (
          get().notificationsEnabled &&
          get().hasNotificationPermission &&
          !existing.completedAt &&
          mergedReminder
        ) {
          notificationId =
            (await scheduleDeadlineNotification({
              assignmentName: input.assignmentName ?? existing.assignmentName,
              dueAt: mergedDueAt,
              reminder: mergedReminder,
            })) ?? undefined;
        }

        const payload: Partial<Deadline> = {
          ...input,
          reminder: mergedReminder,
          notificationId,
          updatedAt: nowIso,
        };

        if (input.dueAt) {
          payload.colorStatus = computeUrgencyColor(input.dueAt);
        }

        await updateDoc(doc(db, deadlinesCollection, id), payload);
        await get().loadDeadlines();
      } catch {
        // Ignore network/persistence errors to avoid crashing UI.
      }
    })();
  },
  deleteDeadline: (id) => {
    void (async () => {
      try {
        const existing =
          get().deadlines.find((deadline) => deadline.id === id) ??
          get().completedDeadlines.find((deadline) => deadline.id === id);

        if (existing?.notificationId) {
          try {
            await cancelNotification(existing.notificationId);
          } catch {
            // Ignore cancellation errors.
          }
        }

        await deleteDoc(doc(db, deadlinesCollection, id));

        set((state) => ({
          deadlines: state.deadlines.filter((deadline) => deadline.id !== id),
          completedDeadlines: state.completedDeadlines.filter(
            (deadline) => deadline.id !== id,
          ),
          selectedDeadlineId:
            state.selectedDeadlineId === id ? null : state.selectedDeadlineId,
        }));
      } catch {
        // Ignore network/persistence errors to avoid crashing UI.
      }
    })();
  },
  completeDeadline: (id) => {
    const deadlineToComplete = get().deadlines.find(
      (deadline) => deadline.id === id,
    );

    if (!deadlineToComplete) {
      return;
    }

    if (deadlineToComplete.notificationId) {
      void cancelNotification(deadlineToComplete.notificationId).catch(() => {
        // Ignore cancellation errors.
      });
    }

    const completedAtIso = new Date().toISOString();
    const completedDeadline: Deadline = {
      ...deadlineToComplete,
      notificationId: undefined,
      completedAt: completedAtIso,
      updatedAt: completedAtIso,
    };

    set((state) => ({
      deadlines: state.deadlines.filter((deadline) => deadline.id !== id),
      completedDeadlines: [completedDeadline, ...state.completedDeadlines],
      selectedDeadlineId:
        state.selectedDeadlineId === id ? null : state.selectedDeadlineId,
    }));

    void (async () => {
      try {
        await updateDoc(doc(db, deadlinesCollection, id), {
          notificationId: null,
          completedAt: completedAtIso,
          updatedAt: completedAtIso,
        });
      } catch {
        set((state) => ({
          deadlines: sortByDueAt([...state.deadlines, deadlineToComplete]),
          completedDeadlines: state.completedDeadlines.filter(
            (deadline) => deadline.id !== id,
          ),
          selectedDeadlineId:
            state.selectedDeadlineId === id ? id : state.selectedDeadlineId,
        }));
      }
    })();
  },
  undoCompletedDeadline: (id) => {
    const deadlineToRestore = get().completedDeadlines.find(
      (deadline) => deadline.id === id,
    );

    if (!deadlineToRestore) {
      return;
    }

    const restoredAtIso = new Date().toISOString();
    const restoredReminder = deadlineToRestore.reminder ?? null;
    let restoredNotificationId: string | undefined;

    const restoredDeadline: Deadline = {
      ...deadlineToRestore,
      notificationId: undefined,
      completedAt: undefined,
      updatedAt: restoredAtIso,
    };

    set((state) => ({
      deadlines: sortByDueAt([...state.deadlines, restoredDeadline]),
      completedDeadlines: state.completedDeadlines.filter(
        (deadline) => deadline.id !== id,
      ),
      selectedDeadlineId:
        state.selectedDeadlineId === id ? null : state.selectedDeadlineId,
    }));

    void (async () => {
      try {
        if (
          get().notificationsEnabled &&
          get().hasNotificationPermission &&
          restoredReminder
        ) {
          restoredNotificationId =
            (await scheduleDeadlineNotification({
              assignmentName: restoredDeadline.assignmentName,
              dueAt: restoredDeadline.dueAt,
              reminder: restoredReminder,
            })) ?? undefined;
        }

        set((state) => ({
          deadlines: sortByDueAt(
            state.deadlines.map((deadline) =>
              deadline.id === id
                ? { ...deadline, notificationId: restoredNotificationId }
                : deadline,
            ),
          ),
        }));

        await updateDoc(doc(db, deadlinesCollection, id), {
          completedAt: null,
          notificationId: restoredNotificationId ?? null,
          updatedAt: restoredAtIso,
        });
      } catch {
        set((state) => ({
          deadlines: state.deadlines.filter((deadline) => deadline.id !== id),
          completedDeadlines: [deadlineToRestore, ...state.completedDeadlines],
          selectedDeadlineId:
            state.selectedDeadlineId === id ? id : state.selectedDeadlineId,
        }));
      }
    })();
  },
  deleteCompletedDeadline: (id) => {
    void (async () => {
      try {
        const existing = get().completedDeadlines.find(
          (deadline) => deadline.id === id,
        );

        if (existing?.notificationId) {
          try {
            await cancelNotification(existing.notificationId);
          } catch {
            // Ignore cancellation errors.
          }
        }

        await deleteDoc(doc(db, deadlinesCollection, id));

        set((state) => ({
          completedDeadlines: state.completedDeadlines.filter(
            (deadline) => deadline.id !== id,
          ),
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
