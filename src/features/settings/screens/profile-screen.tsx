import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText, IconButton, PastelBackground } from "@/src/components";
import { getFirestoreErrorMessage } from "@/src/core/utils";
import { useSettingsNavigation } from "@/src/features/settings/hooks/use-settings-navigation";
import { auth, db } from "@/src/firebase";
import { useAuthStore } from "@/src/store/auth-store";
import {
  colors,
  constants,
  layout,
  radius,
  shadows,
  spacing,
  typography,
} from "@/src/theme";
import { doc, getDoc } from "firebase/firestore";

type UserProfile = {
  username?: string;
  name?: string;
};

const PROFILE_ACCENT = colors.textPrimary;
const PROFILE_ACCENT_STRONG = colors.textSecondary;

export function ProfileScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < layout.thresholds.compact;
  const isWide = width >= layout.thresholds.wide;
  const navigation = useSettingsNavigation();
  const currentUser = useAuthStore((state) => state.currentUser);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const displayLoadError = useMemo(() => {
    return loadError || "Unable to load profile. Please sign in again.";
  }, [loadError]);

  const showSignInAgain = useMemo(() => {
    return (
      loadError === "Sign in again" ||
      loadError === "Session expired. Please sign in again."
    );
  }, [loadError]);

  const loadProfile = useCallback(async () => {
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated) {
      console.warn("[Profile] auth is missing after hydration");
      setLoadError("Sign in again");
      setIsLoading(false);
      return;
    }

    if (!currentUser) {
      console.warn("[Profile] currentUser is null after hydration");
      setLoadError("Sign in again");
      setIsLoading(false);
      return;
    }

    try {
      const fallbackUsername = currentUser.displayName?.trim() || "";
      const authEmail = auth.currentUser?.email ?? currentUser.email ?? "";

      setIsLoading(true);
      setLoadError("");
      setEmail(authEmail);

      const profileRef = doc(db, "users", currentUser.uid);
      const snapshot = await getDoc(profileRef);
      let nextUsername = fallbackUsername;

      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        nextUsername =
          data.username?.trim() || data.name?.trim() || fallbackUsername;
      }

      setUsername(nextUsername);
    } catch (error) {
      console.error("[Profile] failed:", error);
      setLoadError(getFirestoreErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, isAuthenticated, isHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void loadProfile();
  }, [isHydrated, loadProfile]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <PastelBackground />
      <View
        style={[
          styles.container,
          isCompact && styles.containerCompact,
          isWide && styles.containerWide,
        ]}
      >
        <View style={styles.headerRow}>
          <IconButton
            icon="chevron-back"
            onPress={() => navigation.goBack()}
            accessibilityLabel={"Go back"}
          />
          <AppText variant="section" style={styles.screenTitle}>
            {"Profile"}
          </AppText>
        </View>

        <View
          style={[
            styles.contentInner,
            isCompact && styles.contentInnerCompact,
            isWide && styles.contentInnerWide,
          ]}
        >
          <View style={styles.avatar}>
            <Ionicons name="person" size={30} color={colors.textSecondary} />
          </View>

          {isLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={PROFILE_ACCENT_STRONG} />
            </View>
          ) : null}

          <View style={styles.formWrap}>
            <View style={styles.readOnlyRow}>
              <AppText variant="caption" style={styles.readOnlyLabel}>
                {"Username"}
              </AppText>
              <AppText variant="caption" style={styles.readOnlyValue}>
                {username || "-"}
              </AppText>
            </View>

            <View style={styles.readOnlyRow}>
              <AppText variant="caption" style={styles.readOnlyLabel}>
                {"Email"}
              </AppText>
              <AppText variant="caption" style={styles.readOnlyValue}>
                {email || "-"}
              </AppText>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.l,
    gap: spacing.m,
  },
  containerCompact: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
  },
  containerWide: {
    paddingHorizontal: spacing.xxxl,
    paddingTop: spacing.xl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: spacing.s,
    marginBottom: spacing.s,
  },
  screenTitle: {
    textAlign: "left",
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    letterSpacing: constants.typography.letterSpacing.normal,
    fontSize: typography.size.l,
    lineHeight: typography.lineHeight.m,
    marginLeft: spacing.s,
    marginTop: spacing.m,
  },
  contentInner: {
    width: "100%",
    maxWidth: layout.maxWidths.default,
    alignSelf: "center",
    gap: spacing.xxl,
  },
  contentInnerCompact: {
    maxWidth: layout.maxWidths.compact,
  },
  contentInnerWide: {
    maxWidth: layout.maxWidths.wide,
  },
  avatar: {
    alignSelf: "center",
    width: layout.components.profile.avatarSize,
    height: layout.components.profile.avatarSize,
    borderRadius: layout.components.profile.avatarRadius,
    borderColor: colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  formWrap: { gap: spacing.m },
  readOnlyRow: {
    borderColor: colors.borderSoft,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  readOnlyLabel: {
    color: colors.textSecondary,
  },
  readOnlyValue: {
    color: colors.textPrimary,
  },
  loadingWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.s,
  },
});
