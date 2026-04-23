import { ReactNode } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, LogOut, Bell, User, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function TeacherLayout({
  title,
  showBack = true,
  children,
}: {
  title?: string;
  showBack?: boolean;
  children: ReactNode;
}) {
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
            <h1 className="text-base font-bold">
              <Link to="/portal/teacher" className="hover:underline">
                بوابة أعضاء الهيئة التدريسية
              </Link>
              {title && <span className="text-primary-foreground/70"> / {title}</span>}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="p-1.5 rounded-md hover:bg-primary-foreground/10" aria-label="الإشعارات">
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
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-primary-foreground/10 hover:bg-primary-foreground/20"
            >
              <LogOut size={14} />
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showBack && title && (
          <button
            onClick={() => navigate("/portal/teacher")}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mb-4"
          >
            <ArrowRight size={14} />
            العودة إلى البوابة
          </button>
        )}
        {children}
      </main>
    </div>
  );
}
