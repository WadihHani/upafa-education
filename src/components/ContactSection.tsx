import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useSiteContent } from "@/hooks/use-site-content";

export default function ContactSection() {
  const { ref, isVisible } = useScrollReveal();
  const { get } = useSiteContent();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("تم إرسال رسالتك بنجاح!");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const contactInfo = [
    { icon: MapPin, label: "العنوان", value: get("contact_address", "دمشق، عين كرش") },
    { icon: Phone, label: "الهاتف", value: get("contact_phone", "+963 989 801 010"), dir: "ltr" as const },
    { icon: Mail, label: "البريد الإلكتروني", value: get("contact_email", "info@upafa.sy") },
    { icon: Clock, label: "ساعات العمل", value: get("contact_hours", "الأحد - الخميس: 8:00 صباحاً - 4:00 مساءً") },
  ];

  return (
    <section id="contact" className="section-padding section-alt-bg" ref={ref}>
      <div className="container mx-auto">
        <div
          className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2 text-center">اتصل بنا</h2>
          <div className="w-16 h-1 bg-accent mx-auto mb-12 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <div
            className={`space-y-6 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-5"}`}
            style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
          >
            {contactInfo.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="text-primary" size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm mb-0.5">{item.label}</h4>
                    <p className="text-muted-foreground text-sm" dir={item.dir}>{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <form
            onSubmit={handleSubmit}
            className={`bg-card rounded-lg p-6 border shadow-sm space-y-4 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-5"}`}
            style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
          >
            <input type="text" placeholder="الاسم" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-md border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="email" placeholder="البريد الإلكتروني" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-md border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input type="text" placeholder="الموضوع" required value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full px-4 py-3 rounded-md border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <textarea placeholder="الرسالة" required rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-4 py-3 rounded-md border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            <button type="submit" className="w-full bg-primary text-primary-foreground py-3 rounded-md font-bold text-sm hover:brightness-110 active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-2">
              <Send size={16} />
              إرسال
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
