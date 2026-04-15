

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
    return "This field is required.";
  }

  if (
    courseName.trim().length > maxTextLength ||
    assignmentName.trim().length > maxTextLength
  ) {
    return "Please keep text under 120 characters.";
  }

  if (!selectedDate || !hasPickedDate || !hasPickedTime) {
    return "Please fill Course name, Assignment name, Date and Time.";
  }

  const dueMs = selectedDate.getTime();
  if (Number.isNaN(dueMs)) {
    return "Please choose a valid date and time.";
  }

  if (dueMs <= Date.now() + minDueMsFromNow) {
    return "Due time should be at least 1 minute from now.";
  }

  return null;
}
