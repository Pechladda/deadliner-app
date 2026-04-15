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
    ...typography.preset.display,
    color: colors.textPrimary,
  },

  title: {
    ...typography.preset.title,
    color: colors.textPrimary,
  },

  section: {
    ...typography.preset.section,
    color: colors.textPrimary,
  },

  subtitle: {
    ...typography.preset.subtitle,
    color: colors.textPrimary,
  },

  bodyMedium: {
    ...typography.preset.bodyMedium,
    color: colors.textPrimary,
  },

  body: {
    ...typography.preset.body,
    color: colors.textPrimary,
  },

  caption: {
    ...typography.preset.caption,
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
