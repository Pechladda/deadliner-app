import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { doc, getDoc } from "firebase/firestore";
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

const PINK = "#EAB8C9";
const PINK_LIGHT = "#FAF0F4";
const PINK_BORDER = "#F0D0DC";
const PINK_DEEP = "#C9849A";

const USERS_COLLECTION = "users";

const AVATAR_RING_SIZE = 96;
const AVATAR_RING_BORDER_WIDTH = 2;
const AVATAR_RING_PADDING = 4;
const AVATAR_SIZE = 80;
const AVATAR_BORDER_WIDTH = 1.5;
const AVATAR_PLACEHOLDER_ICON_SIZE = 32;
const INFO_ICON_WRAP_SIZE = 34;
const INFO_ICON_SIZE = 16;
const ERROR_ICON_SIZE = 14;
const BLUR_INTENSITY = 26;
const DIVIDER_HEIGHT = 1;
const DIVIDER_OPACITY = 0.5;
const INITIALS_LETTER_SPACING = 1;

const FALLBACK_LOAD_ERROR = "Unable to load profile. Please sign in again.";
const SIGN_IN_AGAIN_ERROR = "Sign in again";
const EMPTY_PLACEHOLDER = "–";

type UserProfile = {
  username?: string;
  name?: string;
};

function getInitials(name: string): string {
  const parts = name.trim().split(" ");

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  const firstInitial = parts[0][0];
  const lastInitial = parts[parts.length - 1][0];

  return (firstInitial + lastInitial).toUpperCase();
}

export function ProfileScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const isCompactLayout = windowWidth < layout.thresholds.compact;
  const isWideLayout = windowWidth >= layout.thresholds.wide;
  const navigation = useSettingsNavigation();
  const currentUser = useAuthStore((state) => state.currentUser);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const displayedLoadError = useMemo(() => {
    return loadError || FALLBACK_LOAD_ERROR;
  }, [loadError]);

  const loadProfile = useCallback(async () => {
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated) {
      console.warn("[Profile] auth is missing after hydration");
      setLoadError(SIGN_IN_AGAIN_ERROR);
      setIsLoading(false);
      return;
    }

    if (!currentUser) {
      console.warn("[Profile] currentUser is null after hydration");
      setLoadError(SIGN_IN_AGAIN_ERROR);
      setIsLoading(false);
      return;
    }

    try {
      const fallbackUsername = currentUser.displayName?.trim() ?? "";
      const authEmail = auth.currentUser?.email ?? currentUser.email ?? "";

      setIsLoading(true);
      setLoadError("");
      setEmail(authEmail);

      const profileDocRef = doc(db, USERS_COLLECTION, currentUser.uid);
      const snapshot = await getDoc(profileDocRef);

      let resolvedUsername = fallbackUsername;
      if (snapshot.exists()) {
        const profileData = snapshot.data() as UserProfile;
        resolvedUsername =
          profileData.username?.trim() ||
          profileData.name?.trim() ||
          fallbackUsername;
      }

      setUsername(resolvedUsername);
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

  const initials = username ? getInitials(username) : null;
  const hasLoadError = !isLoading && Boolean(loadError);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <PastelBackground />

      <View
        style={[
          styles.container,
          isCompactLayout && styles.containerCompact,
          isWideLayout && styles.containerWide,
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
            isCompactLayout && styles.contentInnerCompact,
            isWideLayout && styles.contentInnerWide,
          ]}
        >
          <View style={styles.avatarSection}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                {isLoading ? (
                  <ActivityIndicator color={PINK} size="small" />
                ) : initials ? (
                  <AppText style={styles.avatarInitials}>{initials}</AppText>
                ) : (
                  <Ionicons
                    name="person"
                    size={AVATAR_PLACEHOLDER_ICON_SIZE}
                    color={PINK_DEEP}
                  />
                )}
              </View>
            </View>

            {!isLoading && username ? (
              <AppText style={styles.displayName}>{username}</AppText>
            ) : null}
            {!isLoading && email ? (
              <AppText style={styles.displayEmail}>{email}</AppText>
            ) : null}
          </View>

          <BlurView
            intensity={BLUR_INTENSITY}
            tint="light"
            style={styles.formCard}
          >
            <View style={styles.infoRow}>
              <View style={styles.infoIconWrap}>
                <Ionicons
                  name="person-outline"
                  size={INFO_ICON_SIZE}
                  color={PINK_DEEP}
                />
              </View>
              <View style={styles.infoText}>
                <AppText style={styles.infoLabel}>{"Username"}</AppText>
                <AppText style={styles.infoValue}>
                  {isLoading
                    ? EMPTY_PLACEHOLDER
                    : username || EMPTY_PLACEHOLDER}
                </AppText>
              </View>
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconWrap}>
                <Ionicons
                  name="mail-outline"
                  size={INFO_ICON_SIZE}
                  color={PINK_DEEP}
                />
              </View>
              <View style={styles.infoText}>
                <AppText style={styles.infoLabel}>{"Email"}</AppText>
                <AppText style={styles.infoValue} numberOfLines={1}>
                  {isLoading ? EMPTY_PLACEHOLDER : email || EMPTY_PLACEHOLDER}
                </AppText>
              </View>
            </View>
          </BlurView>

          {hasLoadError ? (
            <View style={styles.errorWrap}>
              <Ionicons
                name="alert-circle-outline"
                size={ERROR_ICON_SIZE}
                color={colors.overdue}
              />
              <AppText style={styles.errorText}>{displayedLoadError}</AppText>
            </View>
          ) : null}
        </View>
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
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
    gap: spacing.m,
  },
  containerCompact: {
    paddingHorizontal: spacing.m,
    paddingTop: spacing.m,
  },
  containerWide: {
    paddingHorizontal: spacing.xxxl,
    paddingTop: spacing.xl,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s,
    marginBottom: spacing.s,
  },
  screenTitle: {
    color: colors.textPrimary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.l,
    lineHeight: typography.lineHeight.m,
    marginLeft: spacing.s,
    marginTop: spacing.m,
  },

  contentInner: {
    width: "100%",
    maxWidth: layout.maxWidths.default,
    alignSelf: "center",
    gap: spacing.l,
  },
  contentInnerCompact: {
    maxWidth: layout.maxWidths.compact,
  },
  contentInnerWide: {
    maxWidth: layout.maxWidths.wide,
  },

  avatarSection: {
    alignItems: "center",
    gap: spacing.s,
    paddingTop: spacing.m,
  },
  avatarRing: {
    width: AVATAR_RING_SIZE,
    height: AVATAR_RING_SIZE,
    borderRadius: AVATAR_RING_SIZE / 2,
    borderWidth: AVATAR_RING_BORDER_WIDTH,
    borderColor: PINK_BORDER,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    padding: AVATAR_RING_PADDING,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: PINK_LIGHT,
    borderWidth: AVATAR_BORDER_WIDTH,
    borderColor: PINK,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: typography.size.m,
    fontWeight: typography.weight.bold,
    color: PINK_DEEP,
    letterSpacing: INITIALS_LETTER_SPACING,
  },
  displayName: {
    fontSize: typography.size.m,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    letterSpacing: constants.typography.letterSpacing.tight,
  },
  displayEmail: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
  },

  formCard: {
    borderRadius: radius.s,
    overflow: "hidden",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.m,
    ...shadows.shadowCard,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.m,
    paddingVertical: spacing.m,
  },
  infoIconWrap: {
    width: INFO_ICON_WRAP_SIZE,
    height: INFO_ICON_WRAP_SIZE,
    borderRadius: radius.s,
    backgroundColor: PINK_LIGHT,
    borderWidth: 1,
    borderColor: PINK_BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    flex: 1,
    gap: spacing.xxs,
  },
  infoLabel: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    letterSpacing: constants.typography.letterSpacing.tight,
  },
  infoValue: {
    fontSize: typography.size.sm,
    color: colors.textPrimary,
    fontWeight: typography.weight.semibold,
  },
  rowDivider: {
    height: DIVIDER_HEIGHT,
    backgroundColor: colors.border,
    opacity: DIVIDER_OPACITY,
    marginHorizontal: -spacing.m,
  },

  errorWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    justifyContent: "center",
  },
  errorText: {
    fontSize: typography.size.xs,
    color: colors.overdue,
  },
});
