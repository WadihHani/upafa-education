import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, LogOut, Bell, User, Users, ClipboardList, Award, FolderKanban, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const sections = [
  { label: "مقرراتي", icon: BookOpen, description: "المقررات التي تُدرّسها هذا الفصل.", href: "/portal/teacher/courses" },
  { label: "الطلاب المسجلون", icon: Users, description: "قائمة الطلاب في كل مقرر وإدارة طلبات التسجيل.", href: "/portal/teacher/students" },
  { label: "المحاضرات والمواد", icon: FolderKanban, description: "رفع المحاضرات المسجلة والمواد التعليمية.", href: "/portal/teacher/materials" },
  { label: "الاختبارات والواجبات", icon: ClipboardList, description: "إنشاء الاختبارات وتسليم الواجبات.", href: "/portal/teacher/assessments" },
  { label: "الدرجات", icon: Award, description: "إدخال درجات الطلاب ونشر النتائج.", href: "/portal/teacher/grades" },
];

export default function TeacherPortal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchPending = async () => {
      // get my courses, then count pending enrollments on them
      const { data: cs } = await supabase
        .from("courses")
        .select("id")
        .eq("teacher_user_id", user.id);
      const ids = (cs ?? []).map((c) => c.id);
      if (ids.length === 0) {
        setPendingCount(0);
        return;
      }
      const { count } = await supabase
        .from("enrollments")
        .select("id", { count: "exact", head: true })
        .in("course_id", ids)
        .eq("status", "pending");
      setPendingCount(count ?? 0);
    };
    fetchPending();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "تم تسجيل الخروج" });
    navigate("/portal");
  };

  return (
    <div dir="rtl" className="min-h-screen bg-muted/30">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-accent" />
            <h1 className="text-base font-bold">بوابة أعضاء الهيئة التدريسية</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/portal/teacher/students"
              className="relative p-1.5 rounded-md hover:bg-primary-foreground/10 transition-colors"
              aria-label="الإشعارات"
            >
              <Bell size={16} />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-accent text-accent-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Link>
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <div className="w-7 h-7 rounded-full bg-primary-foreground/15 flex items-center justify-center">
                <User size={14} />
              </div>
              <span>عضو الهيئة التدريسية</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
            >
              <LogOut size={14} />
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary mb-1">مرحباً بك في بوابتك</h2>
          <p className="text-sm text-muted-foreground">
            اختر القسم الذي تريد الانتقال إليه.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="mb-6 bg-accent/15 border border-accent/40 rounded-lg p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                <Bell size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-primary">
                  لديك {pendingCount} {pendingCount === 1 ? "طلب انضمام جديد" : "طلبات انضمام جديدة"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  راجع الطلبات وقم بقبول أو رفض الطلاب من قسم "الطلاب المسجلون".
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/portal/teacher/students")}
              className="gap-1"
            >
              مراجعة الطلبات <ArrowLeft size={14} />
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((s) => {
            const Icon = s.icon;
            const showBadge = s.href === "/portal/teacher/students" && pendingCount > 0;
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => navigate(s.href)}
                className="text-right bg-card border border-border rounded-md p-4 hover:shadow-md hover:border-accent/50 transition-all relative"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-md bg-accent/15 text-accent flex items-center justify-center">
                    <Icon size={18} />
                  </div>
                  <h3 className="font-bold text-sm text-primary">{s.label}</h3>
                  {showBadge && (
                    <span className="ms-auto bg-accent text-accent-foreground text-[10px] font-bold rounded-full min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center">
                      {pendingCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {s.description}
                </p>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
