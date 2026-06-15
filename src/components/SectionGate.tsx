import { ReactNode } from "react";
import { useSiteContent } from "@/hooks/use-site-content";

/**
 * Hides its children when the admin has toggled the section off
 * via the Theme Editor. Keeps the section visible in admin theme
 * editor preview mode (?themePreview=1) but dimmed via outline.
 */
export default function SectionGate({
  sectionKey,
  children,
}: {
  sectionKey: string;
  children: ReactNode;
}) {
  const { isHidden } = useSiteContent();
  const hidden = isHidden(sectionKey);
  const isThemePreview =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("themePreview") === "1";

  if (hidden && !isThemePreview) return null;

  if (hidden && isThemePreview) {
    return (
      <div
        data-section-key={sectionKey}
        className="relative opacity-40 grayscale pointer-events-none"
      >
        <div className="absolute inset-0 z-10 border-4 border-dashed border-amber-500/70 flex items-start justify-center pt-2">
          <span className="bg-amber-500 text-amber-950 text-xs font-bold px-2 py-1 rounded">
            مخفي
          </span>
        </div>
        {children}
      </div>
    );
  }

  return <div data-section-key={sectionKey}>{children}</div>;
}
