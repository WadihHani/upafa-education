import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { BookOpen, ChevronLeft, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import TeacherLayout from "./TeacherLayout";
import { useTeacherCourses } from "@/hooks/use-teacher-courses";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const emptyForm = {
  title: "",
  code: "",
  level: "",
  description: "",
  is_open_for_enrollment: true,
};

export default function TeacherCourses() {
  const { user } = useAuth();
  const { courses, loading, error, refetch } = useTeacherCourses();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.title.trim()) return;
    setSubmitting(true);
    const { error: insErr } = await supabase.from("courses").insert({
      teacher_user_id: user.id,
      title: form.title.trim(),
      code: form.code.trim() || null,
      level: form.level.trim() || null,
      description: form.description.trim(),
      is_open_for_enrollment: form.is_open_for_enrollment,
    });
    setSubmitting(false);
    if (insErr) {
      toast({
        title: "تعذرت الإضافة",
        description: insErr.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "تم إنشاء المقرر" });
    setOpen(false);
    setForm(emptyForm);
    refetch();
  };

  const toggleOpen = async (id: string, value: boolean) => {
    const { error: upErr } = await supabase
      .from("courses")
      .update({ is_open_for_enrollment: value })
      .eq("id", id);
    if (upErr) {
      toast({ title: "تعذر التحديث", description: upErr.message, variant: "destructive" });
      return;
    }
    refetch();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف هذا المقرر؟ سيتم حذف جميع البيانات المرتبطة به.")) return;
    const { error: delErr } = await supabase.from("courses").delete().eq("id", id);
    if (delErr) {
      toast({ title: "تعذر الحذف", description: delErr.message, variant: "destructive" });
      return;
    }
    toast({ title: "تم الحذف" });
    refetch();
  };

  return (
    <TeacherLayout title="مقرراتي">
      <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">مقرراتي</h2>
          <p className="text-sm text-muted-foreground">
            المقررات التي تُدرّسها — يمكنك إضافة مقرر جديد ليتمكن الطلاب من طلب الانضمام إليه.
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus size={16} /> إضافة مقرر
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8 text-center text-destructive text-sm">
            {error}
          </CardContent>
        </Card>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <BookOpen className="mx-auto mb-3 opacity-40" size={40} />
            لم تقم بإضافة أي مقرر بعد. اضغط "إضافة مقرر" للبدء.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-primary text-sm">{c.title}</h3>
                  {c.is_open_for_enrollment ? (
                    <Badge variant="secondary" className="text-[10px]">مفتوح للتسجيل</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">مغلق</Badge>
                  )}
                </div>
                <div className="flex gap-2 text-[11px] text-muted-foreground mb-3">
                  {c.code && <span>{c.code}</span>}
                  {c.level && <span>• {c.level}</span>}
                </div>
                {c.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {c.description}
                  </p>
                )}

                <div className="flex items-center justify-between border-t border-border pt-3 mb-3">
                  <span className="text-[11px] text-muted-foreground">فتح للتسجيل</span>
                  <Switch
                    checked={c.is_open_for_enrollment}
                    onCheckedChange={(v) => toggleOpen(c.id, v)}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/portal/teacher/students?course=${c.id}`}
                    className="text-xs text-accent hover:underline flex items-center gap-1"
                  >
                    الطلاب <ChevronLeft size={12} />
                  </Link>
                  <Link
                    to={`/portal/teacher/materials?course=${c.id}`}
                    className="text-xs text-accent hover:underline flex items-center gap-1"
                  >
                    المواد <ChevronLeft size={12} />
                  </Link>
                  <Link
                    to={`/portal/teacher/grades?course=${c.id}`}
                    className="text-xs text-accent hover:underline flex items-center gap-1"
                  >
                    الدرجات <ChevronLeft size={12} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(c.id)}
                    className="ms-auto text-xs text-destructive hover:underline flex items-center gap-1"
                  >
                    <Trash2 size={12} /> حذف
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة مقرر جديد</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">عنوان المقرر *</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                maxLength={200}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">رمز المقرر</label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  maxLength={50}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">المستوى</label>
                <Input
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  placeholder="بكالوريوس / ماجستير ..."
                  maxLength={50}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">الوصف</label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                maxLength={1000}
              />
            </div>
            <div className="flex items-center justify-between bg-muted/40 rounded-md px-3 py-2">
              <span className="text-sm">فتح المقرر لطلبات التسجيل</span>
              <Switch
                checked={form.is_open_for_enrollment}
                onCheckedChange={(v) => setForm({ ...form, is_open_for_enrollment: v })}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={submitting || !form.title.trim()}>
                {submitting ? "جارٍ الحفظ..." : "حفظ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </TeacherLayout>
  );
}
