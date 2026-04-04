import { AppText } from "@/src/components";
import { StackRoutes } from "@/src/core/navigation";
import { t } from "@/src/core/utils";
import { useLoginNavigation } from "@/src/features/login/hooks/use-login-navigation";
import { auth } from "@/src/firebase";
import { useAuthStore } from "@/src/store/auth-store";
import { usePrivacyStore } from "@/src/store/privacy-store";
import { colors, radius, spacing, typography } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
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
import Svg, { Circle, Line } from "react-native-svg";

const BRAND_PRIMARY = colors.textPrimary;
const BRAND_ACCENT = colors.primaryStrong;
const BRAND_LIGHT = colors.border;
const BG_WARM = colors.background;
const INPUT_PLACEHOLDER = colors.textSecondary;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ClockLogo() {
  const stroke = BRAND_PRIMARY;
  const accent = BRAND_ACCENT;

  const ticks = Array.from({ length: 12 }, (_, i) => {
    const deg = i * 30;
    const rad = (Math.PI * deg) / 180;
    const isMain = i % 3 === 0;
    const inner = isMain ? 20 : 22;
    return { rad, isMain, inner };
  });

  return (
    <Svg width={90} height={90} viewBox="0 0 64 64">
      {/* Outer circle */}
      <Circle
        cx="32"
        cy="32"
        r="26"
        stroke={stroke}
        strokeWidth="2.5"
        fill="none"
      />

      {/* Hour ticks */}
      {ticks.map(({ rad, isMain, inner }, i) => (
        <Line
          key={i}
          x1={32 + inner * Math.sin(rad)}
          y1={32 - inner * Math.cos(rad)}
          x2={32 + 26 * Math.sin(rad)}
          y2={32 - 26 * Math.cos(rad)}
          stroke={stroke}
          strokeWidth={isMain ? 2 : 1}
          strokeLinecap="round"
          opacity={isMain ? 1 : 0.35}
        />
      ))}

      {/* Minute hand — 12 o'clock */}
      <Line
        x1="32"
        y1="32"
        x2="32"
        y2="10"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Hour hand — ~10 o'clock */}
      <Line
        x1="32"
        y1="32"
        x2="19"
        y2="22"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Second hand accent */}
      <Line
        x1="32"
        y1="36"
        x2="44"
        y2="18"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Center dot */}
      <Circle cx="32" cy="32" r="2.5" fill={accent} />
    </Svg>
  );
}

export function LoginScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 375;
  const isWide = width >= 430;
  const navigation = useLoginNavigation();
  const login = useAuthStore((state) => state.login);
  const consentGranted = usePrivacyStore((state) => state.consentGranted);
  const hydrateConsent = usePrivacyStore((state) => state.hydrateConsent);
  const setConsent = usePrivacyStore((state) => state.setConsent);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [consentError, setConsentError] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    void hydrateConsent();
  }, [hydrateConsent]);

  const animatePress = (toValue: number) => {
    Animated.timing(buttonScale, {
      toValue,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  const onChangeEmail = (value: string) => {
    setEmail(value);
    if (authError) {
      setAuthError("");
    }
  };

  const onChangePassword = (value: string) => {
    setPassword(value);
    if (authError) {
      setAuthError("");
    }
  };

  const onSubmit = () => {
    if (isSubmitting) {
      return;
    }

    setAuthError("");
    const normalizedEmail = email.trim();

    if (!normalizedEmail && !password) {
      setAuthError("Please enter your email and password.");
      return;
    }

    if (!normalizedEmail) {
      setAuthError("Email is required.");
      return;
    }

    if (!password) {
      setAuthError("Password is required.");
      return;
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setAuthError("Please enter a valid email address.");
      return;
    }

    if (!consentGranted && !consentChecked) {
      setConsentError(t("consentRequired"));
      return;
    }

    setConsentError("");

    void (async () => {
      try {
        setIsSubmitting(true);

        if (!consentGranted && consentChecked) {
          await setConsent(true);
        }

        await signInWithEmailAndPassword(auth, normalizedEmail, password);
        await login();
      } catch {
        setAuthError("Invalid email or password.");
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.screenBody}>
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
              <View
                style={[
                  styles.logoBlock,
                  isCompact && styles.logoBlockCompact,
                  isWide && styles.logoBlockWide,
                ]}
              >
                <ClockLogo />
                <AppText
                  variant="title"
                  style={[
                    styles.title,
                    isCompact && styles.titleCompact,
                    isWide && styles.titleWide,
                  ]}
                >
                  DEADLINER
                </AppText>
              </View>

              <View
                style={[
                  styles.formArea,
                  isCompact && styles.formAreaCompact,
                  isWide && styles.formAreaWide,
                ]}
              >
                <View style={styles.formFieldsGroup}>
                  <View style={styles.fieldWrap}>
                    <TextInput
                      value={email}
                      onChangeText={onChangeEmail}
                      placeholder={t("email")}
                      placeholderTextColor={INPUT_PLACEHOLDER}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      textContentType="emailAddress"
                      keyboardType="email-address"
                      returnKeyType="next"
                      selectionColor={colors.primary}
                      accessibilityLabel={t("email")}
                      editable={!isSubmitting}
                      style={[styles.input, isCompact && styles.inputCompact]}
                    />
                  </View>

                  <View style={styles.fieldWrap}>
                    <View style={styles.passwordFieldWrap}>
                      <TextInput
                        value={password}
                        onChangeText={onChangePassword}
                        placeholder={t("passwordPlaceholder")}
                        placeholderTextColor={INPUT_PLACEHOLDER}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="password"
                        textContentType="password"
                        returnKeyType="done"
                        selectionColor={colors.primary}
                        accessibilityLabel={t("passwordInput")}
                        editable={!isSubmitting}
                        style={[
                          styles.input,
                          styles.passwordInput,
                          isCompact && styles.inputCompact,
                        ]}
                      />
                      <Pressable
                        onPress={() => setShowPassword((prev) => !prev)}
                        style={styles.eyeButton}
                        accessibilityRole="button"
                        accessibilityLabel={
                          showPassword ? t("hidePassword") : t("showPassword")
                        }
                      >
                        <Ionicons
                          name={
                            showPassword ? "eye-off-outline" : "eye-outline"
                          }
                          size={20}
                          color={BRAND_ACCENT}
                        />
                      </Pressable>
                    </View>

                    <View style={styles.errorSlot}>
                      {authError ? (
                        <AppText style={styles.errorText}>{authError}</AppText>
                      ) : null}
                    </View>
                  </View>
                </View>

                <Animated.View
                  style={[
                    styles.actionArea,
                    { transform: [{ scale: buttonScale }] },
                  ]}
                >
                  {!consentGranted ? (
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
                        accessibilityLabel={t("consentLabel")}
                      >
                        {consentChecked ? (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color={BRAND_PRIMARY}
                          />
                        ) : null}
                      </Pressable>
                      <Pressable
                        onPress={() =>
                          navigation.navigate(StackRoutes.PrivacyPolicy)
                        }
                        accessibilityRole="button"
                        accessibilityLabel={t("privacyPolicy")}
                      >
                        <AppText style={styles.consentText}>
                          {t("consentLabel")}
                        </AppText>
                      </Pressable>
                    </View>
                  ) : null}

                  {!consentGranted ? (
                    <View style={styles.errorSlot}>
                      {consentError ? (
                        <AppText style={styles.errorText}>
                          {consentError}
                        </AppText>
                      ) : null}
                    </View>
                  ) : null}

                  <Pressable
                    style={[
                      styles.loginButton,
                      isCompact && styles.loginButtonCompact,
                      isSubmitting && styles.loginButtonDisabled,
                    ]}
                    onPress={onSubmit}
                    onPressIn={() => animatePress(0.98)}
                    onPressOut={() => animatePress(1)}
                    accessibilityRole="button"
                    accessibilityLabel={t("login")}
                    disabled={isSubmitting}
                  >
                    <AppText style={styles.loginText}>
                      {isSubmitting ? "SIGNING IN..." : "Sign In"}
                    </AppText>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      navigation.navigate(StackRoutes.ForgotPassword)
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Forgot password"
                    style={styles.forgotInlineButton}
                    disabled={isSubmitting}
                  >
                    <AppText style={styles.forgotInlineText}>
                      Forgot password?
                    </AppText>
                  </Pressable>
                </Animated.View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.bottomSecondaryArea}>
          <Pressable
            onPress={() => navigation.navigate(StackRoutes.Register)}
            accessibilityRole="button"
            accessibilityLabel="Create new account"
            style={({ pressed }) => [
              styles.createAccountButton,
              pressed && styles.createAccountButtonPressed,
            ]}
            disabled={isSubmitting}
          >
            <AppText style={styles.createAccountText}>
              Create new account
            </AppText>
          </Pressable>
        </View>
      </View>
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
  screenBody: {
    flex: 1,
    position: "relative",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  container: {
    flexGrow: 1,
    position: "relative",
    justifyContent: "flex-start",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.l,
    paddingBottom: spacing.xxl,
  },
  containerCompact: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
  },
  containerWide: {
    paddingHorizontal: spacing.xxxl,
    paddingTop: spacing.xl,
  },
  logoBlock: {
    alignItems: "center",
    marginTop: spacing.xxxl,
    marginBottom: spacing.xxl,
  },
  logoBlockCompact: {
    marginTop: spacing.xxl,
    marginBottom: spacing.xxl,
  },
  logoBlockWide: {
    marginTop: spacing.xxxxl,
    marginBottom: spacing.xxxl,
  },
  title: {
    color: BRAND_PRIMARY,
    letterSpacing: 0.6,
    fontWeight: typography.weight.bold,
    marginTop: spacing.m,
  },
  titleCompact: {
    marginTop: spacing.s,
  },
  titleWide: {
    marginTop: spacing.l,
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    letterSpacing: 0.2,
    textAlign: "center",
  },
  formArea: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    gap: spacing.xl,
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
  formFieldsGroup: {
    gap: spacing.s,
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
  inputFocused: {
    borderColor: colors.primary,
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
  actionArea: {
    gap: spacing.xxs,
  },
  forgotInlineButton: {
    marginTop: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xs,
  },
  forgotInlineText: {
    color: colors.textSecondary,
    textDecorationLine: "underline",
    fontSize: typography.size.s,
  },
  helperText: {
    color: colors.textSecondary,
    fontSize: typography.size.s,
    lineHeight: typography.lineHeight.compact,
  },
  errorText: {
    color: colors.danger,
  },
  loginButton: {
    marginTop: 0,
    minHeight: 48,
    borderRadius: radius.xxl,
    backgroundColor: colors.buttonBg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadow,
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 0,
  },
  loginButtonCompact: {
    minHeight: 44,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  secondaryActionButton: {
    marginTop: spacing.s,
    shadowOpacity: 0,
    elevation: 0,
  },
  bottomSecondaryArea: {
    position: "absolute",
    left: spacing.xl,
    right: spacing.xl,
    bottom: spacing.l,
    alignItems: "center",
    justifyContent: "center",
  },
  createAccountButton: {
    width: "100%",
    maxWidth: 420,
    minHeight: 47,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.xxl,
    marginTop: spacing.s,
  },
  createAccountButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  createAccountText: {
    color: colors.primary,
    textDecorationLine: "none",
    fontSize: typography.size.s,
    fontWeight: typography.weight.medium,
    letterSpacing: 0.2,
  },
  consentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
    marginVertical: spacing.s,
  },
  consentCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BRAND_ACCENT,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  consentText: {
    color: colors.textSecondary,
    textDecorationLine: "underline",
  },
  loginText: {
    color: colors.buttonText,
    fontSize: typography.size.s,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0.2,
  },
  bottomLinkButton: {
    marginTop: spacing.s,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomLinkText: {
    color: colors.textSecondary,
    textDecorationLine: "underline",
  },
});
