import { User } from "lucide-react";

import salwaImg from "@/assets/team/salwa.jpg";
import tamaderImg from "@/assets/team/tamader.jpg";
import kawtharImg from "@/assets/team/kawthar.jpg";
import taifImg from "@/assets/team/taif.jpg";
import halaImg from "@/assets/team/hala.jpg";
import moustafaImg from "@/assets/team/moustafa.jpg";
import omarImg from "@/assets/team/omar.jpg";
import tayseerImg from "@/assets/team/tayseer.jpg";

type TeamMember = {
  name: string;
  title: string;
  bio: string;
  image?: string;
};

const teamMembers: TeamMember[] = [
  {
    name: "د. تيسير الغول",
    title: "مدير العلاقات الدولية والأكاديمية في الشرق الأوسط",
    bio: "المشرف العام على فرع الجامعة في الشرق الأوسط. مدير العلاقات الدولية في جامعة باشن العالمية المفتوحة ومدير العلاقات الدولية في جامعة أفريقيا الفرنسية العربية.",
    image: tayseerImg,
  },
  {
    name: "د. سلوى مرتضى",
    title: "مدرب دبلوم للتأهيل التربوي ومهارات البحث العلمي",
    bio: "أكاديمية سورية متخصصة في تربية الطفل ورياض الأطفال، تمتلك خبرة علمية وعملية تمتد لأكثر من ثلاثة عقود في التعليم الجامعي. حاصلة على دكتوراه في التوجيه التربوي بتقدير امتياز. شغلت منصب رئيسة قسم تربية الطفل في كلية التربية بجامعة دمشق، ومدربة معتمدة في أكاديمية كنجستون للأعمال.",
    image: salwaImg,
  },
  {
    name: "أ. تماضر شاهين",
    title: "مديرة مكتب المدير العام",
    bio: "أخصائية تربوية تمتلك خبرة عملية تفوق 10 سنوات في مجال التعليم المبكر، متخصصة في تطبيق منهج المونتسوري وتنمية المهارات الذهنية للأطفال، بالإضافة إلى تدريب المعلمات والكوادر التربوية على الأساليب التعليمية الحديثة. مشاركة فعّالة في مؤتمرات علمية.",
    image: tamaderImg,
  },
  {
    name: "أ. كوثر بهجت هرملاني",
    title: "استشاري إداري",
    bio: "مديرة تنفيذية في شركة ENMACON للإدارة والهندسة والاستشارات، استشارية ومدربة خبيرة في التطوير الإداري والحوكمة وتأسيس مكاتب إدارة المشاريع (PMO). سجل احترافي يمتد لأكثر من 25 عاماً. معتمدة من اتحاد نقابات المدربين العرب وعضو في مؤسسة PMI العالمية.",
    image: kawtharImg,
  },
  {
    name: "د. طيف محمد",
    title: "مدرس في كلية الإعلام – جامعة دمشق",
    bio: "حاصل على دكتوراه في الصحافة والنشر من جامعة دمشق. يعمل مدرساً برتبة جامعية دكتور في قسم الصحافة والنشر بكلية الإعلام. باحث إعلامي ومستشار إعلامي لمجلة الألوان للطباعة والنشر. له عدة أبحاث منشورة في مجلات جامعية محكّمة.",
    image: taifImg,
  },
  {
    name: "أ. هلا دقوري",
    title: "أستاذة جامعية ومترجمة فورية محلّفة",
    bio: "حاصلة على ماجستير في الترجمة الفورية من المعهد العالي للترجمة. تمتلك خبرة تدريسية واسعة في جامعة دمشق وعدة جامعات خاصة. متخصصة في الترجمة التحريرية والفورية والسمعبصرية. تدرّس حالياً في كلية الآداب والمعهد العالي للسينما.",
    image: halaImg,
  },
  {
    name: "د. محمد إسماعيل",
    title: "باحث وأستاذ جامعي في إدارة الأعمال",
    bio: "حاصل على دكتوراه في إدارة الأعمال من جامعة دمشق. عمل باحثاً في المعهد الملكي للتكنولوجيا KTH في ستوكهولم وجامعة غوتنبرغ. حائز على جائزة Emerald Literati للتميز البحثي. يتقن خمس لغات ولديه خبرة أكاديمية دولية واسعة.",
  },
  {
    name: "د. مصطفى مصطفى",
    title: "رئيس قسم القطاع الصحي",
    bio: "طبيب مساعد يتمتع بخبرة عملية في المجال الطبي، خاصة في أقسام الطوارئ والجراحة العامة وجراحة الصدر وعلم الأمراض. حاصل على تعليم جامعي من الجامعة السورية الخاصة. يتقن اللغات العربية والألمانية والإنجليزية.",
    image: moustafaImg,
  },
  {
    name: "أ. عمر أحمد عبدو",
    title: "مدرّس تربية إسلامية",
    bio: "حاصل على دكتوراه في أصول الفقه. يمتلك خبرة تعليمية تمتد لأكثر من 15 عاماً في مدارس دولية وأكاديميات عالمية في الإمارات. مقدّم برامج توعوية إذاعية، ومدير سابق لمعاهد القرآن الكريم.",
    image: omarImg,
  },
];

export default function TeamSection() {
  return (
    <section id="team" className="py-20 bg-[hsl(var(--section-alt))]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-accent tracking-wider mb-2">القيادة</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">فريق العمل</h2>
          <div className="w-16 h-1 bg-accent mx-auto mt-4 rounded-full" />
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, i) => (
            <div
              key={i}
              className="bg-primary rounded-xl p-8 text-center flex flex-col items-center shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {/* Avatar */}
              <div className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center mb-5 border-2 border-primary-foreground/20 bg-primary-foreground/10">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-primary-foreground/40" />
                )}
              </div>

              {/* Name */}
              <h3 className="text-lg font-bold text-primary-foreground mb-2">
                {member.name}
              </h3>

              {/* Title */}
              <p className="text-sm font-semibold text-accent mb-3">
                {member.title}
              </p>

              {/* Bio */}
              <p className="text-sm text-primary-foreground/70 leading-relaxed">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
