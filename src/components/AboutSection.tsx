import { useScrollReveal } from "@/hooks/use-scroll-reveal";

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
            عن الجامعة
          </h2>
          <div className="w-16 h-1 bg-accent mx-auto mb-10 rounded-full" />

          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-primary mb-4">
              جامعة أفريقيا الفرنسية العربية – فرع سوريا
            </h3>
            <p className="text-foreground/80 leading-[2] text-base mb-8">
              تأسست جامعة أفريقيا الفرنسية العربية (UPAFA) في مدينة بامكو، عاصمة جمهورية مالي، وكانت مسجلة ومعترف بها لدى وزارة التعليم العالي والبحث العلمي في جمهورية مالي. هدف الجامعة تقديم تعليم عالي الجودة يجمع بين التراث الإسلامي والعلوم الحديثة، وتسعى لتطوير جيل من الطلاب المتميّزين أكاديمياً ومتوازنين في علوم الدنيا والدين. ثم أسست الجامعة فرع سوريا للتعليم عن بعد؛ للوصول إلى أكبر عدد ممكن من الطلاب والطالبات في المنطقة العربية.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div
                className={`bg-card rounded-lg p-6 shadow-sm border transition-all duration-700 delay-200 ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5"
                }`}
                style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
              >
                <h4 className="text-lg font-bold text-primary mb-3">الرسالة</h4>
                <p className="text-foreground/75 text-sm leading-[2]">
                  تمكين الطلاب والطالبات من جميع أنحاء العالم، عبر منصات التعليم عن بعد المرنة، لتطوير كفاءاتهم الأكاديمية، وتحقيق التوازن بين علوم الدين والدنيا، ليصبحوا قادة مؤثرين ومساهمين فاعلين في التنمية الشاملة لمجتمعاتهم.
                </p>
              </div>

              <div
                className={`bg-card rounded-lg p-6 shadow-sm border transition-all duration-700 delay-300 ${
                  isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-5"
                }`}
                style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
              >
                <h4 className="text-lg font-bold text-primary mb-3">الرؤية</h4>
                <p className="text-foreground/75 text-sm leading-[2]">
                  أن نكون المنارة الأكاديمية الرائدة عالمياً في التعليم المدمج عن بعد، والمحور الأساسي الذي يربط بين الثقافة العربية والإسلامية والابتكار المعرفي، من خلال تخريج جيل من المتميزين أكاديمياً والقادرين على المنافسة في سوق العمل العالمي.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
