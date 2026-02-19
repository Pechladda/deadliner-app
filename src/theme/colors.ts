export const colors = {
  background: "#fffefd",
  surface: "#ffffff",
  textPrimary: "#3e2723",
  textSecondary: "#6b7280",
  border: "#e5e7eb",
  shadow: "#3e2723",
  primary: "#3e2723e3",
  danger: "#db1c1c",
  warning: "#ffeb3b",
  success: "#22c55e",
  priorityRed: "#db1c1c",
  priorityYellow: "#ffeb3b",
  priorityGreen: "#22c55e",
  urgentBg: "#fffefd",
  urgentPill: "#fb923c",
  buttonBg: "#3e2723",
  buttonText: "#ffffff",
  overlay: "rgba(15, 23, 42, 0.45)",
} as const;

export type ColorToken = keyof typeof colors;
