import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import {
  getDeadlineStatus,
  getDeadlineStatusColor,
  getFirestoreErrorMessage,
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
  return getDeadlineStatusColor(getDeadlineStatus(dueAt));
}

function sortByDueAt(deadlines: Deadline[]): Deadline[] {
  return sortDeadlinesByDueAt(deadlines);
}

interface DeadlineState {
  deadlines: Deadline[];
  completedDeadlines: Deadline[];
  isLoadingDeadlines: boolean;
  deadlinesError: string | null;
  selectedDeadlineId: string | null;
  notificationsEnabled: boolean;
  hasNotificationPermission: boolean;
  hydrateNotificationsSetting: () => Promise<void>;
  refreshNotificationPermission: () => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  loadDeadlines: () => Promise<void>;
  addDeadline: (
    deadline: Omit<Deadline, "id" | "createdAt">,
  ) => Promise<boolean>;
  deleteDeadline: (id: string) => Promise<boolean>;
  completeDeadline: (id: string) => void;
  undoCompletedDeadline: (id: string) => void;
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
  isLoadingDeadlines: false,
  deadlinesError: null,
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
        const granted = await hasNotificationPermission();
        set({ hasNotificationPermission: granted });
        return;
      }

      const granted = await hasNotificationPermission();
      set({ hasNotificationPermission: granted });
    } catch {
      set({ notificationsEnabled: true, hasNotificationPermission: false });
    }
  },
  refreshNotificationPermission: async () => {
    try {
      const granted = await hasNotificationPermission();
      set({ hasNotificationPermission: granted });
    } catch {
      set({ hasNotificationPermission: false });
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
        hasNotificationPermission: state.hasNotificationPermission,
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
          deadlinesError: null,
          isLoadingDeadlines: false,
        });
        return;
      }

      const activeDeadlines = loadedDeadlines.filter(
        (deadline) => deadline.isCompleted !== true,
      );
      const doneDeadlines = loadedDeadlines
        .filter((deadline) => deadline.isCompleted === true)
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
        deadlinesError: null,
        isLoadingDeadlines: false,
      });
    } catch (error) {
      set({
        deadlines: [],
        completedDeadlines: [],
        deadlinesError: getFirestoreErrorMessage(error),
        isLoadingDeadlines: false,
      });
    }
  },
  addDeadline: async (input) => {
    let newlyScheduledNotificationId: string | undefined;

    try {
      console.info("[AddDeadline] addDeadline input:", input);
      const sanitizedInput = sanitizeDeadlineInput(input);
      console.info("[AddDeadline] sanitized input:", sanitizedInput);
      if (!validateDeadlineInput(sanitizedInput)) {
        console.error("[AddDeadline] validation failed in store");
        set({ deadlinesError: "Please complete all required fields." });
        return false;
      }

      const nowIso = new Date().toISOString();
      const colorStatus = computeUrgencyColor(sanitizedInput.dueAt);
      const reminder = sanitizedInput.reminder ?? null;
      const existingNotificationId =
        typeof sanitizedInput.notificationId === "string" &&
        sanitizedInput.notificationId
          ? sanitizedInput.notificationId
          : undefined;
      let notificationId = existingNotificationId;

      if (
        !notificationId &&
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
        newlyScheduledNotificationId = notificationId;
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
        isCompleted: false,
        createdAt: nowIso,
        updatedAt: nowIso,
      });

      console.info("[AddDeadline] Firestore create success");

      await get().loadDeadlines();
      set({ deadlinesError: null });
      return true;
    } catch (error) {
      if (newlyScheduledNotificationId) {
        try {
          await cancelNotification(newlyScheduledNotificationId);
        } catch {
          // Ignore cleanup failures.
        }
      }

      const readableError = getFirestoreErrorMessage(error);
      console.error("[AddDeadline] addDeadline failed:", error);
      set({ deadlinesError: readableError });
      return false;
    }
  },
  updateDeadline: async (id, input) => {
    let newlyScheduledNotificationId: string | undefined;

    try {
      console.info("[AddDeadline] updateDeadline id:", id, "input:", input);
      const sanitizedInput = sanitizeDeadlineInput(input);
      console.info("[AddDeadline] update sanitized input:", sanitizedInput);

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
      const mergedAssignmentName =
        sanitizedInput.assignmentName ?? existing.assignmentName;
      const existingNotificationId =
        typeof existing.notificationId === "string" && existing.notificationId
          ? existing.notificationId
          : undefined;

      const reminderFieldChanged =
        sanitizedInput.reminder !== undefined ||
        sanitizedInput.dueAt !== undefined ||
        sanitizedInput.assignmentName !== undefined;

      let notificationId: string | null | undefined = existingNotificationId;

      if (reminderFieldChanged) {
        if (existingNotificationId) {
          try {
            await cancelNotification(existingNotificationId);
          } catch {
            // Ignore cancellation errors.
          }
        }

        notificationId = null;
        if (
          get().notificationsEnabled &&
          get().hasNotificationPermission &&
          !existing.completedAt &&
          mergedReminder
        ) {
          notificationId =
            (await scheduleDeadlineNotification({
              assignmentName: mergedAssignmentName,
              dueAt: mergedDueAt,
              reminder: mergedReminder,
            })) ?? null;
          newlyScheduledNotificationId = notificationId ?? undefined;
        }
      }

      const payload: Partial<Deadline> = {
        ...sanitizedInput,
        reminder: mergedReminder,
        updatedAt: nowIso,
      };

      if (reminderFieldChanged) {
        payload.notificationId = notificationId ?? null;
      }

      if (sanitizedInput.dueAt) {
        payload.colorStatus = computeUrgencyColor(sanitizedInput.dueAt);
      }

      await updateDeadlineDoc(id, payload);
      console.info("[AddDeadline] Firestore update success for id:", id);
      await get().loadDeadlines();
      set({ deadlinesError: null });
      return true;
    } catch (error) {
      if (newlyScheduledNotificationId) {
        try {
          await cancelNotification(newlyScheduledNotificationId);
        } catch {
          // Ignore cleanup failures.
        }
      }

      const readableError = getFirestoreErrorMessage(error);
      console.error("[AddDeadline] updateDeadline failed:", error);
      set({ deadlinesError: readableError });
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
        selectedDeadlineId:
          state.selectedDeadlineId === id ? null : state.selectedDeadlineId,
      }));

      return true;
    } catch (error) {
      console.warn("deleteDeadline failed", error);
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
      isCompleted: true,
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
          isCompleted: true,
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
    let restoredNotificationId =
      typeof deadlineToRestore.notificationId === "string" &&
      deadlineToRestore.notificationId
        ? deadlineToRestore.notificationId
        : undefined;

    const restoredDeadline: Deadline = {
      ...deadlineToRestore,
      notificationId: undefined,
      isCompleted: false,
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
          !restoredNotificationId &&
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
          isCompleted: false,
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
  clearAllData: async () => {
    try {
      await cancelAllNotifications();
      await deleteAllDeadlines();

      set({
        deadlines: [],
        completedDeadlines: [],
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
