import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { CheckCircle } from "lucide-react";

const values = [
  "الجودة والتميز",
  "النزاهة والمسؤولية",
  "الابتكار والتطوير",
  "الانفتاح الثقافي",
  "الشراكة والتعاون الدولي",
];

export default function AboutSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="about" className="section-padding section-alt-bg" ref={ref}>
      <div className="container mx-auto">
        <div
          className={`transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2 text-center" style={{ textWrap: "balance" }}>
            من نحن
          </h2>
          <div className="w-16 h-1 bg-accent mx-auto mb-10 rounded-full" />

          <div className="max-w-4xl mx-auto">
            <p className="text-foreground/80 leading-[2] text-base mb-10">
              الجامعة الإفريقية الفرنسية العربية هي مؤسسة تعليمية دولية تُعنى بتقديم تعليم عالي الجودة، قائم على الابتكار، والبحث العلمي، والانفتاح الثقافي. تجمع الجامعة بين الخبرات الأكاديمية الإفريقية والفرنسية والعربية لتوفير بيئة تعليمية متعددة الثقافات، تُعدّ الطلاب للريادة في مجالاتهم محليًا ودوليًا.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div
                className={`bg-card rounded-lg p-6 shadow-sm border transition-all duration-700 delay-200 ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5"
                }`}
                style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
              >
                <h4 className="text-lg font-bold text-primary mb-3">رؤيتنا</h4>
                <p className="text-foreground/75 text-sm leading-[2]">
                  أن نكون جامعة رائدة إقليميًّا ودوليًّا في التعليم والبحث العلمي، وأن نُسهم في إعداد جيل قادر على مواجهة تحديات المستقبل بروح معرفية وإنسانية.
                </p>
              </div>

              <div
                className={`bg-card rounded-lg p-6 shadow-sm border transition-all duration-700 delay-300 ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-5"
                }`}
                style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
              >
                <h4 className="text-lg font-bold text-primary mb-3">رسالتنا</h4>
                <p className="text-foreground/75 text-sm leading-[2]">
                  تقديم برامج أكاديمية معتمدة، وتعزيز البحث العلمي، وبناء شراكات دولية، وتخريج كوادر مؤهلة تمتلك المعرفة والمهارات والقيم التي تواكب متطلبات سوق العمل العالمي.
                </p>
              </div>
            </div>

            {/* Values */}
            <div
              className={`bg-card rounded-lg p-6 shadow-sm border transition-all duration-700 delay-400 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
              }`}
              style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
            >
              <h4 className="text-lg font-bold text-primary mb-4">قيمنا</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {values.map((value, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="text-accent shrink-0" size={18} />
                    <span className="text-foreground/75 text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
