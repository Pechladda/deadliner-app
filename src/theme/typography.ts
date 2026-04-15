export const typography = {
  family: {
    regular: "Roboto_400Regular",
    medium: "Roboto_500Medium",
    semibold: "Roboto_600SemiBold",
    bold: "Roboto_700Bold",
    heavy: "Roboto_900Black",
  },

  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    heavy: "900",
  },

  size: {
    xs: 12,
    sm: 14,
    s: 14,
    base: 16,
    m: 16,
    l: 19,
    lg: 19,
    section: 24,
    xl: 26,
    xxl: 30,
    display: 40,
  },

  lineHeight: {
    xs: 16,
    sm: 20,
    base: 24,
    compact: 20,
    normal: 24,
    relaxed: 30,
    title: 44,
    lg: 26,
    section: 32,
    xl: 32,
    xxl: 38,
    display: 48,
  },

  preset: {
    caption: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: "Roboto_400Regular",
    },

    body: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: "Roboto_400Regular",
    },

    bodyMedium: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: "Roboto_500Medium",
      fontWeight: "500" as const,
    },

    subtitle: {
      fontSize: 19,
      lineHeight: 26,
      fontFamily: "Roboto_700Bold",
      fontWeight: "500" as const,
    },

    section: {
      fontSize: 24,
      lineHeight: 32,
      fontFamily: "Roboto_900Black",
    },

    title: {
      fontSize: 30,
      lineHeight: 38,
      fontFamily: "Roboto_900Black",
    },

    display: {
      fontSize: 40,
      lineHeight: 48,
      fontFamily: "Roboto_900Black",
    },
  },
} as const;
