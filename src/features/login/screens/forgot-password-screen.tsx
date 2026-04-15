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
import { colors, loginTokens, spacing, typography } from "@/src/theme";
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

const BRAND_PRIMARY = colors.textPrimary;
const BG_WARM = colors.background;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export function ForgotPasswordScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < loginTokens.compactWidthThreshold;
  const isWide = width >= loginTokens.wideWidthThreshold;
  const navigation = useLoginNavigation();

  const [email, setEmail] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [touched, setTouched] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChangeEmail = (value: string) => {
    setEmail(value);
    if (submitError) setSubmitError("");

    if (submitAttempted || touched) {
      setEmailError(validateEmail(value));
    }
  };

  const onBlurEmail = () => {
    setTouched(true);
    setEmailError(validateEmail(email));
  };

  const onSubmit = async () => {
    if (isSubmitting) return;

    setSubmitAttempted(true);
    setSubmitError("");
    setSuccessMessage("");

    const nextError = validateEmail(email);
    setEmailError(nextError);
    setTouched(true);

    if (nextError) return;

    try {
      setIsSubmitting(true);
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMessage("Password reset link has been sent to your email.");
    } catch {
      setSubmitError("Unable to send reset link. Please try again.");
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
                isCompact && styles.formAreaCompact,
                isWide && styles.formAreaWide,
              ]}
            >
              <View style={styles.fieldWrap}>
                <FormInput
                  value={email}
                  onChangeText={onChangeEmail}
                  onBlur={onBlurEmail}
                  placeholder={"Email address"}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  keyboardType="email-address"
                  returnKeyType="done"
                  selectionColor={colors.primary}
                  accessibilityLabel={"Email"}
                  editable={!isSubmitting}
                  compact={isCompact}
                  error={submitAttempted || touched ? emailError : ""}
                  showFeedbackSlot
                />
              </View>

              <AppButton
                title={"Send Reset Link"}
                onPress={onSubmit}
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
    textAlign: "left",
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    letterSpacing: loginTokens.createAccountLetterSpacing,
    textAlign: "left",
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
    minHeight: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  successText: {
    color: colors.textSecondary,
    textAlign: "center",
  },
});
