import { createClient } from "@/lib/supabase/client";

export function getCoverUrl(path: string | null): string {
  if (!path) return "/no_cover_available.png";
  const supabase = createClient();
  return supabase.storage.from("book-covers").getPublicUrl(path).data.publicUrl;
}
