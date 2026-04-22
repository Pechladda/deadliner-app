const STATUS_GREEN = "#05e317";
const STATUS_RED = "#f80834";
const BRAND_PINK = "#E9B8C9";

export const colors = {
  // Base palette
  background: "#FFFFFF",
  surface: "#ffffff",
  textPrimary: "#333333",
  textSecondary: "#6C757D",
  border: BRAND_PINK,
  borderSoft: "#F8EBEF",
  buttonBg: BRAND_PINK,
  shadow: "#31241F",

  // Deadline status colors
  overdue: "#6C757D",
  urgent: STATUS_RED,
  soon: "#fce514",
  onTrack: STATUS_GREEN,

  // Semantic aliases mapped to status colors
  success: STATUS_GREEN,
  danger: STATUS_RED,
  warning: STATUS_RED,
} as const;
