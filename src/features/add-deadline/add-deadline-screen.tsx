import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton, AppText, PastelBackground } from "@/src/components";
import {
  ANDROID_DATE_PICKER_LOCALE,
  DATE_DISPLAY_LOCALE,
  DATE_DISPLAY_OPTIONS,
  IOS_DATE_PICKER_LOCALE,
  TIME_DISPLAY_LOCALE,
  TIME_DISPLAY_OPTIONS,
} from "@/src/core/config";
import { TabRoutes } from "@/src/core/navigation/route-names";
import { getDeadlineStatus, getDeadlineStatusColor } from "@/src/core/utils";
import {
  useAddDeadlineNavigation,
  useAddDeadlineRoute,
} from "@/src/features/add-deadline/hooks/use-add-deadline-screen";
import { PickerMode } from "@/src/features/add-deadline/types";
import { validateDeadlineForm } from "@/src/features/add-deadline/utils/validate-deadline-form";
import { useDeadlineStore } from "@/src/store/deadline-store";
import {
  addDeadlineTokens,
  colors,
  radius,
  screenSharedTokens,
  shadows,
  spacing,
  typography,
} from "@/src/theme";

const PICKER_LOCALE =
  Platform.OS === "ios" ? IOS_DATE_PICKER_LOCALE : ANDROID_DATE_PICKER_LOCALE;

type FloatingInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  accessibilityLabel: string;
  placeholder: string;
};

function FloatingInput({
  label,
  value,
  onChangeText,
  accessibilityLabel,
  placeholder,
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: focused || value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [focused, value, progress]);

  const labelTop = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 8],
  });

  const labelSize = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [
      typography.preset.body.fontSize,
      typography.preset.caption.fontSize,
    ],
  });

  return (
    <View style={styles.floatingWrap}>
      <Animated.Text
        style={[
          styles.floatingLabel,
          {
            top: labelTop,
            fontSize: labelSize,
          },
        ]}
      >
        {label}
      </Animated.Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused ? placeholder : ""}
        placeholderTextColor={colors.textSecondary}
        style={styles.floatingInput}
        accessibilityLabel={accessibilityLabel}
      />
    </View>
  );
}

type DateTimeFieldProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress: () => void;
};

function DateTimeField({ icon, label, value, onPress }: DateTimeFieldProps) {
  // ถ้า value เป็น 'Date' หรือ 'Time' ให้ใช้สี textSecondary (เหมือน Reminder Time)
  const isPlaceholder = value === label;
  return (
    <Pressable
      onPress={onPress}
      style={styles.dateTimeField}
      accessibilityRole="button"
      accessibilityLabel={
        label === "Date" ? "Open date picker" : "Open time picker"
      }
    >
      <Ionicons name={icon} size={18} color={colors.primary} />
      <AppText
        variant="body"
        color={isPlaceholder ? "textSecondary" : "textPrimary"}
        style={styles.dateTimeText}
      >
        {value}
      </AppText>
    </Pressable>
  );
}

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

function getDateDisplayForOS(
  pickerMode: PickerMode,
): "default" | "spinner" | "calendar" | "clock" | "inline" {
  if (Platform.OS === "ios") {
    return "spinner";
  }

  if (pickerMode === "date") {
    return "calendar";
  }

  return "clock";
}

function ReminderSelection({
  value,
  onChange,
  pickerValue,
  onOpenPicker,
}: {
  value: Date | null;
  onChange: (value: Date) => void;
  pickerValue: Date;
  onOpenPicker: () => void;
}) {
  return (
    <View style={styles.reminderWrap}>
      <AppText variant="caption" style={styles.sectionLabel}>
        {"Reminder Time"}
      </AppText>
      <View style={styles.row}>
        <DateTimeField
          label={value ? formatTimeDisplay(value) : "Time"}
          icon="alarm-outline"
          value={value ? formatTimeDisplay(value) : "Time"}
          onPress={onOpenPicker}
        />
      </View>
    </View>
  );
}

export function AddDeadlineScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < screenSharedTokens.compactWidthThreshold;
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
  const [iosPickerMode, setIosPickerMode] = useState<PickerMode | null>(null);
  const [androidPickerMode, setAndroidPickerMode] = useState<PickerMode | null>(
    null,
  );
  // reminder เก็บเป็น string (ISO) | null
  const [reminder, setReminder] = useState<string | null>(null);
  const [reminderPickerMode, setReminderPickerMode] =
    useState<PickerMode | null>(null);
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
    setIosPickerMode(null);
    setAndroidPickerMode(null);
    setReminder(null);
    setErrorMessage(null);
  };

  useEffect(() => {
    if (!editId) {
      return;
    }

    const target = deadlines.find((item) => item.id === editId);
    if (!target) {
      return;
    }

    const parsedDate = new Date(target.dueAt);
    const safeDate = Number.isNaN(parsedDate.getTime())
      ? new Date()
      : parsedDate;

    setCourseName(target.courseName);
    setAssignmentName(target.assignmentName);
    setSelectedDate(safeDate);
    setHasPickedDate(true);
    setHasPickedTime(true);
    setReminder(target.reminder ?? null); // string | null
    setErrorMessage(null);
  }, [deadlines, editId]);

  const openPicker = (pickerMode: PickerMode) => {
    if (Platform.OS === "ios") {
      if (!selectedDate) {
        setSelectedDate(new Date());
      }
      setIosPickerMode(pickerMode);
      return;
    }

    if (!selectedDate) {
      setSelectedDate(new Date());
    }
    setAndroidPickerMode(pickerMode);
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

  const handlePickerChange = (event: DateTimePickerEvent, value?: Date) => {
    const pickerMode =
      Platform.OS === "ios" ? iosPickerMode : androidPickerMode;

    if (!pickerMode) {
      return;
    }

    if (Platform.OS === "ios") {
      if (!value) return;
      if (pickerMode === "date") {
        applyDate(value);
        return;
      }

      applyTime(value);
      return;
    }

    if (event.type === "dismissed") {
      setAndroidPickerMode(null);
      return;
    }

    if (event.type === "set") {
      setAndroidPickerMode(null);
    }

    if (!value) return;

    if (pickerMode === "date") {
      applyDate(value);
      return;
    }

    applyTime(value);
  };

  const onSave = async () => {
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

    if (!selectedDate) {
      return;
    }

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
      reminder: reminder,
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
        latestError ??
          deadlinesError ??
          "Could not save the deadline. Please try again.",
      );
      setIsSaving(false);
      return;
    }

    resetForm();
    setIsSaving(false);
    navigation.navigate(TabRoutes.Home);
  };

  const pickerValue = selectedDate ?? new Date();
  const dateValue =
    selectedDate && hasPickedDate ? formatDateDisplay(selectedDate) : "Date";
  const timeValue =
    selectedDate && hasPickedTime ? formatTimeDisplay(selectedDate) : "Time";

  // สำหรับ ReminderSelection: แปลง reminder (string | null) เป็น Date | null
  const reminderDate = reminder ? new Date(reminder) : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <PastelBackground />
      <View style={[styles.container, isCompact && styles.containerCompact]}>
        <View style={styles.headerRow}>
          <AppText variant="section" style={styles.screenTitleText}>
            {isEditMode ? "Edit Deadline" : "New Deadline"}
          </AppText>
        </View>

        <BlurView intensity={26} tint="light" style={styles.formCard}>
          <FloatingInput
            label={"Course name"}
            value={courseName}
            onChangeText={setCourseName}
            placeholder={"e.g. Software Engineering"}
            accessibilityLabel={"Course name input"}
          />
          <FloatingInput
            label={"Assignment name"}
            value={assignmentName}
            onChangeText={setAssignmentName}
            placeholder={"e.g. API Design Sprint"}
            accessibilityLabel={"Assignment name input"}
          />

          <View style={styles.sectionWrap}>
            <AppText variant="caption" style={styles.sectionLabel}>
              {"Due"}
            </AppText>
            <View style={styles.row}>
              <DateTimeField
                label={"Date"}
                icon="calendar-outline"
                value={dateValue}
                onPress={() => openPicker("date")}
              />
              <DateTimeField
                label={"Time"}
                icon="time-outline"
                value={timeValue}
                onPress={() => openPicker("time")}
              />
            </View>
          </View>

          <ReminderSelection
            value={reminderDate}
            onChange={(date) => setReminder(date.toISOString())}
            pickerValue={reminderDate ?? new Date()}
            onOpenPicker={() => setReminderPickerMode("time")}
          />

          {errorMessage ? (
            <AppText color="danger" style={styles.errorText}>
              {errorMessage}
            </AppText>
          ) : null}
        </BlurView>

        <View style={styles.saveButtonWrap}>
          <AppButton
            label={isSaving ? "Saving..." : "Save"}
            onPress={() => {
              void onSave();
            }}
            disabled={isSaving}
            iconName="sparkles-outline"
            size="compact"
            labelVariant="caption"
          />
        </View>
      </View>

      {/* Due Date/Time Picker */}
      {Platform.OS === "ios" && iosPickerMode ? (
        <Modal
          transparent
          animationType="fade"
          visible={Boolean(iosPickerMode)}
          onRequestClose={() => setIosPickerMode(null)}
        >
          <BlurView intensity={28} tint="light" style={styles.modalOverlay}>
            <LinearGradient
              colors={addDeadlineTokens.iosModalGradient}
              style={styles.modalSheet}
            >
              <View style={styles.modalHeader}>
                <AppText variant="section" style={styles.modalTitle}>
                  {iosPickerMode === "date" ? "Pick Date" : "Pick Time"}
                </AppText>
                <AppButton
                  label={"Done"}
                  onPress={() => setIosPickerMode(null)}
                />
              </View>
              <DateTimePicker
                value={pickerValue}
                mode={iosPickerMode}
                display={getDateDisplayForOS(iosPickerMode)}
                onChange={handlePickerChange}
                locale={PICKER_LOCALE}
                is24Hour
                themeVariant="light"
              />
            </LinearGradient>
          </BlurView>
        </Modal>
      ) : null}

      {Platform.OS === "android" && androidPickerMode ? (
        <DateTimePicker
          value={pickerValue}
          mode={androidPickerMode}
          display={getDateDisplayForOS(androidPickerMode)}
          onChange={handlePickerChange}
          locale={PICKER_LOCALE}
          is24Hour
          themeVariant="light"
        />
      ) : null}

      {/* Reminder Time Picker */}
      {Platform.OS === "ios" && reminderPickerMode ? (
        <Modal
          transparent
          animationType="fade"
          visible={Boolean(reminderPickerMode)}
          onRequestClose={() => setReminderPickerMode(null)}
        >
          <BlurView intensity={28} tint="light" style={styles.modalOverlay}>
            <LinearGradient
              colors={addDeadlineTokens.iosModalGradient}
              style={styles.modalSheet}
            >
              <View style={styles.modalHeader}>
                <AppText variant="section" style={styles.modalTitle}>
                  Pick Reminder Time
                </AppText>
                <AppButton
                  label={"Done"}
                  onPress={() => setReminderPickerMode(null)}
                />
              </View>
              <DateTimePicker
                value={reminderDate ?? new Date()}
                mode="time"
                display={getDateDisplayForOS("time")}
                onChange={(event, value) => {
                  if (value) setReminder(value.toISOString());
                }}
                locale={PICKER_LOCALE}
                is24Hour
                themeVariant="light"
              />
            </LinearGradient>
          </BlurView>
        </Modal>
      ) : null}

      {Platform.OS === "android" && reminderPickerMode ? (
        <DateTimePicker
          value={reminderDate ?? new Date()}
          mode="time"
          display={getDateDisplayForOS("time")}
          onChange={(event, value) => {
            setReminderPickerMode(null);
            if (value) setReminder(value.toISOString());
          }}
          locale={PICKER_LOCALE}
          is24Hour
          themeVariant="light"
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    paddingHorizontal: spacing.s, // ลด padding ข้างเพื่อให้เนื้อที่กว้างขึ้น
    paddingTop: spacing.l,
    paddingBottom: spacing.l,
  },
  containerCompact: {
    paddingHorizontal: spacing.xs, // ลด padding ข้างในโหมด compact
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: spacing.s,
    marginBottom: spacing.m,
  },
  screenTitleText: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    letterSpacing: screenSharedTokens.screenTitleLetterSpacing,
    marginLeft: spacing.l,
    fontSize: typography.size.l,
    lineHeight: typography.lineHeight.normal,
    marginTop: spacing.m,
    textAlign: "left",
  },
  formCard: {
    borderRadius: radius.xxl,
    borderWidth: 0,
    borderColor: colors.border,
    padding: spacing.m, // ลด padding รอบๆ ช่องกรอก
    gap: spacing.m,
    overflow: "hidden",
    ...shadows.shadowCard,
  },
  floatingWrap: {
    minHeight: 50,
    borderRadius: radius.m,
    backgroundColor: colors.surface, // หรือ homeDeadlineListTokens.searchBackground ถ้า import ได้
    borderWidth: 0,
    borderColor: colors.border, // หรือ homeDeadlineListTokens.searchBorder
    paddingHorizontal: spacing.xs,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  floatingLabel: {
    position: "absolute",
    left: spacing.m,
    color: colors.textSecondary,
    ...typography.preset.caption,
  },
  floatingInput: {
    flex: 1,
    color: colors.textPrimary,
    marginLeft: spacing.m,
    ...typography.preset.body,
    fontSize: typography.size.xs, // ปรับให้เท่ากับช่อง email
    lineHeight: typography.lineHeight.xs,
    marginTop: 12, // คงไว้เพื่อไม่ให้ label ทับ input
  },
  sectionWrap: {
    gap: spacing.s,
  },
  sectionLabel: {
    color: colors.textSecondary,
    letterSpacing: screenSharedTokens.addDeadlineSectionLabelLetterSpacing,
  },
  row: {
    flexDirection: "row",
    gap: spacing.s,
  },
  dateTimeField: {
    flex: 1,
    minHeight: 50, // homeDeadlineListTokens.searchMinHeight
    borderRadius: radius.m, // เหมือน searchWrap
    backgroundColor: colors.surface, // หรือ homeDeadlineListTokens.searchBackground ถ้า import ได้
    borderWidth: 0,
    borderColor: colors.border, // หรือ homeDeadlineListTokens.searchBorder
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
    paddingHorizontal: spacing.m,
    overflow: "hidden",
  },
  dateTimeText: {
    flex: 1,
  },
  reminderWrap: {
    gap: spacing.s,
  },
  reminderOptionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
  },
  reminderOption: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radius.pill,
    borderWidth: 0,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  reminderOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.chipBgActive,
  },
  reminderOptionText: {
    color: colors.textSecondary,
  },
  errorText: {
    marginTop: spacing.xs,
  },
  saveButtonWrap: {
    marginTop: spacing.l,
    alignSelf: "center",
    width: "95%", // ลดความกว้างลง 1 ระดับ (จากเต็มความกว้าง)
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.l,
  },
  modalSheet: {
    borderRadius: radius.xxl,
    borderWidth: 0,
    borderColor: colors.background,
    overflow: "hidden",
    padding: spacing.l,
    gap: spacing.s,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.s,
  },
  modalTitle: {
    color: colors.textPrimary,
  },
});
