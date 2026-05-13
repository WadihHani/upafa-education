import { GraduationCap, BookOpen, FileCheck, AlertCircle, Monitor, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Seo from "@/components/Seo";

const bachelorFees = [
  { specialty: "العلوم الشرعية", total: "1200 دولار", courses: "30", perCourse: "30 دولاراً", graduation: "300 دولار", levels: "6" },
  { specialty: "العلوم الإدارية والتربوية", total: "1500 دولار", courses: "30", perCourse: "40 دولاراً", graduation: "300 دولار", levels: "6" },
  { specialty: "العلوم التقنية", total: "2200 دولار", courses: "34", perCourse: "55 دولاراً", graduation: "330 دولار", levels: "6" },
];

const masterFees = [
  { program: "العلوم الشرعية", degree: "الماجستير", total: "2000 دولار", levels: "4", perLevel: "400 دولار", graduation: "400 دولار" },
  { program: "العلوم الإدارية والتربية", degree: "الماجستير", total: "2500 دولار", levels: "4", perLevel: "500 دولار", graduation: "500 دولار" },
  { program: "العلوم التقنية", degree: "الماجستير", total: "3000 دولار", levels: "4", perLevel: "600 دولار", graduation: "600 دولار" },
  { program: "العلوم الشرعية والإدارية والتربية", degree: "الماجستير", total: "3000 دولار", levels: "4", perLevel: "600 دولار", graduation: "600 دولار" },
  { program: "العلوم التقنية", degree: "الماجستير", total: "3400 دولار", levels: "4", perLevel: "600 دولار", graduation: "1000 دولار" },
];

const requiredDocs = [
  "نسخة من شهادة الثانوية العامة / البكالوريوس",
  "نسخة من السجل الأكاديمي (Transcript) مع توضيح جميع الدرجات",
  "صورة عن الهوية الوطنية أو جواز السفر",
  "صور شخصية حديثة",
  "دفع رسوم التسجيل غير القابلة للاسترداد بعد القبول",
];

const platformFeatures = [
  "المحاضرات المباشرة عبر القاعات الافتراضية",
  "سجل الحضور والحصص والجداول",
  "الاختبارات النصفية والنهائية",
  "الأنشطة الصفية والمشاركات",
  "التكليف والمشاريع",
  "الدرجات والنتائج",
];

export default function TuitionFees() {
  return (
    <>
      <Seo
        title="جدول الرسوم الدراسية 2026 | UPAFA سوريا"
        description="جدول الرسوم الدراسية المعتمد لجامعة UPAFA – فرع سوريا لبرامج البكالوريوس والماجستير والدكتوراه لعام 2026."
        path="/tuition-fees"
      />
    <section className="py-14 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-accent tracking-wider mb-2">تعميم رقم 1 لعام 2026</p>
          <h1 className="text-3xl md:text-4xl font-bold text-primary">القيد والتسجيل والرسوم الدراسية</h1>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
          <p className="text-foreground/70 leading-[2] mt-6">
            شروط القبول والوثائق المطلوبة وجداول الرسوم الدراسية لمرحلتي الإجازة الجامعية والماجستير في جامعة أفريقيا الفرنسية-العربية.
          </p>
        </div>

        {/* Admission requirements */}
        <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-5xl mx-auto">
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="text-primary" size={22} />
                </div>
                <h3 className="font-bold text-foreground text-lg">متطلبات درجة البكالوريوس</h3>
              </div>
              <ul className="space-y-2 text-sm text-foreground/75 leading-[1.9]">
                <li className="flex gap-2"><CheckCircle2 className="text-accent shrink-0 mt-1" size={16} /><span>شهادة الثانوية العامة أو ما يعادلها من شهادات معتمدة (مهنية – فنية).</span></li>
                <li className="flex gap-2"><CheckCircle2 className="text-accent shrink-0 mt-1" size={16} /><span>توفّر معدل دراسي مقبول لكافة المتقدمين.</span></li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="text-primary" size={22} />
                </div>
                <h3 className="font-bold text-foreground text-lg">متطلبات الماجستير</h3>
              </div>
              <ul className="space-y-2 text-sm text-foreground/75 leading-[1.9]">
                <li className="flex gap-2"><CheckCircle2 className="text-accent shrink-0 mt-1" size={16} /><span>شهادة بكالوريوس معترف بها في تخصص متوافق مع البرنامج.</span></li>
                <li className="flex gap-2"><CheckCircle2 className="text-accent shrink-0 mt-1" size={16} /><span>الحد الأدنى للمعدل: <strong>60%</strong> أو ما يعادل <strong>2.5</strong>.</span></li>
                <li className="flex gap-2"><CheckCircle2 className="text-accent shrink-0 mt-1" size={16} /><span>رسالة توصية وبيان شخصي.</span></li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Required documents */}
        <Card className="max-w-5xl mx-auto mb-12 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileCheck className="text-primary" size={22} />
              </div>
              <h3 className="font-bold text-foreground text-lg">المستندات المطلوبة وإجراءات التسجيل</h3>
            </div>
            <ul className="grid md:grid-cols-2 gap-2 text-sm text-foreground/75 leading-[1.9]">
              {requiredDocs.map((d) => (
                <li key={d} className="flex gap-2"><CheckCircle2 className="text-accent shrink-0 mt-1" size={16} /><span>{d}</span></li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Bachelor fees */}
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-primary mb-4">جدول رسوم درجة الإجازة – البكالوريوس</h2>
          {/* Desktop table */}
          <div className="hidden md:block bg-card rounded-xl shadow-md overflow-hidden border border-border/50">
            <table className="w-full text-sm">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th className="p-3 text-right font-bold">التخصص</th>
                  <th className="p-3 text-right font-bold">الإجمالي</th>
                  <th className="p-3 text-right font-bold">عدد المواد</th>
                  <th className="p-3 text-right font-bold">رسوم المادة</th>
                  <th className="p-3 text-right font-bold">رسوم التخرج</th>
                  <th className="p-3 text-right font-bold">عدد المستويات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bachelorFees.map((r) => (
                  <tr key={r.specialty} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3 font-bold text-primary">{r.specialty}</td>
                    <td className="p-3 text-foreground/80">{r.total}</td>
                    <td className="p-3 text-foreground/80">{r.courses}</td>
                    <td className="p-3 text-foreground/80">{r.perCourse}</td>
                    <td className="p-3 text-foreground/80">{r.graduation}</td>
                    <td className="p-3 text-foreground/80">{r.levels}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {bachelorFees.map((r) => (
              <div key={r.specialty} className="bg-card rounded-xl shadow-md border border-border/50 overflow-hidden">
                <div className="bg-primary text-primary-foreground px-4 py-3 font-bold">{r.specialty}</div>
                <dl className="divide-y divide-border text-sm">
                  {[
                    ["الإجمالي", r.total],
                    ["عدد المواد", r.courses],
                    ["رسوم المادة", r.perCourse],
                    ["رسوم التخرج", r.graduation],
                    ["عدد المستويات", r.levels],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between px-4 py-2.5">
                      <dt className="text-foreground/60">{k}</dt>
                      <dd className="font-semibold text-foreground">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>

        {/* Master fees */}
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-primary mb-4">جدول رسوم الدراسات العليا – الماجستير</h2>
          {/* Desktop table */}
          <div className="hidden md:block bg-card rounded-xl shadow-md overflow-hidden border border-border/50">
            <table className="w-full text-sm">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th className="p-3 text-right font-bold">البرنامج</th>
                  <th className="p-3 text-right font-bold">الدرجة</th>
                  <th className="p-3 text-right font-bold">الإجمالي</th>
                  <th className="p-3 text-right font-bold">المستويات</th>
                  <th className="p-3 text-right font-bold">رسوم المستوى</th>
                  <th className="p-3 text-right font-bold">رسوم التخرج</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {masterFees.map((r, i) => (
                  <tr key={i} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3 font-bold text-primary">{r.program}</td>
                    <td className="p-3 text-foreground/80">{r.degree}</td>
                    <td className="p-3 text-foreground/80">{r.total}</td>
                    <td className="p-3 text-foreground/80">{r.levels}</td>
                    <td className="p-3 text-foreground/80">{r.perLevel}</td>
                    <td className="p-3 text-foreground/80">{r.graduation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {masterFees.map((r, i) => (
              <div key={i} className="bg-card rounded-xl shadow-md border border-border/50 overflow-hidden">
                <div className="bg-primary text-primary-foreground px-4 py-3 font-bold">{r.program}</div>
                <dl className="divide-y divide-border text-sm">
                  {[
                    ["الدرجة", r.degree],
                    ["الإجمالي", r.total],
                    ["المستويات", r.levels],
                    ["رسوم المستوى", r.perLevel],
                    ["رسوم التخرج", r.graduation],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between px-4 py-2.5">
                      <dt className="text-foreground/60">{k}</dt>
                      <dd className="font-semibold text-foreground">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>

        {/* Study system */}
        <Card className="max-w-5xl mx-auto mb-8 border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                <Monitor className="text-primary" size={22} />
              </div>
              <h3 className="font-bold text-foreground text-lg">نظام الدراسة عن بُعد</h3>
            </div>
            <p className="text-sm text-foreground/75 leading-[1.9] mb-4">
              تتم المحاضرات عبر القاعات الافتراضية المباشرة أسبوعياً حسب جدول الطالب، عبر منصة جامعة أفريقيا الفرنسية-العربية الإلكترونية، وتتضمن:
            </p>
            <ul className="grid md:grid-cols-2 gap-2 text-sm text-foreground/75 leading-[1.9]">
              {platformFeatures.map((f) => (
                <li key={f} className="flex gap-2"><CheckCircle2 className="text-accent shrink-0 mt-1" size={16} /><span>{f}</span></li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Additional fees notice */}
        <div className="max-w-5xl mx-auto bg-accent/10 border border-accent/30 rounded-xl p-5 flex gap-3">
          <AlertCircle className="text-accent shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-foreground/85 leading-[1.9]">
            <strong className="text-primary">الرسوم الإضافية:</strong> في حال تجاوز الطالب عدد الفصول اللازمة لإكمال البرنامج، يُضاف <strong>35%</strong> على رسوم جميع المقررات غير المكتملة خلال الفترة الزمنية المحددة للبرنامج.
          </div>
        </div>

        <p className="text-center text-foreground/60 text-sm mt-10 max-w-2xl mx-auto">
          للاستفسار عن الرسوم وآليات التسديد يرجى التواصل عبر صفحة <a href="/contact" className="text-primary font-semibold hover:underline">اتصل بنا</a>.
        </p>
      </div>
    </section>
    </>
  );
}
