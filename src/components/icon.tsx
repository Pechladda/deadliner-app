/**
 * AppIcon — wraps lucide-react-native icons using the same name API as Ionicons.
 * SVG-based: works on web and native without any font file.
 */
import {
  AlarmClock,
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Bell,
  BellOff,
  Book,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock,
  ExternalLink,
  FileText,
  Flame,
  LayoutGrid,
  List,
  LogOut,
  LucideIcon,
  Mail,
  Pencil,
  PlusCircle,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Home,
  Trash2,
  User,
  X,
  XCircle,
} from "lucide-react-native";

// Maps Ionicons names → Lucide components.
// Outline vs filled variants both map to the same Lucide icon.
const ICON_MAP: Record<string, LucideIcon> = {
  "alarm-outline": AlarmClock,
  "alert-circle": AlertCircle,
  "alert-circle-outline": AlertCircle,
  "apps-outline": LayoutGrid,
  "arrow-back-outline": ArrowLeft,
  "book-outline": Book,
  calendar: Calendar,
  "calendar-outline": Calendar,
  checkmark: Check,
  "checkmark-circle": CheckCircle2,
  "checkmark-circle-outline": CheckCircle2,
  "checkmark-done-circle": BadgeCheck,
  "checkmark-done-circle-outline": BadgeCheck,
  "chevron-back": ChevronLeft,
  "chevron-forward": ChevronRight,
  "close-circle": XCircle,
  "close-outline": X,
  "document-text": FileText,
  "document-text-outline": FileText,
  flame: Flame,
  "flame-outline": Flame,
  "help-circle-outline": CircleHelp,
  "hourglass-outline": Clock,
  home: Home,
  "home-outline": Home,
  "add-circle": PlusCircle,
  "add-circle-outline": PlusCircle,
  settings: Settings,
  "settings-outline": Settings,
  list: List,
  "log-out-outline": LogOut,
  "mail-outline": Mail,
  notifications: Bell,
  "notifications-outline": Bell,
  "notifications-off-outline": BellOff,
  "open-outline": ExternalLink,
  pencil: Pencil,
  person: User,
  "person-outline": User,
  search: Search,
  "search-outline": Search,
  "shield-checkmark-outline": ShieldCheck,
  "sparkles-outline": Sparkles,
  time: Clock,
  "time-outline": Clock,
  trash: Trash2,
  "trash-outline": Trash2,
};

export type AppIconName = keyof typeof ICON_MAP;

type AppIconProps = {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: object;
};

export function AppIcon({
  name,
  size = 24,
  color = "#000",
  strokeWidth = 1.75,
  style,
}: AppIconProps) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon size={size} color={color} strokeWidth={strokeWidth} style={style} />;
}
