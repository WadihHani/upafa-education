import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">جامعة أفريقيا الفرنسية العربية</h3>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              فرع سوريا – نسعى لتقديم تعليم عالٍ نوعي يجمع بين الأصالة والمعاصرة عبر منصات التعليم عن بعد.
            </p>
          </div>

          {/* Quick Links */}
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
                  <Link to={l.href} onClick={() => window.scrollTo(0, 0)} className="hover:text-primary-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">تواصل معنا</h3>
            <div className="space-y-3 text-sm text-primary-foreground/70">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="shrink-0" />
                <span>دمشق، عين كرش</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="shrink-0" />
                <span dir="ltr">+963 989 801 010</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="shrink-0" />
                <span>info@upafa.sy</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primary-foreground/15 text-center text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} جامعة أفريقيا الفرنسية العربية – فرع سوريا. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}
