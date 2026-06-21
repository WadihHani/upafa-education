import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type KuliyaLite = { id: string; name: string; slug: string };

export function useKuliyat() {
  const [kuliyat, setKuliyat] = useState<KuliyaLite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("kuliyat")
      .select("id, name, slug")
      .eq("is_published", true)
      .order("display_order", { ascending: true })
      .then(({ data }) => {
        setKuliyat((data ?? []) as KuliyaLite[]);
        setLoading(false);
      });
  }, []);

  return { kuliyat, loading };
}
