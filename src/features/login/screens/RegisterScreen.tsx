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
import { t } from "@/src/i18n";
import { useAuthStore } from "@/src/store/auth-store";
import {
    colors,
    loginTokens,
    screenSharedTokens,
    spacing,
    typography,
} from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
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

const BRAND_PRIMARY = colors.textPrimary;
const BG_WARM = colors.background;

const USERNAME_PATTERN = /^[A-Za-z0-9]+$/;
const THAI_CHAR_PATTERN = /[\u0E00-\u0E7F]/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_DEFAULT_HELPER = t("registerPasswordHelper");

const SUCCESS_MESSAGE = t("registerSuccess");

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
    return t("registerUsernameRequired");
  }

  if (/\s/.test(normalized)) {
    return t("registerUsernameNoSpaces");
  }

  if (normalized.length > 20) {
    return t("registerUsernameFormat");
  }

  if (
    THAI_CHAR_PATTERN.test(normalized) ||
    !USERNAME_PATTERN.test(normalized)
  ) {
    return t("registerUsernameFormat");
  }

  return "";
}

function validateEmail(email: string): string {
  const normalized = email.trim();

  if (!normalized) {
    return t("registerEmailRequired");
  }

  if (!EMAIL_PATTERN.test(normalized)) {
    return t("registerEmailInvalid");
  }

  return "";
}

function validatePassword(password: string): string {
  const normalized = password;

  if (!normalized) {
    return t("registerPasswordRequired");
  }

  if (normalized.length < 8) {
    return t("registerPasswordMinLength");
  }

  if (normalized.length > 30) {
    return t("registerPasswordMaxLength");
  }

  if (!/[A-Z]/.test(normalized)) {
    return t("registerPasswordUppercase");
  }

  if (!/[a-z]/.test(normalized)) {
    return t("registerPasswordLowercase");
  }

  if (!/\d/.test(normalized)) {
    return t("registerPasswordNumber");
  }

  if (!/[@_.]/.test(normalized)) {
    return t("registerPasswordSymbol");
  }

  return "";
}

function validateConfirmPassword(
  password: string,
  confirmPassword: string,
): string {
  if (!confirmPassword) {
    return t("registerConfirmPasswordRequired");
  }

  if (confirmPassword !== password) {
    return t("registerConfirmPasswordMismatch");
  }

  return "";
}

export function RegisterScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < loginTokens.compactWidthThreshold;
  const isWide = width >= loginTokens.wideWidthThreshold;
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

  const showUsernameError =
    (submitAttempted || touched.username) && Boolean(errors.username);
  const showEmailError =
    (submitAttempted || touched.email) && Boolean(errors.email);
  const showConfirmPasswordError =
    (submitAttempted || touched.confirmPassword) &&
    Boolean(errors.confirmPassword);

  const isSignUpDisabled = isSubmitting;

  const onSubmit = () => {
    setSubmitAttempted(true);
    setSubmitError("");
    setSuccessMessage("");

    if (!consentChecked) {
      setConsentError(t("registerConsentRequired"));
      return;
    }

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setSubmitError(t("registerCompleteRequiredFields"));
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
          setSubmitError(t("registerEmailAlreadyUsed"));
        } else if (code === "auth/invalid-email") {
          setSubmitError(t("registerEmailInvalid"));
        } else {
          setSubmitError(t("registerCreateFailed"));
        }
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
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
                accessibilityLabel={t("goBack")}
              />
              <View style={styles.headerSpacer} />
            </View>

            <View style={styles.copyBlock}>
              <AppText variant="title" style={styles.title}>
                {t("registerTitle")}
              </AppText>
              <AppText variant="caption" style={styles.subtitle}>
                {t("registerSubtitle")}
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
                onChangeText={onChangeUsername}
                onBlur={() => onBlurField("username")}
                placeholder={t("usernamePlaceholder")}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                textContentType="username"
                returnKeyType="next"
                selectionColor={colors.primary}
                accessibilityLabel={t("usernameInput")}
                editable={!isSubmitting}
                compact={isCompact}
                error={showUsernameError ? errors.username : ""}
                showFeedbackSlot
              />

              <FormInput
                value={email}
                onChangeText={onChangeEmail}
                onBlur={() => onBlurField("email")}
                placeholder={t("email")}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                keyboardType="email-address"
                returnKeyType="next"
                selectionColor={colors.primary}
                accessibilityLabel={t("email")}
                editable={!isSubmitting}
                compact={isCompact}
                error={showEmailError ? errors.email : ""}
                showFeedbackSlot
              />

              <FormInput
                value={password}
                onChangeText={onChangePassword}
                onBlur={() => onBlurField("password")}
                placeholder={t("passwordPlaceholder")}
                isPassword
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password-new"
                textContentType="newPassword"
                returnKeyType="next"
                selectionColor={colors.primary}
                accessibilityLabel={t("passwordInput")}
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
                onChangeText={onChangeConfirmPassword}
                onBlur={() => onBlurField("confirmPassword")}
                placeholder={t("registerConfirmPasswordPlaceholder")}
                isPassword
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password-new"
                textContentType="newPassword"
                returnKeyType="done"
                selectionColor={colors.primary}
                accessibilityLabel={t("registerConfirmPasswordInput")}
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
                    accessibilityLabel={t("registerConsentFull")}
                  >
                    {consentChecked ? (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={colors.textPrimary}
                      />
                    ) : null}
                  </Pressable>

                  <View style={styles.consentTextWrap}>
                    <AppText style={styles.consentText}>
                      {t("registerConsentPrefix")}{" "}
                    </AppText>
                    <Pressable
                      onPress={() =>
                        navigation.navigate(StackRoutes.PrivacyPolicy)
                      }
                      accessibilityRole="button"
                      accessibilityLabel={t("privacyPolicy")}
                    >
                      <AppText style={styles.consentLinkText}>
                        {t("privacyPolicy")}
                      </AppText>
                    </Pressable>
                    <AppText style={styles.consentText}>
                      {" "}
                      {t("registerConsentSuffix")}
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

              <AppButton
                title={
                  isSubmitting ? t("registerSigningUp") : t("registerSignUp")
                }
                onPress={onSubmit}
                isLoading={isSubmitting}
                loadingLabel={t("registerSigningUp")}
                size={isCompact ? "compact" : "default"}
                accessibilityLabel={t("registerScreenAccessibility")}
                disabled={isSignUpDisabled}
              />

              <Pressable
                onPress={() => navigation.navigate(StackRoutes.Login)}
                accessibilityRole="button"
                accessibilityLabel={t("registerBackToSignIn")}
                style={styles.backToLoginButton}
                disabled={isSubmitting}
              >
                <AppText style={styles.backToLoginText}>
                  {t("registerBackToSignIn")}
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
    maxWidth: loginTokens.formAreaMaxWidth,
    alignSelf: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  title: {
    color: BRAND_PRIMARY,
    letterSpacing: loginTokens.titleLetterSpacing,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.xl,
    lineHeight: screenSharedTokens.screenTitleLineHeight,
    textAlign: "left",
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    letterSpacing: loginTokens.createAccountLetterSpacing,
    textAlign: "left",
    lineHeight: typography.lineHeight.compact,
  },
  formArea: {
    width: "100%",
    maxWidth: loginTokens.formAreaMaxWidth,
    alignSelf: "center",
    gap: spacing.l,
  },
  formAreaCompact: {
    maxWidth: loginTokens.formAreaCompactMaxWidth,
  },
  formAreaWide: {
    maxWidth: loginTokens.formAreaWideMaxWidth,
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
