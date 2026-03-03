export type DeadlineColorStatus = "green" | "yellow" | "red";

export type ReminderOption = "5m" | "30m" | "1h" | "1d";

export interface Deadline {
  id: string;
  courseName: string;
  assignmentName: string;
  dueDate: string;
  dueTime: string;
  dueAt: string;
  colorStatus: DeadlineColorStatus;
  createdAt: string;
  updatedAt: string;
  reminder: ReminderOption | null;
  notificationId?: string;
  completedAt?: string;
}

export type CreateDeadlineInput = Omit<
  Deadline,
  | "id"
  | "colorStatus"
  | "createdAt"
  | "updatedAt"
  | "completedAt"
  | "notificationId"
> & {
  colorStatus?: DeadlineColorStatus;
  reminder?: ReminderOption | null;
  notificationId?: string;
};

export type UpdateDeadlineInput = Partial<CreateDeadlineInput>;
