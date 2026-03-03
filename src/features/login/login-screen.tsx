import { AppText } from "@/src/components";
import { StackRoutes } from "@/src/core/navigation";
import { t } from "@/src/core/utils";
import { useLoginNavigation } from "@/src/features/login/hooks/use-login-navigation";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Line } from "react-native-svg";

const BRAND_PRIMARY = "#3e2723";
const BRAND_ACCENT = "#8d6e63";
const BRAND_LIGHT = "#c8a99a";
const BG_WARM = "#ffffff";

const HELPER_DURATION = 200;
const SWITCH_DELAY = 180;
const USERNAME_HELPER_HEIGHT = 64;
const PASSWORD_HELPER_HEIGHT = 152;

type ActiveField = "username" | "password" | null;

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
  const navigation = useLoginNavigation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activeField, setActiveField] = useState<ActiveField>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameHelperVisible, setUsernameHelperVisible] = useState(false);
  const [passwordHelperVisible, setPasswordHelperVisible] = useState(false);
  const [usernameInvalid, setUsernameInvalid] = useState(false);
  const [passwordInvalid, setPasswordInvalid] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessages, setPopupMessages] = useState<string[]>([]);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const usernameHelperAnim = useRef(new Animated.Value(0)).current;
  const passwordHelperAnim = useRef(new Animated.Value(0)).current;
  const strengthAnim = useRef(new Animated.Value(0)).current;
  const usernameShake = useRef(new Animated.Value(0)).current;
  const passwordShake = useRef(new Animated.Value(0)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;
  const popupScale = useRef(new Animated.Value(0.95)).current;
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const usernameValid = useMemo(() => {
    return (
      username.length >= 4 &&
      username.length <= 16 &&
      /^[A-Za-z0-9]+$/.test(username)
    );
  }, [username]);

  const passwordChecks = useMemo(
    () => ({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }),
    [password],
  );

  const passwordValid =
    passwordChecks.length &&
    passwordChecks.uppercase &&
    passwordChecks.lowercase &&
    passwordChecks.number &&
    passwordChecks.special;

  const strengthScore = Object.values(passwordChecks).filter(Boolean).length;
  const strengthLabel =
    strengthScore <= 1
      ? t("strengthWeak")
      : strengthScore === 2
        ? t("strengthFair")
        : strengthScore <= 4
          ? t("strengthGood")
          : t("strengthStrong");

  useEffect(() => {
    Animated.timing(strengthAnim, {
      toValue: strengthScore / 5,
      duration: 210,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [strengthAnim, strengthScore]);

  useEffect(() => {
    Animated.timing(usernameHelperAnim, {
      toValue: usernameHelperVisible ? 1 : 0,
      duration: HELPER_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [usernameHelperAnim, usernameHelperVisible]);

  useEffect(() => {
    Animated.timing(passwordHelperAnim, {
      toValue: passwordHelperVisible ? 1 : 0,
      duration: HELPER_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [passwordHelperAnim, passwordHelperVisible]);

  useEffect(() => {
    return () => {
      if (collapseTimerRef.current) {
        clearTimeout(collapseTimerRef.current);
      }
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }
    };
  }, []);

  const scheduleCollapse = (field: Exclude<ActiveField, null>) => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
    }
    collapseTimerRef.current = setTimeout(() => {
      if (
        field === "username" &&
        activeField !== "username" &&
        username.length === 0
      ) {
        setUsernameHelperVisible(false);
      }
      if (
        field === "password" &&
        activeField !== "password" &&
        password.length === 0
      ) {
        setPasswordHelperVisible(false);
      }
    }, SWITCH_DELAY);
  };

  const animatePress = (toValue: number) => {
    Animated.timing(buttonScale, {
      toValue,
      duration: 120,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const shakeField = (anim: Animated.Value) => {
    anim.setValue(0);
    Animated.sequence([
      Animated.timing(anim, {
        toValue: -5,
        duration: 45,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 5,
        duration: 45,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: -4,
        duration: 45,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 4,
        duration: 45,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 0,
        duration: 45,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showErrorPopup = (messages: string[]) => {
    setPopupMessages(messages);
    setPopupVisible(true);
    popupOpacity.setValue(0);
    popupScale.setValue(0.95);
    Animated.parallel([
      Animated.timing(popupOpacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(popupScale, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
    }
    popupTimerRef.current = setTimeout(() => {
      dismissPopup();
    }, 3400);
  };

  const dismissPopup = () => {
    Animated.parallel([
      Animated.timing(popupOpacity, {
        toValue: 0,
        duration: 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(popupScale, {
        toValue: 0.95,
        duration: 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setPopupVisible(false);
      }
    });
  };

  const onUsernameFocus = () => {
    setActiveField("username");
    setUsernameHelperVisible(true);
    if (password.length === 0) {
      scheduleCollapse("password");
    }
  };

  const onPasswordFocus = () => {
    setActiveField("password");
    setPasswordHelperVisible(true);
    if (username.length === 0) {
      scheduleCollapse("username");
    }
  };

  const onUsernameBlur = () => {
    setActiveField((prev) => (prev === "username" ? null : prev));
    if (username.length === 0) {
      scheduleCollapse("username");
    }
  };

  const onPasswordBlur = () => {
    setActiveField((prev) => (prev === "password" ? null : prev));
    if (password.length === 0) {
      scheduleCollapse("password");
    }
  };

  const onSubmit = () => {
    const usernameIsValid = usernameValid;
    const passwordIsValid = passwordValid;

    setUsernameInvalid(!usernameIsValid);
    setPasswordInvalid(!passwordIsValid);

    if (!usernameIsValid) {
      setUsernameHelperVisible(true);
      shakeField(usernameShake);
    }
    if (!passwordIsValid) {
      setPasswordHelperVisible(true);
      shakeField(passwordShake);
    }

    if (!usernameIsValid || !passwordIsValid) {
      const messages: string[] = [];
      if (!usernameIsValid) {
        messages.push(t("usernameInvalidMessage"));
      }
      if (!passwordIsValid) {
        messages.push(t("passwordInvalidMessage"));
      }
      showErrorPopup(messages);
      return;
    }

    navigation.replace(StackRoutes.MainTabs);
  };

  const usernameHelperStyle = {
    height: usernameHelperAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, USERNAME_HELPER_HEIGHT],
    }),
    opacity: usernameHelperAnim,
    transform: [
      {
        translateY: usernameHelperAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-6, 0],
        }),
      },
    ],
  };

  const passwordHelperStyle = {
    height: passwordHelperAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, PASSWORD_HELPER_HEIGHT],
    }),
    opacity: passwordHelperAnim,
    transform: [
      {
        translateY: passwordHelperAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-6, 0],
        }),
      },
    ],
  };

  const strengthWidth = strengthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

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
          <View style={styles.container}>
            <View style={styles.logoBlock}>
              <ClockLogo />
              <AppText variant="title" style={styles.title}>
                {t("appName")}
              </AppText>
            </View>

            <View style={styles.formArea}>
              <Animated.View
                style={[
                  styles.fieldWrap,
                  { transform: [{ translateX: usernameShake }] },
                ]}
              >
                <TextInput
                  value={username}
                  onChangeText={(text) => {
                    const nextValue = text.replace(/[^A-Za-z0-9]/g, "");
                    setUsername(nextValue);
                    if (usernameInvalid) {
                      setUsernameInvalid(false);
                    }
                    if (nextValue.length > 0) {
                      setUsernameHelperVisible(true);
                    }
                  }}
                  onFocus={onUsernameFocus}
                  onBlur={onUsernameBlur}
                  placeholder={t("usernamePlaceholder")}
                  placeholderTextColor={BRAND_LIGHT}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  accessibilityLabel={t("usernameInput")}
                  style={[
                    styles.input,
                    activeField === "username" && styles.inputFocused,
                    usernameInvalid && styles.inputInvalid,
                  ]}
                />
                <Animated.View
                  style={[styles.helperContainer, usernameHelperStyle]}
                >
                  <View style={styles.helperInner}>
                    <AppText style={styles.ruleLine}>
                      {username.length >= 4 && username.length <= 16
                        ? "✓"
                        : "○"}{" "}
                      {t("usernameRuleLength")}
                    </AppText>
                    <AppText style={styles.ruleLine}>
                      {/^[A-Za-z0-9]+$/.test(username) && username.length > 0
                        ? "✓"
                        : "○"}{" "}
                      {t("usernameRuleChars")}
                    </AppText>
                  </View>
                </Animated.View>
              </Animated.View>

              <Animated.View
                style={[
                  styles.fieldWrap,
                  { transform: [{ translateX: passwordShake }] },
                ]}
              >
                <View style={styles.passwordFieldWrap}>
                  <TextInput
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (passwordInvalid) {
                        setPasswordInvalid(false);
                      }
                      if (text.length > 0) {
                        setPasswordHelperVisible(true);
                      }
                    }}
                    onFocus={onPasswordFocus}
                    onBlur={onPasswordBlur}
                    placeholder={t("passwordPlaceholder")}
                    placeholderTextColor={BRAND_LIGHT}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    accessibilityLabel={t("passwordInput")}
                    style={[
                      styles.input,
                      styles.passwordInput,
                      activeField === "password" && styles.inputFocused,
                      passwordInvalid && styles.inputInvalid,
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

                <Animated.View
                  style={[styles.helperContainer, passwordHelperStyle]}
                >
                  <View style={styles.helperInner}>
                    <AppText style={styles.ruleLine}>
                      {passwordChecks.length ? "✓" : "○"}{" "}
                      {t("passwordRuleLength")}
                    </AppText>
                    <AppText style={styles.ruleLine}>
                      {passwordChecks.uppercase ? "✓" : "○"}{" "}
                      {t("passwordRuleUppercase")}
                    </AppText>
                    <AppText style={styles.ruleLine}>
                      {passwordChecks.lowercase ? "✓" : "○"}{" "}
                      {t("passwordRuleLowercase")}
                    </AppText>
                    <AppText style={styles.ruleLine}>
                      {passwordChecks.number ? "✓" : "○"}{" "}
                      {t("passwordRuleNumber")}
                    </AppText>
                    <AppText style={styles.ruleLine}>
                      {passwordChecks.special ? "✓" : "○"}{" "}
                      {t("passwordRuleSpecial")}
                    </AppText>

                    <View style={styles.strengthRow}>
                      <View style={styles.strengthTrack}>
                        <Animated.View
                          style={[
                            styles.strengthFill,
                            { width: strengthWidth },
                          ]}
                        />
                      </View>
                      <AppText style={styles.strengthText}>
                        {strengthLabel}
                      </AppText>
                    </View>
                  </View>
                </Animated.View>
              </Animated.View>

              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <Pressable
                  style={styles.loginButton}
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

      {popupVisible ? (
        <View style={styles.popupOverlay} pointerEvents="box-none">
          <Pressable style={styles.popupOutsideTap} onPress={dismissPopup} />
          <Animated.View
            style={[
              styles.popup,
              {
                opacity: popupOpacity,
                transform: [{ scale: popupScale }],
              },
            ]}
          >
            <AppText variant="heading" style={styles.popupTitle}>
              {t("error")}
            </AppText>
            {popupMessages.map((message) => (
              <AppText key={message} style={styles.popupMessage}>
                {message}
              </AppText>
            ))}
          </Animated.View>
        </View>
      ) : null}
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
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  logoBlock: {
    alignItems: "center",
    marginBottom: 26,
  },
  title: {
    color: BRAND_PRIMARY,
    letterSpacing: 1.3,
    fontWeight: "700",
  },
  formArea: {
    gap: 10,
  },
  fieldWrap: {
    gap: 4,
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BRAND_LIGHT,
    backgroundColor: "#ffffff",
    color: BRAND_PRIMARY,
    fontSize: 16,
    paddingHorizontal: 16,
  },
  passwordFieldWrap: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: "absolute",
    right: 14,
    top: 16,
  },
  inputFocused: {
    borderColor: BRAND_ACCENT,
  },
  inputInvalid: {
    borderColor: BRAND_PRIMARY,
  },
  helperContainer: {
    overflow: "hidden",
  },
  helperInner: {
    paddingHorizontal: 8,
    paddingTop: 4,
    gap: 2,
  },
  ruleLine: {
    color: BRAND_ACCENT,
    fontSize: 13,
    lineHeight: 18,
  },
  strengthRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  strengthTrack: {
    flex: 1,
    height: 6,
    borderRadius: 99,
    backgroundColor: BRAND_LIGHT,
    overflow: "hidden",
  },
  strengthFill: {
    height: 6,
    borderRadius: 99,
    backgroundColor: BRAND_ACCENT,
  },
  strengthText: {
    color: BRAND_PRIMARY,
    fontSize: 12,
    fontWeight: "600",
    minWidth: 40,
    textAlign: "right",
  },
  loginButton: {
    marginTop: 4,
    minHeight: 54,
    borderRadius: 28,
    backgroundColor: BRAND_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BRAND_PRIMARY,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 14,
    elevation: 4,
  },
  loginText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  popupOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  popupOutsideTap: {
    ...StyleSheet.absoluteFillObject,
  },
  popup: {
    width: "84%",
    maxWidth: 360,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: BRAND_LIGHT,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    shadowColor: BRAND_PRIMARY,
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 5,
  },
  popupTitle: {
    color: BRAND_PRIMARY,
    textAlign: "center",
    marginBottom: 8,
  },
  popupMessage: {
    color: BRAND_ACCENT,
    textAlign: "center",
    lineHeight: 20,
  },
});
