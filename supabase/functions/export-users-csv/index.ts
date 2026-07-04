// Admin-only combined users export.
// GET/POST -> text/csv with columns from auth.users + profiles + aggregated roles.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

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

    // Fetch profiles + roles in bulk.
    const [profilesRes, rolesRes] = await Promise.all([
      admin.from("profiles").select("*"),
      admin.from("user_roles").select("user_id, role"),
    ]);
    if (profilesRes.error) return json({ error: profilesRes.error.message }, 500);
    if (rolesRes.error) return json({ error: rolesRes.error.message }, 500);

    const rolesByUser = new Map<string, string[]>();
    for (const r of rolesRes.data ?? []) {
      const arr = rolesByUser.get(r.user_id) ?? [];
      arr.push(r.role);
      rolesByUser.set(r.user_id, arr);
    }
    const profileByUser = new Map<string, Record<string, unknown>>();
    for (const p of profilesRes.data ?? []) {
      if (p.user_id) profileByUser.set(p.user_id, p);
    }

    // Page through auth.users.
    const authUsers: any[] = [];
    let page = 1;
    const perPage = 1000;
    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) return json({ error: error.message }, 500);
      const users = data?.users ?? [];
      authUsers.push(...users);
      if (users.length < perPage) break;
      page++;
      if (page > 100) break; // safety
    }

    const profileColumns = Array.from(
      new Set((profilesRes.data ?? []).flatMap((p) => Object.keys(p))),
    ).filter((c) => c !== "user_id");

    const authColumns = [
      "id", "email", "phone", "created_at", "last_sign_in_at",
      "email_confirmed_at", "phone_confirmed_at", "banned_until",
      "providers", "provider_ids",
    ];

    const header = [
      ...authColumns,
      "roles",
      ...profileColumns.map((c) => `profile_${c}`),
    ];

    const lines: string[] = [header.map(csvEscape).join(",")];

    for (const u of authUsers) {
      const providers = (u.app_metadata?.providers ?? []) as string[];
      const profile = profileByUser.get(u.id) ?? {};
      const roles = (rolesByUser.get(u.id) ?? []).join("|");
      const row: unknown[] = [
        u.id,
        u.email ?? "",
        u.phone ?? "",
        u.created_at ?? "",
        u.last_sign_in_at ?? "",
        u.email_confirmed_at ?? "",
        u.phone_confirmed_at ?? "",
        u.banned_until ?? "",
        providers.join("|"),
        (u.identities ?? []).map((i: any) => `${i.provider}:${i.id}`).join("|"),
        roles,
        ...profileColumns.map((c) => (profile as any)[c] ?? ""),
      ];
      lines.push(row.map(csvEscape).join(","));
    }

    const csv = lines.join("\n") + "\n";
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    return new Response(csv, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="users_${stamp}.csv"`,
        "x-row-count": String(authUsers.length),
      },
    });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
