import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "كيف يمكنني التسجيل في الجامعة؟",
    a: "يمكنك التسجيل عبر زيارة فرع الجامعة في سوريا أو التواصل معنا عبر صفحة اتصل بنا لتقديم طلب القبول والمستندات المطلوبة.",
  },
  {
    q: "ما هي الشهادات التي تمنحها الجامعة؟",
    a: "تمنح الجامعة شهادات البكالوريوس والماجستير والدكتوراه في مختلف الكليات، وجميعها معتمدة من جامعة أفريقيا الفرنسية العربية في مالي.",
  },
  {
    q: "هل الشهادات معترف بها دولياً؟",
    a: "نعم، شهادات الجامعة الأم في مالي معترف بها من قبل الجهات الرسمية في عدد من الدول الإفريقية والعربية، ويمكن معادلتها حسب أنظمة كل بلد.",
  },
  {
    q: "ما هي طرق الدراسة المتاحة؟",
    a: "تتيح الجامعة الدراسة الحضورية والدراسة عن بُعد عبر منصاتها الإلكترونية، مما يمنح الطالب مرونة كاملة في اختيار النمط المناسب له.",
  },
  {
    q: "هل توجد منح دراسية؟",
    a: "نعم، تقدم الجامعة عدداً من المنح الدراسية للطلاب المتميزين أكاديمياً والحالات الإنسانية، يتم الإعلان عنها بشكل دوري.",
  },
  {
    q: "ما هي اللغات المعتمدة في التدريس؟",
    a: "اللغة العربية هي لغة التدريس الأساسية، مع توفير مقررات باللغتين الإنكليزية والفرنسية في بعض التخصصات.",
  },
  {
    q: "كيف يمكنني التواصل مع إدارة الجامعة؟",
    a: "يمكنك زيارة مقر الجامعة في سوريا، أو التواصل معنا عبر الهاتف وبيانات الاتصال الموجودة في صفحة اتصل بنا.",
  },
  {
    q: "هل توجد أنشطة طلابية وفعاليات؟",
    a: "نعم، تنظم الجامعة باستمرار مؤتمرات وندوات علمية وفعاليات ثقافية واجتماعية، يمكن متابعتها من صفحة المؤتمرات والندوات.",
  },
];

export default function Faq() {
  return (
    <section className="py-16 bg-[hsl(var(--section-alt))]">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-accent tracking-wider mb-2">للمساعدة</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">الأسئلة الشائعة</h1>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
        </div>

        <Accordion type="single" collapsible className="bg-card rounded-xl shadow-md border border-border/50 px-6">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border/40">
              <AccordionTrigger className="text-right text-foreground hover:text-primary font-semibold py-5">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-foreground/70 leading-[2] pb-5">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
