import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, BookOpen, Newspaper } from "lucide-react";
import { getNewsIcon } from "@/lib/news-icons";

type Category = {
  id: string;
  key: string;
  title: string;
  icon_name: string;
  is_highlighted: boolean;
};

export default function AnnouncementsBoard() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("news_categories")
        .select("id,key,title,icon_name,is_highlighted")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      setCategories(data ?? []);
    })();
  }, []);

  return (
    <section
      aria-labelledby="announcements-heading"
      className="py-12 md:py-16 bg-section-alt-bg section-alt-bg"
      dir="rtl"
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Intro */}
          <div className="lg:col-span-2 space-y-4">
            <span className="inline-block bg-accent/15 text-primary text-xs font-bold px-3 py-1 rounded-full">
              أهم الإعلانات
            </span>
            <h2
              id="announcements-heading"
              className="text-3xl md:text-4xl font-extrabold text-primary leading-tight"
            >
              تابع آخر مستجدات الجامعة وقدّم على مفاضلة خريف 2025
            </h2>
            <p className="text-muted-foreground leading-relaxed text-[15px] md:text-base">
              فُتح باب التقديم لمفاضلة خريف 2025 في جامعة UPAFA – فرع سوريا. اطّلع على
              البرامج المتاحة، أدخل بياناتك وعلاماتك، ثم رتّب رغباتك بكل سهولة من خلال
              نظام التقديم الإلكتروني الموحّد.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/mofadla"
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-5 py-3 rounded-md shadow-sm hover:brightness-110 transition"
              >
                <GraduationCap size={18} />
                تفاصيل المفاضلة
              </Link>
              <Link
                to="/programs"
                className="inline-flex items-center gap-2 bg-card border border-border text-foreground font-semibold px-5 py-3 rounded-md hover:bg-muted transition"
              >
                <BookOpen size={18} />
                استعراض البرامج
              </Link>
            </div>
          </div>

          {/* Categories list */}
          <aside className="lg:col-span-1 w-full" aria-label="آخر الأخبار">
            <div className="bg-primary text-primary-foreground rounded-md px-4 py-3 flex items-center justify-between shadow-md">
              <span className="font-bold text-sm">آخر الأخبار</span>
              <Newspaper size={18} className="opacity-80" />
            </div>

            <ul className="mt-2 space-y-2">
              {categories.length === 0
                ? Array.from({ length: 6 }).map((_, i) => (
                    <li
                      key={i}
                      className="h-12 bg-muted/50 rounded-md animate-pulse"
                    />
                  ))
                : categories.map((c) => {
                    const Icon = getNewsIcon(c.icon_name);
                    const highlighted = c.is_highlighted;
                    const target = c.key === "mofadla" ? "/mofadla" : `/news/${c.key}`;
                    return (
                      <li key={c.id}>
                        <Link
                          to={target}
                          className={`group flex items-center justify-between gap-3 rounded-md px-4 py-3 text-sm font-medium transition shadow-sm ${
                            highlighted
                              ? "bg-accent text-accent-foreground font-bold hover:brightness-110"
                              : "bg-card border border-border text-foreground hover:border-primary hover:text-primary"
                          }`}
                        >
                          <span>{c.title}</span>
                          <Icon
                            size={16}
                            className={`shrink-0 ${highlighted ? "" : "text-muted-foreground"}`}
                          />
                        </Link>
                      </li>
                    );
                  })}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
