import { StyleSheet, TextInput, TextInputProps, View } from "react-native";

import { colors, radius, spacing, typography } from "@/src/theme";

import { AppText } from "./app-text";

type InputProps = TextInputProps & {
  label?: string;
};

export function Input({ label, style, ...props }: InputProps) {
  return (
    <View style={styles.wrapper}>
      {label ? <AppText variant="caption">{label}</AppText> : null}
      <TextInput
        style={[styles.input, style]}
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
