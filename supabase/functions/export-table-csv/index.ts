// Admin-only chunked CSV exporter.
// POST { table: string, offset?: number, limit?: number, order_by?: string }
// Returns text/csv for the requested chunk. Call repeatedly with increasing offset
// (limit stays the same) until you receive fewer rows than `limit` (or an empty body
// with header `x-row-count: 0`). Combine the resulting files client-side.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Expose-Headers": "x-row-count, x-has-more, x-next-offset",
};

const DEFAULT_LIMIT = 1000;
const MAX_LIMIT = 10000;

// Whitelist of tables the admin may export. Extend as needed.
const ALLOWED_TABLES = new Set<string>([
  "assessment_submissions",
  "assessments",
  "attendance_records",
  "conferences",
  "contact_submissions",
  "course_meetings",
  "course_messages",
  "courses",
  "email_send_log",
  "email_send_state",
  "email_unsubscribe_tokens",
  "enrollments",
  "grades",
  "hero_slides",
  "kuliyat",
  "lecture_materials",
  "lecture_recordings",
  "mofadla_application_grades",
  "mofadla_application_preferences",
  "mofadla_applications",
  "mofadla_programs",
  "mofadla_quick_registrations",
  "nav_items",
  "news_categories",
  "news_posts",
  "page_seo",
  "portal_items",
  "profiles",
  "program_courses",
  "programs",
  "site_content",
  "student_notes",
  "suppressed_emails",
  "team_members",
  "user_roles",
]);

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  let s: string;
  if (typeof v === "object") {
    try { s = JSON.stringify(v); } catch { s = String(v); }
  } else {
    s = String(v);
  }
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows: Record<string, unknown>[], includeHeader: boolean): string {
  if (rows.length === 0) return includeHeader ? "" : "";
  const cols = Object.keys(rows[0]);
  const lines: string[] = [];
  if (includeHeader) lines.push(cols.map(csvEscape).join(","));
  for (const r of rows) lines.push(cols.map((c) => csvEscape(r[c])).join(","));
  return lines.join("\n") + "\n";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData?.user?.id) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const table = String(body.table ?? "").trim();
    const offset = Math.max(0, Number(body.offset ?? 0) | 0);
    const rawLimit = Number(body.limit ?? DEFAULT_LIMIT) | 0;
    const limit = Math.min(MAX_LIMIT, Math.max(1, rawLimit));
    const orderBy = String(body.order_by ?? "").trim();
    const includeHeader = body.include_header !== false; // default true
    const wantMeta = body.meta === true;

    if (!ALLOWED_TABLES.has(table)) {
      return json({ error: `Table not allowed: ${table}` }, 400);
    }

    if (wantMeta) {
      const { count, error } = await admin
        .from(table)
        .select("*", { count: "exact", head: true });
      if (error) return json({ error: error.message }, 500);
      return json({
        table,
        total: count ?? 0,
        chunks: Math.ceil((count ?? 0) / limit),
        limit,
      });
    }

    let q = admin.from(table).select("*").range(offset, offset + limit - 1);
    if (orderBy) {
      // Support "col" or "col.desc"
      const [col, dir] = orderBy.split(".");
      q = q.order(col, { ascending: dir !== "desc" });
    }
    const { data, error } = await q;
    if (error) return json({ error: error.message }, 500);

    const rows = (data ?? []) as Record<string, unknown>[];
    const csv = toCsv(rows, includeHeader);
    const hasMore = rows.length === limit;

    return new Response(csv, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${table}_${offset}_${offset + rows.length}.csv"`,
        "x-row-count": String(rows.length),
        "x-has-more": hasMore ? "1" : "0",
        "x-next-offset": String(offset + rows.length),
      },
    });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }

  function json(payload: unknown, status = 200) {
    return new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
