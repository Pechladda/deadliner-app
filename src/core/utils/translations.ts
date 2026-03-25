import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";

const translations = {
  en: {
    tabHome: "Home",
    tabAdd: "Add",
    tabSettings: "Settings",
    goBack: "Go back",
    comingSoon: "Coming soon",
    settings: "Settings",
    profile: "Profile",
    notifications: "Notifications",
    aboutApp: "About App",
    history: "History",
    logout: "Logout",
    language: "Language",
    english: "English",
    thai: "ไทย",
    myDeadlines: "My Deadlines",
    createNewDeadline: "Create new deadline",
    duePrefix: "Due:",
    noDeadlinesYet: "No deadlines yet.",
    login: "Login",
    loginUpper: "LOGIN",
    usernamePlaceholder: "Username",
    usernameInput: "Username input",
    passwordPlaceholder: "Password",
    passwordInput: "Password input",
    hidePassword: "Hide password",
    showPassword: "Show password",
    error: "Error",
    usernameInvalidMessage: "Username: 4–16 letters or numbers only.",
    passwordInvalidMessage:
      "Password: 8+ chars with upper, lower, number & special.",
    usernameRuleLength: "4–16 characters",
    usernameRuleChars: "letters and numbers only",
    passwordRuleLength: "8+ characters",
    passwordRuleUppercase: "1 uppercase",
    passwordRuleLowercase: "1 lowercase",
    passwordRuleNumber: "1 number",
    passwordRuleSpecial: "1 special",
    strengthWeak: "Weak",
    strengthFair: "Fair",
    strengthGood: "Good",
    strengthStrong: "Strong",
    editDeadline: "Edit Deadline",
    newDeadline: "New Deadline",
    courseName: "Course name",
    assignmentName: "Assignment name",
    courseNameInput: "Course name input",
    assignmentNameInput: "Assignment name input",
    date: "Date",
    time: "Time",
    saveDeadline: "Save deadline",
    save: "Save",
    pickDate: "Pick Date",
    pickTime: "Pick Time",
    done: "Done",
    fillAllFieldsError:
      "Please fill Course name, Assignment name, Date and Time.",
    openDatePicker: "Open date picker",
    openTimePicker: "Open time picker",
    noAssignmentSelected: "No assignment selected",
    chooseAssignmentHint:
      "Please choose an assignment from Home to see its details.",
    urgent: "URGENT",
    soon: "SOON",
    onTrack: "ON TRACK",
    due: "Due",
    edit: "Edit",
    delete: "Delete",
    deleteDeadlineTitle: "Delete deadline",
    deleteDeadlineConfirm: "Are you sure you want to delete this assignment?",
    cancel: "Cancel",
    assignmentDetail: "Assignment Detail",
    appName: "Deadliner",
    version: "Version 1.0.0",
    appDescription:
      "Deadliner helps students visualize urgency and never miss important deadlines.",
    developedBy: "Developed by Maymae",
    name: "Name",
    email: "Email",
    completedOn: "Completed",
    movedToHistory: "Moved to History",
    restoredToActive: "Restored to Active",
    noHistoryYet: "No completed deadlines yet.",
    originalDue: "Original due",
    undo: "Undo",
    reminder: "Reminder",
    reminderNone: "None",
    reminder5m: "5 minutes before",
    reminder30m: "30 minutes before",
    reminder1h: "1 hour before",
    reminder1d: "1 day before",
    enableNotifications: "Enable Notifications",
    notificationsDisabledTitle: "Notifications are disabled",
    notificationsDisabledHint: "Enable in system settings.",
    openSettings: "Open Settings",
    consentLabel: "I agree to the Privacy Policy and data storage terms.",
    consentRequired: "Please accept the privacy policy before continuing.",
    privacyPolicy: "Privacy Policy",
    privacyWhatWeStoreTitle: "What we store",
    privacyWhatWeStoreBody:
      "We store your deadlines, reminder settings, notification preference, and app language to make the app work.",
    privacyWhyTitle: "Why we store it",
    privacyWhyBody:
      "Data is used only to show your tasks, schedule reminders, and save your preferences.",
    privacyDeleteTitle: "Delete your data",
    privacyDeleteBody:
      "You can remove all deadlines and related reminder data anytime from Settings.",
    privacyNoExtraDataTitle: "Minimal data",
    privacyNoExtraDataBody:
      "Deadliner does not collect unnecessary personal data such as location or contacts.",
    deleteAllData: "Delete All Data",
    deleteAllDataTitle: "Delete all app data",
    deleteAllDataConfirm:
      "This will permanently remove all deadlines and history. Continue?",
    allDataDeleted: "All app data deleted",
    fieldRequired: "This field is required.",
    fieldTooLong: "Please keep text under 120 characters.",
    invalidDateTime: "Please choose a valid date and time.",
    dueAtLeastOneMinute: "Due time should be at least 1 minute from now.",
    deletedDeadline: "Deadline deleted",
    undoDelete: "Undo delete",
    deleteFailed: "Could not delete this deadline. Please try again.",
    saveFailed: "Could not save the deadline. Please try again.",
    summaryTotalActive: "Active",
    summaryDueToday: "Due today",
    summaryUrgent: "Urgent",
    summaryNext: "Next",
    filterAll: "All",
    filterUrgent: "Urgent",
    filterSoon: "Soon",
    filterCompleted: "Completed",
    searchDeadlinePlaceholder: "Search by assignment or course",
    needsAttentionToday: "Needs attention today",
    dueVerySoon: "Due very soon",
    safeForNow: "Safe for now",
    overdue: "Overdue",
    homeEmptyTitle: "Nothing due right now",
    homeEmptyHint: "Create your first deadline and stay ahead.",
    reminderInfo: "Reminder",
    noReminderSelected: "No reminder",
    settingsDataSection: "Data and privacy",
    settingsAppSection: "App preferences",
    dataUsageSummary:
      "Stored data: course, assignment, due date/time, reminder, and language preference.",
  },
  th: {
    tabHome: "หน้าแรก",
    tabAdd: "เพิ่ม",
    tabSettings: "ตั้งค่า",
    goBack: "ย้อนกลับ",
    comingSoon: "เร็ว ๆ นี้",
    settings: "ตั้งค่า",
    profile: "โปรไฟล์",
    notifications: "การแจ้งเตือน",
    aboutApp: "เกี่ยวกับแอป",
    history: "ประวัติ",
    logout: "ออกจากระบบ",
    language: "ภาษา",
    english: "English",
    thai: "ไทย",
    myDeadlines: "งานที่ต้องส่งของฉัน",
    createNewDeadline: "สร้างเดดไลน์ใหม่",
    duePrefix: "ครบกำหนด:",
    noDeadlinesYet: "ยังไม่มีเดดไลน์",
    login: "เข้าสู่ระบบ",
    loginUpper: "เข้าสู่ระบบ",
    usernamePlaceholder: "ชื่อผู้ใช้",
    usernameInput: "ช่องกรอกชื่อผู้ใช้",
    passwordPlaceholder: "รหัสผ่าน",
    passwordInput: "ช่องกรอกรหัสผ่าน",
    hidePassword: "ซ่อนรหัสผ่าน",
    showPassword: "แสดงรหัสผ่าน",
    error: "ข้อผิดพลาด",
    usernameInvalidMessage: "ชื่อผู้ใช้: 4–16 ตัวอักษรหรือตัวเลขเท่านั้น",
    passwordInvalidMessage:
      "รหัสผ่าน: อย่างน้อย 8 ตัว มีพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และอักขระพิเศษ",
    usernameRuleLength: "4–16 ตัวอักษร",
    usernameRuleChars: "ใช้ได้เฉพาะตัวอักษรและตัวเลข",
    passwordRuleLength: "อย่างน้อย 8 ตัวอักษร",
    passwordRuleUppercase: "พิมพ์ใหญ่อย่างน้อย 1 ตัว",
    passwordRuleLowercase: "พิมพ์เล็กอย่างน้อย 1 ตัว",
    passwordRuleNumber: "ตัวเลขอย่างน้อย 1 ตัว",
    passwordRuleSpecial: "อักขระพิเศษอย่างน้อย 1 ตัว",
    strengthWeak: "อ่อน",
    strengthFair: "พอใช้",
    strengthGood: "ดี",
    strengthStrong: "แข็งแรง",
    editDeadline: "แก้ไขเดดไลน์",
    newDeadline: "เดดไลน์ใหม่",
    courseName: "ชื่อวิชา",
    assignmentName: "ชื่องาน",
    courseNameInput: "ช่องกรอกชื่อวิชา",
    assignmentNameInput: "ช่องกรอกชื่องาน",
    date: "วันที่",
    time: "เวลา",
    saveDeadline: "บันทึกเดดไลน์",
    save: "บันทึก",
    pickDate: "เลือกวันที่",
    pickTime: "เลือกเวลา",
    done: "เสร็จสิ้น",
    fillAllFieldsError: "กรุณากรอกชื่อวิชา ชื่องาน วันที่ และเวลาให้ครบ",
    openDatePicker: "เปิดตัวเลือกวันที่",
    openTimePicker: "เปิดตัวเลือกเวลา",
    noAssignmentSelected: "ไม่ได้เลือกงาน",
    chooseAssignmentHint: "โปรดเลือกงานจากหน้าแรกเพื่อดูรายละเอียด",
    urgent: "ด่วน",
    soon: "ใกล้ถึงกำหนด",
    onTrack: "ตามแผน",
    due: "ครบกำหนด",
    edit: "แก้ไข",
    delete: "ลบ",
    deleteDeadlineTitle: "ลบเดดไลน์",
    deleteDeadlineConfirm: "คุณแน่ใจหรือไม่ว่าต้องการลบงานนี้?",
    cancel: "ยกเลิก",
    assignmentDetail: "รายละเอียดงาน",
    appName: "Deadliner",
    version: "เวอร์ชัน 1.0.0",
    appDescription:
      "Deadliner ช่วยให้นักเรียนเห็นความเร่งด่วนและไม่พลาดกำหนดส่งสำคัญ",
    developedBy: "พัฒนาโดย Maymae",
    name: "ชื่อ",
    email: "อีเมล",
    completedOn: "เสร็จเมื่อ",
    movedToHistory: "ย้ายไปประวัติแล้ว",
    restoredToActive: "ย้ายกลับไปงานที่กำลังทำ",
    noHistoryYet: "ยังไม่มีเดดไลน์ที่เสร็จสิ้น",
    originalDue: "ครบกำหนดเดิม",
    undo: "เลิกเสร็จ",
    reminder: "แจ้งเตือน",
    reminderNone: "ไม่แจ้งเตือน",
    reminder5m: "ก่อนครบกำหนด 5 นาที",
    reminder30m: "ก่อนครบกำหนด 30 นาที",
    reminder1h: "ก่อนครบกำหนด 1 ชั่วโมง",
    reminder1d: "ก่อนครบกำหนด 1 วัน",
    enableNotifications: "เปิดการแจ้งเตือน",
    notificationsDisabledTitle: "การแจ้งเตือนถูกปิด",
    notificationsDisabledHint: "เปิดใช้งานได้ในตั้งค่าระบบ",
    openSettings: "เปิดตั้งค่า",
    consentLabel: "ฉันยอมรับนโยบายความเป็นส่วนตัวและเงื่อนไขการจัดเก็บข้อมูล",
    consentRequired: "โปรดยอมรับนโยบายความเป็นส่วนตัวก่อนดำเนินการต่อ",
    privacyPolicy: "นโยบายความเป็นส่วนตัว",
    privacyWhatWeStoreTitle: "ข้อมูลที่เราจัดเก็บ",
    privacyWhatWeStoreBody:
      "เราเก็บข้อมูลงานที่ต้องส่ง การตั้งค่าการแจ้งเตือน และค่าภาษา เพื่อให้แอปทำงานได้",
    privacyWhyTitle: "เหตุผลที่เก็บข้อมูล",
    privacyWhyBody:
      "ข้อมูลถูกใช้เพื่อแสดงงาน ตั้งการแจ้งเตือน และบันทึกการตั้งค่าของคุณเท่านั้น",
    privacyDeleteTitle: "การลบข้อมูล",
    privacyDeleteBody:
      "คุณสามารถลบเดดไลน์และข้อมูลเตือนทั้งหมดได้ทุกเมื่อจากหน้าตั้งค่า",
    privacyNoExtraDataTitle: "เก็บข้อมูลเท่าที่จำเป็น",
    privacyNoExtraDataBody:
      "Deadliner ไม่เก็บข้อมูลส่วนตัวที่ไม่จำเป็น เช่น ตำแหน่งหรือรายชื่อผู้ติดต่อ",
    deleteAllData: "ลบข้อมูลทั้งหมด",
    deleteAllDataTitle: "ลบข้อมูลทั้งหมดของแอป",
    deleteAllDataConfirm:
      "การดำเนินการนี้จะลบเดดไลน์และประวัติทั้งหมดอย่างถาวร ต้องการดำเนินการต่อหรือไม่",
    allDataDeleted: "ลบข้อมูลทั้งหมดแล้ว",
    fieldRequired: "กรุณากรอกข้อมูลในช่องนี้",
    fieldTooLong: "กรุณากรอกไม่เกิน 120 ตัวอักษร",
    invalidDateTime: "กรุณาเลือกวันที่และเวลาที่ถูกต้อง",
    dueAtLeastOneMinute: "เวลาส่งต้องมากกว่าปัจจุบันอย่างน้อย 1 นาที",
    deletedDeadline: "ลบเดดไลน์แล้ว",
    undoDelete: "เลิกการลบ",
    deleteFailed: "ไม่สามารถลบเดดไลน์ได้ กรุณาลองใหม่อีกครั้ง",
    saveFailed: "ไม่สามารถบันทึกเดดไลน์ได้ กรุณาลองใหม่อีกครั้ง",
    summaryTotalActive: "งานที่กำลังทำ",
    summaryDueToday: "ครบกำหนดวันนี้",
    summaryUrgent: "เร่งด่วน",
    summaryNext: "งานถัดไป",
    filterAll: "ทั้งหมด",
    filterUrgent: "ด่วน",
    filterSoon: "ใกล้ถึงกำหนด",
    filterCompleted: "เสร็จแล้ว",
    searchDeadlinePlaceholder: "ค้นหาตามชื่องานหรือวิชา",
    needsAttentionToday: "ควรทำวันนี้",
    dueVerySoon: "ใกล้ครบกำหนดมาก",
    safeForNow: "ยังปลอดภัย",
    overdue: "เกินกำหนด",
    homeEmptyTitle: "ตอนนี้ยังไม่มีงานเร่งด่วน",
    homeEmptyHint: "เพิ่มเดดไลน์แรกเพื่อวางแผนล่วงหน้า",
    reminderInfo: "การแจ้งเตือน",
    noReminderSelected: "ไม่ตั้งการแจ้งเตือน",
    settingsDataSection: "ข้อมูลและความเป็นส่วนตัว",
    settingsAppSection: "การตั้งค่าแอป",
    dataUsageSummary:
      "ข้อมูลที่จัดเก็บ: ชื่อวิชา ชื่องาน วันเวลาแจ้งส่ง การแจ้งเตือน และภาษาที่เลือก",
  },
};

const i18n = new I18n(translations);
const languageListeners = new Set<() => void>();
const LANGUAGE_STORAGE_KEY = "app_language";

i18n.enableFallback = true;
i18n.defaultLocale = "en";

export type LanguageCode = "en" | "th";

function isValidLanguage(value: string | null): value is LanguageCode {
  return value === "en" || value === "th";
}

function resolveDeviceLanguage(): LanguageCode {
  const detectedLanguage = getLocales()?.[0]?.languageCode;
  return detectedLanguage === "th" ? "th" : "en";
}

export async function initLanguage(): Promise<LanguageCode> {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

    if (isValidLanguage(stored)) {
      i18n.locale = stored;
      return stored;
    }

    const fallback = resolveDeviceLanguage();
    i18n.locale = fallback;
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, fallback);
    return fallback;
  } catch {
    i18n.locale = "en";
    return "en";
  }
}

export const t = (
  key: keyof (typeof translations)["en"],
  options?: Record<string, unknown>,
) => i18n.t(key, options) as string;

export const setLanguage = async (language: LanguageCode) => {
  if (i18n.locale === language) {
    return;
  }

  i18n.locale = language;

  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore storage errors to keep app usable.
  }

  languageListeners.forEach((listener) => listener());
};

export const getLanguage = (): LanguageCode =>
  i18n.locale?.startsWith("th") ? "th" : "en";

export const subscribeLanguageChange = (listener: () => void) => {
  languageListeners.add(listener);

  return () => {
    languageListeners.delete(listener);
  };
};
