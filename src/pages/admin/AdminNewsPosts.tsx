import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Pencil,
  Trash2,
  Inbox,
  ChevronRight,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Eye,
  EyeOff,
} from "lucide-react";

type Post = {
  id: string;
  category_id: string;
  title: string;
  summary: string;
  content: string;
  cover_image_url: string | null;
  video_url: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  external_link: string | null;
  is_published: boolean;
  published_at: string;
  sort_order: number;
};

type Category = { id: string; title: string; key: string };

const empty = {
  title: "",
  summary: "",
  content: "",
  cover_image_url: "" as string,
  video_url: "" as string,
  attachment_url: "" as string,
  attachment_name: "" as string,
  external_link: "" as string,
  is_published: true,
  sort_order: 0,
};

export default function AdminNewsPosts() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);
  const attachRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!categoryId) return;
    setLoading(true);
    const [cat, list] = await Promise.all([
      supabase.from("news_categories").select("id,title,key").eq("id", categoryId).maybeSingle(),
      supabase
        .from("news_posts")
        .select("*")
        .eq("category_id", categoryId)
        .order("sort_order", { ascending: true })
        .order("published_at", { ascending: false }),
    ]);
    setCategory(cat.data ?? null);
    setPosts(list.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [categoryId]);

  const openAdd = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (p: Post) => {
    setEditing(p);
    setForm({
      title: p.title,
      summary: p.summary,
      content: p.content,
      cover_image_url: p.cover_image_url ?? "",
      video_url: p.video_url ?? "",
      attachment_url: p.attachment_url ?? "",
      attachment_name: p.attachment_name ?? "",
      external_link: p.external_link ?? "",
      is_published: p.is_published,
      sort_order: p.sort_order,
    });
    setOpen(true);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const path = `${categoryId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("news-media").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      toast({ title: "فشل الرفع", description: error.message, variant: "destructive" });
      return null;
    }
    const { data } = supabase.storage.from("news-media").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleCover = async (file: File | null) => {
    if (!file) return;
    setUploadingCover(true);
    const url = await uploadFile(file);
    setUploadingCover(false);
    if (url) setForm((f) => ({ ...f, cover_image_url: url }));
  };

  const handleAttachment = async (file: File | null) => {
    if (!file) return;
    setUploadingAttachment(true);
    const url = await uploadFile(file);
    setUploadingAttachment(false);
    if (url) setForm((f) => ({ ...f, attachment_url: url, attachment_name: file.name }));
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast({ title: "العنوان مطلوب", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      category_id: categoryId!,
      title: form.title.trim(),
      summary: form.summary.trim(),
      content: form.content,
      cover_image_url: form.cover_image_url || null,
      video_url: form.video_url || null,
      attachment_url: form.attachment_url || null,
      attachment_name: form.attachment_name || null,
      external_link: form.external_link || null,
      is_published: form.is_published,
      sort_order: form.sort_order,
    };
    const { error } = editing
      ? await supabase.from("news_posts").update(payload).eq("id", editing.id)
      : await supabase.from("news_posts").insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: "خطأ في الحفظ", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editing ? "تم التحديث" : "تمت الإضافة" });
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف هذا المنشور؟")) return;
    const { error } = await supabase.from("news_posts").delete().eq("id", id);
    if (error) {
      toast({ title: "تعذر الحذف", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "تم الحذف" });
    load();
  };

  const togglePublish = async (p: Post) => {
    const { error } = await supabase
      .from("news_posts")
      .update({ is_published: !p.is_published })
      .eq("id", p.id);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
      return;
    }
    load();
  };

  return (
    <div>
      <nav className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
        <Link to="/admin/news" className="hover:text-primary">أقسام الأخبار</Link>
        <ChevronRight size={12} />
        <span className="text-foreground">{category?.title ?? "..."}</span>
      </nav>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">منشورات: {category?.title ?? "..."}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            أضف نصوصاً وصوراً وملفات PDF وفيديوهات وروابط لهذا القسم.
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus size={16} /> إضافة منشور
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Inbox className="mx-auto mb-3 opacity-40" size={40} />
            لا توجد منشورات بعد.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {posts.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-center gap-4 flex-wrap">
                {p.cover_image_url ? (
                  <img
                    src={p.cover_image_url}
                    alt=""
                    className="w-20 h-20 rounded-md object-cover border border-border shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-md bg-muted/50 flex items-center justify-center shrink-0 text-muted-foreground/50">
                    <FileText size={22} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-primary line-clamp-1">{p.title}</h3>
                    {!p.is_published && (
                      <Badge variant="outline" className="text-[10px]">مسودة</Badge>
                    )}
                    {p.video_url && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Video size={10} /> فيديو
                      </Badge>
                    )}
                    {p.attachment_url && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <FileText size={10} /> مرفق
                      </Badge>
                    )}
                    {p.external_link && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <LinkIcon size={10} /> رابط
                      </Badge>
                    )}
                  </div>
                  {p.summary && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.summary}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    title={p.is_published ? "إخفاء" : "نشر"}
                    onClick={() => togglePublish(p)}
                  >
                    {p.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => openEdit(p)}>
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => remove(p.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل المنشور" : "إضافة منشور"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">العنوان *</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                maxLength={250}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">ملخص قصير</label>
              <Textarea
                rows={2}
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                maxLength={500}
                placeholder="جملة وصفية تظهر في البطاقة"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">المحتوى</label>
              <Textarea
                rows={8}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="اكتب المحتوى الكامل هنا..."
              />
            </div>

            {/* Cover */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <ImageIcon size={14} /> صورة الغلاف
              </label>
              {form.cover_image_url ? (
                <div className="relative inline-block">
                  <img
                    src={form.cover_image_url}
                    alt=""
                    className="h-32 rounded-md border border-border object-cover"
                  />
                  <button
                    onClick={() => setForm((f) => ({ ...f, cover_image_url: "" }))}
                    className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow"
                    type="button"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  disabled={uploadingCover}
                  onClick={() => coverRef.current?.click()}
                >
                  <Upload size={14} />
                  {uploadingCover ? "جارٍ الرفع..." : "اختر صورة"}
                </Button>
              )}
              <input
                ref={coverRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleCover(e.target.files?.[0] ?? null)}
              />
            </div>

            {/* Video URL */}
            <div>
              <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                <Video size={14} /> رابط فيديو (YouTube / Vimeo / mp4)
              </label>
              <Input
                dir="ltr"
                value={form.video_url}
                onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            {/* Attachment */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <FileText size={14} /> مرفق (PDF / صورة / ملف)
              </label>
              {form.attachment_url ? (
                <div className="flex items-center gap-2 bg-muted/40 rounded-md px-3 py-2">
                  <FileText size={16} className="text-primary" />
                  <a
                    href={form.attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline truncate flex-1"
                  >
                    {form.attachment_name || form.attachment_url}
                  </a>
                  <button
                    onClick={() => setForm((f) => ({ ...f, attachment_url: "", attachment_name: "" }))}
                    type="button"
                    className="text-destructive"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  disabled={uploadingAttachment}
                  onClick={() => attachRef.current?.click()}
                >
                  <Upload size={14} />
                  {uploadingAttachment ? "جارٍ الرفع..." : "اختر ملف"}
                </Button>
              )}
              <input
                ref={attachRef}
                type="file"
                className="hidden"
                onChange={(e) => handleAttachment(e.target.files?.[0] ?? null)}
              />
            </div>

            {/* External link */}
            <div>
              <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                <LinkIcon size={14} /> رابط خارجي
              </label>
              <Input
                dir="ltr"
                value={form.external_link}
                onChange={(e) => setForm({ ...form, external_link: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">الترتيب</label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center justify-between bg-muted/40 rounded-md px-3 py-2">
                <span className="text-sm">منشور</span>
                <Switch
                  checked={form.is_published}
                  onCheckedChange={(v) => setForm({ ...form, is_published: v })}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "جارٍ الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
