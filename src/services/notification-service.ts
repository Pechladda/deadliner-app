import { t } from "@/src/core/utils";
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
    console.warn(t("notificationPhysicalDeviceWarning"));
    return null;
  }

  await ensureAndroidChannel();

  const granted = await requestPermission();
  if (!granted) {
    return null;
  }

  const projectId = getEasProjectId();
  if (!projectId) {
    console.warn(t("notificationMissingProjectIdWarning"));
    return null;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch (error) {
    console.warn(t("notificationFetchTokenWarning"), error);
    return null;
  }
}

export async function scheduleDeadlineNotification(
  deadline: Pick<Deadline, "assignmentName" | "dueAt" | "reminder">,
): Promise<string | null> {
  if (!deadline.reminder) {
    return null;
  }

  await ensureAndroidChannel();

  const dueMs = new Date(deadline.dueAt).getTime();
  if (Number.isNaN(dueMs)) {
    return null;
  }

  const triggerMs = dueMs - reminderOffsets[deadline.reminder];
  if (triggerMs <= Date.now()) {
    return null;
  }

  const secondsFromNow = Math.floor((triggerMs - Date.now()) / 1000);
  if (secondsFromNow <= 0) {
    return null;
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: t("notificationDueSoonTitle"),
      body: t("notificationDueSoonBody", {
        assignmentName: deadline.assignmentName,
      }),
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: secondsFromNow,
      repeats: false,
      channelId: "default",
    },
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
