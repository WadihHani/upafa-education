import EditableText from "@/components/editor/EditableText";

export default function HomeIntro() {
  return (
    <section className="bg-background py-10 md:py-14 border-b border-border/40">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <h1 className="text-2xl md:text-4xl font-extrabold text-primary leading-snug mb-5">
          <EditableText
            contentKey="home_intro_h1"
            field="title"
            fallback="جامعة أفريقيا الفرنسية العربية – فرع سوريا"
            as="span"
          />
          <EditableText
            contentKey="home_intro_h1"
            field="content"
            fallback="UPAFA Syria – الموقع الرسمي"
            as="span"
            className="block text-base md:text-xl font-semibold text-foreground/70 mt-2"
          />
        </h1>

        <EditableText
          contentKey="home_intro_p1"
          fallback="جامعة أفريقيا الفرنسية العربية – فرع سوريا (UPAFA Syria) هي الفرع الرسمي في دمشق لجامعة أفريقيا الفرنسية العربية (UPAFA)، وتقدّم برامج بكالوريوس وماجستير ودكتوراه معتمدة بنظام التعليم عن بعد."
          as="p"
          className="text-foreground/80 leading-[2] text-base md:text-lg mb-4"
        />

        <EditableText
          contentKey="home_intro_p2"
          fallback="تسعى جامعة UPAFA – فرع سوريا إلى تقديم تعليم عالٍ نوعي يجمع بين الأصالة والمعاصرة، عبر منصات إلكترونية حديثة وكادر أكاديمي متميز، لخدمة الطلاب في سوريا والوطن العربي."
          as="p"
          className="text-foreground/70 leading-[2] text-sm md:text-base"
        />
      </div>
    </section>
  );
}
