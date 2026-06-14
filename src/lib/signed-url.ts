import { supabase } from "@/integrations/supabase/client";

const BUCKET = "mofadla-receipts";
const cache = new Map<string, { url: string; exp: number }>();

/**
 * Convert a stored URL (either a legacy public URL containing
 * /object/public/mofadla-receipts/<path> or a bare object path)
 * into a short-lived signed URL. Returns "" if input is empty.
 */
export async function getReceiptSignedUrl(stored: string): Promise<string> {
  if (!stored) return "";
  // Extract object path
  let path = stored;
  const marker = `/${BUCKET}/`;
  const idx = stored.indexOf(marker);
  if (idx !== -1) path = stored.substring(idx + marker.length);
  // Drop query string if present
  path = path.split("?")[0];

  const cached = cache.get(path);
  if (cached && cached.exp > Date.now()) return cached.url;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) return "";
  cache.set(path, { url: data.signedUrl, exp: Date.now() + 50 * 60 * 1000 });
  return data.signedUrl;
}
