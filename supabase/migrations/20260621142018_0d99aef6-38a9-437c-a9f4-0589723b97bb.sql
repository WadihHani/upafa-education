
-- 1. Add kuliya_id to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kuliya_id uuid REFERENCES public.kuliyat(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS profiles_kuliya_id_idx ON public.profiles(kuliya_id);

-- 2. Add kuliya_id to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS kuliya_id uuid REFERENCES public.kuliyat(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS courses_kuliya_id_idx ON public.courses(kuliya_id);

-- 3. Allow students to self-enroll directly as 'approved' (auto-join)
DROP POLICY IF EXISTS "Students request enrollment" ON public.enrollments;
CREATE POLICY "Students self-enroll directly"
ON public.enrollments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = student_user_id
  AND has_role(auth.uid(), 'student'::app_role)
  AND status IN ('pending'::enrollment_status, 'approved'::enrollment_status)
  AND EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = enrollments.course_id
      AND c.is_open_for_enrollment = true
  )
);

DROP POLICY IF EXISTS "Students cancel own pending enrollment" ON public.enrollments;
CREATE POLICY "Students leave own enrollment"
ON public.enrollments
FOR DELETE
TO authenticated
USING (auth.uid() = student_user_id);

-- 4. course_meetings table
CREATE TABLE IF NOT EXISTS public.course_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  meet_url text NOT NULL,
  scheduled_at timestamptz,
  status text NOT NULL DEFAULT 'scheduled',
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS course_meetings_course_id_idx ON public.course_meetings(course_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_meetings TO authenticated;
GRANT ALL ON public.course_meetings TO service_role;

ALTER TABLE public.course_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage own course meetings"
ON public.course_meetings
FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_meetings.course_id AND c.teacher_user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_meetings.course_id AND c.teacher_user_id = auth.uid()));

CREATE POLICY "Enrolled students view course meetings"
ON public.course_meetings
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.enrollments e
  WHERE e.course_id = course_meetings.course_id
    AND e.student_user_id = auth.uid()
    AND e.status = 'approved'::enrollment_status
));

CREATE POLICY "Admins manage all meetings"
ON public.course_meetings
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_course_meetings_updated_at
BEFORE UPDATE ON public.course_meetings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. lecture_recordings table
CREATE TABLE IF NOT EXISTS public.lecture_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  meeting_id uuid REFERENCES public.course_meetings(id) ON DELETE SET NULL,
  title text NOT NULL,
  file_path text NOT NULL,
  duration_seconds integer,
  size_bytes bigint,
  mime_type text NOT NULL DEFAULT 'audio/webm',
  recorded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS lecture_recordings_course_id_idx ON public.lecture_recordings(course_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lecture_recordings TO authenticated;
GRANT ALL ON public.lecture_recordings TO service_role;

ALTER TABLE public.lecture_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage own lecture recordings"
ON public.lecture_recordings
FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = lecture_recordings.course_id AND c.teacher_user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = lecture_recordings.course_id AND c.teacher_user_id = auth.uid()));

CREATE POLICY "Enrolled students view lecture recordings"
ON public.lecture_recordings
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.enrollments e
  WHERE e.course_id = lecture_recordings.course_id
    AND e.student_user_id = auth.uid()
    AND e.status = 'approved'::enrollment_status
));

CREATE POLICY "Admins manage all recordings"
ON public.lecture_recordings
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_lecture_recordings_updated_at
BEFORE UPDATE ON public.lecture_recordings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
