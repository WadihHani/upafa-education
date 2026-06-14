
-- Replace permissive upload policies with a path-restricted one
DROP POLICY IF EXISTS "Anyone can upload mofadla receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload mofadla quick-register documents" ON storage.objects;

CREATE POLICY "Public can upload mofadla receipts to allowed folders"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'mofadla-receipts'
    AND (storage.foldername(name))[1] IN ('quick-register', 'applications')
    AND array_length(storage.foldername(name), 1) >= 2
  );

-- Tighten enrollments teacher UPDATE policy
DROP POLICY IF EXISTS "Teachers update enrollments for own courses" ON public.enrollments;
CREATE POLICY "Teachers update enrollments for own courses"
  ON public.enrollments FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = enrollments.course_id AND c.teacher_user_id = auth.uid()
    )
  )
  WITH CHECK (
    status IN ('pending','approved','rejected')
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = enrollments.course_id AND c.teacher_user_id = auth.uid()
    )
  );
