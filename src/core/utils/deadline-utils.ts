const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

function parseOffsetMs(timeZoneName: string): number {
  const match = timeZoneName.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?$/i);
  if (!match) {
    return 0;
  }

  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? "0");

  return sign * (hours * 60 + minutes) * MS_PER_MINUTE;
}

function getTimezoneOffsetMs(atUtcMs: number, timezone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
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
    throw new Error("Invalid due date or time format");
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error("Invalid due time value");
  }

  if (!timezone) {
    const localIso = new Date(
      `${dueDate}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
    );
    if (Number.isNaN(localIso.getTime())) {
      throw new Error("Invalid due date value");
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

export function getUrgencyPriority(
  iso: string,
  now = new Date(),
): "high" | "medium" | "low" {
  const remainingMs = getRemainingMs(iso, now);

  if (remainingMs <= MS_PER_DAY) {
    return "high";
  }

  if (remainingMs <= 3 * MS_PER_DAY) {
    return "medium";
  }

  return "low";
}

export function formatDueLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatCountdownLong(iso: string, now = new Date()): string {
  return formatRemaining(iso, now);
}

export function formatRemaining(dueAtISO: string, now = new Date()): string {
  const diffMs = getRemainingMs(dueAtISO, now);

  if (diffMs <= 0) {
    return "Overdue";
  }

  const totalHours = Math.floor(diffMs / MS_PER_HOUR);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  return `${days} Day${days === 1 ? "" : "s"}, ${hours} Hour${hours === 1 ? "" : "s"}`;
}

export function computeColorStatus(
  remainingMs: number,
): "green" | "yellow" | "red" {
  if (remainingMs < MS_PER_DAY) {
    return "red";
  }

  if (remainingMs < 3 * MS_PER_DAY) {
    return "yellow";
  }

  return "green";
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
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h left`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }

  return `${minutes}m left`;
}

// Unit-like examples:
// const dueAt = parseDueAt("2026-02-20", "14:30", "Asia/Bangkok");
// getRemainingMs("2026-02-20T07:30:00.000Z", new Date("2026-02-20T06:30:00.000Z")) === 3600000;
// formatRemaining("2026-02-21T12:00:00.000Z", new Date("2026-02-20T10:00:00.000Z")) === "1 Day, 2 Hours";
// formatRemaining("2026-02-20T09:00:00.000Z", new Date("2026-02-20T10:00:00.000Z")) === "Overdue";
// computeColorStatus(23 * 60 * 60 * 1000) === "red";
// computeColorStatus(48 * 60 * 60 * 1000) === "yellow";
// computeColorStatus(96 * 60 * 60 * 1000) === "green";
// sortDeadlinesByDueAt([{ dueAt: "2026-02-21T00:00:00.000Z" }, { dueAt: "2026-02-20T00:00:00.000Z" }]);
