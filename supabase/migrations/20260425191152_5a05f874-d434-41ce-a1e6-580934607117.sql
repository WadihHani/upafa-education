-- 1) Fix search_path for email queue functions
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public;

-- 2) Tighten permissive "WITH CHECK (true)" INSERT policies on mofadla tables
DROP POLICY IF EXISTS "Anyone can submit application" ON public.mofadla_applications;
CREATE POLICY "Anyone can submit application"
  ON public.mofadla_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(full_name)) > 0
    AND length(trim(national_id)) > 0
    AND length(trim(phone)) > 0
  );

DROP POLICY IF EXISTS "Anyone can submit grades" ON public.mofadla_application_grades;
CREATE POLICY "Anyone can submit grades"
  ON public.mofadla_application_grades
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    application_id IS NOT NULL
    AND length(trim(subject)) > 0
  );

DROP POLICY IF EXISTS "Anyone can submit preferences" ON public.mofadla_application_preferences;
CREATE POLICY "Anyone can submit preferences"
  ON public.mofadla_application_preferences
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    application_id IS NOT NULL
    AND program_id IS NOT NULL
  );