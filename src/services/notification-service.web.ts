/**
 * Web implementation of notification-service using the browser Notification API.
 *
 * Limitations vs native:
 * - Notifications only fire while the browser tab is open (no background push).
 * - Scheduled timers live in memory — a page reload clears them.
 *   This is acceptable for a tab-open study-reminder use case.
 */
import type { Deadline, ReminderOption } from "@/src/models/deadline";

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

const REMINDER_OFFSETS_MS: Record<ReminderOption, number> = {
  "5m": 5 * MS_PER_MINUTE,
  "30m": 30 * MS_PER_MINUTE,
  "1h": MS_PER_HOUR,
  "1d": MS_PER_DAY,
};

const ALLOWED_REMINDERS: readonly ReminderOption[] = ["5m", "30m", "1h", "1d"];

/** In-memory map of scheduled notification timers keyed by our generated ID. */
const scheduledTimers = new Map<string, ReturnType<typeof setTimeout>>();

function isBrowserNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function hasNotificationPermission(): Promise<boolean> {
  if (!isBrowserNotificationSupported()) return false;
  return Notification.permission === "granted";
}

export async function requestPermission(): Promise<boolean> {
  if (!isBrowserNotificationSupported()) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const result = await Notification.requestPermission();
  return result === "granted";
}

export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  // Push tokens require a native device; not applicable on web.
  return null;
}

export async function scheduleDeadlineNotification(
  deadline: Pick<Deadline, "assignmentName" | "dueAt" | "reminder">,
): Promise<string | null> {
  if (!isBrowserNotificationSupported()) return null;
  if (Notification.permission !== "granted") return null;
  if (
    !deadline.reminder ||
    !ALLOWED_REMINDERS.includes(deadline.reminder as ReminderOption)
  )
    return null;
  if (!deadline.dueAt) return null;

  const dueMs = new Date(deadline.dueAt).getTime();
  if (Number.isNaN(dueMs)) return null;

  const offset = REMINDER_OFFSETS_MS[deadline.reminder as ReminderOption];
  const triggerMs = dueMs - offset;
  const delayMs = triggerMs - Date.now();
  if (delayMs <= 0) return null;

  const id = `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const timerId = setTimeout(() => {
    try {
      new Notification("Due soon 🔔", {
        body: `${deadline.assignmentName} is due soon. Open the app to review.`,
        icon: "/favicon.ico",
      });
    } catch {
      // Browser may block the notification silently; nothing to do.
    }
    scheduledTimers.delete(id);
  }, delayMs);

  scheduledTimers.set(id, timerId);
  return id;
}

export async function cancelNotification(
  notificationId: string,
): Promise<void> {
  const timerId = scheduledTimers.get(notificationId);
  if (timerId !== undefined) {
    clearTimeout(timerId);
    scheduledTimers.delete(notificationId);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  scheduledTimers.forEach((timerId) => clearTimeout(timerId));
  scheduledTimers.clear();
}
