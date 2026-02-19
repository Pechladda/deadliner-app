export const TabRoutes = {
  Home: "Home",
  AddDeadline: "AddDeadline",
  Settings: "Settings",
} as const;

export const StackRoutes = {
  Login: "Login",
  MainTabs: "MainTabs",
  DeadlineDetail: "DeadlineDetail",
} as const;

export type TabRouteName = (typeof TabRoutes)[keyof typeof TabRoutes];
export type StackRouteName = (typeof StackRoutes)[keyof typeof StackRoutes];
