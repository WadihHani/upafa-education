import { Calendar, DollarSign, BookOpen, Award } from "lucide-react";

const programs = [
  { level: "البكالوريوس", duration: "4 سنوات", fee: "حسب التخصص", note: "ينقسم إلى 8 فصول دراسية" },
  { level: "الماجستير", duration: "سنتان", fee: "حسب التخصص", note: "بحث + مقررات" },
  { level: "الدكتوراه", duration: "3–5 سنوات", fee: "حسب التخصص", note: "أطروحة بحثية أصيلة" },
];

const features = [
  { icon: Calendar, title: "نظام الفصول الدراسية", text: "السنة الأكاديمية مقسمة إلى فصلين دراسيين، بالإضافة إلى فصل صيفي اختياري." },
  { icon: BookOpen, title: "نظام الساعات المعتمدة", text: "اعتماد نظام الساعات المعتمدة الذي يتيح للطالب مرونة في اختيار المقررات." },
  { icon: Award, title: "الحضور والتقييم", text: "تقييم مستمر يجمع بين الحضور والمشاركة والاختبارات النهائية." },
  { icon: DollarSign, title: "الرسوم الدراسية", text: "تختلف الرسوم بحسب الكلية والتخصص والمرحلة الدراسية، مع توفر تسهيلات في الدفع." },
];

export default function Tuition() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-accent tracking-wider mb-2">معلومات أكاديمية</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">نظام الدراسة والرسوم</h1>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-5xl mx-auto">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-card rounded-xl p-6 shadow-md border border-border/50 flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-foreground/70 leading-[1.9]">{f.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="max-w-4xl mx-auto bg-card rounded-xl shadow-lg overflow-hidden border border-border/50">
          <div className="bg-primary text-primary-foreground p-4">
            <h3 className="text-lg font-bold text-center">المراحل الدراسية</h3>
          </div>
          <div className="divide-y divide-border">
            {programs.map((p) => (
              <div key={p.level} className="p-5 grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                <div className="font-bold text-primary">{p.level}</div>
                <div className="text-foreground/70"><span className="font-semibold">المدة:</span> {p.duration}</div>
                <div className="text-foreground/70"><span className="font-semibold">الرسوم:</span> {p.fee}</div>
                <div className="text-foreground/70">{p.note}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-foreground/60 text-sm mt-8 max-w-2xl mx-auto">
          للاستفسار عن الرسوم التفصيلية وآليات التسديد يرجى التواصل مع إدارة الجامعة عبر صفحة <a href="/contact" className="text-primary font-semibold hover:underline">اتصل بنا</a>.
        </p>
      </div>
    </section>
  );
}
