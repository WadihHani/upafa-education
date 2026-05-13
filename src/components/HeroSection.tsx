import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PortalLoginCard from "./PortalLoginCard";
import NewsCategoriesSidebar from "./NewsCategoriesSidebar";
import heroGraduation from "@/assets/hero-graduation-blue.jpg";
import heroCampus from "@/assets/hero-campus-blue.jpg";
import heroLibrary from "@/assets/hero-library-blue.jpg";

const fallbackImages = [heroGraduation, heroCampus, heroLibrary];

type Slide = {
  title: string;
  cta_text: string;
  cta_link: string;
  image_url: string | null;
};

export default function HeroSection() {
  const navigate = useNavigate();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    supabase
      .from("hero_slides")
      .select("title, cta_text, cta_link, image_url")
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) setSlides(data);
      });
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goNext = () => setCurrent((p) => (p + 1) % Math.max(slides.length, 1));
  const goPrev = () => setCurrent((p) => (p - 1 + slides.length) % Math.max(slides.length, 1));

  const slide = slides[current];

  return (
    <section className="bg-background py-6 md:py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Slider */}
          <div className="relative rounded-lg overflow-hidden bg-primary shadow-lg" style={{ aspectRatio: "16 / 9", maxHeight: "500px" }}>
            {slides.length === 0 ? (
              <div className="absolute inset-0 bg-primary animate-pulse" />
            ) : (
              <>
                {slides.map((s, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 transition-opacity duration-700"
                    style={{ opacity: i === current ? 1 : 0 }}
                  >
                    <img
                      src={s.image_url || fallbackImages[i % fallbackImages.length]}
                      alt={s.title}
                      className="w-full h-full object-cover"
                      loading={i === 0 ? "eager" : "lazy"}
                      fetchPriority={i === 0 ? "high" : "auto"}
                      decoding="async"
                      width={1280}
                      height={720}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
                  </div>
                ))}

                {/* Slide content */}
                {slide && (
                  <div className="absolute bottom-0 right-0 left-0 p-6 md:p-10 text-primary-foreground">
                    <h2
                      key={current}
                      className="text-xl md:text-3xl lg:text-4xl font-extrabold leading-snug mb-4 max-w-2xl animate-fade-up"
                      style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
                    >
                      {slide.title}
                    </h2>
                    <button
                      onClick={() => { navigate(slide.cta_link); window.scrollTo(0, 0); }}
                      className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-2.5 rounded-md font-bold text-sm hover:brightness-110 transition-all shadow-md"
                    >
                      {slide.cta_text || "اقرأ المزيد"}
                    </button>
                  </div>
                )}

                {/* Arrows */}
                <button
                  onClick={goPrev}
                  className="absolute top-1/2 right-3 -translate-y-1/2 w-10 h-10 rounded-full bg-card/80 hover:bg-card text-primary flex items-center justify-center shadow-md transition-all hover:scale-105"
                  aria-label="السابق"
                >
                  <ChevronRight size={22} />
                </button>
                <button
                  onClick={goNext}
                  className="absolute top-1/2 left-3 -translate-y-1/2 w-10 h-10 rounded-full bg-card/80 hover:bg-card text-primary flex items-center justify-center shadow-md transition-all hover:scale-105"
                  aria-label="التالي"
                >
                  <ChevronLeft size={22} />
                </button>

                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === current ? "bg-accent w-6" : "bg-primary-foreground/50 w-2 hover:bg-primary-foreground/80"
                      }`}
                      aria-label={`الشريحة ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sidebar: portal login + news */}
          <aside className="flex flex-col gap-3">
            <PortalLoginCard />
            <NewsCategoriesSidebar />
          </aside>
        </div>
      </div>
    </section>
  );
}
