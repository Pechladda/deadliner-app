import { Pressable, StyleSheet, TextInput, View } from "react-native";

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

  // Format values for HTML inputs
  const dateStr = value.toISOString().slice(0, 10); // YYYY-MM-DD
  const timeStr = `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;

  const handleDateChange = (text: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return;
    const [y, m, d] = text.split("-").map(Number);
    const merged = new Date(value);
    merged.setFullYear(y, m - 1, d);
    if (!isNaN(merged.getTime())) onApplyDate(merged);
  };

  const handleTimeChange = (text: string) => {
    if (!/^\d{2}:\d{2}$/.test(text)) return;
    const [h, min] = text.split(":").map(Number);
    const merged = new Date(value);
    merged.setHours(h, min, 0, 0);
    if (!isNaN(merged.getTime())) onApplyTime(merged);
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

        {/* React Native Web passes unknown props (like type) through to the DOM <input> */}
        <TextInput
          {...({ type: mode === "date" ? "date" : "time" } as object)}
          value={mode === "date" ? dateStr : timeStr}
          onChangeText={
            mode === "date" ? handleDateChange : handleTimeChange
          }
          style={styles.input}
        />

        <Pressable onPress={onDismiss} style={styles.doneBtn}>
          <AppText style={styles.doneBtnText}>{"Done"}</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.l,
    padding: spacing.xl,
    gap: spacing.m,
    alignItems: "center",
    width: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    letterSpacing: 1.4,
  },
  preview: {
    color: colors.textPrimary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
  },
  input: {
    width: "100%",
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: radius.s,
    borderWidth: 1,
    borderColor: BRAND_ACCENT,
    backgroundColor: BRAND_ACCENT_LIGHT,
    color: colors.textPrimary,
    fontSize: typography.size.sm,
    textAlign: "center",
  } as object,
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
