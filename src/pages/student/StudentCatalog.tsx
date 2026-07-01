import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, GraduationCap, LogOut, LogIn, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useKuliyat } from "@/hooks/use-kuliyat";

type CatalogCourse = {
  id: string;
  title: string;
  code: string | null;
  level: string | null;
  description: string;
  is_open_for_enrollment: boolean;
  teacher_user_id: string;
  kuliya_id: string | null;
};

type Enrollment = {
  id: string;
  course_id: string;
  status: "pending" | "approved" | "rejected";
};

export default function StudentCatalog() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { kuliyat } = useKuliyat();
  const [courses, setCourses] = useState<CatalogCourse[]>([]);
  const [teacherNames, setTeacherNames] = useState<Record<string, string>>({});
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [kuliyaFilter, setKuliyaFilter] = useState<string>("all");
  const [studentKuliyaId, setStudentKuliyaId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [coursesRes, enrollRes] = await Promise.all([
      supabase
        .from("courses")
        .select("id, title, code, level, description, is_open_for_enrollment, teacher_user_id, kuliya_id")
        .eq("is_open_for_enrollment", true)
        .order("created_at", { ascending: false }),
      user
        ? supabase
            .from("enrollments")
            .select("id, course_id, status")
            .eq("student_user_id", user.id)
        : Promise.resolve({ data: [] as Enrollment[], error: null }),
    ]);

    if (coursesRes.error) {
      toast({ title: "خطأ في تحميل المقررات", description: coursesRes.error.message, variant: "destructive" });
    } else {
      setCourses((coursesRes.data ?? []) as CatalogCourse[]);
      const teacherIds = Array.from(new Set((coursesRes.data ?? []).map((c) => c.teacher_user_id)));
      if (teacherIds.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", teacherIds);
        const map: Record<string, string> = {};
        (profs ?? []).forEach((p) => (map[p.user_id] = p.full_name));
        setTeacherNames(map);
      }
    }
    if (!enrollRes.error) {
      setEnrollments(((enrollRes.data ?? []) as Enrollment[]));
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const enrollmentFor = (courseId: string) =>
    enrollments.find((e) => e.course_id === courseId);

  const joinCourse = async (courseId: string) => {
    if (!user) {
      navigate("/portal");
      return;
    }
    setActingId(courseId);
    const { error } = await supabase.from("enrollments").insert({
      course_id: courseId,
      student_user_id: user.id,
      status: "approved",
    });
    setActingId(null);
    if (error) {
      toast({ title: "تعذر الانضمام", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "🎉 تم الانضمام للمقرر" });
    load();
  };

  const leaveCourse = async (enrollmentId: string) => {
    if (!confirm("مغادرة هذا المقرر؟")) return;
    setActingId(enrollmentId);
    const { error } = await supabase.from("enrollments").delete().eq("id", enrollmentId);
    setActingId(null);
    if (error) {
      toast({ title: "تعذرت المغادرة", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "تمت المغادرة" });
    load();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/portal");
  };

  const kuliyaName = (id: string | null) =>
    id ? kuliyat.find((k) => k.id === id)?.name ?? "غير محدد" : "غير محدد";

  const filtered = useMemo(
    () =>
      kuliyaFilter === "all"
        ? courses
        : kuliyaFilter === "none"
        ? courses.filter((c) => !c.kuliya_id)
        : courses.filter((c) => c.kuliya_id === kuliyaFilter),
    [courses, kuliyaFilter]
  );

  // Group by kuliya
  const grouped = useMemo(() => {
    const groups: Record<string, CatalogCourse[]> = {};
    filtered.forEach((c) => {
      const key = c.kuliya_id ?? "__none__";
      (groups[key] ||= []).push(c);
    });
    return groups;
  }, [filtered]);

  return (
    <div dir="rtl" className="min-h-screen bg-muted/30">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap size={20} className="text-accent" />
            <h1 className="text-base font-bold">
              <Link to="/portal/student" className="hover:underline">بوابة الطالب</Link>
              <span className="text-primary-foreground/70"> / دليل المقررات</span>
            </h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md bg-primary-foreground/10 hover:bg-primary-foreground/20"
          >
            <LogOut size={14} /> خروج
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/portal/student")}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mb-4"
        >
          <ArrowRight size={14} /> العودة إلى البوابة
        </button>

        <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-1">المقررات المتاحة</h2>
            <p className="text-sm text-muted-foreground">
              اختر المقرر واضغط "انضمام" — ستصبح مسجلاً فيه فوراً وتتمكن من حضور المحاضرات.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={kuliyaFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setKuliyaFilter("all")}
            >
              كل الكليات
            </Button>
            {kuliyat.map((k) => (
              <Button
                key={k.id}
                variant={kuliyaFilter === k.id ? "default" : "outline"}
                size="sm"
                onClick={() => setKuliyaFilter(k.id)}
              >
                {k.name}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <BookOpen className="mx-auto mb-3 opacity-40" size={40} />
              لا توجد مقررات مفتوحة للتسجيل حالياً.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([kid, items]) => (
              <section key={kid}>
                <h3 className="text-lg font-bold text-primary mb-3 border-b border-border pb-1">
                  {kid === "__none__" ? "مقررات عامة" : kuliyaName(kid)}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((c) => {
                    const enr = enrollmentFor(c.id);
                    return (
                      <Card key={c.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-bold text-primary text-sm">{c.title}</h3>
                            {enr?.status === "approved" && (
                              <Badge variant="secondary" className="text-[10px]">مسجَّل</Badge>
                            )}
                          </div>
                          <div className="flex gap-2 text-[11px] text-muted-foreground mb-2 flex-wrap">
                            {c.code && <span>{c.code}</span>}
                            {c.level && <span>• {c.level}</span>}
                          </div>
                          {teacherNames[c.teacher_user_id] && (
                            <p className="text-[11px] text-muted-foreground mb-2">
                              المُحاضر: {teacherNames[c.teacher_user_id]}
                            </p>
                          )}
                          {c.description && (
                            <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                              {c.description}
                            </p>
                          )}

                          {!user ? (
                            <Button size="sm" className="w-full" onClick={() => navigate("/portal")}>
                              تسجيل الدخول للانضمام
                            </Button>
                          ) : !enr ? (
                            <Button
                              size="sm"
                              className="w-full gap-1"
                              disabled={actingId === c.id}
                              onClick={() => joinCourse(c.id)}
                            >
                              <LogIn size={13} />
                              {actingId === c.id ? "جارٍ..." : "انضمام للمقرر"}
                            </Button>
                          ) : enr.status === "approved" ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="flex-1"
                                onClick={() => navigate(`/portal/student/courses`)}
                              >
                                دخول المقرر
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actingId === enr.id}
                                onClick={() => leaveCourse(enr.id)}
                                className="text-destructive hover:text-destructive"
                                aria-label="مغادرة"
                              >
                                <X size={13} />
                              </Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline" className="w-full" disabled>
                              {enr.status === "pending" ? "قيد المراجعة" : "تم الرفض"}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
