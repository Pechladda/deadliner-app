import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { colors, motion, radius, shadows, spacing } from "@/src/theme";

import { AppText } from "./app-text";

type ToastProps = {
  message: string;
  visible: boolean;
  type?: "success" | "error" | "info";
};

export function Toast({ message, visible, type = "info" }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: motion.normal,
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
        <AppText
          variant="caption"
          style={[
            styles.message,
            type === "success" && styles.successText,
            type === "error" && styles.errorText,
          ]}
        >
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
    borderRadius: radius.xl,
    borderWidth: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    ...shadows.shadowSoft,
  },
  message: {
    color: colors.textPrimary,
  },
  successText: {
    color: colors.success,
  },
  errorText: {
    color: colors.danger,
  },
});
