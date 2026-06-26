import { useSiteContent } from "@/hooks/use-site-content";

export default function AnnouncementBar() {
  const { get, isHidden, loading } = useSiteContent();
  if (isHidden("announcement_bar")) return null;
  const text = get("announcement_bar", "أهلًا وسهلًا بك في جامعة أفريقيا الفرنسية العربية الافتراضية").trim();
  if (!text) return null;

  // Duplicate text a few times for a seamless marquee
  const items = Array.from({ length: 6 }, (_, i) => (
    <span key={i} className="mx-8 inline-flex items-center gap-3">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent" />
      {text}
    </span>
  ));

  return (
    <div
      className="bg-primary text-primary-foreground border-b border-primary-foreground/10 overflow-hidden relative z-[60]"
      role="region"
      aria-label="شريط الأخبار"
      aria-busy={loading}
    >
      <div className="relative whitespace-nowrap py-2 text-sm font-medium">
        <div className="inline-block animate-marquee-rtl">
          {items}
          {items}
        </div>
      </div>
    </div>
  );
}
