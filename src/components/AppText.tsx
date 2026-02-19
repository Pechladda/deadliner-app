import { Text, TextProps, TextStyle } from "react-native";

import { colors, typography } from "@/src/theme";

type Variant = "title" | "heading" | "body" | "caption" | "button";

type AppTextProps = TextProps & {
  variant?: Variant;
  color?: keyof typeof colors;
};

const variantStyles: Record<Variant, TextStyle> = {
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.heavy,
    color: colors.textPrimary,
  },
  heading: {
    fontSize: typography.size.l,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  body: {
    fontSize: typography.size.m,
    fontWeight: typography.weight.regular,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: typography.size.s,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
  },
  button: {
    fontSize: typography.size.m,
    fontWeight: typography.weight.bold,
    color: colors.buttonText,
  },
};

export function AppText({
  variant = "body",
  color,
  style,
  ...props
}: AppTextProps) {
  return (
    <Text
      style={[
        variantStyles[variant],
        color ? { color: colors[color] } : null,
        style,
      ]}
      {...props}
    />
  );
}
