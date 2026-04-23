import { useNavigate } from "react-router-dom";
import { BookOpen, LogOut, Bell, User, Users, ClipboardList, Award, FolderKanban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const sections = [
  { label: "مقرراتي", icon: BookOpen, description: "المقررات التي تُدرّسها هذا الفصل." },
  { label: "الطلاب المسجلون", icon: Users, description: "قائمة الطلاب في كل مقرر وإدارة طلبات التسجيل." },
  { label: "المحاضرات والمواد", icon: FolderKanban, description: "رفع المحاضرات المسجلة والمواد التعليمية." },
  { label: "الاختبارات والواجبات", icon: ClipboardList, description: "إنشاء الاختبارات وتسليم الواجبات." },
  { label: "الدرجات", icon: Award, description: "إدخال درجات الطلاب ونشر النتائج." },
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
            البوابة قيد الإعداد — سيتم تفعيل الأقسام التالية قريباً.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-card border border-border rounded-md p-4 hover:shadow-md transition-shadow"
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
              </div>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-8">
          سيتم تفعيل البيانات الحقيقية قريباً.
        </p>
      </main>
    </div>
  );
}
