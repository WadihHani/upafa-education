import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Trash2, Eye, ArrowLeft, Loader2 } from "lucide-react";

type Submission = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function AdminContactSubmissions() {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  async function markRead(id: string) {
    await supabase.from("contact_submissions").update({ is_read: true }).eq("id", id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_read: true } : i)));
    if (selected?.id === id) setSelected((s) => (s ? { ...s, is_read: true } : s));
  }

  async function deleteItem(id: string) {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await supabase.from("contact_submissions").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  const unreadCount = items.filter((i) => !i.is_read).length;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">رسائل اتصل بنا</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} رسائل غير مقروءة` : "لا توجد رسائل جديدة"}
          </p>
        </div>
        <Link to="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} />
          الرئيسية
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="animate-spin" size={16} /> جاري التحميل...
            </div>
          )}
          {!loading && items.length === 0 && (
            <Card className="p-6 text-center text-muted-foreground text-sm">
              لا توجد رسائل بعد
            </Card>
          )}
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelected(item);
                if (!item.is_read) markRead(item.id);
              }}
              className={`w-full text-right p-4 rounded-lg border transition-colors ${
                selected?.id === item.id ? "bg-muted border-primary" : "bg-card hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">{item.name}</span>
                {!item.is_read && <Badge variant="default" className="text-[10px] h-5">جديد</Badge>}
              </div>
              <div className="text-xs text-muted-foreground mb-1">{item.email}</div>
              <div className="text-xs text-muted-foreground truncate">{item.subject || "(بدون موضوع)"}</div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {new Date(item.created_at).toLocaleString("ar")}
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="text-primary" size={18} />
                  </div>
                  <div>
                    <h2 className="font-bold">{selected.name}</h2>
                    <p className="text-sm text-muted-foreground">{selected.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!selected.is_read && (
                    <Button variant="outline" size="sm" onClick={() => markRead(selected.id)}>
                      <Eye size={14} className="ml-1" />
                      تحديد كمقروء
                    </Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={() => deleteItem(selected.id)}>
                    <Trash2 size={14} className="ml-1" />
                    حذف
                  </Button>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="text-sm text-muted-foreground mb-2">
                  الموضوع: <span className="font-medium text-foreground">{selected.subject || "(بدون موضوع)"}</span>
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</div>
              </div>
              <div className="text-xs text-muted-foreground text-left" dir="ltr">
                {new Date(selected.created_at).toLocaleString("ar")}
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center text-muted-foreground text-sm">
              اختر رسالة من القائمة لعرض التفاصيل
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
