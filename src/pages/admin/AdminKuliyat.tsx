import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Save, ArrowUp, ArrowDown, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Faculty = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string;
  bachelor_departments: string[];
  master_departments: string[];
  admission_requirements: string;
  fees: string;
  display_order: number;
  is_published: boolean;
};

const empty = {
  slug: "",
  name: "",
  description: "",
  image_url: "",
  bachelor_departments: "",
  master_departments: "",
  admission_requirements: "",
  fees: "",
  display_order: 0,
  is_published: true,
};

export default function AdminKuliyat() {
  const [items, setItems] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Faculty | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    const { data } = await (supabase as any)
      .from("kuliyat")
      .select("*")
      .order("display_order", { ascending: true });
    setItems((data as Faculty[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (f: Faculty) => {
    setEditing(f);
    setForm({
      slug: f.slug,
      name: f.name,
      description: f.description || "",
      image_url: f.image_url || "",
      bachelor_departments: (f.bachelor_departments || []).join("\n"),
      master_departments: (f.master_departments || []).join("\n"),
      admission_requirements: f.admission_requirements || "",
      fees: f.fees || "",
      display_order: f.display_order,
      is_published: f.is_published,
    });
    setOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `kuliyat/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("site-images").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "خطأ في الرفع", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("site-images").getPublicUrl(path);
    setForm((p) => ({ ...p, image_url: data.publicUrl }));
    setUploading(false);
    toast({ title: "تم رفع الصورة" });
  };

  const handleSave = async () => {
    if (!form.slug.trim() || !form.name.trim()) {
      toast({ title: "الاسم والمعرّف (slug) مطلوبان", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      slug: form.slug.trim(),
      name: form.name.trim(),
      description: form.description,
      image_url: form.image_url,
      bachelor_departments: form.bachelor_departments.split("\n").map((s) => s.trim()).filter(Boolean),
      master_departments: form.master_departments.split("\n").map((s) => s.trim()).filter(Boolean),
      admission_requirements: form.admission_requirements,
      fees: form.fees,
      display_order: Number(form.display_order) || 0,
      is_published: form.is_published,
    };
    const { error } = editing
      ? await (supabase as any).from("kuliyat").update(payload).eq("id", editing.id)
      : await (supabase as any).from("kuliyat").insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editing ? "تم التحديث" : "تمت الإضافة" });
    setOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل تريد حذف الكلية؟")) return;
    await (supabase as any).from("kuliyat").delete().eq("id", id);
    toast({ title: "تم الحذف" });
    fetchData();
  };

  const move = async (f: Faculty, dir: -1 | 1) => {
    const newOrder = f.display_order + dir;
    await (supabase as any).from("kuliyat").update({ display_order: newOrder }).eq("id", f.id);
    fetchData();
  };

  if (loading) return <div className="text-center py-12">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">إدارة الكليات</h1>
        <Button onClick={openAdd} className="gap-2">
          <Plus size={16} /> إضافة كلية
        </Button>
      </div>

      <div className="grid gap-4">
        {items.map((f) => (
          <Card key={f.id}>
            <CardContent className="flex items-center gap-4 p-4">
              {f.image_url ? (
                <img src={f.image_url} alt={f.name} className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-muted" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">{f.name}</h3>
                  {!f.is_published && (
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded">مخفية</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {f.slug} · بكالوريوس: {f.bachelor_departments?.length || 0} · ماجستير: {f.master_departments?.length || 0} · ترتيب: {f.display_order}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" onClick={() => move(f, -1)} title="أعلى"><ArrowUp size={14} /></Button>
                <Button variant="outline" size="icon" onClick={() => move(f, 1)} title="أسفل"><ArrowDown size={14} /></Button>
                <Button variant="outline" size="icon" onClick={() => openEdit(f)}><Pencil size={14} /></Button>
                <Button variant="outline" size="icon" onClick={() => handleDelete(f.id)} className="text-destructive hover:text-destructive"><Trash2 size={14} /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && <p className="text-center text-muted-foreground py-12">لا توجد كليات بعد.</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل كلية" : "إضافة كلية"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">الاسم</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">المعرّف (slug)</label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} dir="ltr" placeholder="law" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">الوصف</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">صورة الكلية</label>
              <div className="flex items-center gap-3">
                {form.image_url && <img src={form.image_url} alt="" className="w-16 h-16 rounded object-cover" />}
                <label className="inline-flex items-center gap-2 cursor-pointer bg-muted px-3 py-2 rounded-md text-sm hover:bg-muted/80">
                  <Upload size={14} /> {uploading ? "جاري الرفع..." : "رفع صورة"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                </label>
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="أو الصق رابط صورة" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">أقسام البكالوريوس (سطر لكل قسم)</label>
                <Textarea value={form.bachelor_departments} onChange={(e) => setForm({ ...form, bachelor_departments: e.target.value })} rows={6} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">اختصاصات الماجستير (سطر لكل اختصاص)</label>
                <Textarea value={form.master_departments} onChange={(e) => setForm({ ...form, master_departments: e.target.value })} rows={6} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">شروط القبول</label>
              <Textarea value={form.admission_requirements} onChange={(e) => setForm({ ...form, admission_requirements: e.target.value })} rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">الرسوم</label>
              <Textarea value={form.fees} onChange={(e) => setForm({ ...form, fees: e.target.value })} rows={2} />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">الترتيب</label>
                <Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} className="w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
                <label className="text-sm font-medium">منشورة</label>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
              <Save size={16} />
              {saving ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
