import { Users, BookOpenCheck, Shield, type LucideIcon } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/use-site-content";

const iconMap: Record<string, LucideIcon> = { Users, BookOpenCheck, Shield };

type PortalItem = { id: string; title: string; description: string; link_url: string; icon_name: string };

export default function PortalSection() {
  const { ref, isVisible } = useScrollReveal();
  const [portals, setPortals] = useState<PortalItem[]>([]);
  const { get } = useSiteContent();
  const title = get("portal_section_title", "البوابة");
  const subtitle = get("portal_section_subtitle", "");
  const loginLabel = get("portal_section_login_label", "تسجيل الدخول");

  useEffect(() => {
    supabase.from("portal_items").select("id, title, description, link_url, icon_name").order("sort_order").then(({ data }) => {
      if (data) setPortals(data);
    });
  }, []);

  return (
    <section id="portal" className="section-padding section-alt-bg" ref={ref}>
      <div className="container mx-auto">
        <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`} style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2 text-center">{title}</h2>
          <div className="w-16 h-1 bg-accent mx-auto mb-3 rounded-full" />
          {subtitle && <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-10">{subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {portals.map((p, i) => {
            const Icon = iconMap[p.icon_name] || Users;
            return (
              <div
                key={p.id}
                className={`bg-card rounded-lg p-8 border text-center shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-1 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
                style={{ transitionDelay: isVisible ? `${200 + i * 100}ms` : "0ms", transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="text-primary" size={26} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{p.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{p.description}</p>
                <a href={p.link_url} className="inline-block bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-medium hover:brightness-110 active:scale-[0.97] transition-all duration-200">
                  {loginLabel}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
