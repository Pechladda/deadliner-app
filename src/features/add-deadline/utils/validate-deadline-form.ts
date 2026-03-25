import { t } from "@/src/core/utils";

export type ValidateDeadlineParams = {
  courseName: string;
  assignmentName: string;
  selectedDate: Date | null;
  hasPickedDate: boolean;
  hasPickedTime: boolean;
};

const maxTextLength = 120;
const minDueMsFromNow = 60 * 1000;

export function validateDeadlineForm({
  courseName,
  assignmentName,
  selectedDate,
  hasPickedDate,
  hasPickedTime,
}: ValidateDeadlineParams): string | null {
  if (!courseName.trim() || !assignmentName.trim()) {
    return t("fieldRequired");
  }

  if (
    courseName.trim().length > maxTextLength ||
    assignmentName.trim().length > maxTextLength
  ) {
    return t("fieldTooLong");
  }

  if (!selectedDate || !hasPickedDate || !hasPickedTime) {
    return t("fillAllFieldsError");
  }

  const dueMs = selectedDate.getTime();
  if (Number.isNaN(dueMs)) {
    return t("invalidDateTime");
  }

  if (dueMs <= Date.now() + minDueMsFromNow) {
    return t("dueAtLeastOneMinute");
  }

  return null;
}
