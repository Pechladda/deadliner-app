import { AppText } from "@/src/components";
import { StackRoutes } from "@/src/core/navigation";
import { t } from "@/src/core/utils";
import { useLoginNavigation } from "@/src/features/login/hooks/use-login-navigation";
import { useAuthStore } from "@/src/store/auth-store";
import { usePrivacyStore } from "@/src/store/privacy-store";
import { colors, radius, spacing, typography } from "@/src/theme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
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

const USERNAME_PATTERN = /^[A-Za-z0-9]+$/;
const THAI_CHAR_PATTERN = /[\u0E00-\u0E7F]/;
const USERNAME_DEFAULT_HELPER =
  "Use English letters and numbers only, up to 6 characters";
const PASSWORD_DEFAULT_HELPER =
  "8-30 characters with uppercase, lowercase, number, and @ or _ or .";

type FieldErrors = {
  username: string;
  password: string;
};

type FieldTouched = {
  username: boolean;
  password: boolean;
};

function validateUsername(username: string): string {
  const normalized = username;

  if (!normalized.trim()) {
    return "Username is required";
  }

  if (/\s/.test(normalized)) {
    return "Username cannot contain spaces";
  }

  if (normalized.length > 6) {
    return "Username must not exceed 6 characters";
  }

  if (
    THAI_CHAR_PATTERN.test(normalized) ||
    !USERNAME_PATTERN.test(normalized)
  ) {
    return "Use English letters and numbers only";
  }

  return "";
}

function validatePassword(password: string): string {
  const normalized = password;

  if (!normalized) {
    return "Password is required";
  }

  if (normalized.length < 8) {
    return "Password must be at least 8 characters";
  }

  if (normalized.length > 30) {
    return "Password must not exceed 30 characters";
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

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({
    username: "",
    password: "",
  });
  const [touched, setTouched] = useState<FieldTouched>({
    username: false,
    password: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [consentError, setConsentError] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);

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

  const buildErrors = (
    nextUsername: string,
    nextPassword: string,
  ): FieldErrors => {
    return {
      username: validateUsername(nextUsername),
      password: validatePassword(nextPassword),
    };
  };

  const onBlurField = (field: keyof FieldTouched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]:
        field === "username"
          ? validateUsername(username)
          : validatePassword(password),
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

  const onChangePassword = (value: string) => {
    setPassword(value);

    if (submitAttempted || touched.password) {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(value),
      }));
    }
  };

  const validationPreview = useMemo(
    () => buildErrors(username, password),
    [username, password],
  );
  const isFormValid =
    !validationPreview.username && !validationPreview.password;
  const hasAnyInput = username.trim().length > 0 || password.length > 0;
  const usernameMessage =
    (submitAttempted || touched.username) && errors.username
      ? errors.username
      : USERNAME_DEFAULT_HELPER;
  const passwordMessage =
    (submitAttempted || touched.password) && errors.password
      ? errors.password
      : PASSWORD_DEFAULT_HELPER;

  const onSubmit = () => {
    setSubmitAttempted(true);
    const nextErrors = buildErrors(username, password);
    setErrors(nextErrors);
    setTouched({ username: true, password: true });

    if (nextErrors.username || nextErrors.password) {
      return;
    }

    if (!consentGranted && !consentChecked) {
      setConsentError(t("consentRequired"));
      return;
    }

    setConsentError("");

    void (async () => {
      if (!consentGranted && consentChecked) {
        await setConsent(true);
      }

      await login();
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
            <View
              style={[styles.logoBlock, isCompact && styles.logoBlockCompact]}
            >
              <ClockLogo />
              <AppText variant="title" style={styles.title}>
                {t("appName")}
              </AppText>
              <AppText variant="caption" style={styles.subtitle}>
                {t("login")}
              </AppText>
            </View>

            <View style={styles.formArea}>
              <View style={styles.fieldWrap}>
                <TextInput
                  value={username}
                  onChangeText={onChangeUsername}
                  onBlur={() => onBlurField("username")}
                  placeholder={t("usernamePlaceholder")}
                  placeholderTextColor={INPUT_PLACEHOLDER}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username"
                  textContentType="username"
                  returnKeyType="next"
                  selectionColor={colors.primary}
                  accessibilityLabel={t("usernameInput")}
                  style={[
                    styles.input,
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
                <View style={styles.passwordFieldWrap}>
                  <TextInput
                    value={password}
                    onChangeText={onChangePassword}
                    onBlur={() => onBlurField("password")}
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
                    style={[
                      styles.input,
                      styles.passwordInput,
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
                      showPassword ? t("hidePassword") : t("showPassword")
                    }
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={BRAND_ACCENT}
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

              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
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
                      <AppText style={styles.errorText}>{consentError}</AppText>
                    ) : null}
                  </View>
                ) : null}

                <Pressable
                  style={[
                    styles.loginButton,
                    !hasAnyInput && styles.loginButtonDisabled,
                  ]}
                  onPress={onSubmit}
                  onPressIn={() => animatePress(0.98)}
                  onPressOut={() => animatePress(1)}
                  accessibilityRole="button"
                  accessibilityLabel={t("login")}
                >
                  <AppText style={styles.loginText}>{t("loginUpper")}</AppText>
                </Pressable>
              </Animated.View>
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
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  containerCompact: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.xl,
  },
  containerWide: {
    paddingHorizontal: spacing.xxxl,
  },
  logoBlock: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  logoBlockCompact: {
    marginBottom: spacing.xl,
  },
  title: {
    color: BRAND_PRIMARY,
    letterSpacing: 0.6,
    fontWeight: typography.weight.bold,
    marginTop: spacing.m,
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  formArea: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    gap: spacing.l,
  },
  fieldWrap: {
    gap: spacing.xs,
  },
  input: {
    minHeight: 50,
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: BRAND_LIGHT,
    backgroundColor: colors.surface,
    color: BRAND_PRIMARY,
    fontSize: typography.size.m,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
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
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
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
    marginTop: spacing.xs,
    minHeight: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.buttonBg,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  loginButtonDisabled: {
    opacity: 0.5,
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
    fontSize: typography.size.m,
    fontWeight: typography.weight.bold,
    letterSpacing: 0.6,
  },
});
