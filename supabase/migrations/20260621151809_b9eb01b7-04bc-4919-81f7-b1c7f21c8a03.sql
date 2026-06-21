GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_meetings TO authenticated;
GRANT ALL ON public.course_meetings TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lecture_recordings TO authenticated;
GRANT ALL ON public.lecture_recordings TO service_role;