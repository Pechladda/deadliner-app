/**
 * DeadlinePicker — Web implementation.
 *
 * Strategy: render a visible modal with a real HTML <input type="date|time">.
 * On mount, call showPicker() (Chrome 99+, Firefox 101+, Safari 16+) so the
 * native browser calendar / time wheel opens immediately without a second tap.
 * Falls back to focus() on older browsers — the user then taps the input once.
 * Selecting a value auto-dismisses the modal (no "Done" tap needed).
 *
 * Overlay uses position:fixed so it always covers the full viewport.
 */
import React, { useLayoutEffect, useRef } from "react";
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

// ─────────────────────────────────────────────────────────
// NativePickerInput — real HTML <input type="date|time">.
// Calls showPicker() immediately on mount to open the
// browser's native date/time picker without an extra tap.
// ─────────────────────────────────────────────────────────
type NativePickerInputProps = {
  type: "date" | "time";
  value: string;
  onChange: (val: string) => void;
};

function NativePickerInput({ type, value, onChange }: NativePickerInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // useLayoutEffect runs after DOM update, before paint — the best opportunity
  // to call showPicker() while still close to the original user gesture.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    try {
      // showPicker() is the modern API; opens the native calendar/clock UI.
      (el as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
    } catch {
      // Fallback for older browsers — at least focuses the input.
      el.focus();
    }
  }, []);

  return React.createElement("input", {
    ref: inputRef,
    type,
    value,
    autoFocus: true,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    style: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: 10,
      border: `1.5px solid ${BRAND_ACCENT}`,
      backgroundColor: BRAND_ACCENT_LIGHT,
      color: colors.textPrimary,
      fontSize: 17,
      fontFamily: "inherit",
      textAlign: "center",
      boxSizing: "border-box",
      cursor: "pointer",
      outline: "none",
    } as React.CSSProperties,
  });
}

// ─────────────────────────────────────────────────────────
// DeadlinePicker
// ─────────────────────────────────────────────────────────
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

  // Derive string values for the HTML input.
  const dateStr = value.toISOString().slice(0, 10); // YYYY-MM-DD
  const timeStr = `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;

  const handleChange = (raw: string) => {
    if (!raw) return;

    if (mode === "date") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return;
      const [y, m, d] = raw.split("-").map(Number);
      const next = new Date(value);
      next.setFullYear(y, m - 1, d);
      if (!isNaN(next.getTime())) {
        onApplyDate(next);
        onDismiss(); // auto-close after picking
      }
    } else {
      if (!/^\d{2}:\d{2}$/.test(raw)) return;
      const [h, min] = raw.split(":").map(Number);
      const next = new Date(value);
      next.setHours(h, min, 0, 0);
      if (!isNaN(next.getTime())) {
        onApplyTime(next);
        onDismiss(); // auto-close after picking
      }
    }
  };

  return (
    <View style={styles.overlay}>
      {/* Backdrop — tap outside to dismiss */}
      <Pressable style={styles.backdrop} onPress={onDismiss} />

      <View style={styles.card}>
        {/* Header */}
        <AppText style={styles.label}>
          {mode === "date" ? "SELECT DATE" : "SELECT TIME"}
        </AppText>
        <AppText style={styles.preview}>
          {mode === "date" ? formatDate(value) : formatTime(value)}
        </AppText>

        {/* Native date/time input — opens browser picker automatically */}
        <View style={styles.inputWrap}>
          <NativePickerInput
            type={mode}
            value={mode === "date" ? dateStr : timeStr}
            onChange={handleChange}
          />
        </View>

        <AppText style={styles.hint}>
          {mode === "date"
            ? "Click the input to open calendar"
            : "Click the input to open time picker"}
        </AppText>

        {/* Done — also available as manual dismiss */}
        <Pressable onPress={onDismiss} style={styles.doneBtn}>
          <AppText style={styles.doneBtnText}>{"Done"}</AppText>
        </Pressable>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    // position:fixed covers the full viewport regardless of scroll / parent.
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
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    gap: spacing.m,
    alignItems: "center",
    width: 320,
    zIndex: 1,
    borderWidth: 1.5,
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
  hint: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,
    textAlign: "center",
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
