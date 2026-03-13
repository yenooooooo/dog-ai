# 🐾 멍산책 (MungWalk) — 프로젝트 플랜

## 1. 프로젝트 개요

- **서비스명:** 멍산책 (MungWalk)
- **한줄 설명:** 현위치 기반 반려견 순환 산책 루트 자동 생성 + 크라우드소싱 구간 정보 + 산책 기록 서비스
- **도메인:** mungwalk.com (또는 mungwalk.vercel.app)
- **목표:** 2주 내 MVP 배포, 첫 달 견주 100명 확보

---

## 2. 해결하는 문제

| 문제 | 현재 대안 | 한계 |
|------|-----------|------|
| 매일 같은 산책 코스가 지루함 | 없음 (감으로 걸음) | 새 루트 탐색 방법 자체가 없음 |
| 새 동네/여행지에서 산책 코스 모름 | 네이버 블로그 검색 | 산발적이고 루트 형태가 아님 |
| 강아지에게 위험한 구간 파악 불가 | 견주 커뮤니티 질문 | 실시간성 없고 위치 기반 아님 |
| 산책 기록 관리 안 됨 | 헬스앱(사람 기준) | 반려견 맞춤 기능 없음 |
| 원형 순환 루트 생성 | 네이버/카카오 지도 | A→B 길찾기만 가능, 순환 루트 불가 |

---

## 3. 타겟 유저

### 1차 타겟 (얼리어답터)
- **도시 거주 2030 견주**
- 매일 1~2회 산책, 인스타에 강아지 사진 올리는 습관
- 새로운 앱/서비스에 거부감 없음

### 2차 타겟 (확장)
- 새 동네로 이사한 견주
- 반려견 동반 여행 중인 견주
- 강아지 산책 알바/펫시터

---

## 4. 핵심 기능 (MVP 스코프)

### 4-1. 순환 산책 루트 생성 ⭐ (핵심)
- 현위치 GPS 자동 감지
- 시간 선택: 15분 / 30분 / 1시간 / 직접입력
- 루트 3개 생성 (각각 다른 방향/성격)
- 각 루트에 태그: "공원 경유", "한적한 길", "카페 근처"
- 지도 위에 폴리라인으로 루트 시각화
- "이 루트로 산책 시작" 버튼

### 4-2. 크라우드소싱 구간 태그
- 산책 중 현위치에 태그 남기기
- 태그 종류 (이모지 + 텍스트):
  - ☀️ 그늘 많음
  - 💧 물 마실 곳
  - ⚠️ 위험 (유리조각, 공사 등)
  - 🐕 큰 개 자주 출몰
  - 🌿 목줄 풀어도 OK
  - 🚗 차 많음 주의
  - ✨ 뷰 좋음
  - 🏪 반려견 동반 가게
- 태그는 지도 위 마커로 표시
- 다른 유저가 "도움됐어요" 투표 가능
- 30일간 투표 0개인 태그는 자동 비활성화

### 4-3. 산책 기록 (GPS 트래킹)
- 산책 시작/종료 버튼
- 실시간 GPS 경로 기록
- 기록 데이터: 날짜, 시작/종료 시간, 총 거리(km), 소요 시간, 평균 속도
- 산책 히스토리 리스트 (최신순)
- 월간 요약: 총 산책 횟수, 총 거리, 총 시간

### 4-4. 산책 완료 공유 카드
- 산책 종료 시 자동 생성
- 카드 내용: 강아지 이름, 날짜, 루트 미니맵, 거리, 시간
- 이미지로 다운로드 가능
- SNS 공유 버튼 (카카오톡, 인스타 스토리)

### 4-5. 유저/반려견 프로필
- 회원가입: 이메일 또는 카카오 로그인
- 유저 프로필: 닉네임, 동네
- 반려견 프로필: 이름, 견종, 나이, 사진, 크기(소/중/대)
- 반려견 여러 마리 등록 가능

---

## 5. 페이지 구조

```
/ (홈 — 랜딩페이지, 비로그인 시)
/app (메인 — 지도 + 루트 생성, 로그인 후)
/app/walk (산책 중 — GPS 트래킹 모드)
/app/history (산책 기록 리스트)
/app/history/[id] (산책 상세 기록)
/app/profile (내 프로필 + 반려견 관리)
/app/profile/pet/new (반려견 등록)
/app/profile/pet/[id]/edit (반려견 수정)
```

---

## 6. 기술 스택

| 영역 | 기술 | 선택 이유 |
|------|------|-----------|
| 프레임워크 | Next.js 14+ (App Router) | SSR, 파일 기반 라우팅, Vercel 최적화 |
| 스타일링 | Tailwind CSS + shadcn/ui | 빠른 UI 개발, 일관된 디자인 |
| 지도 | Kakao Maps JavaScript API v3 | 국내 도보 경로 API 무료, 한국 지도 정확도 최고 |
| 인증 | Supabase Auth (카카오 OAuth) | 무료, Supabase와 통합 |
| DB | Supabase (PostgreSQL + PostGIS) | 무료 티어 충분, 위치 기반 쿼리 PostGIS |
| 스토리지 | Supabase Storage | 프로필 이미지, 공유 카드 저장 |
| 배포 | Vercel | Next.js 최적화 배포, 무료 |
| 이미지 생성 | html-to-image (npm) | 공유 카드를 DOM→이미지 변환 |
| PWA | next-pwa | 홈화면 추가, 오프라인 기본 지원 |

---

## 7. 데이터베이스 스키마

### 테이블 접두사: `mw_` (mungwalk)

### mw_users
```sql
create table mw_users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid references auth.users(id) on delete cascade,
  nickname text not null,
  neighborhood text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### mw_pets
```sql
create table mw_pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references mw_users(id) on delete cascade,
  name text not null,
  breed text,
  age_months integer,
  size text check (size in ('small', 'medium', 'large')),
  photo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### mw_walks (산책 기록)
```sql
create table mw_walks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references mw_users(id) on delete cascade,
  pet_id uuid references mw_pets(id) on delete set null,
  started_at timestamptz not null,
  ended_at timestamptz,
  distance_meters integer default 0,
  duration_seconds integer default 0,
  route_geojson jsonb,
  share_card_url text,
  status text default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamptz default now()
);
```

### mw_tags (구간 태그)
```sql
create table mw_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references mw_users(id) on delete cascade,
  tag_type text not null check (tag_type in ('shade', 'water', 'danger', 'big_dog', 'off_leash', 'traffic', 'scenic', 'pet_friendly')),
  description text,
  location geography(Point, 4326) not null,
  helpful_count integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '90 days')
);
```

### mw_tag_votes (태그 투표)
```sql
create table mw_tag_votes (
  id uuid primary key default gen_random_uuid(),
  tag_id uuid references mw_tags(id) on delete cascade,
  user_id uuid references mw_users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(tag_id, user_id)
);
```

### RLS 정책 (Row Level Security)
- mw_users: 자기 데이터만 읽기/수정
- mw_pets: 자기 반려견만 CRUD
- mw_walks: 자기 산책 기록만 CRUD
- mw_tags: 모든 유저 읽기 가능, 작성/삭제는 본인만
- mw_tag_votes: 태그당 1인 1투표, 본인 투표만 관리

---

## 8. 루트 생성 알고리즘

### 핵심 로직
```
입력: 현위치(lat, lng), 목표시간(분)
출력: 순환 루트 3개 (각각 다른 방향)

1. 목표 거리 계산
   - 총거리 = 목표시간(분) × 67m/분 (시속 4km 기준)
   - 예: 30분 → 2,000m

2. 웨이포인트 생성 (원형 배치)
   - 반경 = 총거리 / (2 × π) × 1.3 (도로 우회 보정계수)
   - 현위치 중심으로 120도 간격 3개 포인트 (삼각형)
   - 루트별로 삼각형 회전: 0도, 40도, 80도 → 3개 다른 방향

3. Kakao 도보 경로 API로 구간 연결
   - 현위치 → WP1 → WP2 → WP3 → 현위치
   - 각 구간 도보 경로 요청

4. 거리 보정
   - 실제 도보 거리 합산
   - 목표 대비 ±20% 초과 시 반경 조정 후 재계산 (최대 3회)

5. 구간 태그 매칭
   - 루트 경로 반경 50m 내 mw_tags 조회
   - 위험 태그 포함 루트에 경고 표시
```

### Kakao Maps API 사용
- REST API: 도보 경로 탐색 (`/v2/local/road/route`)
- JavaScript API: 지도 렌더링, 폴리라인, 마커, 현위치
- 일일 무료 한도: 30만 콜 (MVP에 충분)

---

## 9. 주요 UI 컴포넌트

### 메인 화면 (/app)
- 전체 화면 지도 (Kakao Map)
- 하단 시트: 시간 선택 슬라이더 + "루트 생성" 버튼
- 루트 생성 후: 루트 3개 탭으로 전환, 각 루트 정보(거리, 예상시간, 태그)
- "산책 시작" 플로팅 버튼

### 산책 중 화면 (/app/walk)
- 전체 화면 지도 + 실시간 내 위치 트래킹
- 상단: 경과 시간, 현재 거리 실시간 업데이트
- 하단: "태그 남기기" 버튼, "산책 종료" 버튼
- 태그 남기기: 바텀시트에 태그 종류 그리드 (이모지 탭)

### 산책 완료 모달
- 요약: 총 거리, 시간, 루트 미니맵
- "공유 카드 생성" 버튼
- "저장" 버튼

### 기록 화면 (/app/history)
- 산책 리스트 (카드형)
- 각 카드: 날짜, 거리, 시간, 미니 루트맵
- 상단: 월간 통계 요약 바

---

## 10. 수익화 로드맵

### Phase 1: 무료 성장 (0~6개월)
- 모든 기능 무료
- 목표: MAU 1만

### Phase 2: 제휴 수익 (6개월~)
- 산책 루트에 반려견 동반 카페/식당 경유지 추천
- 제휴 업체 월 광고비 수취
- 견주에게는 유용한 정보로 제공 (광고 거부감 최소화)

### Phase 3: 프리미엄 구독 (1년~)
- 월 3,900원
- 프리미엄 루트 (숲길, 해안길, 시즌 루트)
- 상세 산책 통계 + 리포트
- 가족 공유 (파트너도 기록 확인)
- 광고 제거

---

## 11. MVP 개발 일정 (14일)

| 일차 | 작업 | 산출물 |
|------|------|--------|
| Day 1 | 프로젝트 셋업, Supabase 테이블 생성, Kakao API 키 발급 | 빈 프로젝트 + DB 준비 완료 |
| Day 2 | Kakao Maps 지도 연동, 현위치 표시 | 지도 렌더링 확인 |
| Day 3 | 루트 생성 알고리즘 구현 | 순환 루트 3개 생성 동작 |
| Day 4 | 루트 시각화 (폴리라인, 마커) + 루트 선택 UI | 지도 위 루트 표시 |
| Day 5 | Supabase Auth (카카오 OAuth) + 유저/펫 프로필 | 로그인/회원가입 동작 |
| Day 6 | 산책 GPS 트래킹 (Geolocation API) | 실시간 위치 추적 |
| Day 7 | 산책 기록 저장 + 히스토리 페이지 | 기록 CRUD 완성 |
| Day 8 | 구간 태그 CRUD + 지도 마커 표시 | 태그 기능 동작 |
| Day 9 | 공유 카드 이미지 생성 (html-to-image) | 카드 다운로드 |
| Day 10 | UI 폴리싱 + 반응형 | 모바일 최적화 |
| Day 11 | PWA 설정 + 메타태그 + OG 이미지 | 홈화면 추가 가능 |
| Day 12 | 랜딩페이지 (/) 제작 | 서비스 소개 페이지 |
| Day 13 | 테스트 + 버그 수정 | 안정화 |
| Day 14 | Vercel 배포 + 최종 점검 | 🚀 출시 |

---

## 12. 환경 변수 목록

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Kakao Maps
NEXT_PUBLIC_KAKAO_APP_KEY=
KAKAO_REST_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## 13. 향후 확장 (MVP 이후)

- [ ] 산책 친구 매칭 (같은 시간대/동네 견주 연결)
- [ ] 산책 챌린지 (주 5회 산책 달성 배지)
- [ ] 날씨 연동 (비 오는 날 실내 산책 코스 추천)
- [ ] 반려견 건강 연동 (산책량 기반 건강 리포트)
- [ ] 미용/병원 예약 연결
