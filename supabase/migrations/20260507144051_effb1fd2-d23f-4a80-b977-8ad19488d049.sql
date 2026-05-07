
-- Drop broad SELECT policies that enable listing of files in public buckets.
-- Public buckets still serve files via their public URL endpoint (which bypasses RLS),
-- so removing these listing policies does not break image/file display anywhere.
DROP POLICY IF EXISTS "Public can view site images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view team images" ON storage.objects;
DROP POLICY IF EXISTS "Public read news-media" ON storage.objects;
DROP POLICY IF EXISTS "Public can view mofadla receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public can read mofadla-receipts" ON storage.objects;
