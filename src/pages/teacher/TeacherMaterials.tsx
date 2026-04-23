import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TeacherLayout from "./TeacherLayout";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FolderKanban, Plus, ExternalLink, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTeacherCourses } from "@/hooks/use-teacher-courses";
import { toast } from "@/hooks/use-toast";

type Material = {
  id: string;
  course_id: string;
  title: string;
  description: string;
  external_url: string | null;
  file_path: string | null;
  sort_order: number;
};

export default function TeacherMaterials() {
  const { courses, loading: coursesLoading } = useTeacherCourses();
  const [params, setParams] = useSearchParams();
  const courseFilter = params.get("course") ?? "all";
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    course_id: "",
    title: "",
    description: "",
    external_url: "",
  });

  const courseIds = useMemo(() => courses.map((c) => c.id), [courses]);

  const load = async () => {
    if (courseIds.length === 0) {
      setMaterials([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("lecture_materials")
      .select("id, course_id, title, description, external_url, file_path, sort_order")
      .in("course_id", courseIds)
      .order("sort_order", { ascending: true });
    if (error) {
      toast({ title: "خطأ في تحميل المواد", description: error.message, variant: "destructive" });
    } else {
      setMaterials(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!coursesLoading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coursesLoading, courseIds.join(",")]);

  const openAdd = () => {
    setForm({
      course_id: courseFilter !== "all" ? courseFilter : courses[0]?.id ?? "",
      title: "",
      description: "",
      external_url: "",
    });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.course_id || !form.title) return;
    setSubmitting(true);
    const { error } = await supabase.from("lecture_materials").insert({
      course_id: form.course_id,
      title: form.title,
      description: form.description,
      external_url: form.external_url || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "تعذرت الإضافة", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "تمت الإضافة" });
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف هذه المادة؟")) return;
    const { error } = await supabase.from("lecture_materials").delete().eq("id", id);
    if (error) {
      toast({ title: "تعذر الحذف", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "تم الحذف" });
    load();
  };

  const filtered = courseFilter === "all"
    ? materials
    : materials.filter((m) => m.course_id === courseFilter);

  const courseTitle = (id: string) => courses.find((c) => c.id === id)?.title ?? "—";

  return (
    <TeacherLayout title="المحاضرات والمواد">
      <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">المحاضرات والمواد</h2>
          <p className="text-sm text-muted-foreground">
            رفع المحاضرات المسجلة والمواد التعليمية.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-56">
            <Select
              value={courseFilter}
              onValueChange={(v) => {
                const next = new URLSearchParams(params);
                if (v === "all") next.delete("course");
                else next.set("course", v);
                setParams(next);
              }}
            >
              <SelectTrigger><SelectValue placeholder="فلتر بالمقرر" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل المقررات</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={openAdd} disabled={courses.length === 0} className="gap-2">
            <Plus size={16} /> إضافة مادة
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FolderKanban className="mx-auto mb-3 opacity-40" size={40} />
            لا توجد مواد مرفوعة بعد.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="font-bold text-sm text-primary">{m.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {courseTitle(m.course_id)}
                  </div>
                  {m.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {m.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {m.external_url && (
                    <a
                      href={m.external_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-accent hover:underline flex items-center gap-1"
                    >
                      <ExternalLink size={12} /> فتح
                    </a>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => remove(m.id)}
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
            <DialogTitle>إضافة مادة</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">المقرر</label>
              <Select
                value={form.course_id}
                onValueChange={(v) => setForm({ ...form, course_id: v })}
              >
                <SelectTrigger><SelectValue placeholder="اختر المقرر" /></SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">العنوان</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">الوصف</label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">رابط خارجي (اختياري)</label>
              <Input
                dir="ltr"
                placeholder="https://..."
                value={form.external_url}
                onChange={(e) => setForm({ ...form, external_url: e.target.value })}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={submitting || !form.course_id || !form.title}>
                {submitting ? "جارٍ الحفظ..." : "حفظ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </TeacherLayout>
  );
}
