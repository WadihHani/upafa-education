import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, ArrowLeft } from "lucide-react";
import Seo from "@/components/Seo";
import EditableText from "@/components/editor/EditableText";
import { supabase } from "@/integrations/supabase/client";

type Faculty = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string;
  bachelor_departments: string[];
  master_departments: string[];
  display_order: number;
};

const COLORS = [
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-sky-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-sky-600",
  "from-fuchsia-500 to-pink-600",
  "from-indigo-500 to-blue-600",
  "from-lime-500 to-green-600",
];

export default function Faculties() {
  const [list, setList] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("kuliyat")
        .select("id, slug, name, description, image_url, bachelor_departments, master_departments, display_order")
        .eq("is_published", true)
        .order("display_order", { ascending: true });
      setList((data as Faculty[]) || []);
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <Seo
        title="الكليات والتخصصات | جامعة أفريقيا الفرنسية العربية الافتراضية"
        description="كليات جامعة أفريقيا الفرنسية العربية الافتراضية – فرع سوريا: القانون، إدارة الأعمال، العلوم النفسية والتربوية، الشريعة، الآداب، الإعلام، السياحة، العلوم السياسية، والهندسة الزراعية."
        path="/faculties"
      />
      <section className="py-16 bg-[hsl(var(--section-alt))]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <EditableText contentKey="faculties_eyebrow" fallback="جامعة أفريقيا الفرنسية العربية الافتراضية" as="p" className="text-sm font-semibold text-accent tracking-wider mb-2" />
            <EditableText contentKey="faculties_title" fallback="الكليات والتخصصات" as="h1" className="text-3xl md:text-4xl font-bold text-foreground" />
            <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
            <EditableText
              contentKey="faculties_intro"
              fallback="تضم الجامعة مجموعة من الكليات الأكاديمية المتنوعة التي تغطي مختلف ميادين المعرفة، وتقدم برامج البكالوريوس والماجستير وفق أحدث المعايير الأكاديمية."
              as="p"
              className="text-foreground/70 max-w-2xl mx-auto mt-6 leading-[2]"
            />
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">جاري التحميل…</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((f, i) => {
                const color = COLORS[i % COLORS.length];
                return (
                  <Link
                    key={f.id}
                    to={`/faculties/${f.slug}`}
                    className="group bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-border/50 flex flex-col"
                  >
                    {f.image_url ? (
                      <div className="h-40 overflow-hidden">
                        <img src={f.image_url} alt={f.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                      </div>
                    ) : (
                      <div className={`h-32 bg-gradient-to-br ${color} flex items-center justify-center`}>
                        <GraduationCap className="text-white" size={56} />
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-foreground mb-2">{f.name}</h3>
                      {f.description && <p className="text-sm text-foreground/70 mb-4 line-clamp-3">{f.description}</p>}
                      <div className="text-xs text-muted-foreground mb-4 space-y-1">
                        {f.bachelor_departments?.length > 0 && (
                          <div>• {f.bachelor_departments.length} اختصاص بكالوريوس</div>
                        )}
                        {f.master_departments?.length > 0 && (
                          <div>• {f.master_departments.length} اختصاص ماجستير</div>
                        )}
                      </div>
                      <span className="mt-auto text-sm font-semibold text-accent inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        التفاصيل <ArrowLeft size={14} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
