import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Line } from "react-native-svg";

import {
  AppButton,
  AppText,
  FormInput,
  PastelBackground,
} from "@/src/components";
import { StackRoutes } from "@/src/core/navigation/route-names";
import { useLoginNavigation } from "@/src/features/login/hooks/use-login-navigation";
import { auth } from "@/src/firebase";
import { useAuthStore } from "@/src/store/auth-store";
import {
  colors,
  constants,
  layout,
  radius,
  spacing,
  typography,
} from "@/src/theme";

const BRAND_PRIMARY = colors.textPrimary;
const SCREEN_BACKGROUND = colors.background;
const MODAL_MAX_WIDTH = 340;
const CREATE_ACCOUNT_BUTTON_MIN_HEIGHT = 47;
const DEGREES_TO_RADIANS = Math.PI / 180;

function ClockLogo() {
  const stroke = BRAND_PRIMARY;
  const accent = stroke;
  const logo = constants.clockLogo;

  const ticks = Array.from({ length: logo.tickCount }, (_, index) => {
    const degrees = index * logo.tickStepDegrees;
    const radians = degrees * DEGREES_TO_RADIANS;
    const isMajorTick = index % logo.majorTickEvery === 0;
    const innerRadius = isMajorTick
      ? logo.majorTickInnerRadius
      : logo.minorTickInnerRadius;
    return { radians, isMajorTick, innerRadius };
  });

  return (
    <Svg
      width={logo.svgSize}
      height={logo.svgSize}
      viewBox={`0 0 ${logo.viewBoxSize} ${logo.viewBoxSize}`}
    >
      <Circle
        cx={logo.center}
        cy={logo.center}
        r={logo.outerRadius}
        stroke={stroke}
        strokeWidth={logo.outlineStrokeWidth}
        fill="none"
      />
      {ticks.map(({ radians, isMajorTick, innerRadius }, index) => (
        <Line
          key={index}
          x1={logo.center + innerRadius * Math.sin(radians)}
          y1={logo.center - innerRadius * Math.cos(radians)}
          x2={logo.center + logo.outerRadius * Math.sin(radians)}
          y2={logo.center - logo.outerRadius * Math.cos(radians)}
          stroke={stroke}
          strokeWidth={
            isMajorTick ? logo.majorTickStrokeWidth : logo.minorTickStrokeWidth
          }
          strokeLinecap="round"
          opacity={isMajorTick ? 1 : logo.minorTickOpacity}
        />
      ))}
      <Line
        x1={logo.center}
        y1={logo.center}
        x2={logo.center}
        y2={logo.handLongY}
        stroke={stroke}
        strokeWidth={logo.handLongStrokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1={logo.center}
        y1={logo.center}
        x2={logo.handShortX}
        y2={logo.handShortY}
        stroke={stroke}
        strokeWidth={logo.handShortStrokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1={logo.center}
        y1={logo.accentHandFromY}
        x2={logo.accentHandToX}
        y2={logo.accentHandToY}
        stroke={accent}
        strokeWidth={logo.accentHandStrokeWidth}
        strokeLinecap="round"
      />
      <Circle
        cx={logo.center}
        cy={logo.center}
        r={logo.centerDotRadius}
        fill={accent}
      />
    </Svg>
  );
}

type LoginField = "email" | "password";

export function LoginScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const isCompactLayout = windowWidth < layout.thresholds.compact;
  const isWideLayout = windowWidth >= layout.thresholds.wide;
  const navigation = useLoginNavigation();
  const login = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);

  const handleFieldChange = (field: LoginField, value: string) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const emailAddress = formData.email.trim();
    const password = formData.password;

    if (!emailAddress || !password) {
      setIsErrorModalVisible(true);
      return;
    }

    try {
      setIsSubmitting(true);
      const credential = await signInWithEmailAndPassword(
        auth,
        emailAddress,
        password,
      );
      await login(credential.user);
    } catch {
      setIsErrorModalVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToRegister = () => {
    setIsErrorModalVisible(false);
    navigation.navigate(StackRoutes.Register);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <PastelBackground />
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
                isCompactLayout && styles.containerCompact,
                isWideLayout && styles.containerWide,
              ]}
            >
              <View
                style={[
                  styles.logoBlock,
                  isCompactLayout && styles.logoBlockCompact,
                  isWideLayout && styles.logoBlockWide,
                ]}
              >
                <ClockLogo />
                <AppText
                  variant="section"
                  style={[
                    styles.title,
                    isCompactLayout && styles.titleCompact,
                    isWideLayout && styles.titleWide,
                  ]}
                >
                  DEADLINER
                </AppText>
              </View>

              <View
                style={[
                  styles.formArea,
                  isCompactLayout && styles.formAreaCompact,
                  isWideLayout && styles.formAreaWide,
                ]}
              >
                <View style={styles.formFieldsGroup}>
                  <FormInput
                    value={formData.email}
                    onChangeText={(value) => handleFieldChange("email", value)}
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
                    compact={isCompactLayout}
                  />

                  <FormInput
                    value={formData.password}
                    onChangeText={(value) =>
                      handleFieldChange("password", value)
                    }
                    placeholder={"Password"}
                    isPassword
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    textContentType="password"
                    returnKeyType="done"
                    selectionColor={colors.textPrimary}
                    accessibilityLabel={"Password input"}
                    editable={!isSubmitting}
                    compact={isCompactLayout}
                    showPasswordLabel={"Show password"}
                    hidePasswordLabel={"Hide password"}
                  />
                </View>

                <View style={styles.actionArea}>
                  <AppButton
                    title={"Sign In"}
                    onPress={handleSubmit}
                    isLoading={isSubmitting}
                    loadingLabel={"SIGNING IN..."}
                    size="compact"
                    labelVariant="caption"
                    accessibilityLabel={"Sign In"}
                  />

                  <Pressable
                    onPress={() =>
                      navigation.navigate(StackRoutes.ForgotPassword)
                    }
                    accessibilityRole="button"
                    accessibilityLabel={"Forgot password?"}
                    style={styles.forgotInlineButton}
                    disabled={isSubmitting}
                  >
                    <AppText variant="caption" style={styles.forgotInlineText}>
                      {"Forgot password?"}
                    </AppText>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={styles.bottomSecondaryArea}>
          <Pressable
            onPress={() => navigation.navigate(StackRoutes.Register)}
            accessibilityRole="button"
            accessibilityLabel={"Create new account"}
            style={({ pressed }) => [
              styles.createAccountButton,
              pressed && styles.createAccountButtonPressed,
            ]}
            disabled={isSubmitting}
          >
            <AppText variant="caption" style={styles.createAccountText}>
              {"Create new account"}
            </AppText>
          </Pressable>
        </View>
      </View>
      <Modal
        visible={isErrorModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsErrorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppText variant="subtitle" style={styles.modalTitle}>
              {"Account not found"}
            </AppText>
            <AppText variant="caption" style={styles.modalBody}>
              {
                "We couldn't find an account matching these details. If you don't have an account, you can create one."
              }
            </AppText>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalSecondaryBtn}
                onPress={handleGoToRegister}
              >
                <AppText variant="caption" style={styles.modalSecondaryBtnText}>
                  {"Sign Up"}
                </AppText>
              </Pressable>

              <Pressable
                style={styles.modalPrimaryBtn}
                onPress={() => setIsErrorModalVisible(false)}
              >
                <AppText variant="caption" style={styles.modalPrimaryBtnText}>
                  {"Retry"}
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: SCREEN_BACKGROUND },
  keyboardWrap: { flex: 1 },
  screenBody: { flex: 1, position: "relative" },
  scrollContent: { flexGrow: 1, justifyContent: "flex-start" },
  container: {
    flexGrow: 1,
    position: "relative",
    justifyContent: "flex-start",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.l,
    paddingBottom: spacing.xxl,
  },
  containerCompact: { paddingHorizontal: spacing.l, paddingTop: spacing.m },
  containerWide: { paddingHorizontal: spacing.xxxl, paddingTop: spacing.xl },
  logoBlock: {
    alignItems: "center",
    marginTop: spacing.xxxl,
    marginBottom: spacing.xxl,
  },
  logoBlockCompact: { marginTop: spacing.xxl, marginBottom: spacing.xxl },
  logoBlockWide: { marginTop: spacing.xxxxl, marginBottom: spacing.xxxl },
  title: {
    color: BRAND_PRIMARY,
    letterSpacing: 0.6,
    fontWeight: typography.weight.bold,
    marginTop: spacing.l,
  },
  titleCompact: { marginTop: spacing.m },
  titleWide: { marginTop: spacing.xl },
  formArea: {
    width: "100%",
    maxWidth: layout.maxWidths.default,
    alignSelf: "center",
    gap: spacing.xl,
  },
  formAreaCompact: { maxWidth: layout.maxWidths.compact },
  formAreaWide: { maxWidth: layout.maxWidths.wide },
  formFieldsGroup: { gap: spacing.s },
  actionArea: { gap: spacing.xxs },
  forgotInlineButton: {
    marginTop: spacing.s,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xs,
  },
  forgotInlineText: {
    color: colors.textSecondary,
    textDecorationLine: "underline",
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
    maxWidth: layout.maxWidths.default,
    minHeight: CREATE_ACCOUNT_BUTTON_MIN_HEIGHT,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: BRAND_PRIMARY,
    borderRadius: radius.s,
    marginTop: spacing.s,
  },
  createAccountButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  createAccountText: {
    color: BRAND_PRIMARY,
    textDecorationLine: "none",
    fontWeight: typography.weight.heavy,
    letterSpacing: constants.typography.letterSpacing.normal,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: colors.borderSoft,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxWidth: MODAL_MAX_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: radius.s,
    padding: spacing.xl,
    alignItems: "center",
  },
  modalTitle: {
    color: BRAND_PRIMARY,
    marginBottom: spacing.s,
    textAlign: "center",
  },
  modalBody: {
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xxl,
  },
  modalActions: {
    flexDirection: "row",
    width: "100%",
    gap: spacing.m,
  },
  modalPrimaryBtn: {
    flex: 1,
    backgroundColor: BRAND_PRIMARY,
    paddingVertical: spacing.m,
    borderRadius: radius.s,
    alignItems: "center",
    justifyContent: "center",
  },
  modalPrimaryBtnText: {
    color: colors.surface,
    fontWeight: typography.weight.bold,
  },
  modalSecondaryBtn: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: BRAND_PRIMARY,
    paddingVertical: spacing.m,
    borderRadius: radius.s,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSecondaryBtnText: {
    color: BRAND_PRIMARY,
    fontWeight: typography.weight.heavy,
  },
});
