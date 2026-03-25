import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import {
  computeColorStatus,
  getRemainingMs,
  sanitizeDeadlineInput,
  sortDeadlinesByDueAt,
  validateDeadlineInput,
} from "@/src/core/utils";
import { Deadline } from "@/src/models/deadline";
import {
  createDeadline,
  deleteAllDeadlines,
  deleteDeadlineDoc,
  fetchDeadlines,
  updateDeadlineDoc,
} from "@/src/services/deadline-service";
import {
  cancelAllNotifications,
  cancelNotification,
  hasNotificationPermission,
  requestPermission,
  scheduleDeadlineNotification,
} from "@/src/services/notification-service";

const NOTIFICATIONS_ENABLED_STORAGE_KEY = "@deadliner/notifications-enabled";

export function computeUrgencyColor(dueAt: string): "red" | "yellow" | "green" {
  return computeColorStatus(getRemainingMs(dueAt));
}

function sortByDueAt(deadlines: Deadline[]): Deadline[] {
  return sortDeadlinesByDueAt(deadlines);
}

interface DeadlineState {
  deadlines: Deadline[];
  completedDeadlines: Deadline[];
  recentlyDeletedDeadline: Deadline | null;
  isLoadingDeadlines: boolean;
  selectedDeadlineId: string | null;
  notificationsEnabled: boolean;
  hasNotificationPermission: boolean;
  hydrateNotificationsSetting: () => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  loadDeadlines: () => Promise<void>;
  addDeadline: (
    deadline: Omit<Deadline, "id" | "createdAt">,
  ) => Promise<boolean>;
  deleteDeadline: (id: string) => Promise<boolean>;
  undoDeleteDeadline: () => Promise<boolean>;
  completeDeadline: (id: string) => void;
  undoCompletedDeadline: (id: string) => void;
  deleteCompletedDeadline: (id: string) => void;
  clearAllData: () => Promise<boolean>;
  setSelectedId: (id: string | null) => void;

  updateDeadline: (id: string, input: Partial<Deadline>) => Promise<boolean>;
  selectDeadline: (id: string) => void;
  clearSelectedDeadline: () => void;
  getDeadlineById: (id: string) => Deadline | undefined;
}

export const useDeadlineStore = create<DeadlineState>((set, get) => ({
  deadlines: [],
  completedDeadlines: [],
  recentlyDeletedDeadline: null,
  isLoadingDeadlines: false,
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
        recentlyDeletedDeadline: null,
      }));

      return;
    }

    const granted = await requestPermission();
    set({ hasNotificationPermission: granted });
  },
  loadDeadlines: async () => {
    set({ isLoadingDeadlines: true });

    try {
      const loadedDeadlines = await fetchDeadlines();

      if (!loadedDeadlines.length) {
        set({
          deadlines: [],
          completedDeadlines: [],
          isLoadingDeadlines: false,
        });
        return;
      }

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
        isLoadingDeadlines: false,
      });
    } catch {
      // Fail gracefully so UI remains usable.
      set({ deadlines: [], completedDeadlines: [], isLoadingDeadlines: false });
    }
  },
  addDeadline: async (input) => {
    try {
      const sanitizedInput = sanitizeDeadlineInput(input);
      if (!validateDeadlineInput(sanitizedInput)) {
        return false;
      }

      const nowIso = new Date().toISOString();
      const colorStatus =
        sanitizedInput.colorStatus ?? computeUrgencyColor(sanitizedInput.dueAt);
      const reminder = sanitizedInput.reminder ?? null;
      let notificationId: string | undefined;

      if (
        get().notificationsEnabled &&
        get().hasNotificationPermission &&
        reminder
      ) {
        const scheduledId = await scheduleDeadlineNotification({
          assignmentName: sanitizedInput.assignmentName,
          dueAt: sanitizedInput.dueAt,
          reminder,
        });
        notificationId = scheduledId ?? undefined;
      }

      await createDeadline({
        courseName: sanitizedInput.courseName,
        assignmentName: sanitizedInput.assignmentName,
        dueDate: sanitizedInput.dueDate,
        dueTime: sanitizedInput.dueTime,
        dueAt: sanitizedInput.dueAt,
        reminder,
        notificationId: notificationId ?? null,
        colorStatus,
        createdAt: nowIso,
        updatedAt: nowIso,
      });

      await get().loadDeadlines();
      return true;
    } catch (error) {
      console.warn("addDeadline failed", error);
      return false;
    }
  },
  updateDeadline: async (id, input) => {
    try {
      const sanitizedInput = sanitizeDeadlineInput(input);

      const existing =
        get().deadlines.find((deadline) => deadline.id === id) ??
        get().completedDeadlines.find((deadline) => deadline.id === id);

      if (!existing) {
        return false;
      }

      const nowIso = new Date().toISOString();
      const mergedReminder =
        sanitizedInput.reminder ?? existing.reminder ?? null;
      const mergedDueAt = sanitizedInput.dueAt ?? existing.dueAt;

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
            assignmentName:
              sanitizedInput.assignmentName ?? existing.assignmentName,
            dueAt: mergedDueAt,
            reminder: mergedReminder,
          })) ?? undefined;
      }

      const payload: Partial<Deadline> = {
        ...sanitizedInput,
        reminder: mergedReminder,
        notificationId,
        updatedAt: nowIso,
      };

      if (sanitizedInput.dueAt) {
        payload.colorStatus = computeUrgencyColor(sanitizedInput.dueAt);
      }

      await updateDeadlineDoc(id, payload);
      await get().loadDeadlines();
      return true;
    } catch (error) {
      console.warn("updateDeadline failed", error);
      return false;
    }
  },
  deleteDeadline: async (id) => {
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

      await deleteDeadlineDoc(id);

      set((state) => ({
        deadlines: state.deadlines.filter((deadline) => deadline.id !== id),
        completedDeadlines: state.completedDeadlines.filter(
          (deadline) => deadline.id !== id,
        ),
        recentlyDeletedDeadline: existing ?? null,
        selectedDeadlineId:
          state.selectedDeadlineId === id ? null : state.selectedDeadlineId,
      }));

      return true;
    } catch (error) {
      console.warn("deleteDeadline failed", error);
      return false;
    }
  },
  undoDeleteDeadline: async () => {
    const recent = get().recentlyDeletedDeadline;

    if (!recent) {
      return false;
    }

    const nowIso = new Date().toISOString();

    try {
      await createDeadline({
        courseName: recent.courseName,
        assignmentName: recent.assignmentName,
        dueDate: recent.dueDate,
        dueTime: recent.dueTime,
        dueAt: recent.dueAt,
        colorStatus: recent.colorStatus,
        createdAt: nowIso,
        updatedAt: nowIso,
        reminder: recent.reminder ?? null,
        notificationId: null,
        completedAt: recent.completedAt ?? null,
      });

      set({ recentlyDeletedDeadline: null });
      await get().loadDeadlines();

      return true;
    } catch {
      return false;
    }
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
        await updateDeadlineDoc(id, {
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

        await updateDeadlineDoc(id, {
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

        await deleteDeadlineDoc(id);

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
  clearAllData: async () => {
    try {
      await cancelAllNotifications();
      await deleteAllDeadlines();

      set({
        deadlines: [],
        completedDeadlines: [],
        recentlyDeletedDeadline: null,
        selectedDeadlineId: null,
      });

      return true;
    } catch (error) {
      console.warn("clearAllData failed", error);
      return false;
    }
  },
  setSelectedId: (id) => set({ selectedDeadlineId: id }),
  selectDeadline: (id) => set({ selectedDeadlineId: id }),
  clearSelectedDeadline: () => set({ selectedDeadlineId: null }),
  getDeadlineById: (id) =>
    get().deadlines.find((deadline) => deadline.id === id),
}));
