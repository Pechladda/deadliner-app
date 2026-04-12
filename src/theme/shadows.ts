import { type ViewStyle } from "react-native";

import { colors } from "./colors";

export const shadows: Record<
  "shadowSoft" | "shadowLight" | "shadowCard",
  ViewStyle
> = {
  shadowSoft: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 5,
  },
  shadowLight: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  shadowCard: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 10,
  },
};
