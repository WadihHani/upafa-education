import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TeacherLayout from "./TeacherLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Award, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTeacherCourses } from "@/hooks/use-teacher-courses";
import { toast } from "@/hooks/use-toast";

type GradeSection =
  | "recorded_lectures"
  | "attendance"
  | "quizzes"
  | "midterm"
  | "activities"
  | "projects"
  | "final"
  | "overall";

const SECTION_LABEL: Record<GradeSection, string> = {
  recorded_lectures: "المحاضرات المسجلة",
  attendance: "الحضور",
  quizzes: "الفحوص",
  midterm: "النصفي",
  activities: "الأنشطة",
  projects: "المشاريع",
  final: "النهائي",
  overall: "المجموع العام",
};

type EnrollmentRow = {
  id: string;
  course_id: string;
  student_user_id: string;
  status: string;
};

type GradeRow = {
  id: string;
  enrollment_id: string;
  section: GradeSection;
  title: string;
  score: number | null;
  max_score: number | null;
  graded_at: string;
};

type ProfileRow = { user_id: string; full_name: string; email: string };

export default function TeacherGrades() {
  const { courses, loading: coursesLoading } = useTeacherCourses();
  const [params, setParams] = useSearchParams();
  const courseFilter = params.get("course") ?? (courses[0]?.id ?? "");
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({});
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    enrollment_id: "",
    section: "midterm" as GradeSection,
    title: "",
    score: "",
    max_score: "100",
  });

  const courseIds = useMemo(() => courses.map((c) => c.id), [courses]);

  const load = async () => {
    if (courseIds.length === 0) {
      setEnrollments([]);
      setGrades([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: enr, error: enrErr } = await supabase
      .from("enrollments")
      .select("id, course_id, student_user_id, status")
      .in("course_id", courseIds)
      .eq("status", "approved");
    if (enrErr) {
      toast({ title: "خطأ", description: enrErr.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    setEnrollments(enr ?? []);
    const enrIds = (enr ?? []).map((e) => e.id);
    const studentIds = Array.from(new Set((enr ?? []).map((e) => e.student_user_id)));

    const [{ data: g }, { data: p }] = await Promise.all([
      enrIds.length
        ? supabase
            .from("grades")
            .select("id, enrollment_id, section, title, score, max_score, graded_at")
            .in("enrollment_id", enrIds)
            .order("graded_at", { ascending: false })
        : Promise.resolve({ data: [] as GradeRow[] }),
      studentIds.length
        ? supabase.from("profiles").select("user_id, full_name, email").in("user_id", studentIds)
        : Promise.resolve({ data: [] as ProfileRow[] }),
    ]);
    setGrades((g ?? []) as GradeRow[]);
    const map: Record<string, ProfileRow> = {};
    (p ?? []).forEach((row) => (map[row.user_id] = row));
    setProfiles(map);
    setLoading(false);
  };

  useEffect(() => {
    if (!coursesLoading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coursesLoading, courseIds.join(",")]);

  useEffect(() => {
    if (!params.get("course") && courses[0]) {
      const next = new URLSearchParams(params);
      next.set("course", courses[0].id);
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses]);

  const courseEnrollments = enrollments.filter((e) => e.course_id === courseFilter);

  const openAdd = () => {
    setForm({
      enrollment_id: courseEnrollments[0]?.id ?? "",
      section: "midterm",
      title: "",
      score: "",
      max_score: "100",
    });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.enrollment_id) return;
    setSubmitting(true);
    const { error } = await supabase.from("grades").insert({
      enrollment_id: form.enrollment_id,
      section: form.section,
      title: form.title,
      score: form.score ? Number(form.score) : null,
      max_score: form.max_score ? Number(form.max_score) : null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "تعذر الحفظ", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "تم حفظ الدرجة" });
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف هذه الدرجة؟")) return;
    const { error } = await supabase.from("grades").delete().eq("id", id);
    if (error) {
      toast({ title: "تعذر الحذف", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "تم الحذف" });
    load();
  };

  const studentName = (enrollmentId: string) => {
    const e = enrollments.find((x) => x.id === enrollmentId);
    if (!e) return "—";
    return profiles[e.student_user_id]?.full_name || "طالب";
  };

  const courseGrades = grades.filter((g) =>
    courseEnrollments.some((e) => e.id === g.enrollment_id),
  );

  return (
    <TeacherLayout title="الدرجات">
      <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">الدرجات</h2>
          <p className="text-sm text-muted-foreground">
            إدخال درجات الطلاب ونشر النتائج.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-56">
            <Select
              value={courseFilter}
              onValueChange={(v) => {
                const next = new URLSearchParams(params);
                next.set("course", v);
                setParams(next);
              }}
            >
              <SelectTrigger><SelectValue placeholder="اختر المقرر" /></SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={openAdd}
            disabled={courseEnrollments.length === 0}
            className="gap-2"
          >
            <Plus size={16} /> إضافة درجة
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : courseGrades.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Award className="mx-auto mb-3 opacity-40" size={40} />
            لم يتم إدخال درجات بعد لهذا المقرر.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {courseGrades.map((g) => (
            <Card key={g.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-bold text-sm text-primary">
                    {studentName(g.enrollment_id)}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {SECTION_LABEL[g.section]} {g.title ? `— ${g.title}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-bold text-primary">
                    {g.score ?? "—"} / {g.max_score ?? "—"}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => remove(g.id)}
                    className="gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 size={14} /> حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة درجة</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">الطالب</label>
              <Select
                value={form.enrollment_id}
                onValueChange={(v) => setForm({ ...form, enrollment_id: v })}
              >
                <SelectTrigger><SelectValue placeholder="اختر الطالب" /></SelectTrigger>
                <SelectContent>
                  {courseEnrollments.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {profiles[e.student_user_id]?.full_name || "طالب"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">القسم</label>
              <Select
                value={form.section}
                onValueChange={(v) => setForm({ ...form, section: v as GradeSection })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(SECTION_LABEL) as GradeSection[]).map((s) => (
                    <SelectItem key={s} value={s}>{SECTION_LABEL[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">العنوان (اختياري)</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="مثلاً: امتحان الوحدة الأولى"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">الدرجة</label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.score}
                  onChange={(e) => setForm({ ...form, score: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">الحد الأقصى</label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.max_score}
                  onChange={(e) => setForm({ ...form, max_score: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={submitting || !form.enrollment_id}>
                {submitting ? "جارٍ الحفظ..." : "حفظ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </TeacherLayout>
  );
}
