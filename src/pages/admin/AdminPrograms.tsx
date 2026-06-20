import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Program = {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  sort_order: number;
};

const emptyProg = { title: "", description: "", icon_name: "GraduationCap", sort_order: 0 };

export default function AdminPrograms() {
  const [items, setItems] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  const [form, setForm] = useState(emptyProg);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const { data } = await supabase.from("programs").select("*").order("sort_order");
    setItems((data as Program[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyProg); setDialogOpen(true); };
  const openEdit = (p: Program) => { setEditing(p); setForm({ title: p.title, description: p.description, icon_name: p.icon_name, sort_order: p.sort_order }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: "يرجى ملء العنوان", variant: "destructive" }); return; }
    setSaving(true);
    if (editing) {
      const { error } = await supabase.from("programs").update(form).eq("id", editing.id);
      if (error) toast({ title: "خطأ", description: error.message, variant: "destructive" });
      else toast({ title: "تم التحديث" });
    } else {
      const { error } = await supabase.from("programs").insert(form);
      if (error) toast({ title: "خطأ", description: error.message, variant: "destructive" });
      else toast({ title: "تمت الإضافة" });
    }
    setSaving(false); setDialogOpen(false); fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد؟")) return;
    await supabase.from("programs").delete().eq("id", id);
    toast({ title: "تم الحذف" }); fetchData();
  };

  if (loading) return <div className="text-center py-12">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">إدارة الأقسام</h1>
        <Button onClick={openAdd} className="gap-2"><Plus size={16} /> إضافة برنامج</Button>
      </div>
      <div className="grid gap-4">
        {items.map((p) => (
          <Card key={p.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex-1">
                <h3 className="font-bold">{p.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{p.description}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => openEdit(p)}><Pencil size={14} /></Button>
                <Button variant="outline" size="icon" onClick={() => handleDelete(p.id)} className="text-destructive hover:text-destructive"><Trash2 size={14} /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && <p className="text-center text-muted-foreground py-12">لا توجد برامج بعد.</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>{editing ? "تعديل البرنامج" : "إضافة برنامج"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">العنوان</label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className="text-sm font-medium mb-1 block">الوصف</label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} /></div>
            <div><label className="text-sm font-medium mb-1 block">اسم الأيقونة</label><Input value={form.icon_name} onChange={(e) => setForm({ ...form, icon_name: e.target.value })} placeholder="GraduationCap" dir="ltr" /></div>
            <div><label className="text-sm font-medium mb-1 block">الترتيب</label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} /></div>
            <Button onClick={handleSave} disabled={saving} className="w-full gap-2"><Save size={16} />{saving ? "جاري الحفظ..." : "حفظ"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
