import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Pencil, Trash2, GraduationCap } from "lucide-react";

type Branch = "scientific" | "literary" | "both" | "industrial" | "vocational" | "arts" | "sharia";

type Program = {
  id: string;
  name: string;
  faculty: string;
  description: string;
  seats: number;
  min_score: number;
  required_branch: Branch;
  is_open: boolean;
  sort_order: number;
};

const empty = {
  name: "",
  faculty: "",
  description: "",
  seats: 0,
  min_score: 0,
  required_branch: "both" as Branch,
  is_open: true,
  sort_order: 0,
};

const branchLabel = (b: Branch) =>
  b === "scientific" ? "علمي"
  : b === "literary" ? "أدبي"
  : b === "industrial" ? "صناعي"
  : b === "vocational" ? "مهني"
  : b === "arts" ? "فني"
  : b === "sharia" ? "شرعي"
  : "علمي + أدبي";

export default function AdminMofadlaPrograms() {
  const [items, setItems] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("mofadla_programs")
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

  const openEdit = (p: Program) => {
    setEditing(p);
    setForm({
      name: p.name,
      faculty: p.faculty,
      description: p.description,
      seats: p.seats,
      min_score: Number(p.min_score),
      required_branch: p.required_branch,
      is_open: p.is_open,
      sort_order: p.sort_order,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast({ title: "الاسم مطلوب", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = { ...form, name: form.name.trim(), faculty: form.faculty.trim() };
    const { error } = editing
      ? await supabase.from("mofadla_programs").update(payload).eq("id", editing.id)
      : await supabase.from("mofadla_programs").insert(payload);
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
    if (!confirm("حذف هذا البرنامج؟")) return;
    const { error } = await supabase.from("mofadla_programs").delete().eq("id", id);
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
          <h1 className="text-2xl font-bold">برامج المفاضلة</h1>
          <p className="text-sm text-muted-foreground mt-1">
            البرامج التي يمكن للطلاب التقديم عليها — حدّد عدد المقاعد والحد الأدنى للعلامة والفرع المطلوب.
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus size={16} /> إضافة برنامج
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <GraduationCap className="mx-auto mb-3 opacity-40" size={40} />
            لا توجد برامج بعد. ابدأ بإضافة برنامج.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-primary">{p.name}</h3>
                    {p.is_open ? (
                      <Badge variant="secondary" className="text-[10px]">مفتوح</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">مغلق</Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">
                      {branchLabel(p.required_branch)}
                    </Badge>
                  </div>
                  {p.faculty && (
                    <p className="text-xs text-muted-foreground mt-1">{p.faculty}</p>
                  )}
                  <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                    <span>المقاعد: <strong className="text-foreground">{p.seats}</strong></span>
                    <span>الحد الأدنى: <strong className="text-foreground">{Number(p.min_score)}</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل البرنامج" : "إضافة برنامج"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">اسم البرنامج *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                maxLength={200}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">الكلية / القسم</label>
              <Input
                value={form.faculty}
                onChange={(e) => setForm({ ...form, faculty: e.target.value })}
                maxLength={200}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">الوصف</label>
              <Textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                maxLength={1000}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">عدد المقاعد</label>
                <Input
                  type="number"
                  min={0}
                  value={form.seats}
                  onChange={(e) => setForm({ ...form, seats: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">الحد الأدنى</label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.min_score}
                  onChange={(e) => setForm({ ...form, min_score: parseFloat(e.target.value) || 0 })}
                />
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
            <div>
              <label className="text-sm font-medium mb-1 block">الفرع المطلوب</label>
              <Select
                value={form.required_branch}
                onValueChange={(v) => setForm({ ...form, required_branch: v as Branch })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">علمي + أدبي</SelectItem>
                  <SelectItem value="scientific">علمي</SelectItem>
                  <SelectItem value="literary">أدبي</SelectItem>
                  <SelectItem value="industrial">صناعي</SelectItem>
                  <SelectItem value="vocational">مهني</SelectItem>
                  <SelectItem value="arts">فني</SelectItem>
                  <SelectItem value="sharia">شرعي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between bg-muted/40 rounded-md px-3 py-2">
              <span className="text-sm">مفتوح للتقديم</span>
              <Switch
                checked={form.is_open}
                onCheckedChange={(v) => setForm({ ...form, is_open: v })}
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
