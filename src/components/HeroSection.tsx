import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import heroGraduation from "@/assets/hero-graduation.jpg";
import heroCampus from "@/assets/hero-campus.jpg";
import heroLibrary from "@/assets/hero-library.jpg";

const slides = [
  {
    image: heroGraduation,
    subtitle: "جامعة أفريقيا الفرنسية العربية – فرع سوريا",
    title: "نسعى لتحقيق الريادة والتميز في مجال التعليم عن بعد",
    cta: "سجل معنا",
    href: "/programs",
  },
  {
    image: heroCampus,
    subtitle: "جامعة أفريقيا الفرنسية العربية – فرع سوريا",
    title: "نقدم تعليماً عالمياً متميزاً يجمع بين التراث والمعاصرة",
    cta: "استكشف البرامج",
    href: "/programs",
  },
  {
    image: heroLibrary,
    subtitle: "جامعة أفريقيا الفرنسية العربية – فرع سوريا",
    title: "نؤمن بتطوير جيل من الطلاب المتميزين أكاديمياً",
    cta: "تواصل معنا",
    href: "/contact",
  },
];

export default function HeroSection() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
      setAnimKey((k) => k + 1);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const slide = slides[current];

  return (
    <section id="home" className="relative h-screen min-h-[600px] overflow-hidden">
      {/* Background images */}
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={s.image}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-primary/65" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-end">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mr-auto md:mr-0 md:ml-0 text-right" key={animKey}>
            <p
              className="text-accent text-sm md:text-base font-semibold mb-4"
              style={{ animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s forwards", opacity: 0 }}
            >
              {slide.subtitle}
            </p>
            <h1
              className="text-primary-foreground text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8"
              style={{
                animation: "fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.25s forwards",
                opacity: 0,
                textWrap: "balance",
                lineHeight: 1.3,
              }}
            >
              {slide.title}
            </h1>
            <button
              onClick={() => { navigate(slide.href); window.scrollTo(0, 0); }}
              className="inline-block bg-accent text-accent-foreground px-8 py-3.5 rounded-md font-bold text-base hover:brightness-110 active:scale-[0.97] transition-all duration-200"
              style={{ animation: "fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.4s forwards", opacity: 0 }}
            >
              {slide.cta}
            </button>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); setAnimKey((k) => k + 1); }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === current ? "bg-accent w-8" : "bg-primary-foreground/40 hover:bg-primary-foreground/60"
            }`}
            aria-label={`الشريحة ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
