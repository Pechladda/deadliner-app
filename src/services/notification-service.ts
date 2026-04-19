import type { Deadline, ReminderOption } from "@/src/models/deadline";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const reminderOffsets: Record<ReminderOption, number> = {
  "5m": 5 * 60 * 1000,
  "30m": 30 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
};

let channelReady = false;

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
  const projectId =
    typeof fromExpoConfig === "string" && fromExpoConfig.trim().length > 0
      ? fromExpoConfig.trim()
      : typeof fromEasConfig === "string" && fromEasConfig.trim().length > 0
        ? fromEasConfig.trim()
        : null;

  return projectId;
}

export async function hasNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();

  return (
    current.granted ||
    current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

async function ensureAndroidChannel() {
  if (Platform.OS !== "android" || channelReady) {
    return;
  }

  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.DEFAULT,
  });

  channelReady = true;
}

export async function requestPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();

  if (
    current.granted ||
    current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return true;
  }

  if (current.status !== "undetermined") {
    return false;
  }

  if (!current.canAskAgain) {
    return false;
  }

  const requested = await Notifications.requestPermissionsAsync();

  return (
    requested.granted ||
    requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
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
  // Only allow ReminderOption values
  const allowedReminders = ["5m", "30m", "1h", "1d"];
  if (!deadline.reminder || !allowedReminders.includes(deadline.reminder)) {
    return null;
  }

  await ensureAndroidChannel();

  const dueMs = new Date(deadline.dueAt).getTime();
  if (Number.isNaN(dueMs)) {
    return null;
  }

  const reminderKey = deadline.reminder as ReminderOption;
  const triggerMs = dueMs - reminderOffsets[reminderKey];
  if (triggerMs <= Date.now()) {
    return null;
  }

  let trigger;
  if (Platform.OS === "android") {
    const secondsFromNow = Math.floor((triggerMs - Date.now()) / 1000);
    if (secondsFromNow <= 0) {
      return null;
    }
    trigger = {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: secondsFromNow,
      repeats: false,
      channelId: "default",
    };
  } else {
    // iOS: use absolute date trigger (type: 'date')
    trigger = {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(triggerMs),
    };
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Due soon",
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
