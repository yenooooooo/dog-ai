import { NextResponse } from 'next/server';

// Vercel 배포마다 새 빌드 ID 생성
const BUILD_ID = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8)
  ?? process.env.BUILD_ID
  ?? Date.now().toString();

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(
    { version: BUILD_ID },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Pragma': 'no-cache' } }
  );
}
