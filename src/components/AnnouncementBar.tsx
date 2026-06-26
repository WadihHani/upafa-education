import { useEffect, useRef, useState } from "react";
import { useSiteContent } from "@/hooks/use-site-content";

export default function AnnouncementBar() {
  const { get, isHidden, loading } = useSiteContent();
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(40);

  if (isHidden("announcement_bar")) return null;
  const text = get(
    "announcement_bar",
    "أهلًا وسهلًا بك في جامعة أفريقيا الفرنسية العربية الافتراضية"
  ).trim();

  // Speed scales with content width so long text doesn't disappear/run too fast.
  useEffect(() => {
    if (!trackRef.current) return;
    const contentWidth = trackRef.current.scrollWidth / 2;
    setDuration(Math.max(10, Math.round(contentWidth / pxPerSecond)));
  }, [text, pxPerSecond]);

  if (!text) return null;

  const speedRaw = parseInt(get("announcement_bar_speed", "80"), 10);
  const pxPerSecond = Number.isFinite(speedRaw) && speedRaw > 0 ? speedRaw : 80;

  const Row = (
    <span className="inline-flex items-center gap-3 mx-8 whitespace-nowrap">
      {text}
    </span>
  );

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
          className="inline-flex whitespace-nowrap animate-marquee-rtl will-change-transform"
          style={{ animationDuration: `${duration}s` }}
        >
          {Row}
          {Row}
        </div>
      </div>
    </div>
  );
}
