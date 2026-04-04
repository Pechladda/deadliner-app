import { AppText, IconButton } from "@/src/components";
import { StackRoutes } from "@/src/core/navigation";
import { useLoginNavigation } from "@/src/features/login/hooks/use-login-navigation";
import { auth } from "@/src/firebase";
import { colors, radius, spacing, typography } from "@/src/theme";
import { sendPasswordResetEmail } from "firebase/auth";
import { useRef, useState } from "react";
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): string {
  const normalized = email.trim();

  if (!normalized) {
    return "Email is required";
  }

  if (!EMAIL_PATTERN.test(normalized)) {
    return "Please enter a valid email address.";
  }

  return "";
}

export function ForgotPasswordScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 375;
  const isWide = width >= 430;
  const navigation = useLoginNavigation();

  const [email, setEmail] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [touched, setTouched] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;

  const animatePress = (toValue: number) => {
    Animated.timing(buttonScale, {
      toValue,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  const isFormValid = !validateEmail(email);

  const onSubmit = () => {
    if (isSubmitting) {
      return;
    }

    setSubmitAttempted(true);
    setSubmitError("");
    setSuccessMessage("");

    const nextError = validateEmail(email);
    setEmailError(nextError);
    setTouched(true);

    if (nextError) {
      return;
    }

    void (async () => {
      try {
        setIsSubmitting(true);
        await sendPasswordResetEmail(auth, email.trim());
        setSuccessMessage("Password reset link has been sent to your email.");
      } catch {
        setSubmitError("Unable to send reset link. Please try again.");
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
                Reset Password
              </AppText>
              <AppText variant="caption" style={styles.subtitle}>
                Enter your email address and we will send you a password reset
                link.
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
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    if (submitError) {
                      setSubmitError("");
                    }
                    if (submitAttempted || touched) {
                      setEmailError(validateEmail(value));
                    }
                  }}
                  onBlur={() => {
                    setTouched(true);
                    setEmailError(validateEmail(email));
                  }}
                  placeholder="Please enter your registered email address."
                  placeholderTextColor={INPUT_PLACEHOLDER}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  keyboardType="email-address"
                  returnKeyType="done"
                  selectionColor={colors.primary}
                  accessibilityLabel="Email"
                  editable={!isSubmitting}
                  style={[
                    styles.input,
                    isCompact && styles.inputCompact,
                    (submitAttempted || touched) && !!emailError
                      ? styles.inputInvalid
                      : null,
                  ]}
                />
                <View style={styles.errorSlot}>
                  {(submitAttempted || touched) && emailError ? (
                    <AppText style={styles.errorText}>{emailError}</AppText>
                  ) : null}
                </View>
              </View>

              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <Pressable
                  style={[
                    styles.submitButton,
                    isCompact && styles.submitButtonCompact,
                    (!email.trim() || !isFormValid || isSubmitting) &&
                      styles.submitButtonDisabled,
                  ]}
                  onPress={onSubmit}
                  onPressIn={() => animatePress(0.98)}
                  onPressOut={() => animatePress(1)}
                  accessibilityRole="button"
                  accessibilityLabel="Send Reset Link"
                  disabled={isSubmitting}
                >
                  <AppText style={styles.submitText}>
                    {isSubmitting ? "SENDING..." : "Send Reset Link"}
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
