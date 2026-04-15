import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Pressable,
    StyleProp,
    StyleSheet,
    TextInput,
    TextInputProps,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";

import { colors, radius, spacing, typography } from "@/src/theme";

import { AppText } from "./app-text";

type FormInputProps = Omit<TextInputProps, "secureTextEntry"> & {
  isPassword?: boolean;
  compact?: boolean;
  error?: string;
  helperText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  feedbackStyle?: StyleProp<TextStyle>;
  showFeedbackSlot?: boolean;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
};

export function FormInput({
  isPassword = false,
  compact = false,
  error,
  helperText,
  containerStyle,
  inputStyle,
  feedbackStyle,
  showFeedbackSlot = false,
  showPasswordLabel = "Show password",
  hidePasswordLabel = "Hide password",
  editable,
  ...props
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const feedback = error || helperText || "";
  const shouldShowFeedback = Boolean(feedback) || showFeedbackSlot;

  return (
    <View style={[styles.fieldWrap, containerStyle]}>
      <View style={styles.inputWrap}>
        <TextInput
          {...props}
          editable={editable}
          secureTextEntry={isPassword ? !showPassword : undefined}
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
            compact && styles.inputCompact,
            isPassword && styles.passwordInput,
            error ? styles.inputInvalid : null,
            inputStyle,
          ]}
        />

        {isPassword ? (
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.eyeButton}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? hidePasswordLabel : showPasswordLabel
            }
            disabled={editable === false}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>

      {shouldShowFeedback ? (
        <View style={styles.feedbackSlot}>
          {feedback ? (
            <AppText
              style={[
                styles.feedbackText,
                error ? styles.errorText : null,
                feedbackStyle,
              ]}
            >
              {feedback}
            </AppText>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldWrap: {
    gap: spacing.xxs,
  },
  inputWrap: {
    position: "relative",
  },
  input: {
    minHeight: 50,
    borderRadius: radius.xxl,
    borderWidth: 0,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontSize: typography.size.m,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  inputCompact: {
    minHeight: 46,
    fontSize: typography.size.m,
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
    borderWidth: 0,
  },
  feedbackSlot: {
    minHeight: 22,
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.xxs,
  },
  feedbackText: {
    color: colors.textSecondary,
    fontSize: typography.size.s,
    lineHeight: typography.lineHeight.compact,
  },
  errorText: {
    color: colors.danger,
  },
});
