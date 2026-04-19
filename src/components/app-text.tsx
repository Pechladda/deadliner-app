import { colors, typography } from "@/src/theme";
import { Text, TextProps, TextStyle } from "react-native";

type Variant =
  | "display"
  | "title"
  | "section"
  | "subtitle"
  | "bodyMedium"
  | "body"
  | "caption";

type AppTextProps = TextProps & {
  variant?: Variant;
  color?: keyof typeof colors;
};

const variantStyles: Record<Variant, TextStyle> = {
  display: {
    fontFamily: typography.family.heavy,
    fontSize: typography.size.display,
    lineHeight: typography.lineHeight.display,
    color: colors.textPrimary,
  },
  title: {
    fontFamily: typography.family.heavy,
    fontSize: typography.size.xxl,
    lineHeight: typography.lineHeight.title,
    color: colors.textPrimary,
  },
  section: {
    fontFamily: typography.family.heavy,
    fontSize: typography.size.lg,
    lineHeight: typography.lineHeight.xxl,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: typography.family.bold,
    fontSize: typography.size.m,
    lineHeight: typography.lineHeight.lg,
    color: colors.textPrimary,
  },
  bodyMedium: {
    fontFamily: typography.family.medium,
    fontSize: typography.size.base,
    lineHeight: typography.lineHeight.l,
    color: colors.textPrimary,
  },
  body: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.s,
    lineHeight: typography.lineHeight.l,
    color: colors.textPrimary,
  },
  caption: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.caption,
    color: colors.textSecondary,
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
