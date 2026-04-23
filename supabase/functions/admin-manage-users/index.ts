import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type Action =
  | { action: "list" }
  | {
      action: "create";
      email: string;
      password: string;
      full_name?: string;
      phone?: string;
      role: "student" | "teacher" | "admin";
    }
  | {
      action: "update";
      user_id: string;
      full_name?: string;
      phone?: string;
      email?: string;
      password?: string;
      role?: "student" | "teacher" | "admin";
    }
  | { action: "delete"; user_id: string };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is admin
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(
      token,
    );
    if (claimsErr || !claims?.claims?.sub) {
      return json({ error: "Unauthorized" }, 401);
    }
    const callerId = claims.claims.sub as string;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false },
    });

    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: callerId,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const body = (await req.json()) as Action;

    if (body.action === "list") {
      const { data: users, error } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      if (error) return json({ error: error.message }, 500);

      const ids = users.users.map((u) => u.id);
      const { data: roles } = await admin
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", ids);
      const { data: profiles } = await admin
        .from("profiles")
        .select("user_id, full_name, phone")
        .in("user_id", ids);

      const roleMap = new Map<string, string[]>();
      (roles ?? []).forEach((r) => {
        const arr = roleMap.get(r.user_id) ?? [];
        arr.push(r.role);
        roleMap.set(r.user_id, arr);
      });
      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.user_id, p]),
      );

      const result = users.users.map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        roles: roleMap.get(u.id) ?? [],
        full_name: profileMap.get(u.id)?.full_name ?? "",
        phone: profileMap.get(u.id)?.phone ?? "",
      }));
      return json({ users: result });
    }

    if (body.action === "create") {
      if (!body.email || !body.password || !body.role) {
        return json({ error: "البريد وكلمة المرور والدور مطلوبة" }, 400);
      }
      const { data: created, error } = await admin.auth.admin.createUser({
        email: body.email,
        password: body.password,
        email_confirm: true,
        user_metadata: { full_name: body.full_name ?? "" },
      });
      if (error) return json({ error: error.message }, 400);
      const newId = created.user!.id;

      // Update profile (auto-created by trigger) with phone if provided
      if (body.phone || body.full_name) {
        await admin.from("profiles").update({
          full_name: body.full_name ?? "",
          phone: body.phone ?? null,
        }).eq("user_id", newId);
      }

      const { error: roleErr } = await admin
        .from("user_roles")
        .insert({ user_id: newId, role: body.role });
      if (roleErr) return json({ error: roleErr.message }, 400);

      return json({ user_id: newId });
    }

    if (body.action === "update") {
      const updates: Record<string, unknown> = {};
      if (body.email) updates.email = body.email;
      if (body.password) updates.password = body.password;
      if (Object.keys(updates).length > 0) {
        const { error } = await admin.auth.admin.updateUserById(
          body.user_id,
          updates,
        );
        if (error) return json({ error: error.message }, 400);
      }
      if (body.full_name !== undefined || body.phone !== undefined) {
        await admin.from("profiles").update({
          ...(body.full_name !== undefined && { full_name: body.full_name }),
          ...(body.phone !== undefined && { phone: body.phone }),
        }).eq("user_id", body.user_id);
      }
      if (body.role) {
        await admin.from("user_roles").delete().eq("user_id", body.user_id);
        await admin
          .from("user_roles")
          .insert({ user_id: body.user_id, role: body.role });
      }
      return json({ ok: true });
    }

    if (body.action === "delete") {
      if (body.user_id === callerId) {
        return json({ error: "لا يمكنك حذف حسابك" }, 400);
      }
      const { error } = await admin.auth.admin.deleteUser(body.user_id);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
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