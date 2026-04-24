import { AppIcon } from "@/src/components";
import { useFocusEffect } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { createElement, useCallback, useEffect, useState } from "react";
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
  { label: "5 min", icon: "notifications-outline", value: "5m" },
  { label: "30 min", icon: "notifications-outline", value: "30m" },
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
  /** Web only: type of the overlaid native input */
  pickerType?: "date" | "time";
  /** Web only: called with raw "YYYY-MM-DD" or "HH:MM" string on change */
  onWebApply?: (raw: string) => void;
};

function DateTimeField({
  icon,
  label,
  value,
  onPress,
  pickerType,
  onWebApply,
}: DateTimeFieldProps) {
  const hasPicked = value !== label;
  // On web, suppress onPress only when pickerType is set (overlay <input> handles it).
  // When pickerType is absent (Date field uses custom WebCalendar), onPress fires normally.
  const effectiveOnPress =
    Platform.OS === "web" && pickerType ? undefined : onPress;
  return (
    <Pressable
      onPress={effectiveOnPress}
      style={[
        styles.dateTimeField,
        hasPicked && styles.dateTimeFieldActive,
        Platform.OS === "web" && pickerType &&
          ({ position: "relative", overflow: "hidden" } as object),
      ]}
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

      {/* Web overlay — a transparent native <input> fills the button area.
          Because the user physically clicks this input, the browser considers
          it a direct user gesture and opens the native date/time picker
          immediately on all browsers (Safari, Chrome, Firefox, mobile). */}
      {Platform.OS === "web" && pickerType && onWebApply &&
        createElement("input", {
          type: pickerType,
          "aria-label": label === "Date" ? "Open date picker" : "Open time picker",
          onChange: (e: { target: { value: string } }) => onWebApply(e.target.value),
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            cursor: "pointer",
            padding: 0,
            border: "none",
            boxSizing: "border-box",
          },
        })
      }
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
// WebCalendar — custom inline calendar for web.
// Renders full-width inside the form card so it matches
// the form content width exactly. No browser popup needed.
// ─────────────────────────────────────────────
const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
const CAL_CELL_SIZE = 36;

type WebCalendarProps = {
  value: Date;
  onSelect: (date: Date) => void;
  onDismiss: () => void;
};

function WebCalendar({ value, onSelect, onDismiss }: WebCalendarProps) {
  const [view, setView] = useState(
    () => new Date(value.getFullYear(), value.getMonth(), 1),
  );

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const rows = Array.from({ length: cells.length / 7 }, (_, r) =>
    cells.slice(r * 7, r * 7 + 7),
  );

  const today = new Date();
  const isToday = (d: number) =>
    year === today.getFullYear() &&
    month === today.getMonth() &&
    d === today.getDate();
  const isSelected = (d: number) =>
    year === value.getFullYear() &&
    month === value.getMonth() &&
    d === value.getDate();

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(view);

  return (
    <View style={calStyles.root}>
      {/* Month navigation */}
      <View style={calStyles.header}>
        <Pressable
          onPress={() => setView(new Date(year, month - 1, 1))}
          style={calStyles.navBtn}
          hitSlop={8}
        >
          <AppIcon name="chevron-back" size={13} color={BRAND_ACCENT_DARK} />
        </Pressable>
        <AppText style={calStyles.monthLabel}>{monthLabel}</AppText>
        <Pressable
          onPress={() => setView(new Date(year, month + 1, 1))}
          style={calStyles.navBtn}
          hitSlop={8}
        >
          <AppIcon name="chevron-forward" size={13} color={BRAND_ACCENT_DARK} />
        </Pressable>
      </View>

      {/* Day-of-week headers */}
      <View style={calStyles.weekRow}>
        {WEEK_DAYS.map((d) => (
          <AppText key={d} style={calStyles.weekLabel}>
            {d}
          </AppText>
        ))}
      </View>

      {/* Day grid */}
      {rows.map((row, ri) => (
        <View key={ri} style={calStyles.weekRow}>
          {row.map((day, ci) => {
            if (!day) return <View key={ci} style={calStyles.dayCell} />;
            const sel = isSelected(day);
            const tod = isToday(day);
            return (
              <Pressable
                key={ci}
                style={[
                  calStyles.dayCell,
                  sel && calStyles.dayCellSelected,
                  !sel && tod && calStyles.dayCellToday,
                ]}
                onPress={() => {
                  const next = new Date(value);
                  next.setFullYear(year, month, day);
                  onSelect(next);
                }}
                hitSlop={2}
              >
                <AppText
                  style={[
                    calStyles.dayText,
                    sel && calStyles.dayTextSelected,
                    !sel && tod && calStyles.dayTextToday,
                  ]}
                >
                  {String(day)}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      ))}

      {/* Cancel */}
      <Pressable onPress={onDismiss} style={calStyles.cancelRow}>
        <AppText style={calStyles.cancelText}>{"Cancel"}</AppText>
      </Pressable>
    </View>
  );
}

const calStyles = StyleSheet.create({
  root: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: BRAND_ACCENT_BORDER,
    paddingTop: spacing.s,
    gap: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  monthLabel: {
    color: colors.textPrimary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  navBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.s,
    backgroundColor: BRAND_ACCENT_LIGHT,
  },
  weekRow: {
    flexDirection: "row",
  },
  weekLabel: {
    flex: 1,
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: typography.size.xs,
    paddingVertical: 4,
  },
  dayCell: {
    flex: 1,
    height: CAL_CELL_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.s,
  },
  dayCellSelected: {
    backgroundColor: BRAND_ACCENT,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: BRAND_ACCENT,
  },
  dayText: {
    fontSize: typography.size.xs,
    color: colors.textPrimary,
  },
  dayTextSelected: {
    color: WHITE,
    fontWeight: typography.weight.bold,
  },
  dayTextToday: {
    color: BRAND_ACCENT_DARK,
    fontWeight: typography.weight.semibold,
  },
  cancelRow: {
    alignItems: "center",
    paddingVertical: spacing.s,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: typography.size.xs,
  },
});

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
  const [webCalendarOpen, setWebCalendarOpen] = useState(false);

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
                onPress={
                  Platform.OS === "web"
                    ? () => setWebCalendarOpen((o) => !o)
                    : () => openPicker("date")
                }
              />
              <DateTimeField
                label="Time"
                icon="time-outline"
                value={timeValue}
                onPress={() => openPicker("time")}
                pickerType="time"
                onWebApply={(raw) => {
                  if (!/^\d{2}:\d{2}$/.test(raw)) return;
                  const [h, min] = raw.split(":").map(Number);
                  const next = new Date(selectedDate ?? new Date());
                  next.setHours(h, min, 0, 0);
                  if (!isNaN(next.getTime())) applyTime(next);
                }}
              />
            </View>

            {/* Web-only: custom inline calendar — full-width, no browser popup */}
            {Platform.OS === "web" && webCalendarOpen && (
              <WebCalendar
                value={selectedDate ?? new Date()}
                onSelect={(d) => {
                  applyDate(d);
                  setWebCalendarOpen(false);
                }}
                onDismiss={() => setWebCalendarOpen(false)}
              />
            )}
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
