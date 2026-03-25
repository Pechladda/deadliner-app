export const typography = {
  size: {
    xs: 12,
    s: 13,
    m: 16,
    l: 18,
    section: 23,
    xl: 24,
    xxl: 28,
    display: 34,
  },
  weight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    heavy: "800" as const,
  },
  lineHeight: {
    compact: 17,
    normal: 24,
    relaxed: 28,
    title: 40,
  },
} as const;
