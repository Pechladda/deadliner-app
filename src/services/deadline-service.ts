import {
    addDoc,
    collection,
    CollectionReference,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    updateDoc,
    writeBatch,
} from "firebase/firestore";

import { auth, db } from "@/src/firebase";
import { Deadline } from "@/src/models/deadline";

const deadlinesCollection = "deadlines";
const usersCollection = "users";

type FirebaseLikeError = Error & { code?: string };

function buildAuthRequiredError(): FirebaseLikeError {
  const error = new Error("Please sign in again.") as FirebaseLikeError;
  error.code = "permission-denied";
  return error;
}

function getUserDeadlinesCollection(): CollectionReference {
  const currentUser = auth.currentUser;

  if (!currentUser?.uid) {
    throw buildAuthRequiredError();
  }

  return collection(db, usersCollection, currentUser.uid, deadlinesCollection);
}

function parseDeadline(snapshotDoc: {
  id: string;
  data: () => Record<string, unknown>;
}): Deadline {
  const data = snapshotDoc.data();
  const dueAt = String(data.dueAt ?? "");
  const completedAt =
    typeof data.completedAt === "string" && data.completedAt
      ? data.completedAt
      : undefined;
  const isCompleted =
    typeof data.isCompleted === "boolean"
      ? data.isCompleted
      : Boolean(completedAt);

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
    isCompleted,
    completedAt,
  };
}

export async function fetchDeadlines(): Promise<Deadline[]> {
  try {
    const deadlinesRef = getUserDeadlinesCollection();
    const deadlinesQuery = query(deadlinesRef, orderBy("dueAt", "asc"));
    const snapshot = await getDocs(deadlinesQuery);

    return snapshot.docs.map(parseDeadline);
  } catch (error) {
    console.error("[Firestore] fetchDeadlines failed:", error);
    throw error;
  }
}

export async function createDeadline(
  payload: Omit<Deadline, "id">,
): Promise<void> {
  try {
    await addDoc(getUserDeadlinesCollection(), payload);
  } catch (error) {
    console.error("[Firestore][deadlines] createDeadline failed", error);
    throw error;
  }
}

export async function updateDeadlineDoc(
  id: string,
  payload: Partial<Deadline>,
): Promise<void> {
  try {
    const deadlinesRef = getUserDeadlinesCollection();
    await updateDoc(doc(deadlinesRef, id), payload);
  } catch (error) {
    console.error("[Firestore][deadlines] updateDeadlineDoc failed", error);
    throw error;
  }
}

export async function deleteDeadlineDoc(id: string): Promise<void> {
  try {
    const deadlinesRef = getUserDeadlinesCollection();
    await deleteDoc(doc(deadlinesRef, id));
  } catch (error) {
    console.error("[Firestore][deadlines] deleteDeadlineDoc failed", error);
    throw error;
  }
}

export async function deleteAllDeadlines(): Promise<void> {
  try {
    const deadlinesRef = getUserDeadlinesCollection();
    const snapshot = await getDocs(deadlinesRef);

    if (snapshot.empty) {
      return;
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach((item) => {
      batch.delete(item.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error("[Firestore][deadlines] deleteAllDeadlines failed", error);
    throw error;
  }
}
