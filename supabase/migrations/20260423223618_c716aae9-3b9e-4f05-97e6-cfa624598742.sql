-- ====== Attendance ======
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late', 'excused');

CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  student_user_id UUID NOT NULL,
  session_date DATE NOT NULL,
  status public.attendance_status NOT NULL DEFAULT 'present',
  notes TEXT NOT NULL DEFAULT '',
  marked_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id, session_date)
);

CREATE INDEX idx_attendance_course_date ON public.attendance_records(course_id, session_date DESC);
CREATE INDEX idx_attendance_student ON public.attendance_records(student_user_id);

ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all attendance"
ON public.attendance_records FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers manage attendance for own courses"
ON public.attendance_records FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = attendance_records.course_id AND c.teacher_user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = attendance_records.course_id AND c.teacher_user_id = auth.uid()));

CREATE POLICY "Students view own attendance"
ON public.attendance_records FOR SELECT TO authenticated
USING (auth.uid() = student_user_id);

CREATE TRIGGER update_attendance_records_updated_at
BEFORE UPDATE ON public.attendance_records
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ====== Assessments ======
CREATE TYPE public.assessment_kind AS ENUM ('quiz', 'assignment', 'project', 'exam');
CREATE TYPE public.submission_status AS ENUM ('submitted', 'graded', 'late');

CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  kind public.assessment_kind NOT NULL DEFAULT 'assignment',
  max_score NUMERIC NOT NULL DEFAULT 100,
  due_at TIMESTAMPTZ,
  resource_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assessments_course ON public.assessments(course_id, created_at DESC);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all assessments"
ON public.assessments FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers manage own course assessments"
ON public.assessments FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = assessments.course_id AND c.teacher_user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = assessments.course_id AND c.teacher_user_id = auth.uid()));

CREATE POLICY "Approved students view published assessments"
ON public.assessments FOR SELECT TO authenticated
USING (
  is_published = true AND EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.course_id = assessments.course_id
      AND e.student_user_id = auth.uid()
      AND e.status = 'approved'
  )
);

CREATE TRIGGER update_assessments_updated_at
BEFORE UPDATE ON public.assessments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ====== Assessment Submissions ======
CREATE TABLE public.assessment_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_user_id UUID NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  file_path TEXT,
  link_url TEXT,
  status public.submission_status NOT NULL DEFAULT 'submitted',
  score NUMERIC,
  feedback TEXT NOT NULL DEFAULT '',
  graded_by UUID,
  graded_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (assessment_id, student_user_id)
);

CREATE INDEX idx_submissions_assessment ON public.assessment_submissions(assessment_id);
CREATE INDEX idx_submissions_student ON public.assessment_submissions(student_user_id);

ALTER TABLE public.assessment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all submissions"
ON public.assessment_submissions FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers manage submissions for own courses"
ON public.assessment_submissions FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.assessments a
  JOIN public.courses c ON c.id = a.course_id
  WHERE a.id = assessment_submissions.assessment_id AND c.teacher_user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.assessments a
  JOIN public.courses c ON c.id = a.course_id
  WHERE a.id = assessment_submissions.assessment_id AND c.teacher_user_id = auth.uid()
));

CREATE POLICY "Students view own submissions"
ON public.assessment_submissions FOR SELECT TO authenticated
USING (auth.uid() = student_user_id);

CREATE POLICY "Students create own submissions"
ON public.assessment_submissions FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = student_user_id
  AND EXISTS (
    SELECT 1 FROM public.assessments a
    JOIN public.enrollments e ON e.course_id = a.course_id
    WHERE a.id = assessment_submissions.assessment_id
      AND e.student_user_id = auth.uid()
      AND e.status = 'approved'
  )
);

CREATE POLICY "Students update own ungraded submissions"
ON public.assessment_submissions FOR UPDATE TO authenticated
USING (auth.uid() = student_user_id AND status <> 'graded');

CREATE TRIGGER update_submissions_updated_at
BEFORE UPDATE ON public.assessment_submissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ====== Realtime ======
ALTER TABLE public.attendance_records REPLICA IDENTITY FULL;
ALTER TABLE public.assessments REPLICA IDENTITY FULL;
ALTER TABLE public.assessment_submissions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assessments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.assessment_submissions;