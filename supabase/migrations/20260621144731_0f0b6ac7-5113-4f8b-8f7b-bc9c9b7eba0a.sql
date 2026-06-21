GRANT SELECT ON public.kuliyat TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.kuliyat TO authenticated;
GRANT ALL ON public.kuliyat TO service_role;