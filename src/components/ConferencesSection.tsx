import { CalendarDays, Video } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Conference = { id: string; title: string; description: string; date_text: string };

export default function ConferencesSection() {
  const { ref, isVisible } = useScrollReveal();
  const [events, setEvents] = useState<Conference[]>([]);

  useEffect(() => {
    supabase.from("conferences").select("id, title, description, date_text").order("sort_order").then(({ data }) => {
      if (data) setEvents(data);
    });
  }, []);

  return (
    <section id="conferences" className="section-padding" ref={ref}>
      <div className="container mx-auto">
        <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`} style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2 text-center">المؤتمرات والندوات</h2>
          <div className="w-16 h-1 bg-accent mx-auto mb-12 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {events.map((event, i) => (
            <div
              key={event.id}
              className={`bg-card rounded-lg p-6 border shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-1 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
              style={{ transitionDelay: isVisible ? `${200 + i * 100}ms` : "0ms", transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="text-accent" size={18} />
                <span className="text-xs font-semibold text-accent">{event.date_text}</span>
              </div>
              <h3 className="text-base font-bold text-foreground mb-2 leading-relaxed">{event.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{event.description}</p>
              <a href="#contact" className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary hover:underline">
                <Video size={14} />
                التفاصيل
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
