import { useEffect } from "react";
import { useSiteContent } from "@/hooks/use-site-content";

/** Applies admin-configured theme colors as CSS variables on the document root. */
export default function ThemeColorsApplier() {
  const { data } = useSiteContent();

  useEffect(() => {
    const raw = data["theme_colors"]?.content;
    if (!raw) return;
    try {
      const colors = JSON.parse(raw) as { primary?: string; accent?: string };
      const root = document.documentElement;
      if (colors.primary) root.style.setProperty("--primary", colors.primary);
      if (colors.accent) root.style.setProperty("--accent", colors.accent);
    } catch {
      /* ignore malformed */
    }
  }, [data]);

  // Listen for live color updates from the Theme Editor parent window
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "theme:colors") {
        const root = document.documentElement;
        if (e.data.primary) root.style.setProperty("--primary", e.data.primary);
        if (e.data.accent) root.style.setProperty("--accent", e.data.accent);
      }
      if (e.data?.type === "theme:reload") {
        window.location.reload();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return null;
}
