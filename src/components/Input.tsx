import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
} from "react-native";

import { colors, radius, spacing, typography } from "@/src/theme";

import { AppText } from "./app-text";

type InputProps = TextInputProps & {
  label?: string;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export function Input({
  label,
  style,
  labelStyle,
  inputStyle,
  ...props
}: InputProps) {
  return (
    <View style={styles.wrapper}>
      {label ? (
        <AppText variant="caption" style={labelStyle}>
          {label}
        </AppText>
      ) : null}
      <TextInput
        style={[styles.input, inputStyle, style]}
        placeholderTextColor={colors.textSecondary}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.s,
  },
  input: {
    minHeight: 48,
    borderRadius: radius.l,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.l,
    fontSize: typography.size.m,
    color: colors.textPrimary,
  },
});
