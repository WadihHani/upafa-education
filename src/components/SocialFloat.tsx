import { Facebook, Youtube, Instagram, Linkedin, Phone, Send } from "lucide-react";
import { useSiteContent } from "@/hooks/use-site-content";

export default function SocialFloat() {
  const { get } = useSiteContent();
  const phone = get("contact_phone", "+963989801010").replace(/\s/g, "");

  const socials = [
    { icon: Facebook, href: get("facebook_url", ""), label: "Facebook", color: "#1877F2" },
    { icon: Instagram, href: get("instagram_url", ""), label: "Instagram", color: "#E4405F" },
    { icon: Youtube, href: get("youtube_url", ""), label: "YouTube", color: "#FF0000" },
    { icon: Linkedin, href: get("linkedin_url", ""), label: "LinkedIn", color: "#0A66C2" },
    { icon: Send, href: get("telegram_url", ""), label: "Telegram", color: "#26A5E4" },
  ].filter((s) => s.href && s.href.trim().length > 0);

  return (
    <div className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-40 flex-col shadow-xl">
      {socials.map((s, i) => {
        const Icon = s.icon;
        return (
          <a
            key={i}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className="w-10 h-10 flex items-center justify-center text-white transition-all duration-200 hover:w-12"
            style={{ backgroundColor: s.color }}
          >
            <Icon size={18} />
          </a>
        );
      })}
      <a
        href={`tel:${phone}`}
        aria-label="اتصل بنا"
        className="w-10 h-10 flex items-center justify-center text-accent-foreground bg-accent transition-all duration-200 hover:w-12"
      >
        <Phone size={18} />
      </a>
    </div>
  );
}
