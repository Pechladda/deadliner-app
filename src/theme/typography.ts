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
    s: 16,
    base: 18,
    m: 20,
    l: 22,
    lg: 24,
    section: 26,
    xl: 28,
    xxl: 30,
    display: 32,
  },

  lineHeight: {
    xs: 14,
    sm: 16,
    base: 18,
    compact: 20,
    normal: 22,
    relaxed: 24,
    title: 26,
    lg: 28,
    section: 30,
    xl: 32,
    xxl: 34,
    display: 36,
  },

  preset: {
    caption: {
      fontSize: 14,
      lineHeight: 18.5,
      fontFamily: "Roboto_400Regular",
    },

    body: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: "Roboto_400Regular",
    },

    bodyMedium: {
      fontSize: 18,
      lineHeight: 24,
      fontFamily: "Roboto_500Medium",
    },

    subtitle: {
      fontSize: 19,
      lineHeight: 26,
      fontFamily: "Roboto_700Bold",
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
