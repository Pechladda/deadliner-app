import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { colors, radius, shadows, spacing } from "@/src/theme";

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  highlighted?: boolean;
};

export function Card({ children, style, highlighted = false }: CardProps) {
  return (
    <View style={[styles.card, highlighted && styles.highlighted, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 0,
    borderColor: colors.borderSoft,
    padding: spacing.xl2,
    ...shadows.shadowCard,
  },
  highlighted: {
    backgroundColor: colors.cardHighlight,
  },
});
