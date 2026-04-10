import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import heroGraduation from "@/assets/hero-graduation-blue.jpg";
import heroCampus from "@/assets/hero-campus-blue.jpg";
import heroLibrary from "@/assets/hero-library-blue.jpg";
import logo from "@/assets/logo.png";

const slides = [
  {
    image: heroGraduation,
    title: "نسعى لتحقيق الريادة والتميز في مجال التعليم عن بعد",
    cta: "سجل الآن",
    href: "/programs",
  },
  {
    image: heroCampus,
    title: "نقدم تعليماً عالمياً متميزاً يجمع بين التراث والمعاصرة",
    cta: "استكشف البرامج",
    href: "/programs",
  },
  {
    image: heroLibrary,
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
            width={1920}
            height={900}
          />
        </div>
      ))}

      {/* Dark blue overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(215,65%,15%,0.75)] via-[hsl(215,65%,20%,0.65)] to-[hsl(215,65%,15%,0.80)]" />

      {/* Decorative gold ribbon at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-accent z-20" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        {/* Logo */}
        <div key={animKey}>
          <img
            src={logo}
            alt="شعار الجامعة"
            className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 drop-shadow-lg"
            style={{ animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s forwards", opacity: 0 }}
          />

          <p
            className="text-accent text-base md:text-lg font-bold mb-4 tracking-wide"
            style={{ animation: "fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s forwards", opacity: 0 }}
          >
            جامعة أفريقيا الفرنسية العربية – فرع سوريا
          </p>

          <h1
            className="text-primary-foreground text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-8 max-w-4xl mx-auto"
            style={{
              animation: "fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.35s forwards",
              opacity: 0,
              textWrap: "balance",
              lineHeight: 1.4,
            }}
          >
            {slide.title}
          </h1>

          <button
            onClick={() => { navigate(slide.href); window.scrollTo(0, 0); }}
            className="inline-block bg-accent text-accent-foreground px-10 py-4 rounded-lg font-bold text-lg hover:brightness-110 active:scale-[0.97] transition-all duration-200 shadow-lg"
            style={{ animation: "fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.5s forwards", opacity: 0 }}
          >
            {slide.cta}
          </button>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
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
