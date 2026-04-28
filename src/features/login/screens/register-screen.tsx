import { AppIcon } from "@/src/components";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AppButton,
  AppText,
  FormInput,
  IconButton,
  PastelBackground,
} from "@/src/components";
import { StackRoutes } from "@/src/core/navigation/route-names";
import { useLoginNavigation } from "@/src/features/login/hooks/use-login-navigation";
import { auth, db } from "@/src/firebase";
import { useAuthStore } from "@/src/store/auth-store";
import { colors, constants, layout, spacing, typography } from "@/src/theme";

const BRAND_PRIMARY = colors.textPrimary;
const SCREEN_BACKGROUND = colors.background;

const MAX_USERNAME_LENGTH = 20;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 30;
const HEADER_SPACER_SIZE = 38;
const CONSENT_CHECKBOX_SIZE = 22;
const CONSENT_CHECKBOX_RADIUS = 6;
const CHECKMARK_ICON_SIZE = 16;
const ERROR_SLOT_MIN_HEIGHT = 22;
const FEEDBACK_ROW_MIN_HEIGHT = 22;
const USERS_COLLECTION = "users";

const USERNAME_PATTERN = /^[A-Za-z0-9]+$/;
const THAI_CHAR_PATTERN = /[\u0E00-\u0E7F]/;
const WHITESPACE_PATTERN = /\s/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UPPERCASE_PATTERN = /[A-Z]/;
const LOWERCASE_PATTERN = /[a-z]/;
const DIGIT_PATTERN = /\d/;
const ALLOWED_SYMBOL_PATTERN = /[@_.]/;

const PASSWORD_DEFAULT_HELPER =
  "8–30 characters, including uppercase, lowercase, numbers, and at least one symbol (@, _ or .).";
const SUCCESS_MESSAGE = "Account created successfully.";
const USERNAME_FORMAT_ERROR = `Use English letters and numbers (maximum ${MAX_USERNAME_LENGTH} characters).`;

type FieldErrors = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FieldTouched = {
  username: boolean;
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
};

function validateUsername(username: string): string {
  if (!username.trim()) {
    return "Username is required.";
  }

  if (WHITESPACE_PATTERN.test(username)) {
    return "Username cannot contain spaces.";
  }

  if (username.length > MAX_USERNAME_LENGTH) {
    return USERNAME_FORMAT_ERROR;
  }

  if (THAI_CHAR_PATTERN.test(username) || !USERNAME_PATTERN.test(username)) {
    return USERNAME_FORMAT_ERROR;
  }

  return "";
}

function validateEmail(email: string): string {
  const normalized = email.trim();

  if (!normalized) {
    return "Email is required.";
  }

  if (!EMAIL_PATTERN.test(normalized)) {
    return "Please enter a valid email address.";
  }

  return "";
}

function validatePassword(password: string): string {
  if (!password) {
    return "Password is required.";
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Password must not exceed ${MAX_PASSWORD_LENGTH} characters.`;
  }

  if (!UPPERCASE_PATTERN.test(password)) {
    return "Include at least 1 uppercase letter";
  }

  if (!LOWERCASE_PATTERN.test(password)) {
    return "Include at least 1 lowercase letter";
  }

  if (!DIGIT_PATTERN.test(password)) {
    return "Include at least 1 number";
  }

  if (!ALLOWED_SYMBOL_PATTERN.test(password)) {
    return "Include at least 1 of these: @ _ .";
  }

  return "";
}

function validateConfirmPassword(
  password: string,
  confirmPassword: string,
): string {
  if (!confirmPassword) {
    return "Please confirm your password.";
  }

  if (confirmPassword !== password) {
    return "Password does not match.";
  }

  return "";
}

export function RegisterScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < layout.thresholds.compact;
  const isWide = width >= layout.thresholds.wide;
  const navigation = useLoginNavigation();
  const login = useAuthStore((state) => state.login);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState<FieldTouched>({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentError, setConsentError] = useState("");

  const buildErrors = (
    nextUsername: string,
    nextEmail: string,
    nextPassword: string,
    nextConfirmPassword: string,
  ): FieldErrors => {
    return {
      username: validateUsername(nextUsername),
      email: validateEmail(nextEmail),
      password: validatePassword(nextPassword),
      confirmPassword: validateConfirmPassword(
        nextPassword,
        nextConfirmPassword,
      ),
    };
  };

  const validateSingleField = (field: keyof FieldTouched): string => {
    switch (field) {
      case "username":
        return validateUsername(username);
      case "email":
        return validateEmail(email);
      case "password":
        return validatePassword(password);
      case "confirmPassword":
        return validateConfirmPassword(password, confirmPassword);
    }
  };

  const handleFieldBlur = (field: keyof FieldTouched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]: validateSingleField(field),
    }));
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);

    if (submitAttempted || touched.username) {
      setErrors((prev) => ({
        ...prev,
        username: validateUsername(value),
      }));
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);

    if (submitAttempted || touched.email) {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(value),
      }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    if (submitAttempted || touched.password || touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(value),
        confirmPassword: validateConfirmPassword(value, confirmPassword),
      }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);

    if (submitAttempted || touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(password, value),
      }));
    }
  };

  const showUsernameError =
    (submitAttempted || touched.username) && Boolean(errors.username);
  const showEmailError =
    (submitAttempted || touched.email) && Boolean(errors.email);
  const showConfirmPasswordError =
    (submitAttempted || touched.confirmPassword) &&
    Boolean(errors.confirmPassword);

  const isSignUpDisabled = isSubmitting;

  const handleSubmit = () => {
    setSubmitAttempted(true);
    setSubmitError("");
    setSuccessMessage("");

    if (!consentChecked) {
      setConsentError("You must agree to the Privacy Policy to continue.");
      return;
    }

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setSubmitError("Please complete all required fields.");
    }

    const nextErrors = buildErrors(username, email, password, confirmPassword);
    setErrors(nextErrors);
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (
      nextErrors.username ||
      nextErrors.email ||
      nextErrors.password ||
      nextErrors.confirmPassword
    ) {
      return;
    }

    void (async () => {
      let createdUserId: string | null = null;

      try {
        setIsSubmitting(true);

        const credential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );
        createdUserId = credential.user.uid;

        const nowIso = new Date().toISOString();

        await setDoc(
          doc(db, USERS_COLLECTION, credential.user.uid),
          {
            uid: credential.user.uid,
            name: username.trim(),
            username: username.trim(),
            email: email.trim(),
            createdAt: nowIso,
            updatedAt: nowIso,
          },
          { merge: true },
        );

        await login();
        setSuccessMessage(SUCCESS_MESSAGE);
      } catch (error) {
        if (createdUserId && auth.currentUser?.uid === createdUserId) {
          try {
            await deleteUser(auth.currentUser);
          } catch {
            // Best-effort rollback. Keep the original submission error visible.
          }
        }

        const code =
          error instanceof FirebaseError ? error.code : "unknown-error";

        if (code === "auth/email-already-in-use") {
          setSubmitError("This email is already registered.");
        } else if (code === "auth/invalid-email") {
          setSubmitError("Please enter a valid email address.");
        } else {
          setSubmitError("Unable to create account. Please try again.");
        }
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <PastelBackground />
      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.container,
              isCompact && styles.containerCompact,
              isWide && styles.containerWide,
            ]}
          >
            <View style={styles.headerRow}>
              <IconButton
                icon="chevron-back"
                onPress={() => navigation.goBack()}
                accessibilityLabel={"Go back"}
              />
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.copyBlock}>
              <AppText variant="section" style={styles.title}>
                {"Create an Account"}
              </AppText>
              <AppText variant="caption" style={styles.subtitle}>
                {"Please enter your details to create a new account."}
              </AppText>
            </View>

            <View
              style={[
                styles.formArea,
                isCompact && styles.formAreaCompact,
                isWide && styles.formAreaWide,
              ]}
            >
              <FormInput
                value={username}
                onChangeText={handleUsernameChange}
                onBlur={() => handleFieldBlur("username")}
                placeholder={"Username"}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                textContentType="username"
                returnKeyType="next"
                selectionColor={colors.textPrimary}
                accessibilityLabel={"Username input"}
                editable={!isSubmitting}
                compact={isCompact}
                error={showUsernameError ? errors.username : ""}
                showFeedbackSlot
              />

              <FormInput
                value={email}
                onChangeText={handleEmailChange}
                onBlur={() => handleFieldBlur("email")}
                placeholder={"Email"}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                keyboardType="email-address"
                returnKeyType="next"
                selectionColor={colors.textPrimary}
                accessibilityLabel={"Email"}
                editable={!isSubmitting}
                compact={isCompact}
                error={showEmailError ? errors.email : ""}
                showFeedbackSlot
              />

              <FormInput
                value={password}
                onChangeText={handlePasswordChange}
                onBlur={() => handleFieldBlur("password")}
                placeholder={"Password"}
                isPassword
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password-new"
                textContentType="newPassword"
                returnKeyType="next"
                selectionColor={colors.textPrimary}
                accessibilityLabel={"Password input"}
                editable={!isSubmitting}
                compact={isCompact}
                error={
                  submitAttempted || touched.password ? errors.password : ""
                }
                helperText={
                  (submitAttempted || touched.password) && errors.password
                    ? ""
                    : PASSWORD_DEFAULT_HELPER
                }
                showFeedbackSlot
              />

              <FormInput
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                onBlur={() => handleFieldBlur("confirmPassword")}
                placeholder={"Confirm Password"}
                isPassword
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password-new"
                textContentType="newPassword"
                returnKeyType="done"
                selectionColor={colors.textPrimary}
                accessibilityLabel={"Confirm password input"}
                editable={!isSubmitting}
                compact={isCompact}
                error={showConfirmPasswordError ? errors.confirmPassword : ""}
                showFeedbackSlot
              />

              <View style={styles.consentWrap}>
                <View style={styles.consentRow}>
                  <Pressable
                    onPress={() => {
                      setConsentChecked((prev) => !prev);
                      if (consentError) {
                        setConsentError("");
                      }
                    }}
                    style={styles.consentCheckbox}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: consentChecked }}
                    accessibilityLabel={
                      "I agree to the Privacy Policy and Terms of Service"
                    }
                  >
                    {consentChecked ? (
                      <AppIcon
                        name="checkmark"
                        size={CHECKMARK_ICON_SIZE}
                        color={colors.textPrimary}
                      />
                    ) : null}
                  </Pressable>

                  <View style={styles.consentTextWrap}>
                    <AppText style={styles.consentText}>
                      {"I agree to the"}{" "}
                    </AppText>
                    <Pressable
                      onPress={() =>
                        navigation.navigate(StackRoutes.PrivacyPolicy)
                      }
                      accessibilityRole="button"
                      accessibilityLabel={"Privacy Policy"}
                    >
                      <AppText style={styles.consentLinkText}>
                        {"Privacy Policy"}
                      </AppText>
                    </Pressable>
                    <AppText style={styles.consentText}>
                      {" "}
                      {"and Terms of Service"}
                    </AppText>
                  </View>
                </View>

                <View style={styles.errorSlot}>
                  {consentError ? (
                    <AppText
                      variant="caption"
                      style={[styles.helperText, styles.errorText]}
                    >
                      {consentError}
                    </AppText>
                  ) : null}
                </View>
              </View>

              <AppButton
                title={isSubmitting ? "SIGNING UP..." : "Sign Up"}
                onPress={handleSubmit}
                isLoading={isSubmitting}
                loadingLabel={"SIGNING UP..."}
                size="compact"
                labelVariant="caption"
                accessibilityLabel={"Register"}
                disabled={isSignUpDisabled}
              />

              <Pressable
                onPress={() => navigation.navigate(StackRoutes.Login)}
                accessibilityRole="button"
                accessibilityLabel={"Back to Sign In"}
                style={styles.backToLoginButton}
                disabled={isSubmitting}
              >
                <AppText variant="caption" style={styles.backToLoginText}>
                  {"Back to Sign In"}
                </AppText>
              </Pressable>

              <View style={styles.feedbackRow}>
                {submitError ? (
                  <AppText
                    variant="caption"
                    style={[styles.helperText, styles.errorText]}
                  >
                    {submitError}
                  </AppText>
                ) : null}
                {!submitError && successMessage ? (
                  <AppText variant="caption" style={styles.successText}>
                    {successMessage}
                  </AppText>
                ) : null}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SCREEN_BACKGROUND,
  },
  keyboardWrap: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.l,
    paddingBottom: spacing.l,
  },
  containerCompact: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
  },
  containerWide: {
    paddingHorizontal: spacing.xxxl,
    paddingTop: spacing.xl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.s,
  },
  headerSpacer: {
    width: HEADER_SPACER_SIZE,
    height: HEADER_SPACER_SIZE,
  },
  copyBlock: {
    width: "100%",
    maxWidth: layout.components.login.formAreaMaxWidth,
    alignSelf: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  title: {
    color: BRAND_PRIMARY,
    letterSpacing: constants.typography.letterSpacing.normal,
    fontWeight: typography.weight.bold,
    textAlign: "left",
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    letterSpacing: constants.typography.letterSpacing.tight,
    textAlign: "left",
  },
  formArea: {
    width: "100%",
    maxWidth: layout.components.login.formAreaMaxWidth,
    alignSelf: "center",
    gap: spacing.l,
  },
  formAreaCompact: {
    maxWidth: layout.components.login.formAreaCompactMaxWidth,
  },
  formAreaWide: {
    maxWidth: layout.components.login.formAreaWideMaxWidth,
  },
  errorSlot: {
    minHeight: ERROR_SLOT_MIN_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.xxs,
  },
  helperText: {
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.danger,
  },
  consentWrap: {
    gap: spacing.xxs,
  },
  consentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
  },
  consentCheckbox: {
    width: CONSENT_CHECKBOX_SIZE,
    height: CONSENT_CHECKBOX_SIZE,
    borderRadius: CONSENT_CHECKBOX_RADIUS,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  consentTextWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  consentText: {
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.textSecondary,
  },
  consentLinkText: {
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    color: colors.textSecondary,
    textDecorationLine: "underline",
  },
  backToLoginButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
  backToLoginText: {
    color: colors.textSecondary,
    textDecorationLine: "underline",
  },
  feedbackRow: {
    minHeight: FEEDBACK_ROW_MIN_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  successText: {
    color: colors.success,
    textAlign: "center",
  },
});
