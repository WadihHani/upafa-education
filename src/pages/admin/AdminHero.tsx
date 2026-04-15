import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Save, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type HeroSlide = {
  id: string;
  title: string;
  cta_text: string;
  cta_link: string;
  image_url: string | null;
  sort_order: number;
};

const emptySlide = { title: "", cta_text: "", cta_link: "/programs", image_url: null as string | null, sort_order: 0 };

export default function AdminHero() {
  const [items, setItems] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [form, setForm] = useState(emptySlide);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const { data } = await supabase.from("hero_slides").select("*").order("sort_order");
    setItems((data as HeroSlide[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptySlide); setImageFile(null); setDialogOpen(true); };
  const openEdit = (s: HeroSlide) => { setEditing(s); setForm({ title: s.title, cta_text: s.cta_text, cta_link: s.cta_link, image_url: s.image_url, sort_order: s.sort_order }); setImageFile(null); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: "يرجى ملء العنوان", variant: "destructive" }); return; }
    setSaving(true);

    let imageUrl = form.image_url;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `hero/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("site-images").upload(path, imageFile);
      if (upErr) { toast({ title: "خطأ في رفع الصورة", description: upErr.message, variant: "destructive" }); setSaving(false); return; }
      const { data: urlData } = supabase.storage.from("site-images").getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    const payload = { ...form, image_url: imageUrl };
    if (editing) {
      const { error } = await supabase.from("hero_slides").update(payload).eq("id", editing.id);
      if (error) toast({ title: "خطأ", description: error.message, variant: "destructive" });
      else toast({ title: "تم التحديث" });
    } else {
      const { error } = await supabase.from("hero_slides").insert(payload);
      if (error) toast({ title: "خطأ", description: error.message, variant: "destructive" });
      else toast({ title: "تمت الإضافة" });
    }
    setSaving(false); setDialogOpen(false); fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد؟")) return;
    await supabase.from("hero_slides").delete().eq("id", id);
    toast({ title: "تم الحذف" }); fetchData();
  };

  if (loading) return <div className="text-center py-12">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">إدارة شرائح الهيرو</h1>
        <Button onClick={openAdd} className="gap-2"><Plus size={16} /> إضافة شريحة</Button>
      </div>
      <div className="grid gap-4">
        {items.map((s) => (
          <Card key={s.id}>
            <CardContent className="flex items-center gap-4 p-4">
              {s.image_url ? (
                <img src={s.image_url} alt="" className="w-24 h-14 rounded object-cover" />
              ) : (
                <div className="w-24 h-14 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">بدون صورة</div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.cta_text} → {s.cta_link}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => openEdit(s)}><Pencil size={14} /></Button>
                <Button variant="outline" size="icon" onClick={() => handleDelete(s.id)} className="text-destructive hover:text-destructive"><Trash2 size={14} /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && <p className="text-center text-muted-foreground py-12">لا توجد شرائح.</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>{editing ? "تعديل الشريحة" : "إضافة شريحة"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">العنوان</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className="text-sm font-medium mb-1 block">نص الزر</label><Input value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} /></div>
            <div><label className="text-sm font-medium mb-1 block">رابط الزر</label><Input value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} dir="ltr" /></div>
            <div><label className="text-sm font-medium mb-1 block">الترتيب</label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
            <div>
              <label className="text-sm font-medium mb-1 block">صورة الخلفية</label>
              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              {form.image_url && !imageFile && <img src={form.image_url} alt="" className="w-full h-32 rounded object-cover mt-2" />}
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full gap-2"><Save size={16} />{saving ? "جاري الحفظ..." : "حفظ"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
