import type { Deadline, ReminderOption } from "@/src/models/deadline";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MS_PER_MINUTE = SECONDS_PER_MINUTE * MS_PER_SECOND;
const MS_PER_HOUR = MINUTES_PER_HOUR * MS_PER_MINUTE;
const MS_PER_DAY = HOURS_PER_DAY * MS_PER_HOUR;

const DEFAULT_CHANNEL_ID = "default";
const DEFAULT_CHANNEL_NAME = "Default";
const NOTIFICATION_TITLE = "Due soon";
const ALLOWED_REMINDERS: readonly ReminderOption[] = ["5m", "30m", "1h", "1d"];

const REMINDER_OFFSETS_MS: Record<ReminderOption, number> = {
  "5m": 5 * MS_PER_MINUTE,
  "30m": 30 * MS_PER_MINUTE,
  "1h": MS_PER_HOUR,
  "1d": MS_PER_DAY,
};

let isAndroidChannelReady = false;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function getEasProjectId(): string | null {
  const fromExpoConfig = Constants.expoConfig?.extra?.eas?.projectId;
  const fromEasConfig = Constants.easConfig?.projectId;

  if (typeof fromExpoConfig === "string" && fromExpoConfig.trim().length > 0) {
    return fromExpoConfig.trim();
  }

  if (typeof fromEasConfig === "string" && fromEasConfig.trim().length > 0) {
    return fromEasConfig.trim();
  }

  return null;
}

function isPermissionGranted(
  permission: Notifications.NotificationPermissionsStatus,
): boolean {
  return (
    permission.granted ||
    permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

export async function hasNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  return isPermissionGranted(current);
}

async function ensureAndroidChannel() {
  if (Platform.OS !== "android" || isAndroidChannelReady) {
    return;
  }

  await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
    name: DEFAULT_CHANNEL_NAME,
    importance: Notifications.AndroidImportance.DEFAULT,
  });

  isAndroidChannelReady = true;
}

export async function requestPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();

  if (isPermissionGranted(current)) {
    return true;
  }

  if (current.status !== "undetermined") {
    return false;
  }

  if (!current.canAskAgain) {
    return false;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return isPermissionGranted(requested);
}

export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  if (!Device.isDevice) {
    console.warn(
      "Push notifications require a physical device. Emulator/simulator may not receive push notifications.",
    );
    return null;
  }

  await ensureAndroidChannel();

  const granted = await requestPermission();
  if (!granted) {
    return null;
  }

  const projectId = getEasProjectId();
  if (!projectId) {
    console.warn(
      "Missing EAS projectId. Set expo.extra.eas.projectId in app.json before requesting Expo push token.",
    );
    return null;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch (error) {
    console.warn("Unable to fetch Expo push token", error);
    return null;
  }
}

export async function scheduleDeadlineNotification(
  deadline: Pick<Deadline, "assignmentName" | "dueAt" | "reminder">,
): Promise<string | null> {
  if (
    !deadline.reminder ||
    !ALLOWED_REMINDERS.includes(deadline.reminder as ReminderOption)
  ) {
    return null;
  }

  await ensureAndroidChannel();

  if (!deadline.dueAt) {
    return null;
  }

  const dueMs = new Date(deadline.dueAt).getTime();
  if (Number.isNaN(dueMs)) {
    return null;
  }

  const reminderKey = deadline.reminder as ReminderOption;
  const triggerMs = dueMs - REMINDER_OFFSETS_MS[reminderKey];
  if (triggerMs <= Date.now()) {
    return null;
  }

  let trigger;
  if (Platform.OS === "android") {
    const secondsFromNow = Math.floor((triggerMs - Date.now()) / MS_PER_SECOND);
    if (secondsFromNow <= 0) {
      return null;
    }
    trigger = {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: secondsFromNow,
      repeats: false,
      channelId: DEFAULT_CHANNEL_ID,
    };
  } else {
    trigger = {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(triggerMs),
    };
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: NOTIFICATION_TITLE,
      body: `${deadline.assignmentName} is due soon. Tap to review.`,
      sound: true,
    },
    trigger: trigger as Notifications.NotificationTriggerInput,
  });

  return id;
}

export async function cancelNotification(
  notificationId: string,
): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
