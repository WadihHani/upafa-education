import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type State =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "already" }
  | { kind: "invalid"; message: string }
  | { kind: "submitting" }
  | { kind: "done" }
  | { kind: "error"; message: string };

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!token) {
      setState({ kind: "invalid", message: "رابط غير صالح" });
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON_KEY } }
        );
        const data = await res.json();
        if (data.valid === true) setState({ kind: "ready" });
        else if (data.reason === "already_unsubscribed") setState({ kind: "already" });
        else setState({ kind: "invalid", message: data.error ?? "رابط غير صالح" });
      } catch {
        setState({ kind: "invalid", message: "تعذر التحقق من الرابط" });
      }
    })();
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setState({ kind: "submitting" });
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe`,
        {
          method: "POST",
          headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        }
      );
      const data = await res.json();
      if (data.success) setState({ kind: "done" });
      else if (data.reason === "already_unsubscribed") setState({ kind: "already" });
      else setState({ kind: "error", message: data.error ?? "حدث خطأ" });
    } catch {
      setState({ kind: "error", message: "تعذر إلغاء الاشتراك" });
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-4">
          {state.kind === "loading" && (
            <>
              <Loader2 className="mx-auto animate-spin text-primary" size={48} />
              <p className="text-sm text-muted-foreground">جاري التحقق...</p>
            </>
          )}
          {state.kind === "ready" && (
            <>
              <h2 className="text-xl font-bold text-primary">إلغاء الاشتراك من البريد</h2>
              <p className="text-sm text-muted-foreground">
                هل تريد فعلاً إلغاء الاشتراك من رسائلنا؟ لن تتلقى أي إشعارات بريدية بعد ذلك.
              </p>
              <Button onClick={confirm} className="w-full">
                تأكيد إلغاء الاشتراك
              </Button>
            </>
          )}
          {state.kind === "submitting" && (
            <>
              <Loader2 className="mx-auto animate-spin text-primary" size={48} />
              <p className="text-sm text-muted-foreground">جاري المعالجة...</p>
            </>
          )}
          {state.kind === "done" && (
            <>
              <CheckCircle2 className="mx-auto text-accent" size={56} />
              <h2 className="text-xl font-bold text-primary">تم إلغاء الاشتراك</h2>
              <p className="text-sm text-muted-foreground">
                لن تتلقى المزيد من رسائل البريد الإلكتروني منا.
              </p>
            </>
          )}
          {state.kind === "already" && (
            <>
              <CheckCircle2 className="mx-auto text-accent" size={56} />
              <h2 className="text-xl font-bold text-primary">سبق إلغاء الاشتراك</h2>
              <p className="text-sm text-muted-foreground">
                هذا البريد الإلكتروني غير مشترك بالفعل.
              </p>
            </>
          )}
          {(state.kind === "invalid" || state.kind === "error") && (
            <>
              <AlertCircle className="mx-auto text-destructive" size={56} />
              <h2 className="text-xl font-bold text-primary">حدث خطأ</h2>
              <p className="text-sm text-muted-foreground">{state.message}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
