# 🤖 CLAUDE.md — 멍산책 개발 지침서

## 이 문서의 목적
이 파일은 Claude CLI가 코드를 작성할 때 반드시 따라야 하는 규칙과 지침이다.
모든 작업 전에 이 문서를 참조하고, PLAN.md와 함께 읽어라.

---

## 1. 프로젝트 구조

```
mungwalk/
├── CLAUDE.md              # 이 지침서
├── PLAN.md                # 사업계획서/스펙
├── .env.local             # 환경 변수 (git 제외)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── public/
│   ├── icons/             # PWA 아이콘
│   └── manifest.json      # PWA 매니페스트
│
├── src/
│   ├── app/               # Next.js App Router 페이지
│   │   ├── layout.tsx     # 루트 레이아웃 (폰트, 메타데이터, 프로바이더)
│   │   ├── page.tsx       # 랜딩 페이지
│   │   ├── app/
│   │   │   ├── layout.tsx # 앱 레이아웃 (인증 체크, 하단 네비게이션)
│   │   │   ├── page.tsx   # 메인 지도 + 루트 생성
│   │   │   ├── walk/
│   │   │   │   └── page.tsx  # 산책 중 (GPS 트래킹)
│   │   │   ├── history/
│   │   │   │   ├── page.tsx      # 산책 기록 리스트
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # 산책 상세
│   │   │   └── profile/
│   │   │       ├── page.tsx      # 내 프로필
│   │   │       └── pet/
│   │   │           ├── new/
│   │   │           │   └── page.tsx  # 반려견 등록
│   │   │           └── [id]/
│   │   │               └── edit/
│   │   │                   └── page.tsx  # 반려견 수정
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts  # Supabase Auth 콜백
│   │
│   ├── components/        # 재사용 UI 컴포넌트
│   │   ├── ui/            # shadcn/ui 컴포넌트 (Button, Card 등)
│   │   ├── map/           # 지도 관련 컴포넌트
│   │   │   ├── KakaoMap.tsx
│   │   │   ├── RoutePolyline.tsx
│   │   │   ├── TagMarker.tsx
│   │   │   └── WalkTracker.tsx
│   │   ├── walk/          # 산책 관련 컴포넌트
│   │   │   ├── TimeSelector.tsx
│   │   │   ├── RouteCard.tsx
│   │   │   ├── WalkStats.tsx
│   │   │   └── ShareCard.tsx
│   │   ├── profile/       # 프로필 관련 컴포넌트
│   │   │   ├── UserForm.tsx
│   │   │   └── PetForm.tsx
│   │   └── layout/        # 레이아웃 컴포넌트
│   │       ├── BottomNav.tsx
│   │       ├── Header.tsx
│   │       └── BottomSheet.tsx
│   │
│   ├── lib/               # 유틸리티 & 핵심 로직
│   │   ├── supabase/
│   │   │   ├── client.ts      # 브라우저용 Supabase 클라이언트
│   │   │   ├── server.ts      # 서버용 Supabase 클라이언트
│   │   │   └── middleware.ts  # 인증 미들웨어
│   │   ├── kakao/
│   │   │   ├── loader.ts      # Kakao SDK 동적 로드
│   │   │   └── route-api.ts   # Kakao 도보 경로 REST API 호출
│   │   ├── route-generator.ts # 순환 루트 생성 알고리즘
│   │   ├── geo-utils.ts       # 좌표 계산 유틸 (거리, 방위각 등)
│   │   └── share-card.ts      # 공유 카드 이미지 생성
│   │
│   ├── hooks/             # 커스텀 React 훅
│   │   ├── useGeolocation.ts  # 현위치 GPS
│   │   ├── useWalkTracker.ts  # 산책 GPS 트래킹
│   │   ├── useKakaoMap.ts     # Kakao Map 인스턴스 관리
│   │   └── useAuth.ts         # 인증 상태
│   │
│   ├── stores/            # 상태 관리 (zustand)
│   │   ├── walkStore.ts       # 산책 진행 상태
│   │   └── routeStore.ts      # 루트 생성 상태
│   │
│   └── types/             # TypeScript 타입 정의
│       ├── database.ts        # Supabase 테이블 타입 (자동생성 활용)
│       ├── kakao.d.ts         # Kakao Maps 타입 선언
│       ├── route.ts           # 루트 관련 타입
│       └── walk.ts            # 산책 관련 타입
│
└── supabase/
    └── migrations/        # DB 마이그레이션 SQL 파일
        └── 001_initial.sql
```

---

## 2. 코드 작성 규칙

### 2-1. 파일 크기 제한 ⚠️ 최중요
- **모든 파일은 150줄 이하로 유지한다**
- 150줄 초과할 것 같으면 반드시 분리한다
- 컴포넌트: 기능 단위로 분리 (예: Form → FormField, FormActions로 분리)
- 로직: 훅이나 유틸 함수로 분리
- 분리 기준: "이 파일이 하나의 역할만 하는가?"

### 2-2. 파일 생성 원칙
- 새 기능 = 새 파일. 기존 파일에 기능을 덧붙이지 않는다
- 컴포넌트 하나당 파일 하나 (export default 하나)
- 유틸 함수는 관련 함수끼리 묶되, 5개 이상이면 파일 분리
- 타입은 types/ 폴더에 별도 관리

### 2-3. TypeScript
- 모든 파일은 .ts 또는 .tsx
- any 타입 절대 사용 금지. unknown 후 타입 가드 사용
- 인터페이스는 types/ 폴더에 정의하고 import
- Supabase 타입은 `npx supabase gen types typescript` 결과 활용

### 2-4. 네이밍 규칙
```
컴포넌트: PascalCase (RouteCard.tsx)
훅: camelCase with use 접두사 (useWalkTracker.ts)
유틸 함수: camelCase (calculateDistance.ts → 또는 geo-utils.ts 내 export)
타입/인터페이스: PascalCase with I 없이 (Route, Walk, Tag)
상수: UPPER_SNAKE_CASE (MAX_ROUTE_DISTANCE)
DB 테이블: snake_case with mw_ 접두사 (mw_walks)
DB 컬럼: snake_case (started_at)
```

### 2-5. Import 순서
```typescript
// 1. React/Next.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. 외부 라이브러리
import { createClient } from '@supabase/supabase-js';

// 3. 내부 lib/hooks/stores
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// 4. 컴포넌트
import { Button } from '@/components/ui/button';
import { RouteCard } from '@/components/walk/RouteCard';

// 5. 타입 (type import)
import type { Route } from '@/types/route';
```

---

## 3. Kakao Maps 연동 주의사항

### 3-1. SDK 로딩
- Kakao Maps JS SDK는 `<Script>` 태그로 로드하지 말 것
- `lib/kakao/loader.ts`에서 동적 로드 함수를 만들어 사용
- 로드 완료 후 `window.kakao.maps` 접근

```typescript
// lib/kakao/loader.ts
export function loadKakaoMapSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_APP_KEY}&autoload=false&libraries=services`;
    script.onload = () => {
      window.kakao.maps.load(() => resolve());
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
```

### 3-2. 타입 선언
- `types/kakao.d.ts`에 사용하는 Kakao Maps 타입을 선언
- `window.kakao` 글로벌 타입 확장 필요

### 3-3. 도보 경로 API
- REST API: `https://apis-navi.kakaomobility.com/v1/waypoints/directions`
- 헤더에 `Authorization: KakaoAK ${REST_API_KEY}` 필요
- **이 API는 서버사이드에서만 호출** (API 키 노출 방지)
- Next.js Route Handler (`/api/route`)로 프록시

### 3-4. 지도 컴포넌트
- KakaoMap 컴포넌트는 `useRef`로 map 인스턴스 관리
- 지도 생성은 `useEffect` 내에서 한 번만
- cleanup 시 반드시 map 인스턴스 정리
- **SSR 불가** — `dynamic import`로 클라이언트 전용 로드

```typescript
// 페이지에서 사용 시
import dynamic from 'next/dynamic';
const KakaoMap = dynamic(() => import('@/components/map/KakaoMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-muted animate-pulse" />
});
```

---

## 4. Supabase 연동 규칙

### 4-1. 클라이언트 구분
- **브라우저:** `lib/supabase/client.ts` → `createBrowserClient()`
- **서버 (Server Component, Route Handler):** `lib/supabase/server.ts` → `createServerClient()`
- 절대 혼용하지 말 것

### 4-2. RLS 필수
- 모든 테이블에 RLS 활성화
- anon key로 접근 가능한 범위를 RLS로 제한
- service_role_key는 서버사이드에서만, 관리자 작업에만 사용

### 4-3. 쿼리 패턴
```typescript
// 좋음: 타입 안전한 쿼리
const { data, error } = await supabase
  .from('mw_walks')
  .select('*')
  .eq('user_id', userId)
  .order('started_at', { ascending: false });

if (error) throw error;

// 나쁨: 에러 무시
const { data } = await supabase.from('mw_walks').select('*');
```

### 4-4. PostGIS 쿼리 (태그 조회)
```sql
-- 특정 좌표 반경 500m 내 태그 조회
select * from mw_tags
where st_dwithin(
  location,
  st_point(lng, lat)::geography,
  500
)
and is_active = true;
```

---

## 5. GPS 트래킹 주의사항

### 5-1. Geolocation API
- `navigator.geolocation.watchPosition()` 사용
- `enableHighAccuracy: true` 필수
- `maximumAge: 0` (캐시 사용 안 함)
- `timeout: 10000` (10초 타임아웃)

### 5-2. 배터리/성능
- 위치 업데이트 간격: 5초 (너무 빈번하면 배터리 소모)
- 정확도 낮은 좌표(accuracy > 50m) 필터링
- 비정상 좌표(이전 위치에서 500m 이상 점프) 필터링
- 컴포넌트 언마운트 시 반드시 `clearWatch()` 호출

### 5-3. 경로 데이터 저장
- 산책 중 좌표는 zustand 스토어에 배열로 축적
- 산책 종료 시 GeoJSON LineString으로 변환하여 DB 저장
- 좌표 배열이 너무 길면 Douglas-Peucker 알고리즘으로 간소화

---

## 6. 상태 관리

### zustand 사용 (가볍고 보일러플레이트 최소)

```typescript
// stores/walkStore.ts
interface WalkState {
  isWalking: boolean;
  startedAt: Date | null;
  coordinates: [number, number][];
  distance: number;
  // actions
  startWalk: () => void;
  addCoordinate: (coord: [number, number]) => void;
  endWalk: () => void;
  reset: () => void;
}
```

### 상태 관리 원칙
- 서버 데이터: React Query 또는 Supabase 실시간 구독
- UI 상태: useState (컴포넌트 로컬)
- 크로스 컴포넌트 상태: zustand (산책 진행 상태 등)
- URL 상태: useSearchParams (필터, 정렬 등)

---

## 7. 에러 핸들링

### 7-1. 원칙
- 모든 API 호출에 try-catch
- 에러 발생 시 유저에게 toast 알림 (shadcn/ui의 sonner)
- console.error로 디버깅 정보 기록
- 빈 상태(데이터 없음)와 에러 상태 UI를 구분

### 7-2. 패턴
```typescript
// 좋음
try {
  const data = await fetchRoutes(lat, lng, duration);
  setRoutes(data);
} catch (error) {
  console.error('루트 생성 실패:', error);
  toast.error('루트를 생성하지 못했어요. 다시 시도해주세요.');
}

// 나쁨: 에러 무시하거나 alert 사용
```

### 7-3. GPS 에러 처리
- 위치 권한 거부 → "위치 권한이 필요해요" 안내 UI
- GPS 불가 → "실외에서 다시 시도해주세요" 안내
- 네트워크 끊김 → 로컬에 좌표 임시 저장, 복구 시 동기화

---

## 8. 스타일링 규칙

### 8-1. Tailwind CSS
- 인라인 스타일 사용 금지. 모두 Tailwind 클래스로
- 반복되는 스타일 조합은 `cn()` 유틸로 조건부 적용
- 모바일 퍼스트: `w-full` 기본 → `md:w-1/2` 데스크톱

### 8-2. shadcn/ui
- 기본 컴포넌트(Button, Card, Input, Dialog, Sheet 등)는 shadcn/ui 사용
- 커스텀 필요 시 shadcn 컴포넌트를 래핑하여 확장
- 직접 만들기 전에 shadcn/ui에 있는지 먼저 확인

### 8-3. 색상 테마
```css
/* 멍산책 브랜드 컬러 — CSS 변수로 관리 */
--mw-primary: #4ADE80;      /* 초록 — 산책, 자연 */
--mw-primary-dark: #22C55E;
--mw-accent: #F59E0B;       /* 앰버 — 강조, CTA */
--mw-danger: #EF4444;       /* 빨강 — 위험 태그 */
--mw-bg: #FAFAF5;           /* 따뜻한 화이트 배경 */
```

### 8-4. 모바일 최적화 ⚠️ 중요
- 터치 타겟 최소 44px × 44px
- 하단 네비게이션 고정 (safe-area-inset 적용)
- 지도는 전체 화면, UI는 오버레이로
- bottom sheet 패턴 활용 (위로 스와이프)
- 높이: `h-[100dvh]` 사용 (모바일 브라우저 주소창 대응)
- 스크롤: `overflow-y-auto` + `flex-1` 조합으로 내부 스크롤
- 입력 필드: `text-[16px]` 이상 (iOS 자동 줌 방지)
- 버튼: `active:scale-[0.97]` 터치 피드백 필수
- 폰트: 최소 12px (text-[12px]) — 그 아래는 사용 금지

### 8-5. PWA / iOS 대응
- `public/manifest.json` — 앱 이름, 아이콘, 테마 색상, standalone 모드
- `layout.tsx` head에 필수 메타태그:
  - `<meta name="apple-mobile-web-app-capable" content="yes" />`
  - `<meta name="apple-mobile-web-app-status-bar-style" content="default" />`
  - `<meta name="apple-mobile-web-app-title" content="멍산책" />`
  - `<link rel="apple-touch-icon" href="/icons/icon-192.svg" />`
- iOS Safari 홈화면 추가 안내: `IosPwaPrompt` 컴포넌트 (앱 레이아웃에 포함)
- standalone 모드 감지: `window.matchMedia('(display-mode: standalone)')`
- 아이콘: SVG 사용 (PNG 대비 용량 절약, 벡터 스케일링)

---

## 9. API 라우트 구조

```
src/app/api/
├── route/
│   └── generate/
│       └── route.ts       # POST: 루트 생성 (Kakao API 프록시)
├── walks/
│   └── route.ts           # GET: 산책 기록 조회 / POST: 산책 저장
├── tags/
│   └── route.ts           # GET: 주변 태그 조회 / POST: 태그 생성
└── share/
    └── route.ts           # POST: 공유 카드 이미지 생성
```

### API 라우트 규칙
- 모든 API 라우트에서 인증 체크 (Supabase 서버 클라이언트)
- 입력값 검증 (zod 스키마)
- 에러 응답 형식 통일: `{ error: string, code: string }`
- Kakao REST API 키는 서버에서만 사용 (절대 클라이언트 노출 금지)

---

## 10. 작업 진행 방식

### 10-1. 작업 순서
1. 항상 PLAN.md에서 현재 구현할 기능의 스펙을 확인한다
2. types/ 먼저 정의한다 (타입부터)
3. lib/ 유틸/로직을 작성한다
4. hooks/ 커스텀 훅을 작성한다
5. components/ UI를 작성한다
6. app/ 페이지에서 조립한다

### 10-2. 한 번에 하나씩
- 한 번의 작업에서 하나의 기능만 완성한다
- 여러 기능을 동시에 만들지 않는다
- 기능 완성 후 동작 확인 → 다음 기능으로

### 10-3. 수정 시 주의
- 기존 파일 수정 시, 수정 범위를 최소화한다
- 동작하는 코드를 건드리지 않는다
- 새 기능은 기존 코드에 추가하지 말고 새 파일로 분리한 뒤 import

### 10-4. 의존성 관리
- 새 패키지 설치 전에 "정말 필요한가?" 판단
- 필수 패키지 목록:
  ```
  next, react, react-dom
  @supabase/supabase-js, @supabase/ssr
  zustand
  zod
  html-to-image
  sonner (toast)
  tailwindcss, tailwind-merge, clsx
  @radix-ui/* (shadcn 의존)
  lucide-react (아이콘)
  ```
- 그 외 패키지는 추가 전 반드시 확인 요청

---

## 11. 금지 사항

1. **파일 150줄 초과 금지** — 넘기면 즉시 분리
2. **any 타입 금지** — unknown + 타입 가드 사용
3. **인라인 스타일 금지** — Tailwind 클래스만
4. **console.log 커밋 금지** — 디버깅 후 제거 (console.error만 허용)
5. **하드코딩 금지** — 상수는 const로, 설정값은 env로
6. **CSS 파일 직접 작성 금지** — globals.css의 CSS 변수 선언 외에는 Tailwind만
7. **API 키 클라이언트 노출 금지** — NEXT_PUBLIC_ 아닌 키는 서버에서만
8. **에러 무시 금지** — 모든 catch 블록에 처리 로직
9. **주석 없는 복잡한 로직 금지** — 루트 생성 알고리즘 등에는 반드시 주석
10. **테스트 안 된 기능 다음 기능으로 넘어가기 금지**

---

## 12. 커밋 & 체크포인트

### 기능 단위로 체크포인트를 찍는다
```
feat: 카카오맵 지도 렌더링 + 현위치 표시
feat: 순환 루트 생성 알고리즘 구현
feat: 산책 GPS 트래킹 기능
feat: 구간 태그 CRUD
feat: 공유 카드 이미지 생성
feat: 유저/펫 프로필 관리
feat: 랜딩 페이지
chore: PWA 설정 + 배포
```

---

## 13. 트러블슈팅 가이드

### 자주 발생하는 문제와 해결법

**Q: Kakao Maps가 렌더링 안 됨**
→ SDK 로드 완료 전에 map 생성 시도했을 가능성. `loadKakaoMapSDK()` await 확인. 또한 반드시 `{ ssr: false }` dynamic import 사용.

**Q: Supabase RLS로 데이터 안 나옴**
→ RLS 정책에서 `auth.uid()` 조건 확인. 로그인 안 된 상태에서 쿼리하면 빈 배열 반환됨.

**Q: GPS 좌표가 튀는 현상**
→ `accuracy > 50` 좌표 필터링, 이전 좌표 대비 500m 이상 점프 필터링 로직 적용.

**Q: 도보 경로 API 응답 없음**
→ Kakao 도보 경로 API는 출발지/도착지가 도보 불가능한 곳이면 에러. 좌표가 도로 위인지 확인. 또한 REST API 키가 서버 환경변수에 잘 설정되었는지 확인.

**Q: PostGIS 함수 에러**
→ Supabase에서 PostGIS 확장이 활성화되어 있는지 확인. SQL Editor에서 `create extension if not exists postgis;` 실행.

**Q: hydration mismatch 에러**
→ Kakao Map 등 브라우저 전용 컴포넌트에 `dynamic(..., { ssr: false })` 누락 확인. window 객체 접근하는 코드는 useEffect 안에서만.
