import { createClient } from "@/lib/supabase/client";

export function getCoverUrl(path?: string | null) {
  if (!path) return null;
  const supabase = createClient();
  return supabase.storage.from("book-covers").getPublicUrl(path).data.publicUrl;
}
