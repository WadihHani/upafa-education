import { useEffect, useRef, useState } from "react";
import { useSiteContent } from "@/hooks/use-site-content";

export default function AnnouncementBar() {
  const { get, isHidden, loading } = useSiteContent();
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const posRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const [ready, setReady] = useState(false);

  if (isHidden("announcement_bar")) return null;

  const text = get(
    "announcement_bar",
    "أهلًا وسهلًا بك في جامعة أفريقيا الفرنسية العربية الافتراضية"
  ).trim();

  const speedRaw = parseInt(get("announcement_bar_speed", "80"), 10);
  const pxPerSecond = Number.isFinite(speedRaw) && speedRaw > 0 ? speedRaw : 80;

  useEffect(() => {
    if (!trackRef.current || !containerRef.current) return;

    const track = trackRef.current;
    const container = containerRef.current;

    const start = () => {
      const trackWidth = track.scrollWidth;
      const containerWidth = container.clientWidth;
      // Start fully off-screen to the left
      posRef.current = -trackWidth;
      setReady(true);

      const animate = () => {
        posRef.current += pxPerSecond / 60; // ~60fps

        // When fully off-screen to the right, reset to left
        if (posRef.current > containerWidth) {
          posRef.current = -trackWidth;
        }

        track.style.transform = `translateX(${posRef.current}px)`;
        rafRef.current = requestAnimationFrame(animate);
      };

      rafRef.current = requestAnimationFrame(animate);
    };

    // Wait for fonts/layout to settle so scrollWidth is correct
    const id = requestAnimationFrame(start);
    return () => {
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(id);
    };
  }, [text, pxPerSecond]);

  if (!text) return null;

  return (
    <div
      ref={containerRef}
      className="bg-primary text-primary-foreground border-b border-primary-foreground/10 overflow-hidden relative z-[60]"
      role="region"
      aria-label="شريط الأخبار"
      aria-busy={loading}
      dir="ltr"
    >
      <div className="py-2 text-sm font-medium overflow-hidden">
        <div
          ref={trackRef}
          className="inline-flex whitespace-nowrap will-change-transform"
          style={{
            transform: ready ? undefined : "translateX(-100%)",
            opacity: ready ? 1 : 0,
            transition: "opacity 0.2s ease",
          }}
        >
          <span className="inline-flex items-center gap-3 mx-8 whitespace-nowrap">
            {text}
          </span>
        </div>
      </div>
    </div>
  );
}
