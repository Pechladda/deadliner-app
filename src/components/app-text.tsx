import { Text, TextProps, TextStyle } from "react-native";

import { colors, typography } from "@/src/theme";

type Variant =
  | "title"
  | "heading"
  | "sectionTitle"
  | "cardTitle"
  | "body"
  | "caption"
  | "button";

type AppTextProps = TextProps & {
  variant?: Variant;
  color?: keyof typeof colors;
};

const variantStyles: Record<Variant, TextStyle> = {
  title: {
    fontSize: typography.size.xxl,
    lineHeight: typography.lineHeight.title,
    fontWeight: typography.weight.heavy,
    fontFamily: typography.family.heavy,
    color: colors.textPrimary,
  },
  heading: {
    fontSize: typography.size.section,
    lineHeight: typography.lineHeight.relaxed,
    fontWeight: typography.weight.bold,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: typography.size.section,
    lineHeight: typography.lineHeight.relaxed,
    fontWeight: typography.weight.bold,
    fontFamily: typography.family.bold,
    color: colors.textPrimary,
  },
  cardTitle: {
    fontSize: typography.size.l,
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.weight.semibold,
    fontFamily: typography.family.semibold,
    color: colors.textPrimary,
  },
  body: {
    fontSize: typography.size.m,
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.weight.regular,
    fontFamily: typography.family.regular,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: typography.size.s,
    lineHeight: typography.lineHeight.compact,
    fontWeight: typography.weight.medium,
    fontFamily: typography.family.medium,
    color: colors.textSecondary,
  },
  button: {
    fontSize: typography.size.m,
    fontWeight: typography.weight.bold,
    fontFamily: typography.family.semibold,
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
