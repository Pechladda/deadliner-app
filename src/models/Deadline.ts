export type DeadlineColorStatus = "green" | "yellow" | "red";

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
}

export type CreateDeadlineInput = Omit<
  Deadline,
  "id" | "colorStatus" | "createdAt" | "updatedAt"
> & {
  colorStatus?: DeadlineColorStatus;
};

export type UpdateDeadlineInput = Partial<CreateDeadlineInput>;
