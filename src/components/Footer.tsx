import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { useSiteContent } from "@/hooks/use-site-content";

export default function Footer() {
  const { get } = useSiteContent();

  const uniName = get("university_name", "جامعة أفريقيا الفرنسية العربية – فرع سوريا");
  const footerAbout = get("footer_about", "فرع سوريا – نسعى لتقديم تعليم عالٍ نوعي يجمع بين الأصالة والمعاصرة عبر منصات التعليم عن بعد.");
  const address = get("contact_address", "دمشق، عين كرش");
  const phone = get("contact_phone", "+963 989 801 010");
  const email = get("contact_email", "academic@upafa.education");
  const phoneDigits = phone.replace(/\D/g, "");

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-lg font-bold mb-4">{uniName}</h3>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">{footerAbout}</p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              {[
                { label: "عن الجامعة", href: "/about" },
                { label: "البرامج", href: "/programs" },
                { label: "البوابة", href: "/portal" },
                { label: "اتصل بنا", href: "/contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link to={l.href} onClick={() => window.scrollTo(0, 0)} className="hover:text-primary-foreground transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">تواصل معنا</h3>
            <div className="space-y-3 text-sm text-primary-foreground/70">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="shrink-0" />
                <span>{address}</span>
              </div>
              <a
                href={`tel:${phoneDigits}`}
                className="flex items-center gap-2 hover:text-primary-foreground transition-colors"
              >
                <Phone size={16} className="shrink-0" />
                <span dir="ltr">{phone}</span>
              </a>
              <a
                href={`https://wa.me/${phoneDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-primary-foreground transition-colors"
              >
                <MessageCircle size={16} className="shrink-0" />
                <span dir="ltr">واتساب: {phone}</span>
              </a>
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 hover:text-primary-foreground transition-colors"
              >
                <Mail size={16} className="shrink-0" />
                <span>{email}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-foreground/15 text-center text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} {uniName}. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
