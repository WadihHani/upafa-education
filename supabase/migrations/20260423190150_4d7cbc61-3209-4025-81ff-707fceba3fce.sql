
-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Courses
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  code TEXT,
  level TEXT,
  description TEXT NOT NULL DEFAULT '',
  is_open_for_enrollment BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Enrollments
CREATE TYPE public.enrollment_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TABLE public.enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.enrollment_status NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at TIMESTAMPTZ,
  decided_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, student_user_id)
);
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Lecture materials
CREATE TABLE public.lecture_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  file_path TEXT,
  external_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lecture_materials ENABLE ROW LEVEL SECURITY;

-- Grades
CREATE TYPE public.grade_section AS ENUM (
  'recorded_lectures','attendance','quizzes','midterm','activities','projects','final','overall'
);
CREATE TABLE public.grades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  section public.grade_section NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  score NUMERIC(6,2),
  max_score NUMERIC(6,2) DEFAULT 100,
  notes TEXT,
  graded_by UUID REFERENCES auth.users(id),
  graded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- Triggers for timestamps
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER enrollments_updated_at BEFORE UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER lecture_materials_updated_at BEFORE UPDATE ON public.lecture_materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER grades_updated_at BEFORE UPDATE ON public.grades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.email, ''));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ POLICIES ============

-- profiles
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers view enrolled student profiles" ON public.profiles
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'teacher') AND EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.courses c ON c.id = e.course_id
      WHERE e.student_user_id = profiles.user_id
        AND c.teacher_user_id = auth.uid()
        AND e.status = 'approved'
    )
  );
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins update any profile" ON public.profiles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert profiles" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins delete profiles" ON public.profiles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- courses
CREATE POLICY "Anyone authenticated views courses" ON public.courses
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers create own courses" ON public.courses
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = teacher_user_id AND public.has_role(auth.uid(), 'teacher')
  );
CREATE POLICY "Admins create any courses" ON public.courses
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers update own courses" ON public.courses
  FOR UPDATE TO authenticated USING (auth.uid() = teacher_user_id);
CREATE POLICY "Admins update courses" ON public.courses
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers delete own courses" ON public.courses
  FOR DELETE TO authenticated USING (auth.uid() = teacher_user_id);
CREATE POLICY "Admins delete courses" ON public.courses
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- enrollments
CREATE POLICY "Students view own enrollments" ON public.enrollments
  FOR SELECT TO authenticated USING (auth.uid() = student_user_id);
CREATE POLICY "Teachers view enrollments for own courses" ON public.enrollments
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = enrollments.course_id AND c.teacher_user_id = auth.uid())
  );
CREATE POLICY "Admins view all enrollments" ON public.enrollments
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Students request enrollment" ON public.enrollments
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = student_user_id AND public.has_role(auth.uid(), 'student') AND status = 'pending'
  );
CREATE POLICY "Teachers invite students to own courses" ON public.enrollments
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = enrollments.course_id AND c.teacher_user_id = auth.uid())
  );
CREATE POLICY "Admins create any enrollment" ON public.enrollments
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Teachers update enrollments for own courses" ON public.enrollments
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = enrollments.course_id AND c.teacher_user_id = auth.uid())
  );
CREATE POLICY "Admins update any enrollment" ON public.enrollments
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Students cancel own pending enrollment" ON public.enrollments
  FOR DELETE TO authenticated USING (auth.uid() = student_user_id AND status = 'pending');
CREATE POLICY "Teachers remove enrollments from own courses" ON public.enrollments
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.courses c WHERE c.id = enrollments.course_id AND c.teacher_user_id = auth.uid())
  );
CREATE POLICY "Admins delete any enrollment" ON public.enrollments
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- lecture_materials
CREATE POLICY "Teachers manage own course materials" ON public.lecture_materials
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = lecture_materials.course_id AND c.teacher_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = lecture_materials.course_id AND c.teacher_user_id = auth.uid()));
CREATE POLICY "Admins manage all materials" ON public.lecture_materials
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Approved students view course materials" ON public.lecture_materials
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id = lecture_materials.course_id
        AND e.student_user_id = auth.uid()
        AND e.status = 'approved'
    )
  );

-- grades
CREATE POLICY "Students view own grades" ON public.grades
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.enrollments e WHERE e.id = grades.enrollment_id AND e.student_user_id = auth.uid())
  );
CREATE POLICY "Teachers manage grades for own courses" ON public.grades
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.courses c ON c.id = e.course_id
      WHERE e.id = grades.enrollment_id AND c.teacher_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      JOIN public.courses c ON c.id = e.course_id
      WHERE e.id = grades.enrollment_id AND c.teacher_user_id = auth.uid()
    )
  );
CREATE POLICY "Admins manage all grades" ON public.grades
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- user_roles: admin management + own role visibility
CREATE POLICY "Admins insert roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update roles" ON public.user_roles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete roles" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Storage: lecture-materials bucket (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('lecture-materials', 'lecture-materials', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Teachers upload to own course folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'lecture-materials'
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id::text = (storage.foldername(name))[1] AND c.teacher_user_id = auth.uid()
    )
  );
CREATE POLICY "Teachers manage own course files"
  ON storage.objects FOR ALL TO authenticated
  USING (
    bucket_id = 'lecture-materials'
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id::text = (storage.foldername(name))[1] AND c.teacher_user_id = auth.uid()
    )
  );
CREATE POLICY "Approved students read course files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'lecture-materials'
    AND EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.course_id::text = (storage.foldername(name))[1]
        AND e.student_user_id = auth.uid() AND e.status = 'approved'
    )
  );
CREATE POLICY "Admins manage all lecture files"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'lecture-materials' AND public.has_role(auth.uid(), 'admin'));
