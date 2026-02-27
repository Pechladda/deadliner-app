import { AppButton, AppText } from "@/src/components";
import { StackRoutes } from "@/src/core/navigation";
import { useLoginNavigation } from "@/src/features/login/hooks/use-login-navigation";
import { colors, spacing } from "@/src/theme";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Line } from "react-native-svg";

function ClockLogo() {
  const stroke = "#3e2723";
  const accent = "#8d6e63";

  const ticks = Array.from({ length: 12 }, (_, i) => {
    const deg = i * 30;
    const rad = (Math.PI * deg) / 180;
    const isMain = i % 3 === 0;
    const inner = isMain ? 20 : 22;
    return { rad, isMain, inner };
  });

  return (
    <Svg width={90} height={90} viewBox="0 0 64 64">
      {/* Outer circle */}
      <Circle
        cx="32"
        cy="32"
        r="26"
        stroke={stroke}
        strokeWidth="2.5"
        fill="none"
      />

      {/* Hour ticks */}
      {ticks.map(({ rad, isMain, inner }, i) => (
        <Line
          key={i}
          x1={32 + inner * Math.sin(rad)}
          y1={32 - inner * Math.cos(rad)}
          x2={32 + 26 * Math.sin(rad)}
          y2={32 - 26 * Math.cos(rad)}
          stroke={stroke}
          strokeWidth={isMain ? 2 : 1}
          strokeLinecap="round"
          opacity={isMain ? 1 : 0.35}
        />
      ))}

      {/* Minute hand — 12 o'clock */}
      <Line
        x1="32"
        y1="32"
        x2="32"
        y2="10"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Hour hand — ~10 o'clock */}
      <Line
        x1="32"
        y1="32"
        x2="19"
        y2="22"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Second hand accent */}
      <Line
        x1="32"
        y1="36"
        x2="44"
        y2="18"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Center dot */}
      <Circle cx="32" cy="32" r="2.5" fill={accent} />
    </Svg>
  );
}

export function LoginScreen() {
  const navigation = useLoginNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        {/* Logo + Title block — centered */}
        <View style={styles.logoBlock}>
          <ClockLogo />
          <View style={styles.divider} />
          <AppText variant="title" style={styles.title}>
            DEADLINER
          </AppText>
          <AppText variant="body" color="textSecondary" style={styles.subtitle}>
            Organize your assignments and never miss a due date.
          </AppText>
        </View>

        <AppButton
          label="Continue"
          onPress={() => navigation.replace(StackRoutes.MainTabs)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.l,
    gap: spacing.m,
  },
  logoBlock: {
    alignItems: "center",
    gap: spacing.m,
    marginBottom: spacing.l,
  },
  divider: {
    width: 40,
    height: 1.5,
    backgroundColor: "#c8a99a",
    borderRadius: 2,
  },
  title: {
    color: "#3e2723",
    letterSpacing: 6,
  },
  subtitle: {
    textAlign: "center",
    color: "#8d6e63",
  },
});
