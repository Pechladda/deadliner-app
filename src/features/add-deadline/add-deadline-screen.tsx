import { AppIcon } from "@/src/components";
import { useFocusEffect } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { useCallback, useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton, AppText, PastelBackground } from "@/src/components";
import {
  DATE_DISPLAY_LOCALE,
  DATE_DISPLAY_OPTIONS,
  TIME_DISPLAY_LOCALE,
  TIME_DISPLAY_OPTIONS,
} from "@/src/core/config";
import { TabRoutes } from "@/src/core/navigation/route-names";
import { getDeadlineStatus, getDeadlineStatusColor } from "@/src/core/utils";
import {
  useAddDeadlineNavigation,
  useAddDeadlineRoute,
} from "@/src/features/add-deadline/hooks/use-add-deadline-screen";
import { DeadlinePicker } from "@/src/features/add-deadline/components/deadline-picker";
import { PickerMode } from "@/src/features/add-deadline/types";
import { validateDeadlineForm } from "@/src/features/add-deadline/utils/validate-deadline-form";
import { useDeadlineStore } from "@/src/store/deadline-store";
import {
  colors,
  constants,
  layout,
  radius,
  spacing,
  typography,
} from "@/src/theme";

// Brand palette — pink accents shared across time-based deadline UI.
const BRAND_ACCENT = "#EAB8C9";
const BRAND_ACCENT_DARK = "#C9849A";
const BRAND_ACCENT_LIGHT = "#FAF0F4";
const BRAND_ACCENT_BORDER = "#F0D0DC";

const WHITE = "#fff";
const ERROR_BG = "#FFF0F0";

// Icon sizes
const ICON_SIZE_XS = 11;
const ICON_SIZE_SM = 13;
const ICON_SIZE_MD = 15;
const ICON_SIZE_LG = 16;

// Field/control dimensions
const FIELD_MIN_HEIGHT = 45;
const BLUR_INTENSITY = 26;

// Reminder label map — user-facing Thai strings for confirmation indicator.
const REMINDER_LABEL_MAP: Record<string, string> = {
  "5m": "5 minutes before deadline",
  "30m": "30 minutes before deadline",
  "1h": "1 hour before deadline",
  "1d": "1 day before deadline",
};

const REMINDER_OPTIONS: {
  label: string;
  icon: string;
  value: string | null;
}[] = [
  { label: "5 min", icon: "alarm-outline", value: "5m" },
  { label: "30 min", icon: "alarm-outline", value: "30m" },
  { label: "1 hr", icon: "notifications-outline", value: "1h" },
  { label: "1 day", icon: "notifications-outline", value: "1d" },
  { label: "None", icon: "notifications-off-outline", value: null },
];

// ─────────────────────────────────────────────
// SectionLabel — small caption above each input group.
// ─────────────────────────────────────────────
function SectionLabel({ children }: { children: string }) {
  return (
    <AppText
      variant="caption"
      style={{
        color: colors.textSecondary,
        fontSize: typography.size.xs,
        letterSpacing: constants.typography.letterSpacing.tight,
        marginBottom: 4,
      }}
    >
      {children}
    </AppText>
  );
}

// ─────────────────────────────────────────────
// FloatingInput — text input with icon and clear button.
// ─────────────────────────────────────────────
type FloatingInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  accessibilityLabel: string;
  icon: string;
};

function FloatingInput({
  label,
  value,
  onChangeText,
  accessibilityLabel,
  icon,
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[
        styles.floatingInput,
        isFocused && {
          borderColor: BRAND_ACCENT,
          backgroundColor: BRAND_ACCENT_LIGHT,
        },
      ]}
    >
      <AppIcon
        name={icon}
        size={ICON_SIZE_LG}
        color={isFocused ? BRAND_ACCENT_DARK : colors.textSecondary}
        style={{ marginRight: 8 }}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor={colors.textSecondary}
        style={styles.floatingInputText}
        accessibilityLabel={accessibilityLabel}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText("")} hitSlop={8}>
          <AppIcon
            name="close-circle"
            size={ICON_SIZE_MD}
            color={colors.textSecondary}
          />
        </Pressable>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────
// DateTimeField — date or time picker trigger.
// ─────────────────────────────────────────────
type DateTimeFieldProps = {
  icon: string;
  label: string;
  value: string;
  onPress: () => void;
};

function DateTimeField({ icon, label, value, onPress }: DateTimeFieldProps) {
  const hasPicked = value !== label;
  return (
    <Pressable
      onPress={onPress}
      style={[styles.dateTimeField, hasPicked && styles.dateTimeFieldActive]}
      accessibilityRole="button"
      accessibilityLabel={
        label === "Date" ? "Open date picker" : "Open time picker"
      }
    >
      <AppIcon
        name={icon}
        size={ICON_SIZE_MD}
        color={hasPicked ? BRAND_ACCENT_DARK : colors.textSecondary}
      />
      <AppText
        variant="caption"
        style={[
          styles.dateTimeText,
          hasPicked && {
            color: colors.textPrimary,
            fontWeight: typography.weight.semibold,
          },
        ]}
      >
        {value}
      </AppText>
    </Pressable>
  );
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function formatDateDisplay(date: Date): string {
  return new Intl.DateTimeFormat(
    DATE_DISPLAY_LOCALE,
    DATE_DISPLAY_OPTIONS,
  ).format(date);
}

function formatTimeDisplay(date: Date): string {
  return new Intl.DateTimeFormat(
    TIME_DISPLAY_LOCALE,
    TIME_DISPLAY_OPTIONS,
  ).format(date);
}

// ─────────────────────────────────────────────
// ReminderSelection — reminder pill selector.
// ─────────────────────────────────────────────
function ReminderSelection({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <View style={styles.reminderWrap}>
      <View style={styles.reminderLabelRow}>
        <AppIcon
          name="notifications-outline"
          size={ICON_SIZE_SM}
          color={BRAND_ACCENT_DARK}
        />
        <SectionLabel>{"Reminder"}</SectionLabel>
      </View>
      <View style={styles.reminderOptionsRow}>
        {REMINDER_OPTIONS.map((option) => {
          const isActive = value === option.value;
          return (
            <Pressable
              key={String(option.value)}
              style={[
                styles.reminderPill,
                isActive && styles.reminderPillActive,
              ]}
              onPress={() => onChange(option.value)}
            >
              <AppIcon
                name={option.icon}
                size={ICON_SIZE_XS}
                color={isActive ? WHITE : BRAND_ACCENT_DARK}
              />
              <AppText
                style={[
                  styles.reminderPillText,
                  isActive && styles.reminderPillTextActive,
                ]}
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// ReminderIndicator — confirmation chip shown when reminder is set.
// ─────────────────────────────────────────────
function ReminderIndicator({ value }: { value: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.reminderIndicator}>
      <AppIcon
        name="notifications"
        size={ICON_SIZE_SM}
        color={BRAND_ACCENT_DARK}
      />
      <AppText style={styles.reminderIndicatorText}>
        {"Reminder: " + (REMINDER_LABEL_MAP[value] ?? value)}
      </AppText>
    </View>
  );
}

// ─────────────────────────────────────────────
// AddDeadlineScreen
// ─────────────────────────────────────────────
export function AddDeadlineScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const isCompactLayout = windowWidth < layout.thresholds.compact;
  const isTabletLayout = windowWidth >= layout.thresholds.tablet;
  const route = useAddDeadlineRoute();
  const navigation = useAddDeadlineNavigation();

  const deadlines = useDeadlineStore((state) => state.deadlines);
  const deadlinesError = useDeadlineStore((state) => state.deadlinesError);
  const addDeadline = useDeadlineStore((state) => state.addDeadline);
  const updateDeadline = useDeadlineStore((state) => state.updateDeadline);

  const [courseName, setCourseName] = useState("");
  const [assignmentName, setAssignmentName] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hasPickedDate, setHasPickedDate] = useState(false);
  const [hasPickedTime, setHasPickedTime] = useState(false);
  const [pickerMode, setPickerMode] = useState<PickerMode | null>(null);
  const [reminder, setReminder] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const params = route.params;
  const editId =
    params?.mode === "edit" && params?.id ? String(params.id) : null;
  const isEditMode = Boolean(editId);

  const resetForm = () => {
    setCourseName("");
    setAssignmentName("");
    setSelectedDate(null);
    setHasPickedDate(false);
    setHasPickedTime(false);
    setPickerMode(null);
    setReminder(null);
    setErrorMessage(null);
  };

  useEffect(() => {
    if (!editId) return;
    const target = deadlines.find((item) => item.id === editId);
    if (!target) return;
    if (target.dueAt) {
      const parsedDate = new Date(target.dueAt);
      const safeDate = Number.isNaN(parsedDate.getTime())
        ? new Date()
        : parsedDate;
      setSelectedDate(safeDate);
      setHasPickedDate(true);
      setHasPickedTime(true);
    }
    setCourseName(target.courseName);
    setAssignmentName(target.assignmentName);
    setReminder(target.reminder ?? null);
    setErrorMessage(null);
  }, [deadlines, editId]);

  useFocusEffect(
    useCallback(() => {
      if (!isEditMode) resetForm();
    }, [isEditMode]),
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      navigation.setParams({ mode: undefined, id: undefined });
      resetForm();
    });
    return unsubscribe;
  }, [navigation]);

  const openPicker = (mode: PickerMode) => {
    if (!selectedDate) setSelectedDate(new Date());
    setPickerMode(mode);
  };

  const applyDate = (nextDate: Date) => {
    setSelectedDate((current) => {
      const base = current ?? new Date();
      const merged = new Date(base);
      merged.setFullYear(nextDate.getFullYear());
      merged.setMonth(nextDate.getMonth());
      merged.setDate(nextDate.getDate());
      return merged;
    });
    setHasPickedDate(true);
  };

  const applyTime = (nextDate: Date) => {
    setSelectedDate((current) => {
      const base = current ?? new Date();
      const merged = new Date(base);
      merged.setHours(nextDate.getHours(), nextDate.getMinutes(), 0, 0);
      return merged;
    });
    setHasPickedTime(true);
  };

  const handleSave = async () => {
    setErrorMessage(null);

    const validationError = validateDeadlineForm({
      courseName,
      assignmentName,
      selectedDate,
      hasPickedDate,
      hasPickedTime,
    });
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    if (!selectedDate) return;

    setIsSaving(true);

    const dueAt = selectedDate.toISOString();
    const urgencyColor = getDeadlineStatusColor(getDeadlineStatus(dueAt));
    const nowIso = new Date().toISOString();

    const values = {
      courseName: courseName.trim(),
      assignmentName: assignmentName.trim(),
      dueDate: dueAt.slice(0, 10),
      dueTime: dueAt.slice(11, 16),
      dueAt,
      reminder,
      colorStatus: urgencyColor,
      updatedAt: nowIso,
    };

    const isSuccess =
      isEditMode && editId
        ? await updateDeadline(editId, values)
        : await addDeadline(values);

    if (!isSuccess) {
      const latestError = useDeadlineStore.getState().deadlinesError;
      setErrorMessage(
        latestError ?? deadlinesError ?? "Could not save. Please try again.",
      );
      setIsSaving(false);
      return;
    }

    resetForm();
    setIsSaving(false);
    navigation.setParams({ mode: undefined, id: undefined });
    navigation.navigate(TabRoutes.Home);
  };

  const pickerValue = selectedDate ?? new Date();
  const dateValue =
    selectedDate && hasPickedDate ? formatDateDisplay(selectedDate) : "Date";
  const timeValue =
    selectedDate && hasPickedTime ? formatTimeDisplay(selectedDate) : "Time";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <PastelBackground />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isCompactLayout && styles.scrollContentCompact,
          isTabletLayout && styles.scrollContentTablet,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <AppText variant="subtitle" style={styles.screenTitleText}>
            {isEditMode ? "Edit Deadline" : "New Deadline"}
          </AppText>
        </View>

        {/* Form card */}
        <BlurView
          intensity={BLUR_INTENSITY}
          tint="light"
          style={styles.formCard}
        >
          <View style={styles.fieldGroup}>
            <SectionLabel>{"Course"}</SectionLabel>
            <FloatingInput
              label="Course name"
              value={courseName}
              onChangeText={setCourseName}
              accessibilityLabel="Course name input"
              icon="book-outline"
            />
            <SectionLabel>{"Assignment"}</SectionLabel>
            <FloatingInput
              label="Assignment name"
              value={assignmentName}
              onChangeText={setAssignmentName}
              accessibilityLabel="Assignment name input"
              icon="document-text-outline"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.fieldGroup}>
            <SectionLabel>{"Date & Time *"}</SectionLabel>
            <View style={styles.row}>
              <DateTimeField
                label="Date"
                icon="calendar-outline"
                value={dateValue}
                onPress={() => openPicker("date")}
              />
              <DateTimeField
                label="Time"
                icon="time-outline"
                value={timeValue}
                onPress={() => openPicker("time")}
              />
            </View>
          </View>

          <View style={styles.divider} />
          <ReminderSelection value={reminder} onChange={setReminder} />
          <ReminderIndicator value={reminder} />

          {/* Error */}
          {errorMessage ? (
            <View style={styles.errorRow}>
              <AppIcon
                name="alert-circle-outline"
                size={ICON_SIZE_SM}
                color={colors.overdue}
              />
              <AppText style={styles.errorText}>{errorMessage}</AppText>
            </View>
          ) : null}
        </BlurView>

        {/* Save / Update button */}
        <View style={styles.saveButtonWrap}>
          <AppButton
            label={isSaving ? "Saving..." : isEditMode ? "Update" : "Save"}
            onPress={() => {
              void handleSave();
            }}
            disabled={isSaving}
            iconName="sparkles-outline"
            size="compact"
            labelVariant="caption"
          />
          {isEditMode && (
            <AppButton
              label="Cancel"
              onPress={() => navigation.goBack()}
              disabled={isSaving}
              iconName="close-outline"
              size="compact"
              labelVariant="caption"
            />
          )}
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      <DeadlinePicker
        mode={pickerMode}
        value={pickerValue}
        onApplyDate={(d: Date) => { applyDate(d); }}
        onApplyTime={(d: Date) => { applyTime(d); }}
        onDismiss={() => setPickerMode(null)}
        formatDate={formatDateDisplay}
        formatTime={formatTimeDisplay}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },

  scrollContent: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
    width: "100%",
  },
  scrollContentCompact: { paddingHorizontal: spacing.m },
  scrollContentTablet: {},

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
    marginBottom: spacing.m,
    marginTop: spacing.m,
    marginLeft: spacing.m,
  },
  screenTitleText: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.l,
    lineHeight: typography.lineHeight.m,
  },

  formCard: {
    borderRadius: radius.s,
    overflow: "hidden",
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    gap: spacing.m,
  },
  fieldGroup: { gap: spacing.xs },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.4,
    marginHorizontal: -spacing.m,
  },

  floatingInput: {
    minHeight: FIELD_MIN_HEIGHT,
    borderRadius: radius.s,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.m,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  floatingInputText: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    paddingVertical: spacing.s,
  },

  // Date/Time fields
  row: { flexDirection: "row", gap: spacing.s },
  dateTimeField: {
    flex: 1,
    minHeight: FIELD_MIN_HEIGHT,
    borderRadius: radius.s,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
    paddingHorizontal: spacing.m,
  },
  dateTimeFieldActive: {
    borderColor: BRAND_ACCENT,
    backgroundColor: BRAND_ACCENT_LIGHT,
  },
  dateTimeText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.size.sm,
  },

  // Reminder
  reminderWrap: { gap: spacing.s },
  reminderLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reminderOptionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  reminderPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: BRAND_ACCENT_BORDER,
    backgroundColor: colors.surface,
  },
  reminderPillActive: {
    backgroundColor: BRAND_ACCENT,
    borderColor: BRAND_ACCENT,
  },
  reminderPillText: {
    color: BRAND_ACCENT_DARK,
    fontSize: typography.size.xs,
    fontWeight: "500",
  },
  reminderPillTextActive: { color: WHITE, fontWeight: "700" },

  // Reminder indicator
  reminderIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: BRAND_ACCENT_LIGHT,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: BRAND_ACCENT_BORDER,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    alignSelf: "flex-start",
  },
  reminderIndicatorText: {
    color: BRAND_ACCENT_DARK,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },

  // Error
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: ERROR_BG,
    borderRadius: radius.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  errorText: { color: colors.overdue, fontSize: typography.size.xs, flex: 1 },

  saveButtonWrap: { marginTop: spacing.l, width: "100%", gap: spacing.s },

});
