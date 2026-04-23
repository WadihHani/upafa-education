import { Link } from "react-router-dom";
import {
  Megaphone,
  Newspaper,
  FileText,
  GraduationCap,
  Calendar,
  BookOpen,
  AlertCircle,
} from "lucide-react";

type Item = {
  label: string;
  href: string;
  Icon: typeof Newspaper;
  external?: boolean;
};

const items: Item[] = [
  { label: "أخبار الجامعة", href: "/about", Icon: Newspaper },
  { label: "أخبار الامتحانات", href: "/programs", Icon: GraduationCap },
  { label: "أخبار شؤون الطلاب", href: "/portal", Icon: Calendar },
  { label: "مناقشة رسائل الماجستير والدكتوراه", href: "/publications", Icon: FileText },
  { label: "أخبار مركز التدريب", href: "/conferences", Icon: Megaphone },
  { label: "ملاحظات الطلاب", href: "/contact", Icon: AlertCircle, external: false },
];

export default function AnnouncementsBoard() {
  return (
    <section
      aria-labelledby="announcements-heading"
      className="py-12 md:py-16 bg-section-alt-bg section-alt-bg"
      dir="rtl"
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left/main intro */}
          <div className="lg:col-span-2 space-y-4">
            <span className="inline-block bg-accent/15 text-primary text-xs font-bold px-3 py-1 rounded-full">
              أهم الإعلانات
            </span>
            <h2
              id="announcements-heading"
              className="text-3xl md:text-4xl font-extrabold text-primary leading-tight"
            >
              تابع آخر مستجدات الجامعة وقدّم على مفاضلة خريف 2025
            </h2>
            <p className="text-muted-foreground leading-relaxed text-[15px] md:text-base">
              فُتح باب التقديم لمفاضلة خريف 2025 في جامعة UPAFA – فرع سوريا. اطّلع على
              البرامج المتاحة، أدخل بياناتك وعلاماتك، ثم رتّب رغباتك بكل سهولة من خلال
              نظام التقديم الإلكتروني الموحّد.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/mofadla"
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-5 py-3 rounded-md shadow-sm hover:brightness-110 transition"
              >
                <GraduationCap size={18} />
                تفاصيل المفاضلة
              </Link>
              <Link
                to="/programs"
                className="inline-flex items-center gap-2 bg-card border border-border text-foreground font-semibold px-5 py-3 rounded-md hover:bg-muted transition"
              >
                <BookOpen size={18} />
                استعراض البرامج
              </Link>
            </div>
          </div>

          {/* SVU-style announcements list */}
          <aside className="lg:col-span-1 w-full" aria-label="آخر الأخبار">
            <div className="bg-primary text-primary-foreground rounded-md px-4 py-3 flex items-center justify-between shadow-md">
              <span className="font-bold text-sm">آخر الأخبار</span>
              <Newspaper size={18} className="opacity-80" />
            </div>

            <ul className="mt-2 space-y-2">
              {/* Highlighted Mofadla item */}
              <li>
                <Link
                  to="/mofadla"
                  className="group flex items-center justify-between gap-3 bg-accent text-accent-foreground rounded-md px-4 py-3 shadow-sm hover:brightness-110 transition"
                >
                  <span className="font-bold text-sm">مفاضلة خريف 2025</span>
                  <Megaphone
                    size={18}
                    className="shrink-0 group-hover:scale-110 transition-transform"
                  />
                </Link>
              </li>

              {items.map(({ label, href, Icon }) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="flex items-center justify-between gap-3 bg-card border border-border rounded-md px-4 py-3 text-sm font-medium text-foreground hover:border-primary hover:text-primary hover:shadow-sm transition"
                  >
                    <span>{label}</span>
                    <Icon size={16} className="text-muted-foreground shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
