import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { cardTokens, radius, shadows, spacing } from "@/src/theme";

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  highlighted?: boolean;
  gradientColors?: readonly [string, string, ...string[]];
};

export function Card({
  children,
  style,
  highlighted = false,
  gradientColors,
}: CardProps) {
  const defaultColors: readonly [string, string] = highlighted
    ? cardTokens.highlightedGradient
    : cardTokens.defaultGradient;
  const finalColors = gradientColors ?? defaultColors;

  return (
    <View style={[styles.cardWrap, style]}>
      <LinearGradient
        colors={finalColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, highlighted && styles.highlighted]}
      >
        <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.innerBorder} />
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    borderRadius: radius.xl,
    overflow: "visible",
    ...shadows.shadowCard,
  },
  card: {
    backgroundColor: "transparent",
    borderRadius: radius.xl,
    borderWidth: 0,
    padding: spacing.xl2,
    overflow: "hidden",
  },
  highlighted: {
    backgroundColor: "transparent",
  },
  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 0,
    borderRadius: radius.xl,
    borderColor: cardTokens.innerBorder,
  },
});
