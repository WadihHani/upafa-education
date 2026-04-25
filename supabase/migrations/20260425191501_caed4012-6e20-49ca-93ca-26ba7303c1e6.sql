CREATE POLICY "Service role can delete suppressed emails"
  ON public.suppressed_emails
  FOR DELETE
  TO public
  USING (auth.role() = 'service_role');