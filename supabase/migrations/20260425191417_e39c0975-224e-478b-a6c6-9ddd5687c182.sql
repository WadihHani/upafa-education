-- Remove permissive public INSERT policies on child tables
DROP POLICY IF EXISTS "Anyone can submit grades" ON public.mofadla_application_grades;
DROP POLICY IF EXISTS "Anyone can submit preferences" ON public.mofadla_application_preferences;

-- Realtime channel authorization: only allow subscribing to topics that match the user
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can subscribe to own topics" ON realtime.messages;
CREATE POLICY "Authenticated users can subscribe to own topics"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR realtime.topic() = ('user:' || auth.uid()::text)
    OR realtime.topic() LIKE ('student:' || auth.uid()::text || ':%')
    OR realtime.topic() LIKE ('teacher:' || auth.uid()::text || ':%')
  );

DROP POLICY IF EXISTS "Authenticated users can broadcast to own topics" ON realtime.messages;
CREATE POLICY "Authenticated users can broadcast to own topics"
  ON realtime.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR realtime.topic() = ('user:' || auth.uid()::text)
    OR realtime.topic() LIKE ('student:' || auth.uid()::text || ':%')
    OR realtime.topic() LIKE ('teacher:' || auth.uid()::text || ':%')
  );