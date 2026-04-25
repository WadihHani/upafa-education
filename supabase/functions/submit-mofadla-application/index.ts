import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface PersonalInput {
  full_name?: string;
  national_id?: string;
  exam_number?: string;
  birth_date?: string | null;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  graduation_year?: number | null;
  last_certificate?: string;
}

interface RequestBody {
  personal: PersonalInput;
  branch: string;
  average: number;
  preferences: string[];
  notes?: string;
}

const VALID_BRANCHES = new Set([
  "scientific",
  "literary",
  "industrial",
  "vocational",
  "arts",
  "sharia",
]);

function s(v: unknown, max = 500): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as RequestBody;

    const fullName = s(body?.personal?.full_name, 200);
    const nationalId = s(body?.personal?.national_id, 50);
    const phone = s(body?.personal?.phone, 30);

    if (!fullName || !nationalId || !phone) {
      return new Response(
        JSON.stringify({ error: "البيانات الأساسية غير مكتملة" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const branch = VALID_BRANCHES.has(body?.branch) ? body.branch : "scientific";
    const average = Math.max(0, Math.min(100, Number(body?.average) || 0));
    const preferences = Array.isArray(body?.preferences)
      ? body.preferences.filter((x) => typeof x === "string").slice(0, 50)
      : [];

    const lastCert = s(body?.personal?.last_certificate, 200);
    const extraNotes = s(body?.notes, 1000);
    const combinedNotes = [
      lastCert ? `آخر شهادة: ${lastCert}` : "",
      extraNotes,
    ].filter(Boolean).join("\n");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    // Insert application
    const { data: appRow, error: appErr } = await admin
      .from("mofadla_applications")
      .insert({
        full_name: fullName,
        national_id: nationalId,
        exam_number: s(body?.personal?.exam_number, 50),
        birth_date: body?.personal?.birth_date || null,
        gender: s(body?.personal?.gender, 20),
        phone,
        email: s(body?.personal?.email, 255),
        address: s(body?.personal?.address, 500),
        branch,
        total_score: average,
        graduation_year:
          body?.personal?.graduation_year && Number.isFinite(body.personal.graduation_year)
            ? Math.trunc(body.personal.graduation_year)
            : null,
        notes: combinedNotes,
      })
      .select("id")
      .single();

    if (appErr || !appRow) {
      console.error("application insert failed", appErr);
      return new Response(
        JSON.stringify({ error: appErr?.message ?? "فشل إنشاء الطلب" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const appId = appRow.id as string;

    // Insert grade summary
    const { error: gErr } = await admin
      .from("mofadla_application_grades")
      .insert([
        {
          application_id: appId,
          subject: "المعدل العام",
          score: average,
          max_score: 100,
          sort_order: 0,
        },
      ]);
    if (gErr) console.error("grade insert failed", gErr);

    // Insert preferences
    if (preferences.length > 0) {
      const { error: pErr } = await admin
        .from("mofadla_application_preferences")
        .insert(
          preferences.map((pid, i) => ({
            application_id: appId,
            program_id: pid,
            preference_order: i + 1,
          })),
        );
      if (pErr) console.error("preferences insert failed", pErr);
    }

    // Fire-and-forget confirmation email
    const email = s(body?.personal?.email, 255);
    if (email) {
      try {
        await admin.functions.invoke("send-transactional-email", {
          body: {
            templateName: "mofadla-confirmation",
            recipientEmail: email,
            idempotencyKey: `mofadla-confirm-${appId}`,
            templateData: { fullName },
          },
        });
      } catch (emailErr) {
        console.error("confirmation email failed", emailErr);
      }
    }

    return new Response(
      JSON.stringify({ id: appId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("submit-mofadla-application error", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message ?? "خطأ غير متوقع" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
