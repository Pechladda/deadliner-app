import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { colors, constants, radius, spacing } from "@/src/theme";

const BLUR_INTENSITY = 30;
const GRADIENT_START = { x: 0, y: 0 };
const GRADIENT_END = { x: 1, y: 1 };

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
    ? constants.card.highlightedGradient
    : constants.card.defaultGradient;
  const resolvedColors = gradientColors ?? defaultColors;

  return (
    <View style={[styles.cardWrap, style]}>
      <LinearGradient
        colors={resolvedColors}
        start={GRADIENT_START}
        end={GRADIENT_END}
        style={[styles.card, highlighted && styles.highlighted]}
      >
        <BlurView
          intensity={BLUR_INTENSITY}
          tint="light"
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.innerBorder} />
        <View style={styles.contentGap}>{children}</View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    borderRadius: radius.xl,
    overflow: "visible",
  },
  card: {
    backgroundColor: "transparent",
    borderRadius: radius.l,
    borderWidth: 0,
    padding: spacing.m,
    overflow: "hidden",
  },
  highlighted: {
    backgroundColor: "transparent",
  },
  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 0,
    borderRadius: radius.l,
    borderColor: constants.card.innerBorder,
  },
  contentGap: {
    rowGap: spacing.s,
  },
});
