export const APP_VERSION = "1.0.0";

export const DATE_DISPLAY_LOCALE = "en-US-u-ca-gregory-nu-latn";
export const TIME_DISPLAY_LOCALE = "en-GB-u-ca-gregory-nu-latn";
export const IOS_DATE_PICKER_LOCALE = "en_US";
export const ANDROID_DATE_PICKER_LOCALE = "en-US-u-ca-gregory-nu-latn";

export const DATE_DISPLAY_OPTIONS = {
  month: "short",
  day: "numeric",
  year: "numeric",
} as const;

export const DUE_LABEL_OPTIONS = {
  month: "short",
  day: "numeric",
} as const;

export const COMPLETED_LABEL_OPTIONS = {
  month: "short",
  day: "numeric",
  year: "numeric",
} as const;

export const TIME_DISPLAY_OPTIONS = {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
} as const;

export const HISTORY_COMPLETED_AT_OPTIONS = {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
} as const;
