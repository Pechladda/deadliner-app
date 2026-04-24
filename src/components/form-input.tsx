import { AppIcon } from "@/src/components";
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

import { colors, layout, radius, spacing, typography } from "@/src/theme";

import { AppText } from "./app-text";

const EYE_ICON_SIZE = 20;
const EYE_BUTTON_SIZE = 32;
const EYE_BUTTON_RIGHT_OFFSET = 10;
const EYE_BUTTON_VERTICAL_CENTER_OFFSET = -16;
const PASSWORD_INPUT_PADDING_RIGHT = 50;
const FEEDBACK_SLOT_MIN_HEIGHT = 22;
const INVALID_INPUT_BORDER_WIDTH = 1.5;

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
            <AppIcon
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={EYE_ICON_SIZE}
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
    minHeight: layout.components.input.minHeight,
    borderRadius: radius.s,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontFamily: typography.family.regular,
    fontSize: typography.size.xs,
    lineHeight: typography.lineHeight.xs,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  inputCompact: {
    minHeight: layout.components.button.compactMinHeight,
    paddingVertical: spacing.xs,
  },
  passwordInput: {
    paddingRight: PASSWORD_INPUT_PADDING_RIGHT,
  },
  eyeButton: {
    position: "absolute",
    right: EYE_BUTTON_RIGHT_OFFSET,
    top: "50%",
    marginTop: EYE_BUTTON_VERTICAL_CENTER_OFFSET,
    width: EYE_BUTTON_SIZE,
    height: EYE_BUTTON_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  inputInvalid: {
    borderColor: colors.danger,
    borderWidth: INVALID_INPUT_BORDER_WIDTH,
  },
  feedbackSlot: {
    minHeight: FEEDBACK_SLOT_MIN_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.xxs,
  },
  feedbackText: {
    marginLeft: spacing.s,
    color: colors.textSecondary,
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.sm,
  },
  errorText: {
    color: colors.danger,
  },
});
