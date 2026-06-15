// Default values currently rendered on /mofadla as EditableText fallbacks.
// Keep in sync with src/pages/Mofadla.tsx — used by AdminMofadlaContent to
// pre-fill fields when no site_content row exists yet.

export const MOFADLA_DEFAULTS: Record<string, string> = {
  // Hero
  mofadla_hero_badge: "مفاضلة صيف 2026",
  mofadla_hero_title: "التقديم على المفاضلة الجامعية",
  mofadla_hero_desc:
    "فُتح باب التقديم على مفاضلة صيف 2026 في جامعة UPAFA – فرع سوريا. أكمل طلبك إلكترونياً خلال دقائق، اختر الكلية والاختصاص المناسبين لك، وثبّت مقعدك الجامعي.",
  mofadla_cta_apply: "قدّم الآن",
  mofadla_cta_register: "تثبيت التسجيل",
  mofadla_cta_programs: "عرض البرامج المتاحة",

  // Stats (4 cards)
  mofadla_stat_1_label: "بدء التسجيل",
  mofadla_stat_1_value: "27 / 4",
  mofadla_stat_2_label: "آخر موعد",
  mofadla_stat_2_value: "15 / 6",
  mofadla_stat_3_label: "إعلان النتائج",
  mofadla_stat_3_value: "15 / 6",
  mofadla_stat_4_label: "بدء الفصل الصيفي",
  mofadla_stat_4_value: "25 / 6",

  // Calendar
  mofadla_cal_badge: "التقويم الجامعي",
  mofadla_cal_title: "التقويم الجامعي للعام الدراسي 2026 - 2027",
  mofadla_cal_subtitle: "جدول الفصلين الدراسيين: التسجيل، بداية الفصل، والامتحانات.",
  mofadla_sem1_title: "الفصل الأول",
  mofadla_sem1_duration: "16 أسبوعاً تقريباً",
  mofadla_sem1_rows:
    "بدء التسجيل|آب + أيلول\nبداية الفصل|تشرين الأول\nالامتحانات|آخر كانون الثاني",
  mofadla_sem2_title: "الفصل الثاني",
  mofadla_sem2_duration: "16 أسبوعاً تقريباً",
  mofadla_sem2_rows:
    "بدء التسجيل|بداية شباط\nبداية الفصل الثاني|شباط\nالامتحانات|حزيران",

  // Docs + Steps
  mofadla_docs_badge: "الوثائق المطلوبة",
  mofadla_docs_title: "ما تحتاجه لإتمام التقديم",
  mofadla_docs_subtitle: "جهّز نسخاً واضحة من الوثائق التالية قبل البدء بالتقديم.",
  mofadla_docs_list:
    "صورة شخصية حديثة بخلفية بيضاء\nصورة عن الهوية الشخصية / الرقم الوطني\nوثيقة درجات شهادة الثانوية العامة (الأصلية)\nصورة مصدّقة عن شهادة الثانوية العامة\nإخراج قيد فردي حديث (لا يتجاوز 3 أشهر)\nإيصال دفع رسم التقديم",
  mofadla_steps_badge: "كيف تتقدّم؟",
  mofadla_steps_title: "خطوات بسيطة لإكمال طلبك",
  mofadla_steps_subtitle: "نظام التقديم إلكتروني بالكامل ولن يستغرق منك أكثر من 10 دقائق.",
  mofadla_steps_list:
    "أدخل بياناتك الشخصية|اسم رباعي، رقم وطني، تواصل، وعنوان.\nأدخل معدلك|اختر الفرع وأدخل معدل الثانوية أو آخر شهادة.\nرتّب الرغبات|اختر البرامج التي تناسبك ورتّبها حسب الأولوية.\nأرسل الطلب|احصل على رقم الطلب واحتفظ به للمراجعة.",

  // Downloads meta
  mofadla_dl_badge: "ملفات للتحميل",
  mofadla_dl_title: "الوثائق والإجراءات الرسمية",
  mofadla_dl_subtitle:
    "حمّل الملفات التالية للاطلاع على إجراءات القيد وجداول البرامج بشكل تفصيلي.",
  mofadla_dl_btn: "تحميل PDF",
  mofadla_dl_list:
    "إجراءات القيد لدرجة الإجازة|الشروط والوثائق المطلوبة للقيد في مرحلة الإجازة.|/downloads/registration-bachelor.pdf\nإجراءات القيد لدرجة الماجستير|الشروط والوثائق المطلوبة للقيد في مرحلة الماجستير.|/downloads/registration-master.pdf\nإجراءات القيد لدرجة الدكتوراه|الشروط والوثائق المطلوبة للقيد في مرحلة الدكتوراه.|/downloads/registration-phd.pdf\nجداول البرامج|الجداول التفصيلية للبرامج الأكاديمية المتاحة.|/downloads/programs-schedule.pdf",

  // Programs section text
  mofadla_prog_badge: "البرامج المتاحة",
  mofadla_prog_title: "اختصاصات مفاضلة صيف 2026",
  mofadla_prog_subtitle:
    "اطّلع على البرامج المفتوحة للتقديم وعدد المقاعد والحدّ الأدنى للقبول.",
  mofadla_prog_empty: "لا توجد برامج مفتوحة للتقديم حالياً. يرجى المتابعة لاحقاً.",
  mofadla_prog_seats_label: "المقاعد:",
  mofadla_prog_min_label: "الحد الأدنى:",

  // Register
  mofadla_reg_badge: "تثبيت التسجيل",
  mofadla_reg_title: "تثبيت التسجيل في المفاضلة",
  mofadla_reg_subtitle:
    "املأ بياناتك الشخصية وارفع المستندات المطلوبة وإيصال دفع رسوم التسجيل من خلال النموذج التالي.",

  // Notes
  mofadla_notes_badge: "ملاحظات هامة",
  mofadla_notes_title: "قبل أن تبدأ التقديم",
  mofadla_notes_subtitle: "معلومات يجب عليك معرفتها لضمان قبول طلبك.",
  mofadla_notes_list:
    "الطلب الإلكتروني نهائي بعد الإرسال ولا يمكن تعديله — راجع بياناتك جيداً.\nترتيب الرغبات مهمّ: سيُقبل الطالب في أعلى رغبة تسمح بها علامته ومقاعدها متوفرة.\nأيّ بيانات أو علامات غير صحيحة تؤدي إلى استبعاد الطلب نهائياً.\nاحتفظ برقم الطلب الذي يظهر بعد الإرسال للرجوع إليه عند الاستفسار.\nستتواصل معك إدارة الجامعة عبر الهاتف أو البريد عند صدور النتائج.",

  // CTA + contact
  mofadla_cta_title: "جاهز للتقديم؟ ثبّت مقعدك الآن",
  mofadla_cta_desc:
    "ابدأ تعبئة طلبك مباشرة. لن يستغرق الأمر أكثر من 10 دقائق، وستحصل على رقم طلب فوري لمتابعة حالة قبولك.",
  mofadla_cta_apply_btn: "قدّم الآن",
  mofadla_cta_faq_btn: "أسئلة شائعة",
  mofadla_contact_title: "للاستفسار والدعم",
  mofadla_contact_phone: "+963 989 801 010",
  mofadla_contact_wa: "+963 989 801 010",
  mofadla_contact_email: "academic@upafa.education",
  mofadla_contact_address: "دمشق – سوريا",

  // SEO
  mofadla_seo_title: "المفاضلة والقبول الجامعي 2026 | UPAFA سوريا",
  mofadla_seo_desc:
    "مفاضلة جامعة UPAFA – فرع سوريا 2026: التخصصات المتاحة، شروط القبول، والتسجيل المباشر للمتقدمين الجدد.",
};
