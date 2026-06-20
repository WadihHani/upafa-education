import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Clock, GraduationCap, ChevronDown } from "lucide-react";

type Course = {
  id: string;
  program_slug: string;
  program_name: string;
  level: string;
  year: number;
  semester: number | null;
  code: string;
  title_ar: string;
  credit_hours: number;
  prerequisite: string;
  description: string;
};

type Program = {
  slug: string;
  name: string;
  totalCourses: number;
  totalHours: number;
};

type Props = { level: "bachelor" | "master" | "phd" };

export default function ProgramCoursesSection({ level }: Props) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("program_courses")
        .select("*")
        .eq("level", level)
        .order("program_slug")
        .order("year")
        .order("sort_order");
      const list = (data ?? []) as Course[];
      setCourses(list);
      const map = new Map<string, Program>();
      list.forEach((c) => {
        const p = map.get(c.program_slug) ?? {
          slug: c.program_slug,
          name: c.program_name,
          totalCourses: 0,
          totalHours: 0,
        };
        p.totalCourses += 1;
        p.totalHours += Number(c.credit_hours || 0);
        map.set(c.program_slug, p);
      });
      setPrograms(Array.from(map.values()));
      setLoading(false);
    })();
  }, [level]);

  if (loading) {
    return (
      <div className="bg-card rounded-xl shadow-lg p-8 border border-border/50 mb-8 text-center text-muted-foreground">
        جاري تحميل المقررات...
      </div>
    );
  }

  if (programs.length === 0) return null;

  return (
    <div className="bg-card rounded-xl shadow-lg p-6 md:p-8 border border-border/50 mb-8">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="text-primary" size={22} />
        <h2 className="text-2xl font-bold text-foreground">مقررات الأقسام</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        اضغط على أي برنامج لعرض جميع مقرراته موزعة حسب السنة الدراسية.
      </p>

      <div className="space-y-3">
        {programs.map((p) => {
          const isOpen = openSlug === p.slug;
          const programCourses = courses.filter((c) => c.program_slug === p.slug);
          const years = Array.from(new Set(programCourses.map((c) => c.year))).sort();
          return (
            <div key={p.slug} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenSlug(isOpen ? null : p.slug)}
                className="w-full flex items-center justify-between gap-3 p-4 bg-muted/30 hover:bg-muted/50 transition-colors text-right"
              >
                <div className="flex items-center gap-3 flex-1">
                  <GraduationCap className="text-primary shrink-0" size={20} />
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">{p.name}</h3>
                    <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
                      <span>{p.totalCourses} مقرر</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {p.totalHours} ساعة معتمدة</span>
                    </div>
                  </div>
                </div>
                <ChevronDown
                  className={`text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  size={18}
                />
              </button>

              {isOpen && (
                <div className="p-4 space-y-6 bg-background">
                  {years.map((year) => {
                    const yearCourses = programCourses.filter((c) => c.year === year);
                    return (
                      <div key={year}>
                        <h4 className="text-sm font-bold text-primary mb-3 pb-2 border-b border-border">
                          السنة {["", "الأولى", "الثانية", "الثالثة", "الرابعة"][year] || year}
                        </h4>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {yearCourses.map((c) => (
                            <div
                              key={c.id}
                              className="border border-border rounded-lg p-3 bg-card hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h5 className="font-semibold text-foreground text-sm leading-snug flex-1">
                                  {c.title_ar}
                                </h5>
                                {c.code && (
                                  <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0">
                                    {c.code}
                                  </span>
                                )}
                              </div>
                              {c.description && (
                                <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-3">
                                  {c.description}
                                </p>
                              )}
                              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/50">
                                <span className="flex items-center gap-1">
                                  <Clock size={11} /> {c.credit_hours} ساعة
                                </span>
                                {c.prerequisite && (
                                  <span className="text-accent">متطلب: {c.prerequisite}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
