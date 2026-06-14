
-- Admin-only read/delete for mofadla-receipts bucket (bucket already set to private)
DROP POLICY IF EXISTS "Public can read mofadla-receipts" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read mofadla-receipts" ON storage.objects;
CREATE POLICY "Admins can read mofadla-receipts"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'mofadla-receipts' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete mofadla-receipts" ON storage.objects;
CREATE POLICY "Admins can delete mofadla-receipts"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'mofadla-receipts' AND public.has_role(auth.uid(), 'admin'));

-- Tighten enrollments teacher invite policy
DROP POLICY IF EXISTS "Teachers invite students to own courses" ON public.enrollments;
CREATE POLICY "Teachers invite students to own courses"
  ON public.enrollments FOR INSERT TO authenticated
  WITH CHECK (
    status IN ('pending','approved')
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = enrollments.course_id AND c.teacher_user_id = auth.uid()
    )
    AND public.has_role(enrollments.student_user_id, 'student')
  );
