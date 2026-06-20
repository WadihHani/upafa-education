import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, GraduationCap, BookOpen, Award } from "lucide-react";
import Seo from "@/components/Seo";
import { supabase } from "@/integrations/supabase/client";

type Faculty = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string;
  bachelor_departments: string[];
  master_departments: string[];
  admission_requirements: string;
  fees: string;
};

export default function FacultyDetail() {
  const { slug } = useParams();
  const [f, setF] = useState<Faculty | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("kuliyat")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      setF(data as Faculty | null);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <div className="container mx-auto py-20 text-center text-muted-foreground">جاري التحميل…</div>;
  if (!f) return (
    <div className="container mx-auto py-20 text-center">
      <p className="text-muted-foreground mb-4">الكلية غير موجودة.</p>
      <Link to="/faculties" className="text-accent font-semibold">العودة إلى الكليات</Link>
    </div>
  );

  return (
    <>
      <Seo title={`${f.name} | جامعة أفريقيا الفرنسية العربية الافتراضية`} description={f.description || f.name} path={`/faculties/${f.slug}`} />
      <section className="bg-gradient-to-l from-primary/10 to-accent/5 py-12">
        <div className="container mx-auto px-4">
          <Link to="/faculties" className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-accent mb-6">
            <ArrowRight size={16} /> العودة إلى الكليات
          </Link>
          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{f.name}</h1>
              {f.description && <p className="text-foreground/70 leading-[2] text-lg">{f.description}</p>}
            </div>
            {f.image_url && (
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img src={f.image_url} alt={f.name} className="w-full h-56 object-cover" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 space-y-8">
          {f.bachelor_departments?.length > 0 && (
            <div className="bg-card rounded-xl p-6 shadow-md border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                  <GraduationCap className="text-white" size={20} />
                </div>
                <h2 className="text-xl font-bold">الإجازة (البكالوريوس) – الأقسام</h2>
              </div>
              <ul className="grid sm:grid-cols-2 gap-2">
                {f.bachelor_departments.map((d) => (
                  <li key={d} className="flex items-center gap-2 text-foreground/80 bg-muted/40 rounded-lg px-3 py-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" /> {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {f.master_departments?.length > 0 && (
            <div className="bg-card rounded-xl p-6 shadow-md border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Award className="text-white" size={20} />
                </div>
                <h2 className="text-xl font-bold">الماجستير – الاختصاصات</h2>
              </div>
              <ul className="grid sm:grid-cols-2 gap-2">
                {f.master_departments.map((d) => (
                  <li key={d} className="flex items-center gap-2 text-foreground/80 bg-muted/40 rounded-lg px-3 py-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" /> {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(f.admission_requirements || f.fees) && (
            <div className="grid md:grid-cols-2 gap-6">
              {f.admission_requirements && (
                <div className="bg-card rounded-xl p-6 shadow-md border border-border/50">
                  <div className="flex items-center gap-3 mb-3">
                    <BookOpen className="text-accent" size={20} />
                    <h2 className="text-lg font-bold">شروط القبول</h2>
                  </div>
                  <p className="text-foreground/80 leading-[2] whitespace-pre-line">{f.admission_requirements}</p>
                </div>
              )}
              {f.fees && (
                <div className="bg-card rounded-xl p-6 shadow-md border border-border/50">
                  <div className="flex items-center gap-3 mb-3">
                    <Award className="text-accent" size={20} />
                    <h2 className="text-lg font-bold">الرسوم</h2>
                  </div>
                  <p className="text-foreground/80 leading-[2] whitespace-pre-line">{f.fees}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
