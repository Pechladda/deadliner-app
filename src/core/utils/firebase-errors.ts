

type MaybeFirebaseError = {
  code?: string;
};

export function getAuthErrorMessage(error: unknown): string {
  const code = (error as MaybeFirebaseError | null)?.code ?? "";

  if (code === "auth/invalid-email") {
    return "Please enter a valid email address.";
  }

  if (code === "auth/user-disabled") {
    return "This account has been disabled. Please contact support.";
  }

  if (code === "auth/user-not-found") {
    return "No account was found for this email.";
  }

  if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
    return "Invalid email or password.";
  }

  if (code === "auth/email-already-in-use") {
    return "This email is already in use. Please log in instead.";
  }

  if (code === "auth/weak-password") {
    return "Password is too weak. Please choose a stronger password.";
  }

  if (code === "auth/too-many-requests") {
    return "Too many attempts. Please wait a moment and try again.";
  }

  if (code === "auth/network-request-failed") {
    return "Network error. Please check your connection and try again.";
  }

  return "Something went wrong. Please try again.";
}

export function getFirestoreErrorMessage(error: unknown): string {
  const code = (error as MaybeFirebaseError | null)?.code ?? "";

  if (code === "permission-denied") {
    return "Session expired. Please sign in again.";
  }

  if (code === "unavailable" || code === "deadline-exceeded") {
    return "Service is temporarily unavailable. Please try again shortly.";
  }

  if (code === "not-found") {
    return "Requested data was not found.";
  }

  if (code === "failed-precondition") {
    return "The operation cannot be completed right now. Please retry.";
  }

  if (code === "network-request-failed") {
    return "Network error. Please check your connection and try again.";
  }

  return "Unable to complete this action right now. Please try again.";
}
