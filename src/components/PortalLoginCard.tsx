import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, User, KeyRound, GraduationCap, BookOpen } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Role = "student" | "instructor";

export default function PortalLoginCard() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      toast({
        title: "حقول ناقصة",
        description: "يرجى إدخال البريد وكلمة المرور.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier.trim(),
        password,
      });
      if (error || !data.user) {
        throw error ?? new Error("login failed");
      }
      // Check role
      const requiredRole = role === "student" ? "student" : "teacher";
      const { data: hasRole, error: roleError } = await supabase.rpc("has_role", {
        _user_id: data.user.id,
        _role: requiredRole,
      });
      if (roleError) throw roleError;
      if (!hasRole) {
        await supabase.auth.signOut();
        toast({
          title: "صلاحية غير مناسبة",
          description:
            role === "student"
              ? "هذا الحساب ليس حساب طالب."
              : "هذا الحساب ليس حساب أستاذ.",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "تم تسجيل الدخول بنجاح" });
      navigate(role === "student" ? "/portal/student" : "/portal/teacher");
    } catch (err: any) {
      toast({
        title: "تعذّر تسجيل الدخول",
        description: err?.message ?? "تأكد من البريد وكلمة المرور.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const roleTabBase =
    "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold transition-colors";

  return (
    <div className="bg-card border border-border rounded-md shadow-sm overflow-hidden">
      <div className="bg-primary text-primary-foreground px-4 py-2.5 flex items-center gap-2">
        <LogIn size={16} className="text-accent" />
        <h3 className="text-sm font-bold">تسجيل الدخول إلى البوابة</h3>
      </div>

      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setRole("student")}
          className={`${roleTabBase} ${
            role === "student"
              ? "bg-accent/15 text-primary border-b-2 border-accent"
              : "bg-muted/40 text-foreground/60 hover:text-foreground border-b-2 border-transparent"
          }`}
        >
          <GraduationCap size={14} />
          بوابة الطالب
        </button>
        <button
          type="button"
          onClick={() => setRole("instructor")}
          className={`${roleTabBase} ${
            role === "instructor"
              ? "bg-accent/15 text-primary border-b-2 border-accent"
              : "bg-muted/40 text-foreground/60 hover:text-foreground border-b-2 border-transparent"
          }`}
        >
          <BookOpen size={14} />
          بوابة الأستاذ
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-3 space-y-2.5">
        <div className="relative">
          <User
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="email"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="البريد الإلكتروني"
            autoComplete="username"
            className="w-full h-9 pr-8 pl-2.5 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="relative">
          <KeyRound
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            autoComplete="current-password"
            className="w-full h-9 pr-8 pl-2.5 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-9 rounded-md bg-accent text-accent-foreground text-xs font-bold hover:brightness-110 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "جارٍ الدخول..." : "دخول"}
        </button>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
          <span className="opacity-70">المسؤول يصدر الحسابات</span>
        </div>
      </form>
    </div>
  );
}
