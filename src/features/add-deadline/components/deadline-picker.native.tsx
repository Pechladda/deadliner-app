import { AppIcon } from "@/src/components";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import React from "react";
import { Platform, Modal, Pressable, StyleSheet, View } from "react-native";

import { AppText } from "@/src/components";
import {
  ANDROID_DATE_PICKER_LOCALE,
  IOS_DATE_PICKER_LOCALE,
} from "@/src/core/config";
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
const WHITE = "#fff";
const LOCALE =
  Platform.OS === "ios" ? IOS_DATE_PICKER_LOCALE : ANDROID_DATE_PICKER_LOCALE;

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

  const handleApply = () => {
    mode === "date" ? onApplyDate(value) : onApplyTime(value);
    onDismiss();
  };

  const handleChange = (_: DateTimePickerEvent, date?: Date) => {
    if (!date) return;
    if (Platform.OS === "android") {
      mode === "date" ? onApplyDate(date) : onApplyTime(date);
      onDismiss();
      return;
    }
    // iOS: live preview
    mode === "date" ? onApplyDate(date) : onApplyTime(date);
  };

  if (Platform.OS === "android") {
    const AndroidPicker = DateTimePicker as React.ComponentType<Record<string, unknown>>;
    return (
      <AndroidPicker
        value={value}
        mode={mode}
        display={mode === "date" ? "calendar" : "clock"}
        onChange={handleChange}
        locale={LOCALE}
        is24Hour
        themeVariant="light"
      />
    );
  }

  // iOS — bottom sheet modal
  return (
    <Modal
      transparent
      animationType="slide"
      visible
      onRequestClose={handleApply}
    >
      <Pressable style={styles.backdrop} onPress={handleApply} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <AppText style={styles.modeLabel}>
              {mode === "date" ? "SELECT DATE" : "SELECT TIME"}
            </AppText>
            <AppText style={styles.preview}>
              {mode === "date" ? formatDate(value) : formatTime(value)}
            </AppText>
          </View>
          <Pressable onPress={handleApply} style={styles.doneBtn} hitSlop={8}>
            <AppIcon name="checkmark" size={13} color={WHITE} />
            <AppText style={styles.doneBtnText}>{"Done"}</AppText>
          </Pressable>
        </View>
        <View style={styles.divider} />
        <DateTimePicker
          value={value}
          mode={mode as any}
          display="spinner"
          onChange={handleChange}
          locale={LOCALE}
          is24Hour
          themeVariant="light"
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.18)" },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.m,
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xxl,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: spacing.l,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.m,
  },
  titleBlock: { gap: 3 },
  modeLabel: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    letterSpacing: 1.4,
  },
  preview: {
    color: colors.textPrimary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    lineHeight: typography.lineHeight.lg,
  },
  doneBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: BRAND_ACCENT,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
  },
  doneBtnText: {
    color: WHITE,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.3,
    marginHorizontal: -spacing.l,
    marginBottom: spacing.s,
  },
});
