
-- Mofadla branch enum (academic track)
CREATE TYPE public.mofadla_branch AS ENUM ('scientific', 'literary', 'both');
CREATE TYPE public.application_status AS ENUM ('pending', 'accepted', 'rejected', 'waitlisted');

-- Programs offered in the mofadla
CREATE TABLE public.mofadla_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  faculty TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  seats INTEGER NOT NULL DEFAULT 0,
  min_score NUMERIC NOT NULL DEFAULT 0,
  required_branch public.mofadla_branch NOT NULL DEFAULT 'both',
  is_open BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Application from a candidate
CREATE TABLE public.mofadla_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  national_id TEXT NOT NULL,
  exam_number TEXT NOT NULL DEFAULT '',
  birth_date DATE,
  gender TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  branch public.mofadla_branch NOT NULL,
  total_score NUMERIC NOT NULL DEFAULT 0,
  graduation_year INTEGER,
  notes TEXT NOT NULL DEFAULT '',
  status public.application_status NOT NULL DEFAULT 'pending',
  accepted_program_id UUID REFERENCES public.mofadla_programs(id) ON DELETE SET NULL,
  admin_notes TEXT NOT NULL DEFAULT '',
  decided_at TIMESTAMPTZ,
  decided_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mofadla_apps_status ON public.mofadla_applications(status);
CREATE INDEX idx_mofadla_apps_national_id ON public.mofadla_applications(national_id);

-- Per-subject grades for an application
CREATE TABLE public.mofadla_application_grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.mofadla_applications(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  max_score NUMERIC NOT NULL DEFAULT 100,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mofadla_grades_app ON public.mofadla_application_grades(application_id);

-- Ordered program preferences for an application
CREATE TABLE public.mofadla_application_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.mofadla_applications(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.mofadla_programs(id) ON DELETE CASCADE,
  preference_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (application_id, program_id),
  UNIQUE (application_id, preference_order)
);

CREATE INDEX idx_mofadla_prefs_app ON public.mofadla_application_preferences(application_id);
CREATE INDEX idx_mofadla_prefs_prog ON public.mofadla_application_preferences(program_id);

-- Enable RLS
ALTER TABLE public.mofadla_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mofadla_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mofadla_application_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mofadla_application_preferences ENABLE ROW LEVEL SECURITY;

-- Programs: public read, admin write
CREATE POLICY "Public can view mofadla programs"
ON public.mofadla_programs FOR SELECT TO public USING (true);

CREATE POLICY "Admins manage mofadla programs"
ON public.mofadla_programs FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Applications: anyone (anonymous) can submit, only admins can view/manage
CREATE POLICY "Anyone can submit application"
ON public.mofadla_applications FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Admins view all applications"
ON public.mofadla_applications FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update applications"
ON public.mofadla_applications FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete applications"
ON public.mofadla_applications FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Grades: anyone can insert (during submission), only admins can read/manage
CREATE POLICY "Anyone can submit grades"
ON public.mofadla_application_grades FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Admins view grades"
ON public.mofadla_application_grades FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage grades"
ON public.mofadla_application_grades FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Preferences: anyone can insert, only admins can read/manage
CREATE POLICY "Anyone can submit preferences"
ON public.mofadla_application_preferences FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Admins view preferences"
ON public.mofadla_application_preferences FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage preferences"
ON public.mofadla_application_preferences FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at triggers
CREATE TRIGGER set_mofadla_programs_updated
BEFORE UPDATE ON public.mofadla_programs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_mofadla_applications_updated
BEFORE UPDATE ON public.mofadla_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
