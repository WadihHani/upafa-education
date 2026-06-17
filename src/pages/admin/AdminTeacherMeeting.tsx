import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Save, Video } from "lucide-react";
import { clearSiteContentCache } from "@/hooks/use-site-content";

const KEY = "teacher_meeting_room";

export default function AdminTeacherMeeting() {
  const [title, setTitle] = useState("قاعة الاجتماعات");
  const [content, setContent] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("site_content")
        .select("title, content, link_url")
        .eq("section_key", KEY)
        .maybeSingle();
      if (data) {
        setTitle(data.title || "قاعة الاجتماعات");
        setContent(data.content || "");
        setLinkUrl(data.link_url || "");
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await (supabase as any)
      .from("site_content")
      .upsert(
        { section_key: KEY, title, content, link_url: linkUrl },
        { onConflict: "section_key" }
      );
    setSaving(false);
    if (error) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
      return;
    }
    clearSiteContentCache();
    toast({ title: "✅ تم الحفظ" });
  };

  if (loading) return <div className="text-center py-12">جاري التحميل...</div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Video className="text-primary" size={24} />
        <h1 className="text-2xl font-bold">قاعة الاجتماعات — بوابة الأساتذة</h1>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">عنوان البطاقة</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">وصف / ملاحظات</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="مثال: اجتماع كل يوم أحد الساعة 8 مساءً"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">رابط الاجتماع (Zoom / Meet / Teams)</label>
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              dir="ltr"
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
            />
            <p className="text-xs text-muted-foreground mt-1">
              عند ترك الحقل فارغاً ستظهر رسالة "لم يُحدَّد رابط بعد" للأساتذة.
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save size={16} />
            {saving ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
