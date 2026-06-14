
-- Extend site_content
ALTER TABLE public.site_content
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS link_url text,
  ADD COLUMN IF NOT EXISTS content_type text NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS group_key text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS label text,
  ADD COLUMN IF NOT EXISTS sort_order int NOT NULL DEFAULT 0;

-- Nav items (navbar + footer + dropdowns)
CREATE TABLE IF NOT EXISTS public.nav_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL,            -- 'navbar' | 'footer_quick' | 'footer_social'
  parent_id uuid REFERENCES public.nav_items(id) ON DELETE CASCADE,
  label text NOT NULL,
  href text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.nav_items TO anon, authenticated;
GRANT ALL ON public.nav_items TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.nav_items TO authenticated;
ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nav_items public read" ON public.nav_items FOR SELECT USING (true);
CREATE POLICY "nav_items admin write" ON public.nav_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER nav_items_updated_at BEFORE UPDATE ON public.nav_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Page SEO
CREATE TABLE IF NOT EXISTS public.page_seo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL UNIQUE,
  title text,
  description text,
  og_image_url text,
  noindex boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.page_seo TO anon, authenticated;
GRANT ALL ON public.page_seo TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.page_seo TO authenticated;
ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "page_seo public read" ON public.page_seo FOR SELECT USING (true);
CREATE POLICY "page_seo admin write" ON public.page_seo FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER page_seo_updated_at BEFORE UPDATE ON public.page_seo
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed nav_items with current navbar
INSERT INTO public.nav_items (location, label, href, sort_order) VALUES
  ('navbar','الرئيسية','/',1),
  ('navbar','عن الجامعة','/about',2),
  ('navbar','المؤتمرات والندوات','/conferences',3),
  ('navbar','الرسوم والتسجيل','/tuition-fees',4),
  ('navbar','المفاضلة','/mofadla',5),
  ('navbar','البرامج','/programs',6),
  ('navbar','البوابة','/portal',7),
  ('navbar','المنشورات','/publications',8),
  ('navbar','اتصل بنا','/contact',9),
  ('footer_quick','عن الجامعة','/about',1),
  ('footer_quick','البرامج','/programs',2),
  ('footer_quick','البوابة','/portal',3),
  ('footer_quick','اتصل بنا','/contact',4)
ON CONFLICT DO NOTHING;

-- Add About dropdown children
WITH p AS (SELECT id FROM public.nav_items WHERE location='navbar' AND href='/about' LIMIT 1)
INSERT INTO public.nav_items (location,parent_id,label,href,sort_order)
SELECT 'navbar', p.id, x.label, x.href, x.sort
FROM p, (VALUES
  ('نبذة عن الجامعة','/about',1),
  ('الكليات والتخصصات','/faculties',2),
  ('نظام الدراسة والرسوم','/tuition',3),
  ('أسئلة شائعة','/faq',4)
) AS x(label,href,sort)
WHERE NOT EXISTS (SELECT 1 FROM public.nav_items WHERE parent_id=p.id);

-- Add Programs dropdown children
WITH p AS (SELECT id FROM public.nav_items WHERE location='navbar' AND href='/programs' LIMIT 1)
INSERT INTO public.nav_items (location,parent_id,label,href,sort_order)
SELECT 'navbar', p.id, x.label, x.href, x.sort
FROM p, (VALUES
  ('البكالوريوس','/programs/bachelor',1),
  ('الماجستير','/programs/master',2),
  ('الدكتوراه','/programs/phd',3),
  ('جميع البرامج','/programs',4)
) AS x(label,href,sort)
WHERE NOT EXISTS (SELECT 1 FROM public.nav_items WHERE parent_id=p.id);

-- Seed default page SEO
INSERT INTO public.page_seo (path,title,description) VALUES
  ('/','UPAFA Syria | جامعة أفريقيا الفرنسية العربية – فرع سوريا','جامعة أفريقيا الفرنسية العربية فرع سوريا - تعليم عالٍ نوعي عبر منصات التعليم عن بعد'),
  ('/about','عن الجامعة | UPAFA Syria','تعرّف على جامعة أفريقيا الفرنسية العربية فرع سوريا، رؤيتنا ورسالتنا وقيمنا'),
  ('/contact','اتصل بنا | UPAFA Syria','تواصل مع جامعة UPAFA سوريا عبر الهاتف أو البريد الإلكتروني أو واتساب'),
  ('/programs','البرامج الأكاديمية | UPAFA Syria','استكشف برامج البكالوريوس والماجستير والدكتوراه في UPAFA Syria'),
  ('/faq','أسئلة شائعة | UPAFA Syria','إجابات على الأسئلة الأكثر شيوعاً عن الدراسة في UPAFA Syria'),
  ('/tuition','نظام الدراسة والرسوم | UPAFA Syria','نظام الدراسة عن بُعد والرسوم الجامعية في UPAFA Syria'),
  ('/tuition-fees','الرسوم والتسجيل | UPAFA Syria','تفاصيل الرسوم وآلية التسجيل في UPAFA Syria'),
  ('/faculties','الكليات والتخصصات | UPAFA Syria','تعرّف على كليات وتخصصات UPAFA Syria'),
  ('/publications','المنشورات | UPAFA Syria','المنشورات والإصدارات العلمية لجامعة UPAFA Syria'),
  ('/conferences','المؤتمرات والندوات | UPAFA Syria','المؤتمرات والندوات الأكاديمية في UPAFA Syria'),
  ('/portal','بوابة الطالب والمدرس | UPAFA Syria','بوابة الدخول للطلاب والمدرسين في UPAFA Syria'),
  ('/mofadla','المفاضلة | UPAFA Syria','تقديم طلب المفاضلة في UPAFA Syria'),
  ('/payment','الدفع الإلكتروني | UPAFA Syria','طرق الدفع الإلكتروني في UPAFA Syria')
ON CONFLICT (path) DO NOTHING;
