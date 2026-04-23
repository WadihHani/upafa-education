import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, FolderOpen, FileText, Star } from "lucide-react";
import { ICON_OPTIONS, getNewsIcon } from "@/lib/news-icons";

type Category = {
  id: string;
  key: string;
  title: string;
  icon_name: string;
  sort_order: number;
  is_highlighted: boolean;
  is_active: boolean;
};

const empty = {
  key: "",
  title: "",
  icon_name: "Newspaper",
  sort_order: 0,
  is_highlighted: false,
  is_active: true,
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function AdminNewsCategories() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("news_categories")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) toast({ title: "خطأ", description: error.message, variant: "destructive" });
    else setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({
      key: c.key,
      title: c.title,
      icon_name: c.icon_name,
      sort_order: c.sort_order,
      is_highlighted: c.is_highlighted,
      is_active: c.is_active,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) {
      toast({ title: "العنوان مطلوب", variant: "destructive" });
      return;
    }
    const key = (form.key || slugify(form.title)).trim();
    if (!key) {
      toast({ title: "المعرّف (slug) مطلوب", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = { ...form, key, title: form.title.trim() };
    const { error } = editing
      ? await supabase.from("news_categories").update(payload).eq("id", editing.id)
      : await supabase.from("news_categories").insert(payload);
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
    if (!confirm("سيتم حذف القسم وكل منشوراته. هل أنت متأكد؟")) return;
    const { error } = await supabase.from("news_categories").delete().eq("id", id);
    if (error) {
      toast({ title: "تعذر الحذف", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "تم الحذف" });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">أقسام الأخبار</h1>
          <p className="text-sm text-muted-foreground mt-1">
            الأقسام التي تظهر في لوحة "آخر الأخبار" بالصفحة الرئيسية. كل قسم له صفحة خاصة بمنشوراته.
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus size={16} /> إضافة قسم
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FolderOpen className="mx-auto mb-3 opacity-40" size={40} />
            لا توجد أقسام بعد.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((c) => {
            const Icon = getNewsIcon(c.icon_name);
            return (
              <Card key={c.id}>
                <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${
                        c.is_highlighted
                          ? "bg-accent text-accent-foreground"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-primary">{c.title}</h3>
                        {c.is_highlighted && (
                          <Badge className="bg-accent text-accent-foreground text-[10px] gap-1">
                            <Star size={10} /> مميّز
                          </Badge>
                        )}
                        {!c.is_active && (
                          <Badge variant="outline" className="text-[10px]">معطّل</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono" dir="ltr">
                        /news/{c.key}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm" className="gap-1">
                      <Link to={`/admin/news/${c.id}/posts`}>
                        <FileText size={14} /> المنشورات
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => openEdit(c)}>
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => remove(c.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل القسم" : "إضافة قسم"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">العنوان *</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                maxLength={120}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">المعرّف (Slug)</label>
              <Input
                dir="ltr"
                value={form.key}
                placeholder="auto-from-title"
                onChange={(e) => setForm({ ...form, key: e.target.value })}
                maxLength={80}
              />
              <p className="text-[11px] text-muted-foreground mt-1">يستخدم في الرابط /news/{form.key || "..."}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">الأيقونة</label>
                <Select
                  value={form.icon_name}
                  onValueChange={(v) => setForm({ ...form, icon_name: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">الترتيب</label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between bg-muted/40 rounded-md px-3 py-2">
              <span className="text-sm">قسم مميّز (يظهر بلون مختلف)</span>
              <Switch
                checked={form.is_highlighted}
                onCheckedChange={(v) => setForm({ ...form, is_highlighted: v })}
              />
            </div>
            <div className="flex items-center justify-between bg-muted/40 rounded-md px-3 py-2">
              <span className="text-sm">مفعّل</span>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
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
