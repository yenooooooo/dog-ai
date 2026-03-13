import { createBrowserClient } from '@supabase/ssr';

// TODO: supabase gen types 실행 후 Database 제네릭 추가
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
