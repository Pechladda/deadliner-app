/**
 * DeadlinePicker — Web stub.
 *
 * On web, date/time picking is handled directly by a transparent
 * <input type="date|time"> overlay rendered inside each DateTimeField button
 * (see add-deadline-screen.tsx). This component is never shown on web.
 */
export type DeadlinePickerProps = {
  mode: "date" | "time" | null;
  value: Date;
  onApplyDate: (d: Date) => void;
  onApplyTime: (d: Date) => void;
  onDismiss: () => void;
  formatDate: (d: Date) => string;
  formatTime: (d: Date) => string;
};

export function DeadlinePicker(_: DeadlinePickerProps) {
  return null;
}
