import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Users, CalendarDays, GraduationCap, FileText, LogOut, LayoutDashboard, Image, DoorOpen, Settings, Lock, ClipboardList, ScrollText, FileCheck, Newspaper, BookOpen, Globe, UserPlus, StickyNote } from "lucide-react";
import AdminLogin from "@/pages/AdminLogin";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { label: "الرئيسية", path: "/admin", icon: LayoutDashboard },
  { label: "شرائح الهيرو", path: "/admin/hero", icon: Image },
  { label: "أقسام الأخبار", path: "/admin/news", icon: Newspaper },
  { label: "المستخدمون", path: "/admin/users", icon: Users },
  { label: "ملاحظات الطلاب", path: "/admin/student-notes", icon: StickyNote },
  { label: "المؤتمرات", path: "/admin/conferences", icon: CalendarDays },
  { label: "البرامج", path: "/admin/programs", icon: GraduationCap },
  { label: "البوابات", path: "/admin/portal", icon: DoorOpen },
  { label: "المقررات", path: "/admin/courses", icon: BookOpen },
  { label: "طلبات الانضمام", path: "/admin/enrollments", icon: ClipboardList, badgeKey: "pending_enrollments" as const },
  { label: "برامج المفاضلة", path: "/admin/mofadla/programs", icon: ScrollText },
  { label: "طلبات المفاضلة", path: "/admin/mofadla/applications", icon: FileCheck },
  { label: "تثبيت التسجيل", path: "/admin/mofadla/registrations", icon: UserPlus, badgeKey: "pending_registrations" as const },
  { label: "محتوى الموقع", path: "/admin/site-content", icon: Settings },
  { label: "حالة DNS للبريد", path: "/admin/dns-status", icon: Globe },
];

export default function AdminLayout() {
  const { isAdmin, loading, signOut } = useAuth();
  const location = useLocation();
  const [pendingEnrollments, setPendingEnrollments] = useState(0);
  const [pendingRegistrations, setPendingRegistrations] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchCounts = async () => {
      const [enrRes, regRes] = await Promise.all([
        supabase
          .from("enrollments")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("mofadla_quick_registrations")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);
      setPendingEnrollments(enrRes.count ?? 0);
      setPendingRegistrations(regRes.count ?? 0);
    };
    fetchCounts();

    const channel = supabase
      .channel("admin-layout-counts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "enrollments" },
        () => fetchCounts()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mofadla_quick_registrations" },
        () => fetchCounts()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AdminLogin />;
  }

  const badges: Record<string, number> = {
    pending_enrollments: pendingEnrollments,
    pending_registrations: pendingRegistrations,
  };

  return (
    <div className="min-h-screen flex bg-muted/30" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-primary-foreground flex flex-col shrink-0 min-h-screen sticky top-0">
        <div className="p-6 border-b border-primary-foreground/10">
          <h1 className="text-lg font-bold">لوحة التحكم</h1>
          <p className="text-xs text-primary-foreground/60 mt-1">إدارة الموقع</p>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-primary-foreground/20 text-primary-foreground font-medium"
                    : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                }`}
              >
                <Icon size={18} />
                <span className="flex-1">{item.label}</span>
                {badgeCount > 0 && (
                  <span className="bg-accent text-accent-foreground text-[10px] font-bold rounded-full min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center">
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-primary-foreground/10">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2 text-sm text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-lg transition-colors mb-2"
          >
            عرض الموقع
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            onClick={signOut}
          >
            <LogOut size={18} />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
