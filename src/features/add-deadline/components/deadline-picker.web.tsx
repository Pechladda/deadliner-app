/**
 * DeadlinePicker — Web implementation.
 *
 * Uses a native HTML <input type="date|time"> rendered via React.createElement
 * so the browser's built-in date/time picker opens on all desktop and mobile
 * web browsers (Chrome, Safari, Firefox, Edge, mobile Chrome, mobile Safari).
 *
 * The overlay uses position:fixed so it always covers the full viewport
 * regardless of where the component sits in the React tree.
 */
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/src/components";
import { colors, radius, spacing, typography } from "@/src/theme";

export type DeadlinePickerProps = {
  mode: "date" | "time" | null;
  value: Date;
  onApplyDate: (d: Date) => void;
  onApplyTime: (d: Date) => void;
  onDismiss: () => void;
  formatDate: (d: Date) => string;
  formatTime: (d: Date) => string;
};

const BRAND_ACCENT = "#EAB8C9";
const BRAND_ACCENT_DARK = "#C9849A";
const BRAND_ACCENT_LIGHT = "#FAF0F4";
const WHITE = "#fff";

// Native HTML input rendered via React.createElement to bypass RN Web type
// restrictions — ensures browser date/time picker actually fires.
function NativeInput({
  type,
  value,
  onChange,
}: {
  type: "date" | "time";
  value: string;
  onChange: (val: string) => void;
}) {
  return React.createElement("input", {
    type,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    style: {
      width: "100%",
      padding: "10px 14px",
      borderRadius: 8,
      border: `1.5px solid ${BRAND_ACCENT}`,
      backgroundColor: BRAND_ACCENT_LIGHT,
      color: colors.textPrimary,
      fontSize: 16,
      fontFamily: "inherit",
      textAlign: "center",
      boxSizing: "border-box",
      cursor: "pointer",
      outline: "none",
    } as React.CSSProperties,
  });
}

export function DeadlinePicker({
  mode,
  value,
  onApplyDate,
  onApplyTime,
  onDismiss,
  formatDate,
  formatTime,
}: DeadlinePickerProps) {
  if (!mode) return null;

  const dateStr = value.toISOString().slice(0, 10); // YYYY-MM-DD
  const hours = String(value.getHours()).padStart(2, "0");
  const mins = String(value.getMinutes()).padStart(2, "0");
  const timeStr = `${hours}:${mins}`;

  const handleChange = (raw: string) => {
    if (mode === "date") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return;
      const [y, m, d] = raw.split("-").map(Number);
      const next = new Date(value);
      next.setFullYear(y, m - 1, d);
      if (!isNaN(next.getTime())) onApplyDate(next);
    } else {
      if (!/^\d{2}:\d{2}$/.test(raw)) return;
      const [h, min] = raw.split(":").map(Number);
      const next = new Date(value);
      next.setHours(h, min, 0, 0);
      if (!isNaN(next.getTime())) onApplyTime(next);
    }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onDismiss} />
      <View style={styles.card}>
        <AppText style={styles.label}>
          {mode === "date" ? "SELECT DATE" : "SELECT TIME"}
        </AppText>
        <AppText style={styles.preview}>
          {mode === "date" ? formatDate(value) : formatTime(value)}
        </AppText>

        <View style={styles.inputWrap}>
          <NativeInput
            type={mode}
            value={mode === "date" ? dateStr : timeStr}
            onChange={handleChange}
          />
        </View>

        <Pressable onPress={onDismiss} style={styles.doneBtn}>
          <AppText style={styles.doneBtnText}>{"Done"}</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    // position: fixed ensures the overlay covers the full viewport on web
    // regardless of scroll position or parent positioning context.
    position: "fixed" as "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  backdrop: {
    position: "absolute" as "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    padding: spacing.xl,
    gap: spacing.m,
    alignItems: "center",
    width: 320,
    zIndex: 1,
    borderWidth: 1,
    borderColor: BRAND_ACCENT,
  },
  label: {
    color: BRAND_ACCENT_DARK,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    letterSpacing: 1.4,
  },
  preview: {
    color: colors.textPrimary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  inputWrap: {
    width: "100%",
  },
  doneBtn: {
    marginTop: spacing.xs,
    backgroundColor: BRAND_ACCENT,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.s,
  },
  doneBtnText: {
    color: WHITE,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.sm,
  },
});
