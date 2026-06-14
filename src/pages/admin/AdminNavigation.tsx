import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Save, Trash2 } from "lucide-react";
import { clearNavCache } from "@/hooks/use-nav-items";

type Item = {
  id: string;
  location: string;
  parent_id: string | null;
  label: string;
  href: string;
  sort_order: number;
  is_active: boolean;
};

const LOCATIONS = [
  { key: "navbar", label: "شريط القائمة العلوي" },
  { key: "footer_quick", label: "الفوتر - روابط سريعة" },
];

export default function AdminNavigation() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("navbar");
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ label: "", href: "", parent_id: "", sort_order: 0 });

  const fetchAll = async () => {
    const { data } = await (supabase as any).from("nav_items").select("*").order("sort_order");
    setItems((data as Item[]) || []);
    setLoading(false);
  };
  useEffect(() => { fetchAll(); }, []);

  const update = (id: string, patch: Partial<Item>) =>
    setItems((p) => p.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const save = async (it: Item) => {
    const { error } = await (supabase as any).from("nav_items").update({
      label: it.label, href: it.href, sort_order: it.sort_order, is_active: it.is_active, parent_id: it.parent_id,
    }).eq("id", it.id);
    if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    clearNavCache();
    toast({ title: "تم الحفظ" });
  };

  const remove = async (it: Item) => {
    if (!confirm("حذف هذا الرابط؟ سيتم حذف القوائم الفرعية أيضاً.")) return;
    await (supabase as any).from("nav_items").delete().eq("id", it.id);
    clearNavCache();
    fetchAll();
  };

  const add = async () => {
    if (!form.label.trim() || !form.href.trim()) { toast({ title: "العنوان والرابط مطلوبان", variant: "destructive" }); return; }
    const { error } = await (supabase as any).from("nav_items").insert({
      location: active,
      parent_id: form.parent_id || null,
      label: form.label,
      href: form.href,
      sort_order: form.sort_order,
      is_active: true,
    });
    if (error) { toast({ title: "خطأ", description: error.message, variant: "destructive" }); return; }
    clearNavCache();
    setForm({ label: "", href: "", parent_id: "", sort_order: 0 });
    setAddOpen(false);
    fetchAll();
  };

  if (loading) return <div className="text-center py-12">جاري التحميل...</div>;

  const inLoc = items.filter((i) => i.location === active);
  const roots = inLoc.filter((i) => !i.parent_id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">إدارة القوائم والروابط</h1>
          <p className="text-sm text-muted-foreground mt-1">عدّل روابط شريط القائمة والفوتر.</p>
        </div>
      </div>

      <Tabs value={active} onValueChange={setActive} dir="rtl">
        <TabsList>
          {LOCATIONS.map((l) => (
            <TabsTrigger key={l.key} value={l.key}>{l.label}</TabsTrigger>
          ))}
        </TabsList>
        {LOCATIONS.map((l) => (
          <TabsContent key={l.key} value={l.key} className="mt-4">
            <div className="flex justify-end mb-4">
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus size={16} /> إضافة رابط</Button>
                </DialogTrigger>
                <DialogContent dir="rtl">
                  <DialogHeader><DialogTitle>إضافة رابط جديد</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div><label className="text-sm">العنوان</label><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} /></div>
                    <div><label className="text-sm">الرابط</label><Input dir="ltr" value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} placeholder="/about" /></div>
                    {active === "navbar" && (
                      <div>
                        <label className="text-sm">قائمة فرعية ضمن (اختياري)</label>
                        <Select value={form.parent_id || "__none__"} onValueChange={(v) => setForm({ ...form, parent_id: v === "__none__" ? "" : v })}>
                          <SelectTrigger><SelectValue placeholder="رابط رئيسي" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">— رابط رئيسي —</SelectItem>
                            {roots.map((r) => (<SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div><label className="text-sm">الترتيب</label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
                    <Button onClick={add} className="w-full">إضافة</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {roots.map((root) => {
                const children = inLoc.filter((c) => c.parent_id === root.id);
                return (
                  <Card key={root.id}>
                    <CardContent className="p-4 space-y-3">
                      <Row it={root} onChange={(p) => update(root.id, p)} onSave={() => save(root)} onDelete={() => remove(root)} />
                      {children.length > 0 && (
                        <div className="pr-6 border-r-2 border-muted space-y-2">
                          {children.map((c) => (
                            <Row key={c.id} it={c} onChange={(p) => update(c.id, p)} onSave={() => save(c)} onDelete={() => remove(c)} compact />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function Row({ it, onChange, onSave, onDelete, compact }: { it: Item; onChange: (p: Partial<Item>) => void; onSave: () => void; onDelete: () => void; compact?: boolean }) {
  return (
    <div className={`grid grid-cols-12 gap-2 items-center ${compact ? "text-sm" : ""}`}>
      <Input className="col-span-4" value={it.label} onChange={(e) => onChange({ label: e.target.value })} placeholder="العنوان" />
      <Input className="col-span-4" dir="ltr" value={it.href} onChange={(e) => onChange({ href: e.target.value })} placeholder="/path" />
      <Input className="col-span-1" type="number" value={it.sort_order} onChange={(e) => onChange({ sort_order: Number(e.target.value) })} />
      <div className="col-span-1 flex items-center justify-center"><Switch checked={it.is_active} onCheckedChange={(v) => onChange({ is_active: v })} /></div>
      <Button size="icon" variant="outline" className="col-span-1" onClick={onSave}><Save size={14} /></Button>
      <Button size="icon" variant="outline" className="col-span-1 text-destructive" onClick={onDelete}><Trash2 size={14} /></Button>
    </div>
  );
}
