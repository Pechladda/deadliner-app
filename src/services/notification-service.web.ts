/**
 * Web stub for notification-service.
 * expo-notifications is not supported on web; all functions are no-ops.
 * Metro will resolve this file instead of notification-service.ts on web,
 * preventing the module from being imported and silencing the push-token warning.
 */
import type { Deadline, ReminderOption } from "@/src/models/deadline";

export async function hasNotificationPermission(): Promise<boolean> {
  return false;
}

export async function requestPermission(): Promise<boolean> {
  return false;
}

export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  return null;
}

export async function scheduleDeadlineNotification(
  _deadline: Pick<Deadline, "assignmentName" | "dueAt" | "reminder">,
): Promise<string | null> {
  return null;
}

export async function cancelNotification(
  _notificationId: string,
): Promise<void> {}

export async function cancelAllNotifications(): Promise<void> {}
