import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { useSiteContent } from "@/hooks/use-site-content";
import { useNavItems } from "@/hooks/use-nav-items";
import EditableText from "@/components/editor/EditableText";

export default function Footer() {
  const { get } = useSiteContent();
  const quickLinks = useNavItems("footer_quick");

  const phone = get("contact_phone", "+963 989 801 010");
  const email = get("contact_email", "academic@upafa.education");
  const phoneDigits = phone.replace(/\D/g, "");

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <EditableText
              contentKey="university_name"
              fallback="جامعة أفريقيا الفرنسية العربية – فرع سوريا"
              as="h3"
              className="text-lg font-bold mb-4"
            />
            <EditableText
              contentKey="footer_about"
              fallback="جامعة أفريقيا الفرنسية العربية – فرع سوريا (UPAFA Syria) تسعى لتقديم تعليم عالٍ نوعي يجمع بين الأصالة والمعاصرة عبر منصات التعليم عن بعد."
              as="p"
              className="text-primary-foreground/70 text-sm leading-relaxed"
            />
          </div>

          <div>
            <EditableText
              contentKey="footer_quick_title"
              fallback="روابط سريعة"
              as="h3"
              className="text-lg font-bold mb-4"
            />
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              {quickLinks.map((l) => (
                <li key={l.id}>
                  <Link to={l.href} onClick={() => window.scrollTo(0, 0)} className="hover:text-primary-foreground transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <EditableText
              contentKey="footer_contact_title"
              fallback="تواصل معنا"
              as="h3"
              className="text-lg font-bold mb-4"
            />
            <div className="space-y-3 text-sm text-primary-foreground/70">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="shrink-0" />
                <EditableText contentKey="contact_address" fallback="دمشق، عين كرش" />
              </div>
              <a href={`tel:${phoneDigits}`} className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                <Phone size={16} className="shrink-0" />
                <EditableText contentKey="contact_phone" fallback="+963 989 801 010" className="block" />
              </a>
              <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                <MessageCircle size={16} className="shrink-0" />
                <span dir="ltr">واتساب: {phone}</span>
              </a>
              <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                <Mail size={16} className="shrink-0" />
                <EditableText contentKey="contact_email" fallback="academic@upafa.education" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-foreground/15 text-center text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} {get("university_name", "جامعة أفريقيا الفرنسية العربية – فرع سوريا")}. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
