import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

type DnsResult = {
  domain: string;
  status: "active" | "partial" | "missing" | "conflict";
  checkedAt: string;
  expectedNameservers: string[];
  detected: {
    ns: string[];
    mx: string[];
    txt: string[];
    dkim: string[];
    cname: string[];
    a: string[];
  };
  analysis: {
    foundExpected: string[];
    unexpectedNs: string[];
    allExpectedPresent: boolean;
    noConflicts: boolean;
  };
};

const STATUS_META: Record<DnsResult["status"], { label: string; color: string; icon: typeof CheckCircle2 }> = {
  active: { label: "نشط — DNS مهيأ بشكل صحيح", color: "bg-green-500/10 text-green-700 border-green-500/30", icon: CheckCircle2 },
  partial: { label: "ناقص — بعض السجلات فقط مكتشفة", color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30", icon: AlertTriangle },
  conflict: { label: "تعارض — يوجد سجلات NS غير متوقعة", color: "bg-orange-500/10 text-orange-700 border-orange-500/30", icon: AlertTriangle },
  missing: { label: "غير موجود — لم يتم اكتشاف سجلات NS", color: "bg-red-500/10 text-red-700 border-red-500/30", icon: XCircle },
};

export default function AdminDnsStatus() {
  const [data, setData] = useState<DnsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const check = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("check-dns-status", {
        body: { domain: "notify.upafa.education" },
      });
      if (error) throw error;
      setData(data as DnsResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل التحقق");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    check();
  }, []);

  const meta = data ? STATUS_META[data.status] : null;
  const Icon = meta?.icon ?? Loader2;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">حالة DNS للبريد الإلكتروني</h1>
          <p className="text-sm text-muted-foreground mt-1">
            التحقق من تكوين <code className="px-1.5 py-0.5 bg-muted rounded text-xs">notify.upafa.education</code>
          </p>
        </div>
        <Button onClick={check} disabled={loading} variant="outline" className="gap-2">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          إعادة الفحص
        </Button>
      </div>

      {loading && !data ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-muted-foreground" size={32} />
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="py-6">
            <p className="text-red-700">خطأ: {error}</p>
          </CardContent>
        </Card>
      ) : data && meta ? (
        <>
          <Card className={`border-2 ${meta.color}`}>
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <Icon size={32} className="shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="text-lg font-bold">{meta.label}</h2>
                  <p className="text-sm mt-1 opacity-80">
                    آخر فحص: {new Date(data.checkedAt).toLocaleString("ar-EG")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">سجلات NS (تفويض النطاق الفرعي)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">السجلات المطلوبة:</p>
                <div className="space-y-2">
                  {data.expectedNameservers.map((ns) => {
                    const found = data.analysis.foundExpected.includes(ns);
                    return (
                      <div
                        key={ns}
                        className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                      >
                        <code className="text-sm">{ns}</code>
                        {found ? (
                          <Badge className="bg-green-500/10 text-green-700 border-green-500/30 gap-1">
                            <CheckCircle2 size={12} /> مكتشف
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/10 text-red-700 border-red-500/30 gap-1">
                            <XCircle size={12} /> مفقود
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {data.analysis.unexpectedNs.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 text-orange-700">سجلات NS غير متوقعة (تعارض):</p>
                  <div className="space-y-2">
                    {data.analysis.unexpectedNs.map((ns) => (
                      <div key={ns} className="p-3 border border-orange-500/30 bg-orange-500/5 rounded-lg">
                        <code className="text-sm">{ns}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <RecordCard title="سجلات MX" records={data.detected.mx} emptyText="لا توجد سجلات MX" />
            <RecordCard title="DKIM" records={data.detected.dkim} emptyText="لم يتم اكتشاف DKIM" />
            <RecordCard title="سجلات TXT (SPF/أخرى)" records={data.detected.txt} emptyText="لا توجد سجلات TXT" />
            <RecordCard
              title="سجلات A / CNAME"
              records={[...data.detected.a, ...data.detected.cname]}
              emptyText="لا توجد سجلات A أو CNAME"
            />
          </div>

          {data.status !== "active" && (
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">كيفية الإصلاح</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <p>
                  أضف سجلات NS التالية عند مزود النطاق (الاسم: <code className="px-1 bg-background rounded">notify</code> فقط):
                </p>
                <ul className="list-disc list-inside space-y-1 mr-4">
                  {data.expectedNameservers.map((ns) => (
                    <li key={ns}><code>{ns}</code></li>
                  ))}
                </ul>
                <p className="pt-2">
                  لا تعدّل سجلات <code>@</code> أو <code>www</code> الخاصة بالموقع. قد يستغرق الانتشار حتى 72 ساعة.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
}

function RecordCard({ title, records, emptyText }: { title: string; records: string[]; emptyText: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <ul className="space-y-1.5">
            {records.map((r, i) => (
              <li key={i} className="text-xs font-mono p-2 bg-muted rounded break-all">
                {r}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
