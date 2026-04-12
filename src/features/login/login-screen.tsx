import {
  AppButton,
  AppText,
  FormInput,
  PastelBackground,
} from "@/src/components";
import { StackRoutes } from "@/src/core/navigation/route-names";
import { t } from "@/src/core/utils";
import { useLoginNavigation } from "@/src/features/login/hooks/use-login-navigation";
import { auth } from "@/src/firebase";
import { useAuthStore } from "@/src/store/auth-store";
import { colors, loginTokens, radius, spacing, typography } from "@/src/theme";
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

const BRAND_PRIMARY = colors.textPrimary;
const BG_WARM = colors.background;

function ClockLogo() {
  const stroke = BRAND_PRIMARY;
  const accent = stroke;
  const logo = loginTokens.clockLogo;

  const ticks = Array.from({ length: logo.tickCount }, (_, i) => {
    const deg = i * logo.tickStepDegrees;
    const rad = (Math.PI * deg) / 180;
    const isMain = i % logo.majorTickEvery === 0;
    const inner = isMain
      ? logo.majorTickInnerRadius
      : logo.minorTickInnerRadius;
    return { rad, isMain, inner };
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
      {ticks.map(({ rad, isMain, inner }, i) => (
        <Line
          key={i}
          x1={logo.center + inner * Math.sin(rad)}
          y1={logo.center - inner * Math.cos(rad)}
          x2={logo.center + logo.outerRadius * Math.sin(rad)}
          y2={logo.center - logo.outerRadius * Math.cos(rad)}
          stroke={stroke}
          strokeWidth={
            isMain ? logo.majorTickStrokeWidth : logo.minorTickStrokeWidth
          }
          strokeLinecap="round"
          opacity={isMain ? 1 : logo.minorTickOpacity}
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

export function LoginScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < loginTokens.compactWidthThreshold;
  const isWide = width >= loginTokens.wideWidthThreshold;
  const navigation = useLoginNavigation();
  const login = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State สำหรับควบคุมการโชว์ Modal
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleChange = (field: "email" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async () => {
    if (isSubmitting) return;

    const normalizedEmail = formData.email.trim();
    const normalizedPassword = formData.password;

    // ถ้าไม่ได้กรอกอะไรเลย ให้เด้ง Modal เลย (ไม่โชว์ Error ใต้ช่องแล้ว)
    if (!normalizedEmail || !normalizedPassword) {
      setShowErrorModal(true);
      return;
    }

    try {
      setIsSubmitting(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        normalizedEmail,
        normalizedPassword,
      );
      await login(userCredential.user);
    } catch (error) {
      // ไม่ว่าจะ Error อะไร (รหัสผิด, ไม่มีเมล์) ให้โชว์ Modal ตัวนี้
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onGoToRegister = () => {
    setShowErrorModal(false);
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
                  {/* ถอด props `error` ออกทั้งหมด */}
                  <FormInput
                    value={formData.email}
                    onChangeText={(value) => handleChange("email", value)}
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
                  />

                  <FormInput
                    value={formData.password}
                    onChangeText={(value) => handleChange("password", value)}
                    placeholder={t("passwordPlaceholder")}
                    isPassword
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    textContentType="password"
                    returnKeyType="done"
                    selectionColor={colors.primary}
                    accessibilityLabel={t("passwordInput")}
                    editable={!isSubmitting}
                    compact={isCompact}
                    showPasswordLabel={t("showPassword")}
                    hidePasswordLabel={t("hidePassword")}
                  />
                </View>

                <View style={styles.actionArea}>
                  <AppButton
                    title={t("signIn")}
                    onPress={onSubmit}
                    isLoading={isSubmitting}
                    loadingLabel={t("loginSigningIn")}
                    size={isCompact ? "compact" : "default"}
                    accessibilityLabel={t("signIn")}
                  />

                  <Pressable
                    onPress={() =>
                      navigation.navigate(StackRoutes.ForgotPassword)
                    }
                    accessibilityRole="button"
                    accessibilityLabel={t("forgotPassword")}
                    style={styles.forgotInlineButton}
                    disabled={isSubmitting}
                  >
                    <AppText style={styles.forgotInlineText}>
                      {t("forgotPassword")}
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
            accessibilityLabel={t("createNewAccount")}
            style={({ pressed }) => [
              styles.createAccountButton,
              pressed && styles.createAccountButtonPressed,
            ]}
            disabled={isSubmitting}
          >
            <AppText style={styles.createAccountText}>
              {t("createNewAccount")}
            </AppText>
          </Pressable>
        </View>
      </View>
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppText style={styles.modalTitle}>
              {t("loginAccountNotFoundTitle")}
            </AppText>
            <AppText style={styles.modalBody}>
              {t("loginAccountNotFoundBody")}
            </AppText>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalSecondaryBtn}
                onPress={onGoToRegister}
              >
                <AppText style={styles.modalSecondaryBtnText}>
                  {t("registerSignUp")}
                </AppText>
              </Pressable>

              <Pressable
                style={styles.modalPrimaryBtn}
                onPress={() => setShowErrorModal(false)}
              >
                <AppText style={styles.modalPrimaryBtnText}>
                  {t("retry")}
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
  // ... Styles เดิมทั้งหมด (safeArea จนถึง bottomLinkText)
  safeArea: { flex: 1, backgroundColor: BG_WARM },
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
    letterSpacing: loginTokens.titleLetterSpacing,
    fontWeight: typography.weight.bold,
    marginTop: spacing.m,
  },
  titleCompact: { marginTop: spacing.s },
  titleWide: { marginTop: spacing.l },
  formArea: {
    width: "100%",
    maxWidth: loginTokens.formAreaMaxWidth,
    alignSelf: "center",
    gap: spacing.xl,
  },
  formAreaCompact: { maxWidth: loginTokens.formAreaCompactMaxWidth },
  formAreaWide: { maxWidth: loginTokens.formAreaWideMaxWidth },
  formFieldsGroup: { gap: spacing.s },
  actionArea: { gap: spacing.xxs },
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
    maxWidth: loginTokens.formAreaMaxWidth,
    minHeight: loginTokens.createAccountButtonMinHeight,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: BRAND_PRIMARY,
    borderRadius: radius.xxl,
    marginTop: spacing.s,
  },
  createAccountButtonPressed: {
    opacity: loginTokens.createAccountButtonPressedOpacity,
    transform: [{ scale: loginTokens.createAccountButtonPressedScale }],
  },
  createAccountText: {
    color: BRAND_PRIMARY,
    textDecorationLine: "none",
    fontSize: typography.size.s,
    fontWeight: typography.weight.medium,
    letterSpacing: loginTokens.createAccountLetterSpacing,
  },
  // --- Styles สำหรับ Modal (Minimal Pastel) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: loginTokens.modalOverlayBackground,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxWidth: loginTokens.modalContentMaxWidth,
    backgroundColor: loginTokens.modalContentBackground,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    alignItems: "center",
    shadowColor: BRAND_PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: loginTokens.modalShadowOpacity,
    shadowRadius: 24,
    elevation: 8,
  },
  modalTitle: {
    color: BRAND_PRIMARY,
    fontSize: typography.size.s,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.s,
    textAlign: "center",
  },
  modalBody: {
    color: colors.textSecondary,
    fontSize: typography.size.s,
    textAlign: "center",
    lineHeight: typography.lineHeight.compact,
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
    borderRadius: radius.xxl,
    alignItems: "center",
    justifyContent: "center",
  },
  modalPrimaryBtnText: {
    color: loginTokens.modalPrimaryTextColor,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.s,
  },
  modalSecondaryBtn: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: BRAND_PRIMARY,
    paddingVertical: spacing.m,
    borderRadius: radius.xxl,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSecondaryBtnText: {
    color: BRAND_PRIMARY,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.s,
  },
});
