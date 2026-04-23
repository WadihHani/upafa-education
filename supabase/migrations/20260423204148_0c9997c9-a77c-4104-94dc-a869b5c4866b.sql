-- ============ Categories ============
CREATE TABLE public.news_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'Newspaper',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_highlighted BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.news_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active categories"
  ON public.news_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins view all categories"
  ON public.news_categories FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage categories"
  ON public.news_categories FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_news_categories_updated
  BEFORE UPDATE ON public.news_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Posts ============
CREATE TABLE public.news_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.news_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT,
  summary TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT,
  video_url TEXT,
  attachment_url TEXT,
  attachment_name TEXT,
  external_link TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_news_posts_category ON public.news_posts(category_id);
CREATE INDEX idx_news_posts_published ON public.news_posts(is_published, published_at DESC);

ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published posts"
  ON public.news_posts FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins view all posts"
  ON public.news_posts FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage posts"
  ON public.news_posts FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_news_posts_updated
  BEFORE UPDATE ON public.news_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Storage bucket ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('news-media', 'news-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read news-media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'news-media');

CREATE POLICY "Admins upload news-media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'news-media' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update news-media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'news-media' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete news-media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'news-media' AND has_role(auth.uid(), 'admin'::app_role));

-- ============ Seed default categories ============
INSERT INTO public.news_categories (key, title, icon_name, sort_order, is_highlighted) VALUES
  ('mofadla',          'مفاضلة خريف 2025',                      'Megaphone',  1, true),
  ('university-news',  'أخبار الجامعة',                          'Newspaper',  2, false),
  ('exams-news',       'أخبار الامتحانات',                       'GraduationCap', 3, false),
  ('student-affairs',  'أخبار شؤون الطلاب',                      'CalendarDays',  4, false),
  ('thesis-defense',   'مناقشة رسائل الماجستير والدكتوراه',     'FileText',  5, false),
  ('training-center',  'أخبار مركز التدريب',                     'Megaphone',  6, false),
  ('student-notes',    'ملاحظات الطلاب',                          'AlertCircle', 7, false);