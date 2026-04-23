import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Users as UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ManagedUser = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  roles: string[];
  created_at: string;
};

type Role = "student" | "teacher" | "admin";

const ROLE_LABEL: Record<Role, string> = {
  student: "طالب",
  teacher: "أعضاء الهيئة التدريسية",
  admin: "مسؤول",
};

// Roles the admin can assign when creating/editing users
const ASSIGNABLE_ROLES: Role[] = ["student", "teacher"];

export default function AdminUsers() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Role>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    role: "student" as Role,
  });

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke(
      "admin-manage-users",
      { body: { action: "list" } },
    );
    if (error) {
      toast({
        title: "خطأ في تحميل المستخدمين",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setUsers(data?.users ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({
      email: "",
      password: "",
      full_name: "",
      phone: "",
      role: "student",
    });
    setDialogOpen(true);
  };

  const openEdit = (u: ManagedUser) => {
    setEditing(u);
    setForm({
      email: u.email,
      password: "",
      full_name: u.full_name,
      phone: u.phone,
      role: (u.roles[0] as Role) ?? "student",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        const payload: Record<string, unknown> = {
          action: "update",
          user_id: editing.id,
          full_name: form.full_name,
          phone: form.phone,
          role: form.role,
        };
        if (form.email && form.email !== editing.email) payload.email = form.email;
        if (form.password) payload.password = form.password;
        const { data, error } = await supabase.functions.invoke(
          "admin-manage-users",
          { body: payload },
        );
        if (error || data?.error) throw new Error(data?.error || error?.message);
        toast({ title: "تم تحديث المستخدم بنجاح" });
      } else {
        const { data, error } = await supabase.functions.invoke(
          "admin-manage-users",
          {
            body: {
              action: "create",
              email: form.email,
              password: form.password,
              full_name: form.full_name,
              phone: form.phone,
              role: form.role,
            },
          },
        );
        if (error || data?.error) throw new Error(data?.error || error?.message);
        toast({ title: "تم إنشاء المستخدم بنجاح" });
      }
      setDialogOpen(false);
      await fetchUsers();
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: err.message ?? String(err),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (u: ManagedUser) => {
    if (!confirm(`حذف المستخدم ${u.email}؟`)) return;
    const { data, error } = await supabase.functions.invoke(
      "admin-manage-users",
      { body: { action: "delete", user_id: u.id } },
    );
    if (error || data?.error) {
      toast({
        title: "خطأ في الحذف",
        description: data?.error || error?.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "تم حذف المستخدم" });
    fetchUsers();
  };

  const filtered = filter === "all"
    ? users
    : users.filter((u) => u.roles.includes(filter));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
          <p className="text-sm text-muted-foreground mt-1">
            إنشاء حسابات الطلاب والأساتذة وإدارة بياناتهم
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus size={16} /> إضافة مستخدم
        </Button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {(["all", "student", "teacher"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "الكل" : ROLE_LABEL[f]} (
            {f === "all"
              ? users.length
              : users.filter((u) => u.roles.includes(f)).length}
            )
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <UsersIcon className="mx-auto mb-3 opacity-40" size={40} />
            لا يوجد مستخدمون
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((u) => (
            <Card key={u.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">
                      {u.full_name || "—"}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1" dir="ltr">
                      {u.email}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {u.roles.length === 0 ? (
                      <Badge variant="outline">بدون دور</Badge>
                    ) : (
                      u.roles.map((r) => (
                        <Badge key={r} variant="secondary">
                          {ROLE_LABEL[r as Role] ?? r}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {u.phone && (
                  <p className="text-sm text-muted-foreground mb-3" dir="ltr">
                    📞 {u.phone}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(u)}
                    className="gap-1"
                  >
                    <Pencil size={14} /> تعديل
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(u)}
                    className="gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 size={14} /> حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "تعديل المستخدم" : "إضافة مستخدم جديد"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                الاسم الكامل
              </label>
              <Input
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                placeholder="محمد أحمد"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                البريد الإلكتروني
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="user@example.com"
                required
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                كلمة المرور{" "}
                {editing && (
                  <span className="text-xs text-muted-foreground">
                    (اتركها فارغة لعدم التغيير)
                  </span>
                )}
              </label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required={!editing}
                minLength={6}
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                رقم الهاتف <span className="text-xs text-muted-foreground">(اختياري)</span>
              </label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+963..."
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">الدور</label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as Role })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSIGNABLE_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "جارٍ الحفظ..." : editing ? "حفظ" : "إنشاء"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}