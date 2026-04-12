import {
    StyleProp,
    StyleSheet,
    TextInput,
    TextInputProps,
    TextStyle,
    View,
} from "react-native";

import {
    colors,
    radius,
    shadows,
    sharedComponentTokens,
    spacing,
    typography,
} from "@/src/theme";

import { AppText } from "./app-text";

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export function Input({
  label,
  error,
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
        style={[
          styles.input,
          error ? styles.inputError : null,
          inputStyle,
          style,
        ]}
        placeholderTextColor={colors.textSecondary}
        {...props}
      />
      {error ? (
        <AppText variant="caption" color="danger" style={styles.errorText}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.s,
  },
  input: {
    minHeight: 50,
    borderRadius: radius.xl,
    backgroundColor: sharedComponentTokens.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.l,
    fontSize: typography.size.m,
    color: colors.textPrimary,
    ...shadows.shadowLight,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    marginTop: spacing.xs,
  },
});
