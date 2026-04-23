import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TeacherLayout from "./TeacherLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { ClipboardList, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTeacherCourses } from "@/hooks/use-teacher-courses";
import { toast } from "@/hooks/use-toast";

type Kind = "quiz" | "assignment" | "project" | "exam";

const KIND_LABEL: Record<Kind, string> = {
  quiz: "اختبار قصير",
  assignment: "واجب",
  project: "مشروع",
  exam: "امتحان",
};

type Assessment = {
  id: string;
  course_id: string;
  title: string;
  description: string;
  kind: Kind;
  max_score: number;
  due_at: string | null;
  resource_url: string | null;
  is_published: boolean;
};

type Submission = {
  id: string;
  assessment_id: string;
  student_user_id: string;
  content: string;
  link_url: string | null;
  score: number | null;
  feedback: string;
  status: "submitted" | "graded" | "late";
  submitted_at: string;
};

type ProfileRow = { user_id: string; full_name: string };

export default function TeacherAssessments() {
  const { user } = useAuth();
  const { courses, loading: coursesLoading } = useTeacherCourses();
  const [params, setParams] = useSearchParams();
  const courseFilter = params.get("course") ?? "";
  const [items, setItems] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({});
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [gradeDraft, setGradeDraft] = useState<
    Record<string, { score: string; feedback: string }>
  >({});
  const [savingSubId, setSavingSubId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    kind: "assignment" as Kind,
    max_score: "100",
    due_at: "",
    resource_url: "",
    is_published: true,
  });

  useEffect(() => {
    if (!coursesLoading && !courseFilter && courses[0]) {
      const next = new URLSearchParams(params);
      next.set("course", courses[0].id);
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coursesLoading, courses]);

  const load = async () => {
    if (!courseFilter) return;
    setLoading(true);
    const { data: a } = await supabase
      .from("assessments")
      .select("*")
      .eq("course_id", courseFilter)
      .order("created_at", { ascending: false });
    const list = (a ?? []) as Assessment[];
    setItems(list);

    const ids = list.map((x) => x.id);
    const { data: subs } = ids.length
      ? await supabase
          .from("assessment_submissions")
          .select(
            "id, assessment_id, student_user_id, content, link_url, score, feedback, status, submitted_at"
          )
          .in("assessment_id", ids)
          .order("submitted_at", { ascending: false })
      : { data: [] as Submission[] };
    setSubmissions((subs ?? []) as Submission[]);

    const studentIds = Array.from(new Set((subs ?? []).map((s) => s.student_user_id)));
    if (studentIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", studentIds);
      const map: Record<string, ProfileRow> = {};
      (profs ?? []).forEach((p) => (map[p.user_id] = p as ProfileRow));
      setProfiles(map);
    } else {
      setProfiles({});
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseFilter]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseFilter || !user || !form.title.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("assessments").insert({
      course_id: courseFilter,
      title: form.title.trim(),
      description: form.description.trim(),
      kind: form.kind,
      max_score: Number(form.max_score) || 100,
      due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
      resource_url: form.resource_url.trim() || null,
      is_published: form.is_published,
      created_by: user.id,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "تعذر الإنشاء", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "✅ تم إنشاء الاختبار/الواجب" });
    setOpenCreate(false);
    setForm({
      title: "",
      description: "",
      kind: "assignment",
      max_score: "100",
      due_at: "",
      resource_url: "",
      is_published: true,
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف هذا العنصر مع جميع تسليماته؟")) return;
    const { error } = await supabase.from("assessments").delete().eq("id", id);
    if (error) {
      toast({ title: "تعذر الحذف", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "تم الحذف" });
    load();
  };

  const submissionsFor = (assessmentId: string) =>
    submissions.filter((s) => s.assessment_id === assessmentId);

  const saveGrade = async (sub: Submission) => {
    const draft = gradeDraft[sub.id] ?? {
      score: sub.score?.toString() ?? "",
      feedback: sub.feedback,
    };
    if (!draft.score) {
      toast({ title: "أدخل الدرجة أولاً", variant: "destructive" });
      return;
    }
    setSavingSubId(sub.id);
    const { error } = await supabase
      .from("assessment_submissions")
      .update({
        score: Number(draft.score),
        feedback: draft.feedback,
        status: "graded",
        graded_at: new Date().toISOString(),
        graded_by: user?.id,
      })
      .eq("id", sub.id);
    setSavingSubId(null);
    if (error) {
      toast({ title: "تعذر الحفظ", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "✅ تم تسجيل الدرجة" });
    load();
  };

  const studentName = (uid: string) => profiles[uid]?.full_name || "طالب";

  return (
    <TeacherLayout title="الاختبارات والواجبات">
      <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">الاختبارات والواجبات</h2>
          <p className="text-sm text-muted-foreground">
            أنشئ الاختبارات والواجبات، وشاهد تسليمات الطلاب وقم بتقييمها.
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
              <SelectTrigger>
                <SelectValue placeholder="اختر المقرر" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => setOpenCreate(true)}
            disabled={!courseFilter}
            className="gap-2"
          >
            <Plus size={16} /> إنشاء جديد
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ClipboardList className="mx-auto mb-3 opacity-40" size={40} />
            لا توجد اختبارات أو واجبات لهذا المقرر بعد.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((it) => {
            const subs = submissionsFor(it.id);
            const isOpen = expanded === it.id;
            return (
              <Card key={it.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-sm text-primary">{it.title}</h3>
                        <Badge variant="secondary" className="text-[10px]">
                          {KIND_LABEL[it.kind]}
                        </Badge>
                        {!it.is_published && (
                          <Badge variant="outline" className="text-[10px]">
                            مسودة
                          </Badge>
                        )}
                      </div>
                      {it.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                          {it.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span>الدرجة الكاملة: {it.max_score}</span>
                        {it.due_at && (
                          <span dir="ltr">
                            ⏰ {new Date(it.due_at).toLocaleDateString("ar-SY")}
                          </span>
                        )}
                        <span>التسليمات: {subs.length}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExpanded(isOpen ? null : it.id)}
                        className="gap-1 text-xs"
                      >
                        {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        التسليمات ({subs.length})
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => remove(it.id)}
                        className="gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-4 border-t border-border pt-3">
                      {subs.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          لا توجد تسليمات بعد.
                        </p>
                      ) : (
                        <div className="grid gap-2">
                          {subs.map((s) => {
                            const draft = gradeDraft[s.id] ?? {
                              score: s.score?.toString() ?? "",
                              feedback: s.feedback,
                            };
                            return (
                              <div
                                key={s.id}
                                className="border border-border rounded-md p-3 bg-muted/20"
                              >
                                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                                  <div>
                                    <div className="font-bold text-xs text-primary">
                                      {studentName(s.student_user_id)}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground" dir="ltr">
                                      {new Date(s.submitted_at).toLocaleString("ar-SY")}
                                    </div>
                                  </div>
                                  <Badge
                                    variant={s.status === "graded" ? "secondary" : "default"}
                                    className="text-[10px]"
                                  >
                                    {s.status === "graded" ? "مُصحَّح" : "قيد التصحيح"}
                                  </Badge>
                                </div>
                                {s.content && (
                                  <p className="text-xs text-foreground bg-background border border-border rounded p-2 mb-2 whitespace-pre-wrap">
                                    {s.content}
                                  </p>
                                )}
                                {s.link_url && (
                                  <a
                                    href={s.link_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-accent hover:underline block mb-2 truncate"
                                    dir="ltr"
                                  >
                                    🔗 {s.link_url}
                                  </a>
                                )}
                                <div className="flex items-end gap-2 flex-wrap">
                                  <div className="w-24">
                                    <label className="text-[10px] text-muted-foreground block">
                                      الدرجة / {it.max_score}
                                    </label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={draft.score}
                                      onChange={(e) =>
                                        setGradeDraft((p) => ({
                                          ...p,
                                          [s.id]: { ...draft, score: e.target.value },
                                        }))
                                      }
                                      className="h-8 text-xs"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-[180px]">
                                    <label className="text-[10px] text-muted-foreground block">
                                      ملاحظات
                                    </label>
                                    <Input
                                      value={draft.feedback}
                                      onChange={(e) =>
                                        setGradeDraft((p) => ({
                                          ...p,
                                          [s.id]: { ...draft, feedback: e.target.value },
                                        }))
                                      }
                                      className="h-8 text-xs"
                                    />
                                  </div>
                                  <Button
                                    size="sm"
                                    disabled={savingSubId === s.id}
                                    onClick={() => saveGrade(s)}
                                    className="h-8 text-xs"
                                  >
                                    {savingSubId === s.id ? "..." : "حفظ"}
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>إنشاء اختبار/واجب</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">العنوان *</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">النوع</label>
                <Select
                  value={form.kind}
                  onValueChange={(v) => setForm({ ...form, kind: v as Kind })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(KIND_LABEL) as Kind[]).map((k) => (
                      <SelectItem key={k} value={k}>
                        {KIND_LABEL[k]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">الدرجة الكاملة</label>
                <Input
                  type="number"
                  value={form.max_score}
                  onChange={(e) => setForm({ ...form, max_score: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">تاريخ التسليم</label>
              <Input
                type="datetime-local"
                value={form.due_at}
                onChange={(e) => setForm({ ...form, due_at: e.target.value })}
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">الوصف / التعليمات</label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">رابط مرجع (اختياري)</label>
              <Input
                dir="ltr"
                placeholder="https://..."
                value={form.resource_url}
                onChange={(e) => setForm({ ...form, resource_url: e.target.value })}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={submitting || !form.title.trim()}>
                {submitting ? "جارٍ الحفظ..." : "إنشاء"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </TeacherLayout>
  );
}
