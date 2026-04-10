import { User, X } from "lucide-react";
import { useState } from "react";

import salwaImg from "@/assets/team/salwa-new.jpg";
import tamaderImg from "@/assets/team/tamader-new.jpg";
import kawtharImg from "@/assets/team/kawthar-new.jpg";
import taifImg from "@/assets/team/taif-new.jpg";
import halaImg from "@/assets/team/hala-new.jpg";
import moustafaImg from "@/assets/team/moustafa-new.jpg";
import omarImg from "@/assets/team/omar-new.jpg";
import tayseerImg from "@/assets/team/tayseer-new.jpg";
import mohammadIsmailImg from "@/assets/team/mohammad-ismail.jpg";
import sabahImg from "@/assets/team/sabah-new.jpg";
import basemImg from "@/assets/team/basem.jpg";
import mohammadHamidImg from "@/assets/team/mohammad-hamid-new.jpg";
import abdallahJaraImg from "@/assets/team/abdallah-jara-new.jpg";
import atefShaheenImg from "@/assets/team/atef-new.jpg";
import majdSaqourImg from "@/assets/team/majd-saqour.jpg";

type TeamMember = {
  name: string;
  title: string;
  bio: string;
  image?: string;
};

const adminMembers: TeamMember[] = [
  {
    name: "بروفيسور عبدالله جارا",
    title: "مؤسس ورئيس جامعة أفريقيا الفرنسية العربية في مالي",
    bio: "مؤسس ورئيس جامعة أفريقيا الفرنسية العربية في مالي.",
    image: abdallahJaraImg,
  },
  {
    name: "د. عاطف شاهين",
    title: "رئيس فرع الجامعة في رواندا والمشرف العام على الجامعة الرئيسية في مالي",
    bio: "رئيس فرع الجامعة في رواندا والمشرف العام على الجامعة الرئيسية في مالي.",
    image: atefShaheenImg,
  },
  {
    name: "د. محمد حميد",
    title: "رئيس الجامعة – فرع سوريا",
    bio: "يقود الجامعة وفق رؤية استراتيجية تهدف إلى تعزيز الجودة الأكاديمية، تطوير البرامج التعليمية، وتوسيع الشراكات الدولية.",
    image: mohammadHamidImg,
  },
  {
    name: "د. صباح السقا",
    title: "نائب رئيس الجامعة للشؤون العلمية",
    bio: "أستاذ جامعي وخبير متخصص في علم النفس السريري والإرشادي، تتمتع بخبرة تزيد عن 20 عاماً في التدريس الأكاديمي والعلاج النفسي وتقديم الدعم النفسي الاجتماعي. مؤسسة ورئيسة جمعية جودي للأشخاص ذوي الاحتياجات الخاصة. مشاركة بفعالية في تصميم وتنفيذ برامج تدريبية وإرشادية بالتعاون مع اليونيسف ومفوضية الأمم المتحدة لشؤون اللاجئين.",
    image: sabahImg,
  },
  {
    name: "د. مجد صقور",
    title: "نائب رئيس الجامعة للشؤون الإدارية والمالية",
    bio: "دكتوراه فلسفة في الإدارة الاستراتيجية - جامعة اكستر - 2008 - بريطانيا. ماجستير في الإدارة الدولية - جامعة اكستر - 2004 - بريطانيا. ماجستير في التسويق - كلية الاقتصاد - جامعة دمشق - 1999 - سورية. دبلوم إدارة مشاريع الصحة ومكافحة الفقر - جامعة السابيينزا - روما - إيطاليا - 2001. دبلوم إدارة الأعمال - كلية الاقتصاد - جامعة دمشق - 1996 - سورية.",
    image: majdSaqourImg,
  },
  {
    name: "د. تيسير الغول",
    title: "مدير العلاقات الدولية والأكاديمية في الشرق الأوسط",
    bio: "المشرف العام على فرع الجامعة في الشرق الأوسط. مدير العلاقات الدولية في جامعة باشن العالمية المفتوحة ومدير العلاقات الدولية في جامعة أفريقيا الفرنسية العربية.",
    image: tayseerImg,
  },
  {
    name: "أ. تماضر شاهين",
    title: "مدير مكتب رئيس الجامعة ومدير العلاقات الدولية",
    bio: "أخصائية تربوية تمتلك خبرة عملية تفوق 10 سنوات في مجال التعليم المبكر، متخصصة في تطبيق منهج المونتسوري وتنمية المهارات الذهنية للأطفال، بالإضافة إلى تدريب المعلمات والكوادر التربوية على الأساليب التعليمية الحديثة. مشاركة فعّالة في مؤتمرات علمية.",
    image: tamaderImg,
  },
  {
    name: "أ. كوثر بهجت هرملاني",
    title: "استشاري",
    bio: "مديرة تنفيذية في شركة ENMACON للإدارة والهندسة والاستشارات، استشارية ومدربة خبيرة في التطوير الإداري والحوكمة وتأسيس مكاتب إدارة المشاريع (PMO). سجل احترافي يمتد لأكثر من 25 عاماً. معتمدة من اتحاد نقابات المدربين العرب وعضو في مؤسسة PMI العالمية.",
    image: kawtharImg,
  },
];

const academicMembers: TeamMember[] = [
  {
    name: "د. باسم نور الدين",
    title: "رئيس قسم القانون",
    bio: "دكتوراه في العلاقات الدولية بعنوان: \"أثر أزمة اللاجئين على الاتحاد الأوروبي – أبعادها السياسية والاقتصادية والاجتماعية\"، وبمرتبة امتياز - كلية العلوم السياسية - جامعة دمشق، عام (2021). ماجستير في العلاقات الدولية، بعنوان \"دور الفاعلين عبر الحكوميين في العلاقات الدولية المنظمات غير الحكومية نموذجاً\" - كلية العلوم السياسية، جامعة دمشق، عام (2015). إجازة في الحقوق، كلية الحقوق، جامعة دمشق، عام 2008.",
    image: basemImg,
  },
  {
    name: "د. سلوى مرتضى",
    title: "رئيس قسم تربية الأطفال",
    bio: "أكاديمية سورية متخصصة في تربية الطفل ورياض الأطفال، تمتلك خبرة علمية وعملية تمتد لأكثر من ثلاثة عقود في التعليم الجامعي. حاصلة على دكتوراه في التوجيه التربوي بتقدير امتياز. شغلت منصب رئيسة قسم تربية الطفل في كلية التربية بجامعة دمشق، ومدربة معتمدة في أكاديمية كنجستون للأعمال.",
    image: salwaImg,
  },
  {
    name: "د. طيف محمد",
    title: "رئيس قسم الإعلام",
    bio: "حاصلة على دكتوراه في الصحافة والنشر من جامعة دمشق. تعمل مدرّسة برتبة جامعية دكتور في قسم الصحافة والنشر بكلية الإعلام. باحثة ومستشارة إعلامية. لها عدة أبحاث منشورة في مجلات جامعية محكّمة.",
    image: taifImg,
  },
  {
    name: "أ. هلا دقوري",
    title: "رئيس قسم الترجمة",
    bio: "حاصلة على ماجستير في الترجمة الفورية من المعهد العالي للترجمة. تمتلك خبرة تدريسية واسعة في جامعة دمشق وعدة جامعات خاصة. متخصصة في الترجمة التحريرية والفورية والسمعبصرية. تدرّس حالياً في كلية الآداب والمعهد العالي للسينما.",
    image: halaImg,
  },
  {
    name: "د. مصطفى مصطفى",
    title: "رئيس قسم المعادلات",
    bio: "طبيب مساعد يتمتع بخبرة عملية في المجال الطبي، خاصة في أقسام الطوارئ والجراحة العامة وجراحة الصدر وعلم الأمراض. حاصل على تعليم جامعي من الجامعة السورية الخاصة. يتقن اللغات العربية والألمانية والإنجليزية.",
    image: moustafaImg,
  },
  {
    name: "أ. عمر أحمد عبدو",
    title: "رئيس قسم العلوم الشرعية",
    bio: "باحث دكتوراه في أصول الفقه. يمتلك خبرة تعليمية تمتد لأكثر من 15 عاماً في مدارس دولية وأكاديميات عالمية في الإمارات. مقدّم برامج توعوية إذاعية، ومدير سابق لمعاهد القرآن الكريم.",
    image: omarImg,
  },
];

function MemberCard({ member }: { member: TeamMember }) {
  const [showZoom, setShowZoom] = useState(false);

  return (
    <>
      <div className="bg-primary rounded-xl p-8 text-center flex flex-col items-center shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div
          className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center mb-5 border-3 border-accent/30 bg-primary-foreground/10 cursor-pointer hover-scale"
          onClick={() => member.image && setShowZoom(true)}
        >
          {member.image ? (
            <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
          ) : (
            <User size={48} className="text-primary-foreground/40" />
          )}
        </div>
        <h3 className="text-lg font-bold text-primary-foreground mb-2">{member.name}</h3>
        <p className="text-sm font-semibold text-accent mb-3">{member.title}</p>
        <p className="text-sm text-primary-foreground/70 leading-relaxed">{member.bio}</p>
      </div>

      {showZoom && member.image && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in cursor-pointer"
          onClick={() => setShowZoom(false)}
        >
          <button
            className="absolute top-4 right-4 text-primary-foreground bg-primary/80 rounded-full p-2 hover:bg-primary transition-colors"
            onClick={() => setShowZoom(false)}
          >
            <X size={24} />
          </button>
          <img
            src={member.image}
            alt={member.name}
            className="max-w-[90vw] max-h-[85vh] rounded-2xl shadow-2xl animate-scale-in object-contain"
          />
        </div>
      )}
    </>
  );
}

export default function TeamSection() {
  return (
    <section id="team" className="py-20 bg-[hsl(var(--section-alt))]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-sm font-semibold text-accent tracking-wider mb-2">فريق الجامعة</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">الهيكل الإداري والأكاديمي</h2>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
        </div>

        {/* Intro */}
        <p className="text-center text-foreground/70 text-sm leading-[2] max-w-3xl mx-auto mb-14">
          يضم فريق الجامعة الإفريقية الفرنسية العربية نخبة من الأكاديميين والخبراء والإداريين الذين يعملون بروح مهنية عالية لضمان تقديم تعليم جامعي بمعايير دولية. يجمع الفريق بين الخبرات الإفريقية والفرنسية والعربية، مما يخلق بيئة تعليمية متعددة الثقافات تدعم الابتكار، البحث العلمي، وتطوير المهارات.
        </p>

        {/* Admin Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-primary mb-8 text-center">الهيئة الإدارية</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {adminMembers.map((member, i) => (
              <MemberCard key={i} member={member} />
            ))}
          </div>
        </div>

        {/* Academic Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-primary mb-4 text-center">الهيئة التدريسية</h3>
          <p className="text-center text-foreground/60 text-sm leading-[2] max-w-2xl mx-auto mb-8">
            تضم الجامعة مجموعة من الأساتذة والمحاضرين المتخصصين في مختلف المجالات، ممن يمتلكون خبرات أكاديمية وبحثية واسعة، ويساهمون في بناء بيئة تعليمية محفزة على التفكير النقدي والإبداع.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {academicMembers.map((member, i) => (
              <MemberCard key={i} member={member} />
            ))}
          </div>
        </div>

        {/* Commitment */}
        <div className="bg-primary rounded-xl p-8 text-center max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-primary-foreground mb-3">التزامنا</h3>
          <p className="text-primary-foreground/80 text-sm leading-[2]">
            يعمل فريق الجامعة بتكامل وتعاون لضمان تقديم تجربة تعليمية متميزة، قائمة على الجودة، الانفتاح الثقافي، والابتكار. نلتزم ببناء بيئة جامعية تدعم الطالب أكاديميًا، مهنيًا، وإنسانيًا.
          </p>
        </div>
      </div>
    </section>
  );
}
