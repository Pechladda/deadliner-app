import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    updateDoc,
    writeBatch,
} from "firebase/firestore";

import { db } from "@/src/firebase";
import { Deadline } from "@/src/models/deadline";

const deadlinesCollection = "deadlines";

function parseDeadline(snapshotDoc: {
  id: string;
  data: () => Record<string, unknown>;
}): Deadline {
  const data = snapshotDoc.data();
  const dueAt = String(data.dueAt ?? "");

  return {
    id: snapshotDoc.id,
    courseName: String(data.courseName ?? ""),
    assignmentName: String(data.assignmentName ?? ""),
    dueDate: String(data.dueDate ?? ""),
    dueTime: String(data.dueTime ?? ""),
    dueAt,
    colorStatus:
      data.colorStatus === "red" ||
      data.colorStatus === "yellow" ||
      data.colorStatus === "green"
        ? data.colorStatus
        : "green",
    createdAt: String(data.createdAt ?? ""),
    updatedAt: String(data.updatedAt ?? ""),
    reminder:
      data.reminder === "5m" ||
      data.reminder === "30m" ||
      data.reminder === "1h" ||
      data.reminder === "1d"
        ? data.reminder
        : null,
    notificationId:
      typeof data.notificationId === "string" && data.notificationId
        ? data.notificationId
        : undefined,
    completedAt:
      typeof data.completedAt === "string" && data.completedAt
        ? data.completedAt
        : undefined,
  };
}

export async function fetchDeadlines(): Promise<Deadline[]> {
  const deadlinesRef = collection(db, deadlinesCollection);
  const deadlinesQuery = query(deadlinesRef, orderBy("dueAt", "asc"));
  const snapshot = await getDocs(deadlinesQuery);

  return snapshot.docs.map(parseDeadline);
}

export async function createDeadline(
  payload: Omit<Deadline, "id">,
): Promise<void> {
  await addDoc(collection(db, deadlinesCollection), payload);
}

export async function updateDeadlineDoc(
  id: string,
  payload: Partial<Deadline>,
): Promise<void> {
  await updateDoc(doc(db, deadlinesCollection, id), payload);
}

export async function deleteDeadlineDoc(id: string): Promise<void> {
  await deleteDoc(doc(db, deadlinesCollection, id));
}

export async function deleteAllDeadlines(): Promise<void> {
  const deadlinesRef = collection(db, deadlinesCollection);
  const snapshot = await getDocs(deadlinesRef);

  if (snapshot.empty) {
    return;
  }

  const batch = writeBatch(db);
  snapshot.docs.forEach((item) => {
    batch.delete(item.ref);
  });

  await batch.commit();
}
