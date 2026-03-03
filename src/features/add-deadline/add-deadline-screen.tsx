import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton, AppText, IconButton, Input } from "@/src/components";
import { TabRoutes } from "@/src/core/navigation";
import { computeColorStatus, getRemainingMs, t } from "@/src/core/utils";
import {
  useAddDeadlineNavigation,
  useAddDeadlineRoute,
} from "@/src/features/add-deadline/hooks/use-add-deadline-screen";
import { PickerMode } from "@/src/features/add-deadline/types";
import { useDeadlineStore } from "@/src/store/deadline-store";
import { colors, spacing } from "@/src/theme";

const PICKER_LOCALE =
  Platform.OS === "ios" ? "en_US" : "en-US-u-ca-gregory-nu-latn";

type DateTimeFieldProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress: () => void;
};

function DateTimeField({ icon, label, value, onPress }: DateTimeFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Pressable
        onPress={onPress}
        style={styles.dateTimeField}
        accessibilityRole="button"
        accessibilityLabel={
          label === t("date") ? t("openDatePicker") : t("openTimePicker")
        }
      >
        <Ionicons name={icon} size={16} color={colors.textSecondary} />
        <AppText
          variant="body"
          color={value === label ? "textSecondary" : "textPrimary"}
        >
          {value}
        </AppText>
      </Pressable>
    </View>
  );
}

function formatDateDisplay(date: Date): string {
  return new Intl.DateTimeFormat("en-US-u-ca-gregory-nu-latn", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTimeDisplay(date: Date): string {
  return new Intl.DateTimeFormat("en-GB-u-ca-gregory-nu-latn", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
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

export function AddDeadlineScreen() {
  const route = useAddDeadlineRoute();
  const navigation = useAddDeadlineNavigation();

  const deadlines = useDeadlineStore((state) => state.deadlines);
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setCourseName("");
    setAssignmentName("");
    setSelectedDate(null);
    setHasPickedDate(false);
    setHasPickedTime(false);
    setIosPickerMode(null);
    setAndroidPickerMode(null);
    setErrorMessage(null);
  };

  const params = route.params;
  const editId =
    params?.mode === "edit" && params?.id ? String(params.id) : null;
  const isEditMode = Boolean(editId);

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

  const onSave = () => {
    if (
      !courseName.trim() ||
      !assignmentName.trim() ||
      !selectedDate ||
      !hasPickedDate ||
      !hasPickedTime
    ) {
      setErrorMessage(t("fillAllFieldsError"));
      return;
    }

    const dueAt = selectedDate.toISOString();
    const urgencyColor = computeColorStatus(getRemainingMs(dueAt));
    const nowIso = new Date().toISOString();
    const values = {
      courseName: courseName.trim(),
      assignmentName: assignmentName.trim(),
      dueDate: dueAt.slice(0, 10),
      dueTime: dueAt.slice(11, 16),
      dueAt,
      colorStatus: urgencyColor,
      updatedAt: nowIso,
    };

    if (isEditMode && editId) {
      updateDeadline(editId, values);
    } else {
      addDeadline(values);
    }

    resetForm();
    navigation.navigate(TabRoutes.Home);
  };

  const pickerValue = selectedDate ?? new Date();
  const dateValue =
    selectedDate && hasPickedDate ? formatDateDisplay(selectedDate) : t("date");
  const timeValue =
    selectedDate && hasPickedTime ? formatTimeDisplay(selectedDate) : t("time");

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <IconButton
            icon="chevron-back"
            onPress={() => navigation.goBack()}
            accessibilityLabel={t("goBack")}
          />
          <AppText variant="title" style={styles.screenTitleText}>
            {isEditMode ? t("editDeadline") : t("newDeadline")}
          </AppText>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.form}>
          <Input
            label={t("courseName")}
            value={courseName}
            onChangeText={setCourseName}
            placeholder={t("courseName")}
            accessibilityLabel={t("courseNameInput")}
            labelStyle={styles.inputLabelText}
            inputStyle={styles.inputFieldText}
          />
          <Input
            label={t("assignmentName")}
            value={assignmentName}
            onChangeText={setAssignmentName}
            placeholder={t("assignmentName")}
            accessibilityLabel={t("assignmentNameInput")}
            labelStyle={styles.inputLabelText}
            inputStyle={styles.inputFieldText}
          />

          <View style={styles.row}>
            <DateTimeField
              label={t("date")}
              icon="calendar-outline"
              value={dateValue}
              onPress={() => openPicker("date")}
            />
            <DateTimeField
              label={t("time")}
              icon="time-outline"
              value={timeValue}
              onPress={() => openPicker("time")}
            />
          </View>

          {errorMessage ? (
            <AppText color="danger" style={styles.errorText}>
              {errorMessage}
            </AppText>
          ) : null}
        </View>

        <Pressable
          onPress={onSave}
          style={styles.saveButton}
          accessibilityRole="button"
          accessibilityLabel={t("saveDeadline")}
        >
          <AppText variant="button" style={styles.saveButtonText}>
            {t("save")}
          </AppText>
        </Pressable>
      </View>

      {Platform.OS === "ios" && iosPickerMode ? (
        <Modal
          transparent
          animationType="slide"
          visible={Boolean(iosPickerMode)}
          onRequestClose={() => setIosPickerMode(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <AppText variant="heading" style={styles.brownText}>
                  {iosPickerMode === "date" ? t("pickDate") : t("pickTime")}
                </AppText>
                <AppButton
                  label={t("done")}
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
            </View>
          </View>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.s,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.l,
  },
  headerSpacer: { width: 36, height: 36 },
  form: {
    gap: spacing.l,
  },
  row: {
    flexDirection: "row",
    gap: spacing.l,
  },
  fieldGroup: {
    flex: 1,
    gap: spacing.l,
  },
  dateTimeField: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.m,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
  },
  errorText: {
    marginTop: spacing.xs,
  },
  brownText: {
    color: colors.textPrimary,
  },
  screenTitleText: {
    color: colors.textPrimary,
    fontSize: 26,
  },
  inputLabelText: {
    fontSize: 18,
  },
  inputFieldText: {
    fontSize: 15,
  },
  saveButton: {
    marginTop: "auto",
    marginBottom: spacing.xl,
    minHeight: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.buttonBg,
  },
  saveButtonText: {
    color: colors.buttonText,
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: colors.overlay,
  },
  modalSheet: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
    paddingBottom: spacing.xl,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: spacing.m,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.m,
  },
});
