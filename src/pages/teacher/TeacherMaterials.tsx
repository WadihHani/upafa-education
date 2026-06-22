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
import {
  FolderKanban,
  Plus,
  ExternalLink,
  Trash2,
  BookText,
  FileText,
  Film,
  Youtube,
  Link as LinkIcon,
  Upload,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTeacherCourses } from "@/hooks/use-teacher-courses";
import { toast } from "@/hooks/use-toast";

type MaterialType = "book" | "pdf" | "video" | "youtube" | "link";

type Material = {
  id: string;
  course_id: string;
  title: string;
  description: string;
  external_url: string | null;
  file_path: string | null;
  file_size_bytes: number | null;
  file_mime: string | null;
  material_type: MaterialType;
  sort_order: number;
};

const TYPE_META: Record<MaterialType, { label: string; icon: any; accept?: string; needsUpload: boolean; needsUrl: boolean }> = {
  book:    { label: "كتاب",         icon: BookText, accept: ".pdf,.epub,.doc,.docx", needsUpload: true,  needsUrl: false },
  pdf:     { label: "ملف PDF",      icon: FileText, accept: ".pdf",                 needsUpload: true,  needsUrl: false },
  video:   { label: "فيديو",        icon: Film,     accept: "video/*",              needsUpload: true,  needsUrl: false },
  youtube: { label: "يوتيوب",       icon: Youtube,                                  needsUpload: false, needsUrl: true  },
  link:    { label: "رابط خارجي",   icon: LinkIcon,                                 needsUpload: false, needsUrl: true  },
};

const fmtSize = (n: number | null) => {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

export default function TeacherMaterials() {
  const { courses, loading: coursesLoading } = useTeacherCourses();
  const [params, setParams] = useSearchParams();
  const courseFilter = params.get("course") ?? "all";
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [form, setForm] = useState<{
    course_id: string;
    title: string;
    description: string;
    external_url: string;
    material_type: MaterialType;
    file: File | null;
  }>({
    course_id: "",
    title: "",
    description: "",
    external_url: "",
    material_type: "pdf",
    file: null,
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
      .select("id, course_id, title, description, external_url, file_path, file_size_bytes, file_mime, material_type, sort_order")
      .in("course_id", courseIds)
      .order("sort_order", { ascending: true });
    if (error) {
      toast({ title: "خطأ في تحميل المواد", description: error.message, variant: "destructive" });
    } else {
      setMaterials((data ?? []) as Material[]);
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
      material_type: "pdf",
      file: null,
    });
    setProgress(0);
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.course_id || !form.title) return;
    const meta = TYPE_META[form.material_type];
    if (meta.needsUpload && !form.file) {
      toast({ title: "اختر ملفاً لرفعه", variant: "destructive" });
      return;
    }
    if (meta.needsUrl && !form.external_url.trim()) {
      toast({ title: "أدخل الرابط", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    setProgress(0);

    let file_path: string | null = null;
    let file_size_bytes: number | null = null;
    let file_mime: string | null = null;

    try {
      if (meta.needsUpload && form.file) {
        const ext = form.file.name.split(".").pop() || "bin";
        const path = `${form.course_id}/${form.material_type}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("lecture-materials")
          .upload(path, form.file, {
            cacheControl: "3600",
            upsert: false,
            contentType: form.file.type || undefined,
          });
        if (upErr) throw upErr;
        file_path = path;
        file_size_bytes = form.file.size;
        file_mime = form.file.type || null;
        setProgress(100);
      }

      const { error } = await supabase.from("lecture_materials").insert({
        course_id: form.course_id,
        title: form.title,
        description: form.description,
        external_url: meta.needsUrl ? form.external_url.trim() : null,
        material_type: form.material_type,
        file_path,
        file_size_bytes,
        file_mime,
      });
      if (error) throw error;

      toast({ title: "تمت الإضافة" });
      setOpen(false);
      load();
    } catch (err: any) {
      toast({ title: "تعذرت الإضافة", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (m: Material) => {
    if (!confirm("حذف هذه المادة؟")) return;
    if (m.file_path) {
      await supabase.storage.from("lecture-materials").remove([m.file_path]);
    }
    const { error } = await supabase.from("lecture_materials").delete().eq("id", m.id);
    if (error) {
      toast({ title: "تعذر الحذف", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "تم الحذف" });
    load();
  };

  const openFile = async (m: Material) => {
    if (m.external_url) {
      window.open(m.external_url, "_blank");
      return;
    }
    if (!m.file_path) return;
    const { data, error } = await supabase.storage
      .from("lecture-materials")
      .createSignedUrl(m.file_path, 3600);
    if (error || !data) {
      toast({ title: "تعذر الفتح", description: error?.message, variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const filtered = courseFilter === "all"
    ? materials
    : materials.filter((m) => m.course_id === courseFilter);

  const courseTitle = (id: string) => courses.find((c) => c.id === id)?.title ?? "—";
  const currentMeta = TYPE_META[form.material_type];

  return (
    <TeacherLayout title="المواد والمكتبة">
      <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">المواد والمكتبة</h2>
          <p className="text-sm text-muted-foreground">
            أضف كتباً وملفات PDF وفيديوهات وروابط يوتيوب لمقرراتك.
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
          {filtered.map((m) => {
            const meta = TYPE_META[m.material_type] ?? TYPE_META.link;
            const Icon = meta.icon;
            return (
              <Card key={m.id}>
                <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex items-start gap-3">
                    <div className="shrink-0 mt-0.5 p-2 rounded-md bg-muted text-primary">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-primary flex items-center gap-2 flex-wrap">
                        {m.title}
                        <Badge variant="outline" className="text-[10px]">{meta.label}</Badge>
                        {m.file_size_bytes && (
                          <span className="text-[10px] text-muted-foreground">{fmtSize(m.file_size_bytes)}</span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {courseTitle(m.course_id)}
                      </div>
                      {m.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {m.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openFile(m)}
                      className="gap-1"
                    >
                      <ExternalLink size={12} /> فتح
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => remove(m)}
                      className="gap-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 size={14} /> حذف
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={(o) => !submitting && setOpen(o)}>
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
              <label className="text-sm font-medium mb-1 block">نوع المادة</label>
              <Select
                value={form.material_type}
                onValueChange={(v) => setForm({ ...form, material_type: v as MaterialType, file: null, external_url: "" })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(TYPE_META) as MaterialType[]).map((k) => (
                    <SelectItem key={k} value={k}>{TYPE_META[k].label}</SelectItem>
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
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {currentMeta.needsUrl && (
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {form.material_type === "youtube" ? "رابط YouTube" : "الرابط"}
                </label>
                <Input
                  dir="ltr"
                  placeholder={form.material_type === "youtube" ? "https://www.youtube.com/watch?v=..." : "https://..."}
                  value={form.external_url}
                  onChange={(e) => setForm({ ...form, external_url: e.target.value })}
                />
              </div>
            )}

            {currentMeta.needsUpload && (
              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                  <Upload size={13} /> الملف
                </label>
                <Input
                  type="file"
                  accept={currentMeta.accept}
                  onChange={(e) => setForm({ ...form, file: e.target.files?.[0] ?? null })}
                />
                {form.file && (
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {form.file.name} — {fmtSize(form.file.size)}
                  </p>
                )}
              </div>
            )}

            {submitting && progress > 0 && (
              <div className="h-1.5 bg-muted rounded overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
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
