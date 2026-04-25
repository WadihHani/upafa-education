// Check DNS records for the email subdomain via Google DoH
// Public function — no JWT required (admin auth handled by client route guard)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EXPECTED_NS = ["ns3.lovable.cloud", "ns4.lovable.cloud"];

type DohAnswer = { name: string; type: number; TTL: number; data: string };

async function dohQuery(name: string, type: string): Promise<DohAnswer[]> {
  const url = `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`;
  const res = await fetch(url, { headers: { accept: "application/dns-json" } });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.Answer ?? []) as DohAnswer[];
}

function normalize(host: string) {
  return host.replace(/\.$/, "").toLowerCase();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const domain = url.searchParams.get("domain") ?? "notify.upafa.education";

    const [ns, mx, txtSpf, dkim, cname, a] = await Promise.all([
      dohQuery(domain, "NS"),
      dohQuery(domain, "MX"),
      dohQuery(domain, "TXT"),
      dohQuery(`lovable._domainkey.${domain}`, "TXT"),
      dohQuery(domain, "CNAME"),
      dohQuery(domain, "A"),
    ]);

    const nsRecords = ns.map((r) => normalize(r.data));
    const expectedSet = new Set(EXPECTED_NS.map(normalize));
    const foundExpected = EXPECTED_NS.filter((e) => nsRecords.includes(normalize(e)));
    const unexpectedNs = nsRecords.filter((n) => !expectedSet.has(n));

    const allExpectedPresent = foundExpected.length === EXPECTED_NS.length;
    const noConflicts = unexpectedNs.length === 0;
    const delegated = allExpectedPresent && noConflicts;

    let status: "active" | "partial" | "missing" | "conflict";
    if (delegated) status = "active";
    else if (foundExpected.length > 0 && unexpectedNs.length > 0) status = "conflict";
    else if (foundExpected.length > 0) status = "partial";
    else status = "missing";

    return new Response(
      JSON.stringify({
        domain,
        status,
        checkedAt: new Date().toISOString(),
        expectedNameservers: EXPECTED_NS,
        detected: {
          ns: nsRecords,
          mx: mx.map((r) => r.data),
          txt: txtSpf.map((r) => r.data.replace(/^"|"$/g, "")),
          dkim: dkim.map((r) => r.data.replace(/^"|"$/g, "")),
          cname: cname.map((r) => r.data),
          a: a.map((r) => r.data),
        },
        analysis: {
          foundExpected,
          unexpectedNs,
          allExpectedPresent,
          noConflicts,
        },
      }),
      { headers: { ...corsHeaders, "content-type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } },
    );
  }
});
