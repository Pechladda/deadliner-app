const BANGKOK_TZ = "Asia/Bangkok";

function getZonedDate(date: Date, timeZone: string): Date {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "00";

  return new Date(
    `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}:${part("second")}`,
  );
}

export function formatDueAtBangkok(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: BANGKOK_TZ,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function getCountdownBangkok(iso: string, now = new Date()): string {
  const dueZoned = getZonedDate(new Date(iso), BANGKOK_TZ).getTime();
  const nowZoned = getZonedDate(now, BANGKOK_TZ).getTime();
  const diffMs = dueZoned - nowZoned;

  if (diffMs <= 0) {
    return "Overdue";
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h left`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }

  return `${minutes}m left`;
}
