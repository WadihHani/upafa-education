import { Link } from "react-router-dom";
import { GraduationCap, BookOpen } from "lucide-react";

export default function AnnouncementsBoard() {
  return (
    <section
      aria-labelledby="announcements-heading"
      className="py-12 md:py-16 bg-section-alt-bg section-alt-bg"
      dir="rtl"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
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

          <div className="flex flex-wrap justify-center gap-3 pt-2">
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
      </div>
    </section>
  );
}
