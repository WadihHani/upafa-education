import { Facebook, Youtube, Instagram, Linkedin, Twitter, Phone, Send } from "lucide-react";
import { useSiteContent } from "@/hooks/use-site-content";

const socials = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook", color: "#1877F2" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram", color: "#E4405F" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube", color: "#FF0000" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn", color: "#0A66C2" },
  { icon: Twitter, href: "https://twitter.com", label: "X / Twitter", color: "#000000" },
  { icon: Send, href: "https://t.me", label: "Telegram", color: "#26A5E4" },
];

export default function SocialFloat() {
  const { get } = useSiteContent();
  const phone = get("contact_phone", "+963989801010").replace(/\s/g, "");

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
