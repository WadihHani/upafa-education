import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type SiteContent = {
  id: string;
  section_key: string;
  title: string | null;
  content: string | null;
};

const emptyContent = { section_key: "", title: "", content: "" };

export default function AdminContent() {
  const [items, setItems] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SiteContent | null>(null);
  const [form, setForm] = useState(emptyContent);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const { data } = await supabase.from("site_content").select("*").order("section_key");
    setItems((data as SiteContent[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyContent); setDialogOpen(true); };
  const openEdit = (c: SiteContent) => { setEditing(c); setForm({ section_key: c.section_key, title: c.title || "", content: c.content || "" }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.section_key.trim()) { toast({ title: "يرجى ملء مفتاح القسم", variant: "destructive" }); return; }
    setSaving(true);
    if (editing) {
      const { error } = await supabase.from("site_content").update({ title: form.title, content: form.content }).eq("id", editing.id);
      if (error) toast({ title: "خطأ", description: error.message, variant: "destructive" });
      else toast({ title: "تم التحديث" });
    } else {
      const { error } = await supabase.from("site_content").insert(form);
      if (error) toast({ title: "خطأ", description: error.message, variant: "destructive" });
      else toast({ title: "تمت الإضافة" });
    }
    setSaving(false); setDialogOpen(false); fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد؟")) return;
    await supabase.from("site_content").delete().eq("id", id);
    toast({ title: "تم الحذف" }); fetchData();
  };

  if (loading) return <div className="text-center py-12">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">إدارة المحتوى</h1>
        <Button onClick={openAdd} className="gap-2"><Plus size={16} /> إضافة محتوى</Button>
      </div>
      <div className="grid gap-4">
        {items.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex-1">
                <h3 className="font-bold">{c.title || c.section_key}</h3>
                <p className="text-xs text-muted-foreground">{c.section_key}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => openEdit(c)}><Pencil size={14} /></Button>
                <Button variant="outline" size="icon" onClick={() => handleDelete(c.id)} className="text-destructive hover:text-destructive"><Trash2 size={14} /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && <p className="text-center text-muted-foreground py-12">لا يوجد محتوى بعد.</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>{editing ? "تعديل المحتوى" : "إضافة محتوى"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">مفتاح القسم</label>
              <Input value={form.section_key} onChange={(e) => setForm({ ...form, section_key: e.target.value })} disabled={!!editing} dir="ltr" placeholder="about_intro" />
            </div>
            <div><label className="text-sm font-medium mb-1 block">العنوان</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className="text-sm font-medium mb-1 block">المحتوى</label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} /></div>
            <Button onClick={handleSave} disabled={saving} className="w-full gap-2"><Save size={16} />{saving ? "جاري الحفظ..." : "حفظ"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
