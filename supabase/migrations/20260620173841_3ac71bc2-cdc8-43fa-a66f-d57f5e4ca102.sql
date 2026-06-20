
CREATE TABLE public.kuliyat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  bachelor_departments jsonb NOT NULL DEFAULT '[]'::jsonb,
  master_departments jsonb NOT NULL DEFAULT '[]'::jsonb,
  admission_requirements text DEFAULT '',
  fees text DEFAULT '',
  display_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.kuliyat TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kuliyat TO authenticated;
GRANT ALL ON public.kuliyat TO service_role;

ALTER TABLE public.kuliyat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published kuliyat"
  ON public.kuliyat FOR SELECT
  USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert kuliyat"
  ON public.kuliyat FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update kuliyat"
  ON public.kuliyat FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete kuliyat"
  ON public.kuliyat FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_kuliyat_updated_at
  BEFORE UPDATE ON public.kuliyat
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
