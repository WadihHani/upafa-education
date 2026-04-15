import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, X, Save, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type TeamMember = {
  id: string;
  name: string;
  title: string;
  bio: string;
  image_url: string | null;
  category: string;
  sort_order: number;
};

const emptyMember: Omit<TeamMember, "id"> = {
  name: "",
  title: "",
  bio: "",
  image_url: null,
  category: "admin",
  sort_order: 0,
};

export default function AdminTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState(emptyMember);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("team_members")
      .select("*")
      .order("sort_order");
    setMembers((data as TeamMember[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyMember);
    setImageFile(null);
    setDialogOpen(true);
  };

  const openEdit = (m: TeamMember) => {
    setEditing(m);
    setForm({ name: m.name, title: m.title, bio: m.bio, image_url: m.image_url, category: m.category, sort_order: m.sort_order });
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.title.trim()) {
      toast({ title: "يرجى ملء الاسم والمنصب", variant: "destructive" });
      return;
    }
    setSaving(true);

    let imageUrl = form.image_url;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("team-images")
        .upload(path, imageFile);
      if (uploadError) {
        toast({ title: "خطأ في رفع الصورة", description: uploadError.message, variant: "destructive" });
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("team-images").getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    const payload = { ...form, image_url: imageUrl };

    if (editing) {
      const { error } = await supabase.from("team_members").update(payload).eq("id", editing.id);
      if (error) {
        toast({ title: "خطأ في التحديث", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "تم التحديث بنجاح" });
      }
    } else {
      const { error } = await supabase.from("team_members").insert(payload);
      if (error) {
        toast({ title: "خطأ في الإضافة", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "تمت الإضافة بنجاح" });
      }
    }

    setSaving(false);
    setDialogOpen(false);
    fetchMembers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    const { error } = await supabase.from("team_members").delete().eq("id", id);
    if (error) {
      toast({ title: "خطأ في الحذف", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "تم الحذف" });
      fetchMembers();
    }
  };

  if (loading) return <div className="text-center py-12">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">إدارة أعضاء الفريق</h1>
        <Button onClick={openAdd} className="gap-2">
          <Plus size={16} /> إضافة عضو
        </Button>
      </div>

      <div className="grid gap-4">
        {members.map((m) => (
          <Card key={m.id}>
            <CardContent className="flex items-center gap-4 p-4">
              {m.image_url ? (
                <img src={m.image_url} alt={m.name} className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-lg font-bold">
                  {m.name[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground">{m.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{m.title}</p>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded mt-1 inline-block">
                  {m.category === "admin" ? "إداري" : "أكاديمي"}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => openEdit(m)}>
                  <Pencil size={14} />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleDelete(m.id)} className="text-destructive hover:text-destructive">
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {members.length === 0 && (
          <p className="text-center text-muted-foreground py-12">لا يوجد أعضاء بعد. أضف عضواً جديداً.</p>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editing ? "تعديل العضو" : "إضافة عضو جديد"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">الاسم</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">المنصب</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">النبذة</label>
              <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">التصنيف</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="admin">إداري</option>
                <option value="academic">أكاديمي</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">الترتيب</label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">الصورة</label>
              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              {form.image_url && !imageFile && (
                <img src={form.image_url} alt="" className="w-16 h-16 rounded-full object-cover mt-2" />
              )}
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
