import { AppText, IconButton } from "@/src/components";
import { StackRoutes } from "@/src/core/navigation";
import { useLoginNavigation } from "@/src/features/login/hooks/use-login-navigation";
import { auth, db } from "@/src/firebase";
import { useAuthStore } from "@/src/store/auth-store";
import { colors, radius, spacing, typography } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useMemo, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BRAND_PRIMARY = colors.textPrimary;
const BRAND_LIGHT = colors.border;
const BG_WARM = colors.background;
const INPUT_PLACEHOLDER = colors.textSecondary;

const USERNAME_PATTERN = /^[A-Za-z0-9]+$/;
const THAI_CHAR_PATTERN = /[\u0E00-\u0E7F]/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_DEFAULT_HELPER =
  "Use English letters and numbers only (maximum 6 characters).";
const EMAIL_DEFAULT_HELPER = "Please enter a valid email address.";
const PASSWORD_DEFAULT_HELPER =
  "8–30 characters, including uppercase, lowercase, numbers, and at least one symbol (@, _ or .).";
const CONFIRM_DEFAULT_HELPER = "Password must match.";

const SUCCESS_MESSAGE = "Account created successfully.";

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
  const normalized = username;

  if (!normalized.trim()) {
    return "Username is required.";
  }

  if (/\s/.test(normalized)) {
    return "Username cannot contain spaces.";
  }

  if (normalized.length > 6) {
    return "Use English letters and numbers only (maximum 6 characters).";
  }

  if (
    THAI_CHAR_PATTERN.test(normalized) ||
    !USERNAME_PATTERN.test(normalized)
  ) {
    return "Use English letters and numbers only (maximum 6 characters).";
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
  const normalized = password;

  if (!normalized) {
    return "Password is required.";
  }

  if (normalized.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (normalized.length > 30) {
    return "Password must not exceed 30 characters.";
  }

  if (!/[A-Z]/.test(normalized)) {
    return "Include at least 1 uppercase letter";
  }

  if (!/[a-z]/.test(normalized)) {
    return "Include at least 1 lowercase letter";
  }

  if (!/\d/.test(normalized)) {
    return "Include at least 1 number";
  }

  if (!/[@_.]/.test(normalized)) {
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
  const isCompact = width < 375;
  const isWide = width >= 430;
  const navigation = useLoginNavigation();
  const login = useAuthStore((state) => state.login);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const buttonScale = useRef(new Animated.Value(1)).current;

  const animatePress = (toValue: number) => {
    Animated.timing(buttonScale, {
      toValue,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

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

  const onBlurField = (field: keyof FieldTouched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]:
        field === "username"
          ? validateUsername(username)
          : field === "email"
            ? validateEmail(email)
            : field === "password"
              ? validatePassword(password)
              : validateConfirmPassword(password, confirmPassword),
    }));
  };

  const onChangeUsername = (value: string) => {
    setUsername(value);

    if (submitAttempted || touched.username) {
      setErrors((prev) => ({
        ...prev,
        username: validateUsername(value),
      }));
    }
  };

  const onChangeEmail = (value: string) => {
    setEmail(value);

    if (submitAttempted || touched.email) {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(value),
      }));
    }
  };

  const onChangePassword = (value: string) => {
    setPassword(value);

    if (submitAttempted || touched.password || touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(value),
        confirmPassword: validateConfirmPassword(value, confirmPassword),
      }));
    }
  };

  const onChangeConfirmPassword = (value: string) => {
    setConfirmPassword(value);

    if (submitAttempted || touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(password, value),
      }));
    }
  };

  const validationPreview = useMemo(
    () => buildErrors(username, email, password, confirmPassword),
    [username, email, password, confirmPassword],
  );

  const isFormValid =
    !validationPreview.username &&
    !validationPreview.email &&
    !validationPreview.password &&
    !validationPreview.confirmPassword;

  const hasAnyInput =
    username.trim().length > 0 ||
    email.trim().length > 0 ||
    password.length > 0 ||
    confirmPassword.length > 0;

  const usernameMessage =
    (submitAttempted || touched.username) && errors.username
      ? errors.username
      : USERNAME_DEFAULT_HELPER;

  const emailMessage =
    (submitAttempted || touched.email) && errors.email
      ? errors.email
      : EMAIL_DEFAULT_HELPER;

  const passwordMessage =
    (submitAttempted || touched.password) && errors.password
      ? errors.password
      : PASSWORD_DEFAULT_HELPER;

  const confirmPasswordMessage =
    (submitAttempted || touched.confirmPassword) && errors.confirmPassword
      ? errors.confirmPassword
      : CONFIRM_DEFAULT_HELPER;

  const onSubmit = () => {
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
      try {
        setIsSubmitting(true);

        const credential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );

        const nowIso = new Date().toISOString();

        await setDoc(
          doc(db, "users", credential.user.uid),
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
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
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
                accessibilityLabel="Back"
              />
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.copyBlock}>
              <AppText variant="title" style={styles.title}>
                Create an Account
              </AppText>
              <AppText variant="caption" style={styles.subtitle}>
                Please enter your details to create a new account.
              </AppText>
            </View>

            <View
              style={[
                styles.formArea,
                isCompact && styles.formAreaCompact,
                isWide && styles.formAreaWide,
              ]}
            >
              <View style={styles.fieldWrap}>
                <TextInput
                  value={username}
                  onChangeText={onChangeUsername}
                  onBlur={() => onBlurField("username")}
                  placeholder="Username"
                  placeholderTextColor={INPUT_PLACEHOLDER}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username"
                  textContentType="username"
                  returnKeyType="next"
                  selectionColor={colors.primary}
                  accessibilityLabel="Username"
                  editable={!isSubmitting}
                  style={[
                    styles.input,
                    isCompact && styles.inputCompact,
                    (submitAttempted || touched.username) && !!errors.username
                      ? styles.inputInvalid
                      : null,
                  ]}
                />
                <View style={styles.errorSlot}>
                  <AppText
                    style={[
                      styles.helperText,
                      (submitAttempted || touched.username) && errors.username
                        ? styles.errorText
                        : null,
                    ]}
                  >
                    {usernameMessage}
                  </AppText>
                </View>
              </View>

              <View style={styles.fieldWrap}>
                <TextInput
                  value={email}
                  onChangeText={onChangeEmail}
                  onBlur={() => onBlurField("email")}
                  placeholder="Email"
                  placeholderTextColor={INPUT_PLACEHOLDER}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  keyboardType="email-address"
                  returnKeyType="next"
                  selectionColor={colors.primary}
                  accessibilityLabel="Email"
                  editable={!isSubmitting}
                  style={[
                    styles.input,
                    isCompact && styles.inputCompact,
                    (submitAttempted || touched.email) && !!errors.email
                      ? styles.inputInvalid
                      : null,
                  ]}
                />
                <View style={styles.errorSlot}>
                  <AppText
                    style={[
                      styles.helperText,
                      (submitAttempted || touched.email) && errors.email
                        ? styles.errorText
                        : null,
                    ]}
                  >
                    {emailMessage}
                  </AppText>
                </View>
              </View>

              <View style={styles.fieldWrap}>
                <View style={styles.passwordFieldWrap}>
                  <TextInput
                    value={password}
                    onChangeText={onChangePassword}
                    onBlur={() => onBlurField("password")}
                    placeholder="Password"
                    placeholderTextColor={INPUT_PLACEHOLDER}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password-new"
                    textContentType="newPassword"
                    returnKeyType="next"
                    selectionColor={colors.primary}
                    accessibilityLabel="Password"
                    editable={!isSubmitting}
                    style={[
                      styles.input,
                      styles.passwordInput,
                      isCompact && styles.inputCompact,
                      (submitAttempted || touched.password) && !!errors.password
                        ? styles.inputInvalid
                        : null,
                    ]}
                  />
                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    style={styles.eyeButton}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={colors.primaryStrong}
                    />
                  </Pressable>
                </View>
                <View style={styles.errorSlot}>
                  <AppText
                    style={[
                      styles.helperText,
                      (submitAttempted || touched.password) && errors.password
                        ? styles.errorText
                        : null,
                    ]}
                  >
                    {passwordMessage}
                  </AppText>
                </View>
              </View>

              <View style={styles.fieldWrap}>
                <View style={styles.passwordFieldWrap}>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={onChangeConfirmPassword}
                    onBlur={() => onBlurField("confirmPassword")}
                    placeholder="Confirm Password"
                    placeholderTextColor={INPUT_PLACEHOLDER}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password-new"
                    textContentType="newPassword"
                    returnKeyType="done"
                    selectionColor={colors.primary}
                    accessibilityLabel="Confirm Password"
                    editable={!isSubmitting}
                    style={[
                      styles.input,
                      styles.passwordInput,
                      isCompact && styles.inputCompact,
                      (submitAttempted || touched.confirmPassword) &&
                      !!errors.confirmPassword
                        ? styles.inputInvalid
                        : null,
                    ]}
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword((prev) => !prev)}
                    style={styles.eyeButton}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-off-outline" : "eye-outline"
                      }
                      size={20}
                      color={colors.primaryStrong}
                    />
                  </Pressable>
                </View>
                <View style={styles.errorSlot}>
                  <AppText
                    style={[
                      styles.helperText,
                      (submitAttempted || touched.confirmPassword) &&
                      errors.confirmPassword
                        ? styles.errorText
                        : null,
                    ]}
                  >
                    {confirmPasswordMessage}
                  </AppText>
                </View>
              </View>

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
                    accessibilityLabel="I agree to the Privacy Policy and Terms of Service"
                  >
                    {consentChecked ? (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={colors.primaryStrong}
                      />
                    ) : null}
                  </Pressable>

                  <View style={styles.consentTextWrap}>
                    <AppText style={styles.consentText}>
                      I agree to the{" "}
                    </AppText>
                    <Pressable
                      onPress={() =>
                        navigation.navigate(StackRoutes.PrivacyPolicy)
                      }
                      accessibilityRole="button"
                      accessibilityLabel="Privacy Policy"
                    >
                      <AppText style={styles.consentLinkText}>
                        Privacy Policy
                      </AppText>
                    </Pressable>
                    <AppText style={styles.consentText}>
                      {" "}
                      and Terms of Service
                    </AppText>
                  </View>
                </View>

                <View style={styles.errorSlot}>
                  {consentError ? (
                    <AppText style={[styles.helperText, styles.errorText]}>
                      {consentError}
                    </AppText>
                  ) : null}
                </View>
              </View>

              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <Pressable
                  style={[
                    styles.submitButton,
                    isCompact && styles.submitButtonCompact,
                    (!hasAnyInput ||
                      !isFormValid ||
                      isSubmitting ||
                      !consentChecked) &&
                      styles.submitButtonDisabled,
                  ]}
                  onPress={onSubmit}
                  onPressIn={() => animatePress(0.98)}
                  onPressOut={() => animatePress(1)}
                  accessibilityRole="button"
                  accessibilityLabel="Register"
                  disabled={isSubmitting}
                >
                  <AppText style={styles.submitText}>
                    {isSubmitting ? "SIGNING UP..." : "Sign Up"}
                  </AppText>
                </Pressable>
              </Animated.View>

              <Pressable
                onPress={() => navigation.navigate(StackRoutes.Login)}
                accessibilityRole="button"
                accessibilityLabel="Back to Sign In"
                style={styles.backToLoginButton}
                disabled={isSubmitting}
              >
                <AppText style={styles.backToLoginText}>
                  Back to Sign In
                </AppText>
              </Pressable>

              <View style={styles.feedbackRow}>
                {submitError ? (
                  <AppText style={[styles.helperText, styles.errorText]}>
                    {submitError}
                  </AppText>
                ) : null}
                {!submitError && successMessage ? (
                  <AppText style={styles.successText}>{successMessage}</AppText>
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
    backgroundColor: BG_WARM,
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
    width: 38,
    height: 38,
  },
  copyBlock: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  title: {
    color: BRAND_PRIMARY,
    letterSpacing: 0.6,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.xxl,
    textAlign: "left",
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    letterSpacing: 0.2,
    textAlign: "left",
    lineHeight: typography.lineHeight.compact,
  },
  formArea: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    gap: spacing.l,
  },
  formAreaCompact: {
    maxWidth: 360,
  },
  formAreaWide: {
    maxWidth: 460,
  },
  fieldWrap: {
    gap: spacing.xxs,
  },
  input: {
    minHeight: 50,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: BRAND_LIGHT,
    backgroundColor: colors.surface,
    color: BRAND_PRIMARY,
    fontSize: typography.size.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  inputCompact: {
    minHeight: 46,
    fontSize: typography.size.xs,
  },
  passwordFieldWrap: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 52,
  },
  eyeButton: {
    position: "absolute",
    right: 10,
    top: "50%",
    marginTop: -16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  inputInvalid: {
    borderColor: colors.danger,
  },
  errorSlot: {
    minHeight: 22,
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.xxs,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: typography.size.s,
    lineHeight: typography.lineHeight.compact,
  },
  errorText: {
    color: colors.danger,
  },
  submitButton: {
    marginTop: 0,
    minHeight: 48,
    borderRadius: radius.xxl,
    backgroundColor: colors.buttonBg,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonCompact: {
    minHeight: 44,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: colors.buttonText,
    fontSize: typography.size.s,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.2,
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
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
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
    color: colors.textSecondary,
    fontSize: typography.size.s,
    lineHeight: typography.lineHeight.compact,
  },
  consentLinkText: {
    color: colors.textSecondary,
    textDecorationLine: "underline",
    fontSize: typography.size.s,
    lineHeight: typography.lineHeight.compact,
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
    fontSize: typography.size.s,
  },
  feedbackRow: {
    minHeight: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  successText: {
    color: colors.success,
    fontSize: typography.size.s,
    textAlign: "center",
  },
});
