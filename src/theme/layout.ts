import { radius } from "./radius";
import { shadows } from "./shadows";
import { spacing } from "./spacing";

export const layout = {
  spacing,
  radius,
  shadows,
  thresholds: {
    compact: 375,
    wide: 430,
  },
  maxWidths: {
    default: 420,
    compact: 360,
    wide: 460,
  },
  components: {
    button: {
      minHeight: 54,
      compactMinHeight: 42,
      iconSize: 18,
      disabledOpacity: 0.4,
    },
    input: {
      minHeight: 50,
    },
    profile: {
      avatarSize: 72,
      avatarRadius: 36,
      readOnlyRowRadius: 12,
      errorBannerRadius: 14,
    },
    home: {
      summaryDividerWidth: 1,
      summaryDividerHeight: 24,
      searchMinHeight: 44,
      filterChipMinHeight: 30,
      heroOrbSize: 280,
      heroOrbRight: -100,
      heroOrbTop: -120,
      violetOrbSize: 240,
      violetOrbLeft: -80,
      violetOrbTop: 400,
      swipeActionIconSize: 24,
    },
    iconButton: {
      size: 40,
      defaultIconSize: 22,
    },
    login: {
      formAreaMaxWidth: 340,
      formAreaCompactMaxWidth: 320,
      formAreaWideMaxWidth: 360,
    },
  },
} as const;
