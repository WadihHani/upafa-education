import {
  Newspaper,
  Megaphone,
  GraduationCap,
  CalendarDays,
  FileText,
  AlertCircle,
  BookOpen,
  ClipboardList,
  Users,
  ScrollText,
  FileCheck2,
  Bell,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Newspaper,
  Megaphone,
  GraduationCap,
  CalendarDays,
  FileText,
  AlertCircle,
  BookOpen,
  ClipboardList,
  Users,
  ScrollText,
  FileCheck2,
  Bell,
};

export const ICON_OPTIONS = Object.keys(ICONS);

export function getNewsIcon(name?: string | null): LucideIcon {
  if (!name) return Newspaper;
  return ICONS[name] ?? Newspaper;
}
