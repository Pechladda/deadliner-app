import {
  COMPLETED_LABEL_OPTIONS,
  DATE_DISPLAY_LOCALE,
  DUE_LABEL_OPTIONS,
} from "@/src/core/config";

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const URGENT_THRESHOLD_MS = MS_PER_DAY;
const SOON_THRESHOLD_MS = 3 * MS_PER_DAY;

const DUE_LABEL_FALLBACK_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
};
const COMPLETED_LABEL_FALLBACK_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

export type DeadlineStatus = "overdue" | "urgent" | "soon" | "onTrack";

function parseOffsetMs(timeZoneName: string): number {
  const match = timeZoneName.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?$/i);
  if (!match) {
    return 0;
  }

  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? "0");

  return sign * (hours * MINUTES_PER_HOUR + minutes) * MS_PER_MINUTE;
}

function getTimezoneOffsetMs(atUtcMs: number, timezone: string): number {
  const formatter = new Intl.DateTimeFormat(DATE_DISPLAY_LOCALE, {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "shortOffset",
  });

  const timeZoneName =
    formatter
      .formatToParts(new Date(atUtcMs))
      .find((part) => part.type === "timeZoneName")?.value ?? "GMT+0";

  return parseOffsetMs(timeZoneName);
}

export function parseDueAt(
  dueDate: string,
  dueTime: string,
  timezone?: string,
): string {
  const dateMatch = dueDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMatch = dueTime.match(/^(\d{1,2}):(\d{2})$/);

  if (!dateMatch || !timeMatch) {
    throw new Error("Invalid due date or time format.");
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error("Invalid due time value.");
  }

  if (!timezone) {
    const localIso = new Date(
      `${dueDate}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
    );
    if (Number.isNaN(localIso.getTime())) {
      throw new Error("Invalid due date value.");
    }
    return localIso.toISOString();
  }

  const localAsUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  const offsetFirstPass = getTimezoneOffsetMs(localAsUtcMs, timezone);
  const utcFirstPass = localAsUtcMs - offsetFirstPass;
  const offsetSecondPass = getTimezoneOffsetMs(utcFirstPass, timezone);
  const utcMs = localAsUtcMs - offsetSecondPass;

  return new Date(utcMs).toISOString();
}

export function getRemainingMs(dueAtISO: string, now = new Date()): number {
  const dueAtMs = new Date(dueAtISO).getTime();
  if (Number.isNaN(dueAtMs)) {
    return 0;
  }

  return dueAtMs - now.getTime();
}

export function getDeadlineStatus(
  dueAtISO: string,
  now = new Date(),
): DeadlineStatus {
  const remainingMs = getRemainingMs(dueAtISO, now);

  if (remainingMs <= 0) {
    return "overdue";
  }

  if (remainingMs <= URGENT_THRESHOLD_MS) {
    return "urgent";
  }

  if (remainingMs <= SOON_THRESHOLD_MS) {
    return "soon";
  }

  return "onTrack";
}

export function getDeadlineStatusColor(
  status: DeadlineStatus,
): "green" | "yellow" | "red" {
  if (status === "onTrack") {
    return "green";
  }

  if (status === "soon") {
    return "yellow";
  }

  return "red";
}

export function getDeadlineStatusDisplayColor(
  status: DeadlineStatus,
): "green" | "yellow" | "red" | "orange" {
  if (status === "overdue") {
    return "red";
  }

  if (status === "urgent") {
    return "orange";
  }

  return getDeadlineStatusColor(status);
}

export function getDeadlineStatusLabel(status: DeadlineStatus): string {
  if (status === "overdue") {
    return "Overdue";
  }

  if (status === "urgent") {
    return "URGENT";
  }

  if (status === "soon") {
    return "SOON";
  }

  return "On Track";
}

export function formatCreatedLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  const formatOptions =
    COMPLETED_LABEL_OPTIONS ?? COMPLETED_LABEL_FALLBACK_OPTIONS;

  return new Intl.DateTimeFormat(DATE_DISPLAY_LOCALE, formatOptions).format(
    date,
  );
}

export function getUrgencyPriority(
  iso: string,
  now = new Date(),
): "high" | "medium" | "low" {
  const remainingMs = getRemainingMs(iso, now);

  if (remainingMs <= URGENT_THRESHOLD_MS) {
    return "high";
  }

  if (remainingMs <= SOON_THRESHOLD_MS) {
    return "medium";
  }

  return "low";
}

export function formatDueLabel(iso: string | null | undefined): string {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  const formatOptions = DUE_LABEL_OPTIONS ?? DUE_LABEL_FALLBACK_OPTIONS;

  return new Intl.DateTimeFormat(DATE_DISPLAY_LOCALE, formatOptions).format(
    date,
  );
}

export function formatCountdownLong(iso: string, now = new Date()): string {
  return formatRemaining(iso, now);
}

export function formatRemaining(dueAtISO: string, now = new Date()): string {
  const diffMs = getRemainingMs(dueAtISO, now);

  if (diffMs <= 0) {
    return "Overdue";
  }

  const totalMinutes = Math.floor(diffMs / MS_PER_MINUTE);
  const days = Math.floor(totalMinutes / (HOURS_PER_DAY * MINUTES_PER_HOUR));
  const hours = Math.floor(
    (totalMinutes % (HOURS_PER_DAY * MINUTES_PER_HOUR)) / MINUTES_PER_HOUR,
  );
  const minutes = totalMinutes % MINUTES_PER_HOUR;

  if (days > 0) {
    return `${days} ${days === 1 ? "day" : "days"}, ${hours} ${hours === 1 ? "hour" : "hours"} left`;
  }

  if (hours > 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"}, ${minutes} ${minutes === 1 ? "minute" : "minutes"} left`;
  }

  return `${minutes} ${minutes === 1 ? "minute" : "minutes"} left`;
}

export function computeColorStatus(
  remainingMs: number,
): "green" | "yellow" | "red" {
  if (remainingMs <= 0) {
    return "red";
  }

  if (remainingMs <= URGENT_THRESHOLD_MS) {
    return "red";
  }

  if (remainingMs <= SOON_THRESHOLD_MS) {
    return "yellow";
  }

  return "green";
}

export function getUrgencyMessage(
  remainingMs: number,
): "overdue" | "needsToday" | "dueSoon" | "safeForNow" {
  if (remainingMs <= 0) {
    return "overdue";
  }

  if (remainingMs <= URGENT_THRESHOLD_MS) {
    return "needsToday";
  }

  if (remainingMs <= SOON_THRESHOLD_MS) {
    return "dueSoon";
  }

  return "safeForNow";
}

export function sortDeadlinesByDueAt<T extends { dueAt: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const aMs = new Date(a.dueAt).getTime();
    const bMs = new Date(b.dueAt).getTime();

    const safeAMs = Number.isNaN(aMs) ? Number.POSITIVE_INFINITY : aMs;
    const safeBMs = Number.isNaN(bMs) ? Number.POSITIVE_INFINITY : bMs;

    return safeAMs - safeBMs;
  });
}

export function formatCountdownShort(iso: string, now = new Date()): string {
  const diffMs = getRemainingMs(iso, now);
  if (diffMs <= 0) {
    return "Overdue";
  }

  const totalMinutes = Math.floor(diffMs / MS_PER_MINUTE);
  const days = Math.floor(totalMinutes / (HOURS_PER_DAY * MINUTES_PER_HOUR));
  const hours = Math.floor(
    (totalMinutes % (HOURS_PER_DAY * MINUTES_PER_HOUR)) / MINUTES_PER_HOUR,
  );
  const minutes = totalMinutes % MINUTES_PER_HOUR;

  if (days > 0) {
    return `${days}d ${hours}h left`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }

  return `${minutes}m left`;
}

export function formatCompletedLabel(iso?: string | null): string {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const formatOptions =
    COMPLETED_LABEL_OPTIONS ?? COMPLETED_LABEL_FALLBACK_OPTIONS;

  return new Intl.DateTimeFormat(DATE_DISPLAY_LOCALE, formatOptions).format(
    date,
  );
}
