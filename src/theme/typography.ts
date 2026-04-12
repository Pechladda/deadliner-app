export const typography = {
  family: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semibold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
    heavy: "Inter_800ExtraBold",
  },
  size: {
    xs: 12,
    s: 14,
    m: 16,
    l: 19,
    section: 24,
    xl: 26,
    xxl: 30,
    display: 40,
  },
  weight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    heavy: "800" as const,
  },
  lineHeight: {
    compact: 18,
    normal: 24,
    relaxed: 30,
    title: 44,
  },
} as const;
