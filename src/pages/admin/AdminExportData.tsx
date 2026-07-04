import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Download, Database, Loader2, Users } from "lucide-react";

const TABLES = [
  "profiles", "user_roles", "kuliyat", "programs", "program_courses",
  "courses", "enrollments", "course_meetings", "course_messages",
  "lecture_materials", "lecture_recordings", "assessments",
  "assessment_submissions", "grades", "attendance_records", "student_notes",
  "conferences", "news_categories", "news_posts", "hero_slides", "nav_items",
  "portal_items", "site_content", "page_seo", "team_members",
  "mofadla_programs", "mofadla_applications", "mofadla_application_grades",
  "mofadla_application_preferences", "mofadla_quick_registrations",
  "contact_submissions", "email_send_log", "email_send_state",
  "email_unsubscribe_tokens", "suppressed_emails",
];

const CHUNK_SIZE = 1000;

async function fetchChunk(table: string, offset: number, includeHeader: boolean) {
  const { data: { session } } = await supabase.auth.getSession();
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-table-csv`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${session?.access_token ?? ""}`,
    },
    body: JSON.stringify({
      table, offset, limit: CHUNK_SIZE,
      include_header: includeHeader,
      order_by: "",
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `HTTP ${res.status}`);
  }
  return {
    csv: await res.text(),
    hasMore: res.headers.get("x-has-more") === "1",
    nextOffset: Number(res.headers.get("x-next-offset") ?? 0),
    rowCount: Number(res.headers.get("x-row-count") ?? 0),
  };
}

async function exportTable(table: string, onProgress: (msg: string) => void) {
  const parts: string[] = [];
  let offset = 0;
  let totalRows = 0;
  let first = true;
  while (true) {
    onProgress(`${table}: تحميل من ${offset}...`);
    const { csv, hasMore, nextOffset, rowCount } = await fetchChunk(table, offset, first);
    if (csv) parts.push(csv);
    totalRows += rowCount;
    first = false;
    if (!hasMore) break;
    offset = nextOffset;
  }
  const blob = new Blob([parts.join("")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${table}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
  return totalRows;
}

export default function AdminExportData() {
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  const runOne = async (t: string) => {
    setBusy(t);
    setStatus("");
    try {
      const n = await exportTable(t, setStatus);
      toast({ title: `تم تصدير ${t}`, description: `${n} صف` });
    } catch (e: any) {
      toast({ title: `فشل تصدير ${t}`, description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
      setStatus("");
    }
  };

  const runAll = async () => {
    setBusy("__all__");
    try {
      for (const t of TABLES) {
        try {
          const n = await exportTable(t, setStatus);
          setStatus(`تم ${t} (${n})`);
        } catch (e: any) {
          setStatus(`فشل ${t}: ${e.message}`);
        }
      }
      toast({ title: "اكتمل تصدير جميع الجداول" });
    } finally {
      setBusy(null);
      setStatus("");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">تصدير قاعدة البيانات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            تنزيل بيانات الجداول كملفات CSV. يتم التحميل على دفعات ({CHUNK_SIZE} صف/دفعة) ثم دمجها في ملف واحد لكل جدول.
          </p>
        </div>
        <Button onClick={runAll} disabled={busy !== null} className="gap-2">
          {busy === "__all__" ? <Loader2 className="animate-spin" size={16} /> : <Database size={16} />}
          تصدير كل الجداول
        </Button>
      </div>

      {status && (
        <div className="mb-4 text-sm text-muted-foreground bg-muted/40 rounded px-3 py-2">
          {status}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {TABLES.map((t) => (
          <Card key={t}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono">{t}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                onClick={() => runOne(t)}
                disabled={busy !== null}
                className="gap-1 w-full"
              >
                {busy === t ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                تنزيل CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
