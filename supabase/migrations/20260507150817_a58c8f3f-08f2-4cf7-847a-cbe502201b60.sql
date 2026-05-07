
-- Revoke public execute from internal helpers (queue + trigger + role helper) and re-grant minimally

-- Internal email queue helpers — only service_role should call these from edge functions
REVOKE ALL ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;

-- Trigger function — only the trigger (owner) needs to invoke it
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- update_updated_at_column trigger function — same treatment
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- has_role: used inside RLS policies. Policies evaluate as the calling role,
-- so authenticated must keep EXECUTE. Revoke from anon (no anon policies use it).
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

-- Public mofadla quick registration RPC must remain callable by anon
REVOKE ALL ON FUNCTION public.submit_mofadla_quick_registration(
  text, text, text, text, text, text, date, text, text, numeric, integer, text, text, text, text
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_mofadla_quick_registration(
  text, text, text, text, text, text, date, text, text, numeric, integer, text, text, text, text
) TO anon, authenticated;
