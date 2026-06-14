import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Save, Trash2, Upload } from "lucide-react";
import { clearPageSeoCache } from "@/hooks/use-page-seo";

type Row = {
  id: string;
  path: string;
  title: string | null;
  description: string | null;
  og_image_url: string | null;
  noindex: boolean;
};

export default function AdminPageSeo() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [newPath, setNewPath] = useState("");

  const fetchAll = async () => {
    const { data } = await (supabase as any).from("page_seo").select("*").order("path");
    setRows((data as Row[]) || []);
    setLoading(false);
  };
  useEffect(() => { fetchAll(); }, []);

  const update = (id: string, patch: Partial<Row>) =>
    setRows((p) => p.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const save = async (r: Row) => {
    const { error } = await (supabase as any).from("page_seo").update({
      title: r.title, description: r.description, og_image_url: r.og_image_url, noindex: r.noindex,
    }).eq("id", r.id);
    if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    clearPageSeoCache();
    toast({ title: "تم الحفظ" });
  };

  const remove = async (r: Row) => {
    if (!confirm("حذف هذا السجل؟")) return;
    await (supabase as any).from("page_seo").delete().eq("id", r.id);
    clearPageSeoCache();
    fetchAll();
  };

  const add = async () => {
    if (!newPath.startsWith("/")) { toast({ title: "المسار يجب أن يبدأ بـ /", variant: "destructive" }); return; }
    const { error } = await (supabase as any).from("page_seo").insert({ path: newPath, title: "", description: "" });
    if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    setNewPath(""); setAddOpen(false); fetchAll();
  };

  const uploadImg = async (r: Row, file: File) => {
    const ext = file.name.split(".").pop();
    const path = `og-${r.path.replace(/\//g, "_")}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("site-images").upload(path, file, { upsert: true });
    if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    const { data } = supabase.storage.from("site-images").getPublicUrl(path);
    update(r.id, { og_image_url: data.publicUrl });
    toast({ title: "تم الرفع. اضغط حفظ." });
  };

  if (loading) return <div className="text-center py-12">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">إعدادات SEO لكل صفحة</h1>
          <p className="text-sm text-muted-foreground mt-1">عدّل عنوان ووصف وصورة المشاركة (OG) لكل صفحة.</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus size={16} /> إضافة صفحة</Button></DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader><DialogTitle>إضافة مسار جديد</DialogTitle></DialogHeader>
            <Input dir="ltr" placeholder="/new-page" value={newPath} onChange={(e) => setNewPath(e.target.value)} />
            <Button onClick={add} className="w-full mt-3">إضافة</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {rows.map((r) => (
          <Card key={r.id}>
            <CardHeader className="pb-2"><CardTitle className="text-base" dir="ltr">{r.path}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">العنوان (Title)</label>
                <Input value={r.title || ""} onChange={(e) => update(r.id, { title: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">الوصف (Description)</label>
                <Textarea rows={2} value={r.description || ""} onChange={(e) => update(r.id, { description: e.target.value })} />
              </div>
              <div className="flex items-center gap-3">
                {r.og_image_url && <img src={r.og_image_url} alt="" className="w-20 h-12 object-cover border rounded" />}
                <div className="flex-1 space-y-2">
                  <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImg(r, e.target.files[0])} />
                  <Input dir="ltr" placeholder="رابط صورة OG" value={r.og_image_url || ""} onChange={(e) => update(r.id, { og_image_url: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={r.noindex} onCheckedChange={(v) => update(r.id, { noindex: v })} />
                <label className="text-sm">إخفاء من محركات البحث (noindex)</label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => remove(r)}><Trash2 size={14} /></Button>
                <Button size="sm" onClick={() => save(r)} className="gap-1"><Save size={14} /> حفظ</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
