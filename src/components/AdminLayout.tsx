import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Users, CalendarDays, GraduationCap, FileText, LogOut, LayoutDashboard, Image, DoorOpen, Settings, Lock, ClipboardList, ScrollText, FileCheck } from "lucide-react";
import AdminLogin from "@/pages/AdminLogin";

const navItems = [
  { label: "الرئيسية", path: "/admin", icon: LayoutDashboard },
  { label: "شرائح الهيرو", path: "/admin/hero", icon: Image },
  { label: "المستخدمون", path: "/admin/users", icon: Users },
  { label: "المؤتمرات", path: "/admin/conferences", icon: CalendarDays },
  { label: "البرامج", path: "/admin/programs", icon: GraduationCap },
  { label: "البوابات", path: "/admin/portal", icon: DoorOpen },
  { label: "طلبات التسجيل", path: "/admin/enrollments", icon: ClipboardList },
  { label: "برامج المفاضلة", path: "/admin/mofadla/programs", icon: ScrollText },
  { label: "طلبات المفاضلة", path: "/admin/mofadla/applications", icon: FileCheck },
  { label: "محتوى الموقع", path: "/admin/site-content", icon: Settings },
];

export default function AdminLayout() {
  const { isAdmin, loading, signOut } = useAuth();
  const location = useLocation();

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
                {item.label}
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
