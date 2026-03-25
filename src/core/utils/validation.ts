import { Deadline } from "@/src/models/deadline";

const textMaxLength = 120;

type PartialDeadlineInput = Partial<Omit<Deadline, "id">>;

export type ValidatedDeadlineInput = PartialDeadlineInput & {
  courseName: string;
  assignmentName: string;
  dueAt: string;
  dueDate: string;
  dueTime: string;
};

function sanitizeText(value: string): string {
  return value.trim().slice(0, textMaxLength);
}

export function sanitizeDeadlineInput(
  input: PartialDeadlineInput,
): PartialDeadlineInput {
  return {
    ...input,
    courseName:
      typeof input.courseName === "string"
        ? sanitizeText(input.courseName)
        : input.courseName,
    assignmentName:
      typeof input.assignmentName === "string"
        ? sanitizeText(input.assignmentName)
        : input.assignmentName,
  };
}

export function validateDeadlineInput(
  input: PartialDeadlineInput,
): input is ValidatedDeadlineInput {
  if (!input.courseName || !input.assignmentName || !input.dueAt) {
    return false;
  }

  if (!input.dueDate || !input.dueTime) {
    return false;
  }

  const dueAtMs = new Date(input.dueAt).getTime();
  if (Number.isNaN(dueAtMs)) {
    return false;
  }

  return (
    input.courseName.trim().length > 0 && input.assignmentName.trim().length > 0
  );
}
