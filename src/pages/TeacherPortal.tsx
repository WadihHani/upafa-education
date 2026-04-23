import { useNavigate } from "react-router-dom";
import { BookOpen, LogOut, Bell, User, Users, ClipboardList, Award, FolderKanban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const sections = [
  { label: "مقرراتي", icon: BookOpen, description: "المقررات التي تُدرّسها هذا الفصل.", href: "/portal/teacher/courses" },
  { label: "الطلاب المسجلون", icon: Users, description: "قائمة الطلاب في كل مقرر وإدارة طلبات التسجيل.", href: "/portal/teacher/students" },
  { label: "المحاضرات والمواد", icon: FolderKanban, description: "رفع المحاضرات المسجلة والمواد التعليمية.", href: "/portal/teacher/materials" },
  { label: "الاختبارات والواجبات", icon: ClipboardList, description: "إنشاء الاختبارات وتسليم الواجبات.", href: "/portal/teacher/assessments" },
  { label: "الدرجات", icon: Award, description: "إدخال درجات الطلاب ونشر النتائج.", href: "/portal/teacher/grades" },
];

export default function TeacherPortal() {
  const navigate = useNavigate();

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
            <button
              type="button"
              className="p-1.5 rounded-md hover:bg-primary-foreground/10 transition-colors"
              aria-label="الإشعارات"
            >
              <Bell size={16} />
            </button>
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-1">مرحباً بك في بوابتك</h2>
          <p className="text-sm text-muted-foreground">
            اختر القسم الذي تريد الانتقال إليه.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => navigate(s.href)}
                className="text-right bg-card border border-border rounded-md p-4 hover:shadow-md hover:border-accent/50 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-md bg-accent/15 text-accent flex items-center justify-center">
                    <Icon size={18} />
                  </div>
                  <h3 className="font-bold text-sm text-primary">{s.label}</h3>
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
