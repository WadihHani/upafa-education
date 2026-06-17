import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, LogOut, Bell, User, Users, ClipboardList, Award, FolderKanban, ArrowLeft, Check, X, CalendarCheck, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteContent } from "@/hooks/use-site-content";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  { label: "مقرراتي", icon: BookOpen, description: "المقررات التي تُدرّسها هذا الفصل.", href: "/portal/teacher/courses" },
  { label: "الطلاب المسجلون", icon: Users, description: "قائمة الطلاب في كل مقرر وإدارة طلبات التسجيل.", href: "/portal/teacher/students" },
  { label: "الحضور والغياب", icon: CalendarCheck, description: "تسجيل حضور الطلاب لكل جلسة.", href: "/portal/teacher/attendance" },
  { label: "المحاضرات والمواد", icon: FolderKanban, description: "رفع المحاضرات المسجلة والمواد التعليمية.", href: "/portal/teacher/materials" },
  { label: "الاختبارات والواجبات", icon: ClipboardList, description: "إنشاء الاختبارات وتقييم تسليمات الطلاب.", href: "/portal/teacher/assessments" },
  { label: "الدرجات", icon: Award, description: "إدخال درجات الطلاب ونشر النتائج.", href: "/portal/teacher/grades" },
];

type PendingRequest = {
  id: string;
  course_id: string;
  student_user_id: string;
  requested_at: string;
  course_title: string;
  student_name: string;
  student_email: string;
};

export default function TeacherPortal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { get, getTitle, getLink } = useSiteContent();
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const pendingCount = pendingRequests.length;
  const meetingTitle = getTitle("teacher_meeting_room", "قاعة الاجتماعات");
  const meetingNote = get("teacher_meeting_room", "");
  const meetingLink = getLink("teacher_meeting_room", "");

  const fetchPending = async (uid: string) => {
    const { data: cs } = await supabase
      .from("courses")
      .select("id, title")
      .eq("teacher_user_id", uid);
    const courseMap: Record<string, string> = {};
    (cs ?? []).forEach((c) => (courseMap[c.id] = c.title));
    const ids = Object.keys(courseMap);
    if (ids.length === 0) {
      setPendingRequests([]);
      return;
    }
    const { data: enr } = await supabase
      .from("enrollments")
      .select("id, course_id, student_user_id, requested_at")
      .in("course_id", ids)
      .eq("status", "pending")
      .order("requested_at", { ascending: false });
    const studentIds = Array.from(new Set((enr ?? []).map((e) => e.student_user_id)));
    const profileMap: Record<string, { full_name: string; email: string }> = {};
    if (studentIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", studentIds);
      (profs ?? []).forEach((p) => (profileMap[p.user_id] = { full_name: p.full_name, email: p.email }));
    }
    setPendingRequests(
      (enr ?? []).map((e) => ({
        id: e.id,
        course_id: e.course_id,
        student_user_id: e.student_user_id,
        requested_at: e.requested_at,
        course_title: courseMap[e.course_id] ?? "—",
        student_name: profileMap[e.student_user_id]?.full_name || "طالب",
        student_email: profileMap[e.student_user_id]?.email || "",
      }))
    );
  };

  useEffect(() => {
    if (!user) return;
    fetchPending(user.id);
    const channel = supabase
      .channel(`teacher-portal-enrollments-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "enrollments" },
        () => fetchPending(user.id)
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleDecision = async (id: string, status: "approved" | "rejected") => {
    setSavingId(id);
    const { error } = await supabase
      .from("enrollments")
      .update({ status, decided_at: new Date().toISOString() })
      .eq("id", id);
    setSavingId(null);
    if (error) {
      toast({ title: "تعذر التحديث", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: status === "approved" ? "✅ تم قبول الطالب" : "❌ تم رفض الطلب" });
    if (user) fetchPending(user.id);
  };

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
          <Card className="mb-6 border-accent/40 bg-accent/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                    <Bell size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-primary">
                      طلبات انضمام جديدة ({pendingCount})
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      اقبل أو ارفض الطلبات مباشرة من هنا.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/portal/teacher/students")}
                  className="gap-1 text-xs"
                >
                  عرض الكل <ArrowLeft size={12} />
                </Button>
              </div>

              <div className="grid gap-2">
                {pendingRequests.slice(0, 5).map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between gap-3 bg-background border border-border rounded-md p-3 flex-wrap"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-primary truncate">
                        {req.student_name}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate" dir="ltr">
                        {req.student_email}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        المقرر: <span className="font-medium">{req.course_title}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        disabled={savingId === req.id}
                        onClick={() => handleDecision(req.id, "approved")}
                        className="gap-1 h-8 text-xs"
                      >
                        <Check size={13} /> قبول
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={savingId === req.id}
                        onClick={() => handleDecision(req.id, "rejected")}
                        className="gap-1 h-8 text-xs text-destructive hover:text-destructive"
                      >
                        <X size={13} /> رفض
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingCount > 5 && (
                  <button
                    type="button"
                    onClick={() => navigate("/portal/teacher/students")}
                    className="text-xs text-primary hover:underline text-center py-1"
                  >
                    + {pendingCount - 5} طلبات إضافية — عرض الكل
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
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
