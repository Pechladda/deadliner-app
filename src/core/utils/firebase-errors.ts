import { t } from "@/src/i18n";

type MaybeFirebaseError = {
  code?: string;
};

export function getAuthErrorMessage(error: unknown): string {
  const code = (error as MaybeFirebaseError | null)?.code ?? "";

  if (code === "auth/invalid-email") {
    return t("authInvalidEmail");
  }

  if (code === "auth/user-disabled") {
    return t("authUserDisabled");
  }

  if (code === "auth/user-not-found") {
    return t("authUserNotFound");
  }

  if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
    return t("authInvalidCredentials");
  }

  if (code === "auth/email-already-in-use") {
    return t("authEmailAlreadyInUse");
  }

  if (code === "auth/weak-password") {
    return t("authWeakPassword");
  }

  if (code === "auth/too-many-requests") {
    return t("authTooManyRequests");
  }

  if (code === "auth/network-request-failed") {
    return t("authNetworkError");
  }

  return t("authUnknownError");
}

export function getFirestoreErrorMessage(error: unknown): string {
  const code = (error as MaybeFirebaseError | null)?.code ?? "";

  if (code === "permission-denied") {
    return t("firestoreSessionExpired");
  }

  if (code === "unavailable" || code === "deadline-exceeded") {
    return t("firestoreTemporarilyUnavailable");
  }

  if (code === "not-found") {
    return t("firestoreDataNotFound");
  }

  if (code === "failed-precondition") {
    return t("firestoreRetryLater");
  }

  if (code === "network-request-failed") {
    return t("firestoreNetworkError");
  }

  return t("firestoreUnknownError");
}
