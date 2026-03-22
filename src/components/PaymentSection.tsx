import { CreditCard, ShieldCheck, Globe } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export default function PaymentSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section id="payment" className="section-padding" ref={ref}>
      <div className="container mx-auto text-center">
        <div
          className={`transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">الدفع الإلكتروني</h2>
          <div className="w-16 h-1 bg-accent mx-auto mb-8 rounded-full" />

          <p className="max-w-2xl mx-auto text-foreground/75 leading-[2] text-base mb-10">
            يمكنك دفع الرسوم الدراسية إلكترونياً بسهولة وأمان عبر بوابة الدفع الإلكتروني الخاصة بالجامعة.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-10">
            {[
              { icon: CreditCard, label: "دفع آمن", desc: "بوابة دفع مشفرة وآمنة" },
              { icon: Globe, label: "دفع من أي مكان", desc: "ادفع من أي بلد في العالم" },
              { icon: ShieldCheck, label: "إيصال فوري", desc: "احصل على إيصال الدفع مباشرة" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className={`flex flex-col items-center gap-3 transition-all duration-500 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
                  }`}
                  style={{
                    transitionDelay: isVisible ? `${300 + i * 100}ms` : "0ms",
                    transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
                  }}
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="text-primary" size={24} />
                  </div>
                  <h4 className="font-bold text-foreground text-sm">{item.label}</h4>
                  <p className="text-muted-foreground text-xs">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <a
            href="#"
            className="inline-block bg-accent text-accent-foreground px-8 py-3 rounded-md font-bold text-base hover:brightness-110 active:scale-[0.97] transition-all duration-200"
          >
            ادفع الآن
          </a>
        </div>
      </div>
    </section>
  );
}
