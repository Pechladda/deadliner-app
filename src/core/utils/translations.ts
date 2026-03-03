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
