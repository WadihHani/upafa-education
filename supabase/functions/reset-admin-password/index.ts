import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async () => {
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const u = list.users.find((x) => x.email === "admin@upafa.education");
  if (!u) return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
  const { error } = await admin.auth.admin.updateUserById(u.id, { password: "admin12345" });
  return new Response(JSON.stringify({ ok: !error, error: error?.message }));
});
