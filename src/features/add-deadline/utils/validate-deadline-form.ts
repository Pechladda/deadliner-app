export type ValidateDeadlineParams = {
  courseName: string;
  assignmentName: string;
  selectedDate: Date | null;
  hasPickedDate: boolean;
  hasPickedTime: boolean;
};

const MAX_TEXT_LENGTH = 120;
const MIN_DUE_MS_FROM_NOW = 60 * 1000;

export function validateDeadlineForm({
  courseName,
  assignmentName,
  selectedDate,
  hasPickedDate,
  hasPickedTime,
}: ValidateDeadlineParams): string | null {
  const trimmedCourse = courseName.trim();
  const trimmedAssignment = assignmentName.trim();

  if (!trimmedCourse || !trimmedAssignment) {
    return "This field is required.";
  }

  if (
    trimmedCourse.length > MAX_TEXT_LENGTH ||
    trimmedAssignment.length > MAX_TEXT_LENGTH
  ) {
    return `Please keep text under ${MAX_TEXT_LENGTH} characters.`;
  }

  if (!selectedDate || !hasPickedDate || !hasPickedTime) {
    return "Please fill Course name, Assignment name, Date and Time.";
  }

  const dueMs = selectedDate.getTime();
  if (Number.isNaN(dueMs)) {
    return "Please choose a valid date and time.";
  }

  if (dueMs <= Date.now() + MIN_DUE_MS_FROM_NOW) {
    return "Due time should be at least 1 minute from now.";
  }

  return null;
}
