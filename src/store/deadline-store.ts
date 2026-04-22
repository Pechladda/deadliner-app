import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import {
  getDeadlineStatus,
  getDeadlineStatusColor,
  getFirestoreErrorMessage,
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
const NOTIFICATIONS_ENABLED_VALUE = "true";

const ERROR_MESSAGE_MISSING_NAMES =
  "Please fill Course name and Assignment name.";
const ERROR_MESSAGE_MISSING_DATE_TIME = "Please select Date and Time.";

export function computeUrgencyColor(
  dueAt: string | null,
): "red" | "yellow" | "green" | "orange" {
  if (!dueAt) return "green";
  return getDeadlineStatusColor(getDeadlineStatus(dueAt));
}

function parseTimestamp(value: string | null | undefined): number {
  if (!value) return Number.NaN;
  return new Date(value).getTime();
}

function sortByDueAt(deadlines: Deadline[]): Deadline[] {
  return [...deadlines].sort((a, b) => {
    const aTimestamp = parseTimestamp(a.dueAt);
    const bTimestamp = parseTimestamp(b.dueAt);
    const safeA = Number.isNaN(aTimestamp)
      ? Number.POSITIVE_INFINITY
      : aTimestamp;
    const safeB = Number.isNaN(bTimestamp)
      ? Number.POSITIVE_INFINITY
      : bTimestamp;
    return safeA - safeB;
  });
}

function sortByCompletedAtDesc(deadlines: Deadline[]): Deadline[] {
  return [...deadlines].sort((a, b) => {
    const aTimestamp = parseTimestamp(a.completedAt);
    const bTimestamp = parseTimestamp(b.completedAt);
    const safeA = Number.isNaN(aTimestamp)
      ? Number.NEGATIVE_INFINITY
      : aTimestamp;
    const safeB = Number.isNaN(bTimestamp)
      ? Number.NEGATIVE_INFINITY
      : bTimestamp;
    return safeB - safeA;
  });
}

export interface AddDeadlineInput {
  courseName: string;
  assignmentName: string;
  dueDate: string | null;
  dueTime: string | null;
  dueAt: string | null;
  reminder: string | null;
  notificationId?: string | null;
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
  addDeadline: (deadline: AddDeadlineInput) => Promise<boolean>;
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
      const granted = await hasNotificationPermission();
      set({ notificationsEnabled, hasNotificationPermission: granted });
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
        enabled ? NOTIFICATIONS_ENABLED_VALUE : "false",
      );
    } catch {
      // Ignore persistence errors.
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
      const doneDeadlines = loadedDeadlines.filter(
        (deadline) => deadline.isCompleted === true,
      );

      set({
        deadlines: sortByDueAt(activeDeadlines),
        completedDeadlines: sortByCompletedAtDesc(doneDeadlines),
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
      const trimmedCourseName = input.courseName.trim();
      const trimmedAssignmentName = input.assignmentName.trim();

      if (!trimmedCourseName || !trimmedAssignmentName) {
        set({ deadlinesError: ERROR_MESSAGE_MISSING_NAMES });
        return false;
      }

      if (!input.dueDate || !input.dueTime || !input.dueAt) {
        set({ deadlinesError: ERROR_MESSAGE_MISSING_DATE_TIME });
        return false;
      }

      const nowIso = new Date().toISOString();
      const colorStatus = computeUrgencyColor(input.dueAt);
      const reminder = input.reminder ?? null;

      const existingNotificationId =
        typeof input.notificationId === "string" && input.notificationId
          ? input.notificationId
          : undefined;
      let notificationId = existingNotificationId;

      if (
        !notificationId &&
        get().notificationsEnabled &&
        get().hasNotificationPermission &&
        reminder &&
        input.dueAt
      ) {
        const scheduledId = await scheduleDeadlineNotification({
          assignmentName: trimmedAssignmentName,
          dueAt: input.dueAt,
          reminder,
        });
        notificationId = scheduledId ?? undefined;
        newlyScheduledNotificationId = notificationId;
      }

      await createDeadline({
        courseName: trimmedCourseName,
        assignmentName: trimmedAssignmentName,
        dueDate: input.dueDate ?? "",
        dueTime: input.dueTime ?? "",
        dueAt: input.dueAt ?? "",
        colorStatus,
        reminder,
        notificationId: notificationId ?? null,
        isCompleted: false,
        createdAt: nowIso,
        updatedAt: nowIso,
      });

      await get().loadDeadlines();
      set({ deadlinesError: null });
      return true;
    } catch (error) {
      if (newlyScheduledNotificationId) {
        try {
          await cancelNotification(newlyScheduledNotificationId);
        } catch {
          // Ignore rollback errors.
        }
      }

      set({ deadlinesError: getFirestoreErrorMessage(error) });
      return false;
    }
  },
  updateDeadline: async (id, input) => {
    let newlyScheduledNotificationId: string | undefined;

    try {
      const existing =
        get().deadlines.find((deadline) => deadline.id === id) ??
        get().completedDeadlines.find((deadline) => deadline.id === id);

      if (!existing) {
        return false;
      }

      const nowIso = new Date().toISOString();
      const mergedReminder =
        input.reminder !== undefined ? input.reminder : existing.reminder;
      const mergedDueAt =
        input.dueAt !== undefined ? input.dueAt : existing.dueAt;
      const mergedAssignmentName =
        input.assignmentName !== undefined
          ? input.assignmentName
          : existing.assignmentName;

      const existingNotificationId =
        typeof existing.notificationId === "string" && existing.notificationId
          ? existing.notificationId
          : undefined;

      const reminderFieldChanged =
        input.reminder !== undefined ||
        input.dueAt !== undefined ||
        input.assignmentName !== undefined;

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
          mergedReminder &&
          mergedDueAt
        ) {
          notificationId =
            (await scheduleDeadlineNotification({
              assignmentName: mergedAssignmentName!,
              dueAt: mergedDueAt,
              reminder: mergedReminder,
            })) ?? null;
          newlyScheduledNotificationId = notificationId ?? undefined;
        }
      }

      const payload: Partial<Deadline> = {
        ...input,
        reminder: mergedReminder,
        updatedAt: nowIso,
      };

      if (reminderFieldChanged) {
        payload.notificationId = notificationId ?? null;
      }

      if (input.dueAt !== undefined) {
        payload.colorStatus = computeUrgencyColor(input.dueAt);
      }

      await updateDeadlineDoc(id, payload);
      await get().loadDeadlines();
      set({ deadlinesError: null });
      return true;
    } catch (error) {
      if (newlyScheduledNotificationId) {
        try {
          await cancelNotification(newlyScheduledNotificationId);
        } catch {
          // Ignore rollback errors.
        }
      }

      set({ deadlinesError: getFirestoreErrorMessage(error) });
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
        // Rollback on failure.
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
          restoredReminder &&
          restoredDeadline.dueAt
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
        // Rollback on failure.
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
