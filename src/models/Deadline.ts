export type DeadlineColorStatus = "green" | "yellow" | "red";

export type ReminderOption = "5m" | "30m" | "1h" | "1d";

// รองรับทั้ง ReminderOption เดิม และ ISO string
export type ReminderValue = ReminderOption | string | null;

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
  colorStatus?: DeadlineColorStatus;
  reminder?: ReminderValue;
  notificationId?: string;
};

export type UpdateDeadlineInput = Partial<CreateDeadlineInput>;
