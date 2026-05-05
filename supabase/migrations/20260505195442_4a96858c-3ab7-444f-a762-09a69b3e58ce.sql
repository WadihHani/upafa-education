-- Create program_courses table for academic course catalogs
CREATE TABLE public.program_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_slug text NOT NULL,
  program_name text NOT NULL DEFAULT '',
  level text NOT NULL DEFAULT 'bachelor',
  year integer NOT NULL DEFAULT 1,
  semester integer,
  code text NOT NULL DEFAULT '',
  title_ar text NOT NULL,
  credit_hours numeric NOT NULL DEFAULT 3,
  prerequisite text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'department',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_program_courses_program ON public.program_courses(program_slug, year, sort_order);

ALTER TABLE public.program_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view program courses"
  ON public.program_courses FOR SELECT
  USING (true);

CREATE POLICY "Admins manage program courses"
  ON public.program_courses FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_program_courses_updated_at
  BEFORE UPDATE ON public.program_courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();