import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  LogOut,
  PlayCircle,
  CalendarCheck,
  ClipboardList,
  FileText,
  Layers,
  FolderKanban,
  Award,
  BookOpen,
  Bell,
  User,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SectionKey =
  | "lectures"
  | "attendance"
  | "assessments"
  | "grades"
  | "overview";

const sections = [
  { key: "overview" as SectionKey, label: "نظرة عامة", icon: BookOpen, description: "ملخص حالتك الدراسية الحالية." },
  { key: "lectures" as SectionKey, label: "المحاضرات والمواد", icon: PlayCircle, description: "المحاضرات والمواد التعليمية لمقرراتك." },
  { key: "attendance" as SectionKey, label: "الحضور", icon: CalendarCheck, description: "سجل الحضور والغياب الخاص بك." },
  { key: "assessments" as SectionKey, label: "الاختبارات والواجبات", icon: ClipboardList, description: "اختباراتك وواجباتك القادمة وتسليماتك." },
  { key: "grades" as SectionKey, label: "الدرجات والنتائج", icon: Award, description: "كشف الدرجات لكل مقرر." },
];

type Course = { id: string; title: string; code: string | null };
type Enrollment = { id: string; course_id: string };
type Material = {
  id: string;
  course_id: string;
  title: string;
  description: string;
  external_url: string | null;
};
type Attendance = {
  id: string;
  course_id: string;
  session_date: string;
  status: "present" | "absent" | "late" | "excused";
};
type Assessment = {
  id: string;
  course_id: string;
  title: string;
  description: string;
  kind: "quiz" | "assignment" | "project" | "exam";
  max_score: number;
  due_at: string | null;
  resource_url: string | null;
};
type Submission = {
  id: string;
  assessment_id: string;
  content: string;
  link_url: string | null;
  score: number | null;
  feedback: string;
  status: "submitted" | "graded" | "late";
  submitted_at: string;
};
type Grade = {
  id: string;
  enrollment_id: string;
  section: string;
  title: string;
  score: number | null;
  max_score: number | null;
};

const ATT_LABEL: Record<Attendance["status"], string> = {
  present: "حاضر",
  absent: "غائب",
  late: "متأخر",
  excused: "بعذر",
};
const ATT_VARIANT: Record<
  Attendance["status"],
  "default" | "secondary" | "outline" | "destructive"
> = {
  present: "secondary",
  absent: "destructive",
  late: "default",
  excused: "outline",
};
const KIND_LABEL: Record<Assessment["kind"], string> = {
  quiz: "اختبار قصير",
  assignment: "واجب",
  project: "مشروع",
  exam: "امتحان",
};
const SECTION_LABEL: Record<string, string> = {
  recorded_lectures: "المحاضرات المسجلة",
  attendance: "الحضور",
  quizzes: "الفحوص",
  midterm: "النصفي",
  activities: "الأنشطة",
  projects: "المشاريع",
  final: "النهائي",
  overall: "المجموع",
};

export default function StudentPortal() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [active, setActive] = useState<SectionKey>("overview");

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  const [submitOpen, setSubmitOpen] = useState<Assessment | null>(null);
  const [submitForm, setSubmitForm] = useState({ content: "", link_url: "" });
  const [savingSub, setSavingSub] = useState(false);

  const ActiveIcon = sections.find((s) => s.key === active)?.icon ?? BookOpen;
  const activeMeta = sections.find((s) => s.key === active)!;

  const load = async () => {
    if (!user) return;
    const { data: enr } = await supabase
      .from("enrollments")
      .select("id, course_id")
      .eq("student_user_id", user.id)
      .eq("status", "approved");
    const enrList = enr ?? [];
    setEnrollments(enrList);
    const courseIds = enrList.map((e) => e.course_id);

    if (courseIds.length === 0) {
      setCourses([]); setMaterials([]); setAttendance([]); setAssessments([]); setSubmissions([]); setGrades([]);
      return;
    }

    const enrIds = enrList.map((e) => e.id);

    const [
      { data: cs },
      { data: mats },
      { data: att },
      { data: ass },
      { data: subs },
      { data: gr },
    ] = await Promise.all([
      supabase.from("courses").select("id, title, code").in("id", courseIds),
      supabase
        .from("lecture_materials")
        .select("id, course_id, title, description, external_url")
        .in("course_id", courseIds)
        .order("sort_order", { ascending: true }),
      supabase
        .from("attendance_records")
        .select("id, course_id, session_date, status")
        .eq("student_user_id", user.id)
        .order("session_date", { ascending: false })
        .limit(200),
      supabase
        .from("assessments")
        .select("id, course_id, title, description, kind, max_score, due_at, resource_url")
        .in("course_id", courseIds)
        .eq("is_published", true)
        .order("due_at", { ascending: true }),
      supabase
        .from("assessment_submissions")
        .select("id, assessment_id, content, link_url, score, feedback, status, submitted_at")
        .eq("student_user_id", user.id),
      supabase
        .from("grades")
        .select("id, enrollment_id, section, title, score, max_score")
        .in("enrollment_id", enrIds),
    ]);

    setCourses((cs ?? []) as Course[]);
    setMaterials((mats ?? []) as Material[]);
    setAttendance((att ?? []) as Attendance[]);
    setAssessments((ass ?? []) as Assessment[]);
    setSubmissions((subs ?? []) as Submission[]);
    setGrades((gr ?? []) as Grade[]);
  };

  useEffect(() => {
    load();
    if (!user) return;
    const ch = supabase
      .channel(`student-portal-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_records", filter: `student_user_id=eq.${user.id}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "assessment_submissions", filter: `student_user_id=eq.${user.id}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "assessments" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "lecture_materials" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "grades" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const courseTitle = (id: string) => courses.find((c) => c.id === id)?.title ?? "—";
  const submissionFor = (aid: string) => submissions.find((s) => s.assessment_id === aid);

  const openSubmitDialog = (a: Assessment) => {
    const existing = submissionFor(a.id);
    setSubmitForm({
      content: existing?.content ?? "",
      link_url: existing?.link_url ?? "",
    });
    setSubmitOpen(a);
  };

  const submitWork = async () => {
    if (!submitOpen || !user) return;
    setSavingSub(true);
    const existing = submissionFor(submitOpen.id);
    const isLate = submitOpen.due_at && new Date(submitOpen.due_at) < new Date();
    const payload = {
      assessment_id: submitOpen.id,
      student_user_id: user.id,
      content: submitForm.content.trim(),
      link_url: submitForm.link_url.trim() || null,
      status: (isLate ? "late" : "submitted") as "submitted" | "late",
    };
    const { error } = existing
      ? await supabase
          .from("assessment_submissions")
          .update(payload)
          .eq("id", existing.id)
      : await supabase.from("assessment_submissions").insert(payload);
    setSavingSub(false);
    if (error) {
      toast({ title: "تعذر التسليم", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "✅ تم تسليم عملك" });
    setSubmitOpen(null);
    load();
  };

  const studentName = profile?.full_name || "الطالب";

  // Stats
  const stats = useMemo(() => {
    const totalSessions = attendance.length;
    const presentCount = attendance.filter((a) => a.status === "present" || a.status === "late").length;
    const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : null;
    const upcoming = assessments.filter(
      (a) => a.due_at && new Date(a.due_at) > new Date() && !submissionFor(a.id)
    ).length;
    return { totalSessions, attendanceRate, upcoming };
  }, [attendance, assessments, submissions]);

  return (
    <div dir="rtl" className="min-h-screen bg-muted/30">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap size={20} className="text-accent" />
            <h1 className="text-base font-bold">بوابة الطالب</h1>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="relative p-1.5 rounded-md hover:bg-primary-foreground/10 transition-colors" aria-label="الإشعارات">
              <Bell size={16} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <div className="w-7 h-7 rounded-full bg-primary-foreground/15 flex items-center justify-center">
                <User size={14} />
              </div>
              <span className="font-medium">{studentName}</span>
            </div>
            <button
              type="button"
              onClick={async () => { await supabase.auth.signOut(); navigate("/portal"); }}
              className="flex items-center gap-1.5 text-xs font-bold bg-accent text-accent-foreground px-3 py-1.5 rounded-md hover:brightness-110 transition-all"
            >
              <LogOut size={14} />
              خروج
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-5 bg-card border border-border rounded-md p-4 flex items-center justify-between gap-4 flex-wrap shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-primary mb-0.5">المقررات المتاحة للتسجيل</h2>
            <p className="text-xs text-muted-foreground">تصفّح المقررات المفتوحة وأرسل طلب الانضمام إلى المحاضر.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/portal/student/catalog")}
            className="text-xs font-bold bg-accent text-accent-foreground px-3 py-2 rounded-md hover:brightness-110 transition-all"
          >
            تصفح المقررات
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
          <aside className="bg-card border border-border rounded-md overflow-hidden h-fit shadow-sm">
            <div className="bg-muted/40 px-4 py-3 border-b border-border">
              <p className="text-xs text-muted-foreground">معلومات الطالب</p>
              <p className="text-sm font-bold mt-0.5">{studentName}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                المقررات النشطة: <span className="font-medium text-foreground">{enrollments.length}</span>
              </p>
            </div>
            <nav className="p-2">
              {sections.map((s) => {
                const Icon = s.icon;
                const isActive = active === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setActive(s.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors text-right ${
                      isActive
                        ? "bg-accent/15 text-primary border-r-2 border-accent"
                        : "text-foreground/70 hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon size={15} className={isActive ? "text-accent" : ""} />
                    <span className="flex-1">{s.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="bg-card border border-border rounded-md shadow-sm">
            <div className="border-b border-border px-5 py-3 flex items-center gap-2">
              <ActiveIcon size={18} className="text-accent" />
              <h2 className="text-sm font-bold">{activeMeta.label}</h2>
            </div>

            <div className="p-5">
              {active === "overview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <InfoTile label="عدد المقررات" value={enrollments.length.toString()} />
                    <InfoTile label="نسبة الحضور" value={stats.attendanceRate !== null ? `${stats.attendanceRate}%` : "—"} />
                    <InfoTile label="مهام قادمة" value={stats.upcoming.toString()} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground mb-2">مقرراتك</h3>
                    {courses.length === 0 ? (
                      <p className="text-xs text-muted-foreground bg-muted/20 border border-border rounded-md p-4 text-center">
                        لم تنضم إلى أي مقرر بعد. اضغط "تصفح المقررات" أعلاه.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {courses.map((c) => (
                          <div key={c.id} className="border border-border rounded-md p-3 bg-muted/10">
                            <div className="text-sm font-bold text-primary">{c.title}</div>
                            {c.code && <div className="text-[11px] text-muted-foreground mt-0.5">{c.code}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {active === "lectures" && (
                materials.length === 0 ? (
                  <Empty msg="لم يتم رفع أي مواد بعد." />
                ) : (
                  <div className="grid gap-2">
                    {materials.map((m) => (
                      <div key={m.id} className="border border-border rounded-md p-3 flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-primary">{m.title}</div>
                          <div className="text-[11px] text-muted-foreground">{courseTitle(m.course_id)}</div>
                          {m.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{m.description}</p>}
                        </div>
                        {m.external_url && (
                          <a href={m.external_url} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline shrink-0">
                            فتح المادة ↗
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}

              {active === "attendance" && (
                attendance.length === 0 ? (
                  <Empty msg="لا يوجد سجل حضور بعد." />
                ) : (
                  <div className="grid gap-2">
                    {attendance.map((a) => (
                      <div key={a.id} className="border border-border rounded-md p-3 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-primary">{courseTitle(a.course_id)}</div>
                          <div className="text-[10px] text-muted-foreground" dir="ltr">{a.session_date}</div>
                        </div>
                        <Badge variant={ATT_VARIANT[a.status]}>{ATT_LABEL[a.status]}</Badge>
                      </div>
                    ))}
                  </div>
                )
              )}

              {active === "assessments" && (
                assessments.length === 0 ? (
                  <Empty msg="لا توجد اختبارات أو واجبات حالياً." />
                ) : (
                  <div className="grid gap-2">
                    {assessments.map((a) => {
                      const sub = submissionFor(a.id);
                      const overdue = a.due_at && new Date(a.due_at) < new Date() && !sub;
                      return (
                        <div key={a.id} className="border border-border rounded-md p-3">
                          <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="font-bold text-sm text-primary">{a.title}</div>
                                <Badge variant="secondary" className="text-[10px]">{KIND_LABEL[a.kind]}</Badge>
                                {sub?.status === "graded" && <Badge variant="outline" className="text-[10px]">مُصحَّح</Badge>}
                                {sub && sub.status !== "graded" && <Badge className="text-[10px]">تم التسليم</Badge>}
                                {overdue && <Badge variant="destructive" className="text-[10px]">متأخر</Badge>}
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-0.5">{courseTitle(a.course_id)}</div>
                              {a.due_at && (
                                <div className="text-[11px] text-muted-foreground" dir="ltr">
                                  ⏰ {new Date(a.due_at).toLocaleString("ar-SY")}
                                </div>
                              )}
                            </div>
                            <Button size="sm" onClick={() => openSubmitDialog(a)} className="text-xs h-8">
                              {sub ? "تعديل التسليم" : "تسليم"}
                            </Button>
                          </div>
                          {a.description && <p className="text-xs text-muted-foreground mt-1">{a.description}</p>}
                          {a.resource_url && (
                            <a href={a.resource_url} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline" dir="ltr">
                              📎 {a.resource_url}
                            </a>
                          )}
                          {sub?.status === "graded" && (
                            <div className="mt-2 bg-muted/30 border border-border rounded p-2 text-xs">
                              <div className="font-bold text-primary">الدرجة: {sub.score} / {a.max_score}</div>
                              {sub.feedback && <div className="text-muted-foreground mt-1">📝 {sub.feedback}</div>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {active === "grades" && (
                grades.length === 0 ? (
                  <Empty msg="لم يتم رصد درجات بعد." />
                ) : (
                  <div className="grid gap-2">
                    {grades.map((g) => {
                      const enr = enrollments.find((e) => e.id === g.enrollment_id);
                      return (
                        <div key={g.id} className="border border-border rounded-md p-3 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-bold text-primary">{enr ? courseTitle(enr.course_id) : "—"}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {SECTION_LABEL[g.section] || g.section} {g.title ? `— ${g.title}` : ""}
                            </div>
                          </div>
                          <div className="font-bold text-primary">
                            {g.score ?? "—"} / {g.max_score ?? "—"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          </main>
        </div>
      </div>

      <Dialog open={!!submitOpen} onOpenChange={(o) => !o && setSubmitOpen(null)}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>{submitOpen?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">إجابتك / محتوى التسليم</label>
              <Textarea
                rows={5}
                value={submitForm.content}
                onChange={(e) => setSubmitForm({ ...submitForm, content: e.target.value })}
                placeholder="اكتب إجابتك أو ملاحظاتك هنا..."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">رابط مرفق (اختياري)</label>
              <Input
                dir="ltr"
                placeholder="https://..."
                value={submitForm.link_url}
                onChange={(e) => setSubmitForm({ ...submitForm, link_url: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSubmitOpen(null)}>إلغاء</Button>
            <Button onClick={submitWork} disabled={savingSub || (!submitForm.content.trim() && !submitForm.link_url.trim())}>
              {savingSub ? "..." : "تسليم"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border rounded-md p-3 bg-muted/20">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-bold mt-1">{value}</p>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-sm text-muted-foreground">{msg}</p>
    </div>
  );
}
