
-- Teachers can upload to lecture-recordings under <course_id>/...
CREATE POLICY "Teachers upload to own course folders"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lecture-recordings'
  AND EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id::text = (storage.foldername(name))[1]
      AND c.teacher_user_id = auth.uid()
  )
);

CREATE POLICY "Teachers manage own course recordings storage"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'lecture-recordings'
  AND EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id::text = (storage.foldername(name))[1]
      AND c.teacher_user_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'lecture-recordings'
  AND EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id::text = (storage.foldername(name))[1]
      AND c.teacher_user_id = auth.uid()
  )
);

CREATE POLICY "Enrolled students read course recordings storage"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'lecture-recordings'
  AND EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.course_id::text = (storage.foldername(name))[1]
      AND e.student_user_id = auth.uid()
      AND e.status = 'approved'::enrollment_status
  )
);

CREATE POLICY "Admins manage lecture recordings storage"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'lecture-recordings' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'lecture-recordings' AND has_role(auth.uid(), 'admin'::app_role));
