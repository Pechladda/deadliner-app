export type DeadlineColorStatus = "green" | "yellow" | "red" | "orange";

export type ReminderOption = "5m" | "30m" | "1h" | "1d";

// Accepts legacy ReminderOption tokens as well as ISO date strings
export type ReminderValue = ReminderOption | string | null;

export interface Deadline {
  id: string;
  courseName: string;
  assignmentName: string;

  dueDate: string;
  dueTime: string;
  dueAt: string;

  // Kept as generic string so stores can pass either token names or hex values
  colorStatus: string;
  createdAt: string;
  updatedAt: string;
  reminder: ReminderValue;
  notificationId?: string | null;
  isCompleted?: boolean;
  completedAt?: string | null;
}

export type CreateDeadlineInput = Omit<
  Deadline,
  | "id"
  | "colorStatus"
  | "createdAt"
  | "updatedAt"
  | "isCompleted"
  | "completedAt"
  | "notificationId"
> & {
  colorStatus?: string;
  reminder?: ReminderValue;
  notificationId?: string | null;
};

export type UpdateDeadlineInput = Partial<CreateDeadlineInput>;
