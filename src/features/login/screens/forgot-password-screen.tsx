import { sendPasswordResetEmail } from "firebase/auth";
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
import { auth } from "@/src/firebase";
import { colors, constants, layout, spacing, typography } from "@/src/theme";

const BRAND_PRIMARY = colors.textPrimary;
const SCREEN_BACKGROUND = colors.background;

const HEADER_SPACER_SIZE = 38;
const FEEDBACK_ROW_MIN_HEIGHT = 22;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RESET_SUCCESS_MESSAGE =
  "Password reset link has been sent to your email.";
const RESET_FAILURE_MESSAGE = "Unable to send reset link. Please try again.";

function validateEmail(email: string): string {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return "Email is required.";
  }

  if (!EMAIL_PATTERN.test(trimmedEmail)) {
    return "Please enter a valid email address.";
  }

  return "";
}

export function ForgotPasswordScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const isCompactLayout = windowWidth < layout.thresholds.compact;
  const isWideLayout = windowWidth >= layout.thresholds.wide;
  const navigation = useLoginNavigation();

  const [email, setEmail] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isEmailFieldTouched, setIsEmailFieldTouched] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shouldShowEmailError = submitAttempted || isEmailFieldTouched;

  const handleEmailChange = (value: string) => {
    setEmail(value);

    if (submitError) {
      setSubmitError("");
    }

    if (submitAttempted || isEmailFieldTouched) {
      setEmailError(validateEmail(value));
    }
  };

  const handleEmailBlur = () => {
    setIsEmailFieldTouched(true);
    setEmailError(validateEmail(email));
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    setSubmitAttempted(true);
    setSubmitError("");
    setSuccessMessage("");

    const validationError = validateEmail(email);
    setEmailError(validationError);
    setIsEmailFieldTouched(true);

    if (validationError) {
      return;
    }

    try {
      setIsSubmitting(true);
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMessage(RESET_SUCCESS_MESSAGE);
    } catch {
      setSubmitError(RESET_FAILURE_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
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
              isCompactLayout && styles.containerCompact,
              isWideLayout && styles.containerWide,
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
                {"Reset Password"}
              </AppText>
              <AppText variant="caption" style={styles.subtitle}>
                {
                  "Enter your email address and we will send you a password reset link."
                }
              </AppText>
            </View>

            <View
              style={[
                styles.formArea,
                isCompactLayout && styles.formAreaCompact,
                isWideLayout && styles.formAreaWide,
              ]}
            >
              <View style={styles.fieldWrap}>
                <FormInput
                  value={email}
                  onChangeText={handleEmailChange}
                  onBlur={handleEmailBlur}
                  placeholder={"Email address"}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  keyboardType="email-address"
                  returnKeyType="done"
                  selectionColor={colors.textPrimary}
                  accessibilityLabel={"Email"}
                  editable={!isSubmitting}
                  compact={isCompactLayout}
                  error={shouldShowEmailError ? emailError : ""}
                  showFeedbackSlot
                />
              </View>

              <AppButton
                title={"Send Reset Link"}
                onPress={handleSubmit}
                isLoading={isSubmitting}
                loadingLabel={"SENDING..."}
                size="compact"
                labelVariant="caption"
                accessibilityLabel={"Send Reset Link"}
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
  fieldWrap: {
    gap: spacing.xxs,
  },
  helperText: {
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.danger,
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
    color: colors.textSecondary,
    textAlign: "center",
  },
});
