import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { colors, radius, spacing } from "@/src/theme";

import { AppText } from "./app-text";

type ToastProps = {
  message: string;
  visible: boolean;
};

export function Toast({ message, visible }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [opacity, visible]);

  if (!message && !visible) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.wrapper, { opacity }]}
      accessibilityLiveRegion="polite"
      accessible
      accessibilityRole="alert"
    >
      <View style={styles.toast}>
        <AppText variant="caption" style={styles.message}>
          {message}
        </AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: spacing.l,
    right: spacing.l,
    bottom: spacing.xl,
    alignItems: "center",
  },
  toast: {
    borderRadius: radius.l,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  message: {
    color: colors.textPrimary,
  },
});
