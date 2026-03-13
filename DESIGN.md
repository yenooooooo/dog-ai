# 🎨 DESIGN.md — 멍산책 디자인 시스템

## 이 문서의 목적
Claude CLI가 UI를 구현할 때 참조하는 디자인 가이드.
"AI가 만든 것 같은" 뻔한 UI를 절대 만들지 않는다.
토스, 당근마켓, 나이키 앱 수준의 세련된 프로덕트를 목표로 한다.

---

## 1. 디자인 철학

### 브랜드 무드: "신뢰할 수 있는 산책 친구"
- 따뜻하지만 유치하지 않다
- 깔끔하지만 차갑지 않다
- 기능적이지만 재미있다
- **핵심 키워드:** 자연, 신뢰, 활기, 프리미엄 캐주얼

### 안티 패턴 — 절대 하지 말 것 ⛔
```
❌ 보라색 그라데이션 배경 (AI 기본 느낌)
❌ Inter, Roboto, Arial 폰트 (뻔한 시스템 폰트)
❌ 둥근 카드 + 연보라/연파랑 조합 (GPT가 만든 느낌)
❌ 과한 그림자(shadow-xl 남발)
❌ 모든 요소에 border-radius: 9999px
❌ 이유 없는 그라데이션 텍스트
❌ 무의미한 아이콘 장식
❌ 모든 카드 크기 동일한 그리드
❌ 색상 5개 이상 동시 사용
❌ 텍스트 중앙 정렬 남발
❌ 과한 애니메이션 (번쩍번쩍)
❌ 빈 공간에 일러스트 억지로 채우기
```

---

## 2. 컬러 시스템

### 기본 팔레트
```css
:root {
  /* 프라이머리 — 깊은 숲 초록 (채도 낮춘 자연색) */
  --mw-green-50: #F0F7F1;
  --mw-green-100: #D6EBDA;
  --mw-green-200: #A8D5B0;
  --mw-green-300: #6BBF7B;
  --mw-green-400: #3DA854;
  --mw-green-500: #2D8A42;   /* 메인 — 버튼, 강조 */
  --mw-green-600: #246E35;
  --mw-green-700: #1B5228;
  --mw-green-800: #133A1C;
  --mw-green-900: #0A2110;

  /* 뉴트럴 — 따뜻한 그레이 (순수 그레이 아닌 브라운 톤) */
  --mw-gray-0: #FFFFFF;
  --mw-gray-50: #FAFAF7;     /* 페이지 배경 */
  --mw-gray-100: #F3F2EE;    /* 카드 배경, 구분선 */
  --mw-gray-200: #E5E3DD;
  --mw-gray-300: #C9C6BD;
  --mw-gray-400: #A09D94;
  --mw-gray-500: #787571;
  --mw-gray-600: #5C5955;
  --mw-gray-700: #3D3B38;
  --mw-gray-800: #252422;    /* 본문 텍스트 */
  --mw-gray-900: #1A1917;    /* 제목 텍스트 */

  /* 액센트 — 따뜻한 앰버 (CTA, 배지) */
  --mw-amber-400: #FBBF24;
  --mw-amber-500: #F59E0B;

  /* 시맨틱 */
  --mw-danger: #DC4A3F;
  --mw-warning: #E8973E;
  --mw-info: #4A90D9;
  --mw-success: #2D8A42;
}
```

### 컬러 사용 규칙
- **배경:** `--mw-gray-50` (순백이 아닌 따뜻한 오프화이트)
- **카드:** `--mw-gray-0` (흰색, 배경과 미세한 대비)
- **본문:** `--mw-gray-800` (완전 블랙 #000 사용 금지)
- **보조 텍스트:** `--mw-gray-500`
- **프라이머리 버튼:** `--mw-green-500` 배경 + 흰 텍스트
- **위험 태그:** `--mw-danger` + 연한 빨강 배경
- **그라데이션:** 단색 위주. 그라데이션은 공유 카드 등 특수한 경우에만

---

## 3. 타이포그래피

### 폰트 선택
```css
/* 제목: Pretendard (한국 서비스 표준급 퀄리티, 토스/카카오가 사용) */
/* 본문: Pretendard 동일 패밀리로 통일 */
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');

:root {
  --font-sans: 'Pretendard Variable', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}
```

### 타입 스케일 (모바일 기준)
```
텍스트 스타일           크기      굵기     행간      용도
─────────────────────────────────────────────────────
display               28px     800     1.2      온보딩 헤드라인
heading-1             24px     700     1.3      페이지 제목
heading-2             20px     700     1.3      섹션 제목
heading-3             17px     600     1.4      카드 제목
body-large            16px     400     1.6      주요 본문
body                  15px     400     1.6      일반 본문
body-small            13px     400     1.5      보조 텍스트
caption               12px     500     1.4      라벨, 배지, 메타
overline              11px     700     1.3      카테고리 라벨 (대문자)
```

### 타이포그래피 규칙
- 한 화면에 폰트 굵기 최대 3종 (400, 600, 700)
- 줄간격(line-height) 반드시 지정. 기본 1.6
- 제목과 본문 사이 간격: 제목 아래 8px, 본문 문단 간 16px
- 긴 텍스트는 최대 너비 제한 (`max-w-prose` 또는 `max-w-[340px]`)
- 숫자 강조 시 `tabular-nums` (숫자 폭 고정)

---

## 4. 간격 & 레이아웃

### 간격 시스템 (4px 기반)
```
4px   — 아이콘과 라벨 사이, 인라인 요소 간격
8px   — 카드 내부 요소 간 최소 간격
12px  — 리스트 아이템 간격
16px  — 카드 내부 패딩, 섹션 내 요소 간격
20px  — 페이지 좌우 패딩 (모바일)
24px  — 섹션 간 간격
32px  — 큰 섹션 구분
48px  — 페이지 상하 여백
```

### 레이아웃 원칙
- 모바일 퍼스트. 최대 너비 `max-w-[430px]` 중앙 정렬 (앱 느낌)
- 좌우 패딩: 모바일 20px 고정
- 카드 간격: 12px
- 하단 네비게이션 높이: 56px + safe-area
- 지도 화면: 전체 화면, UI는 절대 위치 오버레이

### 페이지별 레이아웃

**메인 (지도)**
```
┌─────────────────────────┐
│  상태바 (safe-area)       │
│─────────────────────────│
│                         │
│      전체 화면 지도        │
│      (Kakao Map)         │
│                         │
│  ┌───────────────────┐  │
│  │  루트 정보 바텀시트   │  │
│  │  (드래그로 확장)     │  │
│  └───────────────────┘  │
│─────────────────────────│
│  🗺️    🐾    📊    👤   │  ← 하단 네비게이션
└─────────────────────────┘
```

**산책 중**
```
┌─────────────────────────┐
│  ⏱ 00:24:32  📏 1.2km   │  ← 상단 실시간 스탯 (반투명)
│─────────────────────────│
│                         │
│      전체 화면 지도        │
│     (실시간 트래킹)       │
│                         │
│─────────────────────────│
│  🏷 태그 남기기    ⏹ 종료  │  ← 하단 액션 바
└─────────────────────────┘
```

**히스토리**
```
┌─────────────────────────┐
│  산책 기록         이번 달 │
│─────────────────────────│
│  ┌─ 월간 요약 카드 ─────┐│
│  │ 🐾 14회  📏 28.4km  ││
│  │ ⏱ 6시간 12분        ││
│  └──────────────────────┘│
│                          │
│  3월 12일 (수) ─────────│
│  ┌──────────────────────┐│
│  │ [미니맵]  2.3km 34분 ││
│  │ 뭉치 · 합정동 일대   ││
│  └──────────────────────┘│
│  3월 11일 (화) ─────────│
│  ┌──────────────────────┐│
│  │ [미니맵]  1.8km 26분 ││
│  └──────────────────────┘│
└─────────────────────────┘
```

---

## 5. 컴포넌트 디자인 상세

### 5-1. 버튼

**프라이머리 (CTA)**
```
배경: --mw-green-500
텍스트: 흰색, 15px, 600 weight
높이: 52px (대), 44px (중), 36px (소)
라운드: 14px (대), 12px (중), 10px (소)
hover: --mw-green-600
active: scale(0.98) + --mw-green-700
disabled: opacity 0.4
transition: all 150ms ease
그림자: 없음 (플랫 디자인)
```

**세컨더리**
```
배경: --mw-gray-100
텍스트: --mw-gray-800, 15px, 500 weight
테두리: 없음
hover: --mw-gray-200
```

**고스트**
```
배경: 투명
텍스트: --mw-green-500, 15px, 500 weight
hover: --mw-green-50 배경
```

### 5-2. 카드
```
배경: 흰색
라운드: 16px
패딩: 16px
테두리: 1px solid --mw-gray-100 (미세한 테두리, 그림자 대신)
그림자: 없음 (토스 스타일 — 그림자 대신 배경색 대비로 구분)
hover: 테두리 --mw-gray-200
```

### 5-3. 바텀 시트
```
배경: 흰색
상단 핸들: 36px × 4px, --mw-gray-300, 라운드 2px, 중앙 정렬
라운드: 상단 24px
패딩: 핸들 위 8px, 내용 20px
그림자: 0 -4px 20px rgba(0,0,0,0.08)
드래그: 터치로 위아래 확장/축소
```

### 5-4. 하단 네비게이션
```
배경: 흰색
높이: 56px + env(safe-area-inset-bottom)
상단 테두리: 1px solid --mw-gray-100
아이콘: 24px, 비활성 --mw-gray-400, 활성 --mw-green-500
라벨: 11px, 비활성 --mw-gray-400, 활성 --mw-green-500
아이템 간격: 균등 분배 (flex justify-around)
아이템: 지도 / 산책 / 기록 / 프로필 (4개)
활성 전환: 색상만 변경, 배경 효과 없음 (깔끔)
```

### 5-5. 태그 마커 (지도 위)
```
크기: 32px × 32px
배경: 흰색
테두리: 2px solid (태그 종류별 색상)
라운드: 10px
내부: 이모지 16px 중앙
그림자: 0 2px 8px rgba(0,0,0,0.12)
태그 색상:
  shade(그늘): --mw-green-300
  water(물): --mw-info
  danger(위험): --mw-danger
  big_dog(큰개): --mw-warning
  off_leash(풀어도OK): --mw-green-500
  traffic(차): --mw-gray-500
  scenic(뷰좋음): --mw-amber-400
  pet_friendly(가게): --mw-green-400
```

### 5-6. 산책 통계 바
```
가로 스크롤 가능한 필 캡슐 형태 (토스 자산 요약 스타일)
각 아이템:
  배경: --mw-gray-100
  라운드: 12px
  패딩: 12px 16px
  숫자: heading-3 (17px, 600)
  라벨: caption (12px, 500, --mw-gray-500)
  아이콘: 좌측에 작게 (16px)
```

### 5-7. 루트 카드 (루트 선택 시)
```
가로 스와이프 캐러셀 (한 번에 1장 + 양옆 살짝 보임)
카드 너비: 화면폭 - 56px
높이: 자동 (내용에 맞춤)
내부 구조:
  상단: 루트 미니맵 (높이 120px, 라운드 12px)
  중단: 루트 이름 태그 ("공원 경유 코스")
  하단: 거리 · 예상시간 · 태그 아이콘 나열
  CTA: "이 루트로 산책" 버튼 (프라이머리, 풀너비)
```

### 5-8. 공유 카드
```
크기: 1080px × 1350px (인스타 세로 비율 4:5)
배경: 부드러운 그라데이션 (--mw-green-50 → --mw-gray-50)
상단 40%: 루트 지도 이미지 (폴리라인 강조)
하단 60%:
  강아지 이름 + 날짜 (heading-1)
  통계: 거리, 시간, 걸음수 (큰 숫자)
  하단: "멍산책으로 새로운 길 발견 중 🐾" + QR/로고
폰트: Pretendard
라운드: 0 (이미지 저장용이라 각진 상태)
```

---

## 6. 애니메이션 & 인터랙션

### 원칙
- 모든 애니메이션은 **의미가 있어야** 한다 (장식용 금지)
- 시간: 150ms (빠른 피드백), 300ms (전환), 500ms (등장)
- 이징: `cubic-bezier(0.32, 0.72, 0, 1)` (토스 스타일 커브)
- 동시에 2개 이상 애니메이션 재생 금지

### 적용할 애니메이션 목록

**페이지 전환**
```css
/* 새 페이지 진입: 아래에서 위로 슬라이드 */
@keyframes slideUp {
  from { transform: translateY(12px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.page-enter {
  animation: slideUp 300ms cubic-bezier(0.32, 0.72, 0, 1);
}
```

**바텀시트**
```css
/* 스프링 느낌의 바운스 */
@keyframes sheetUp {
  0% { transform: translateY(100%); }
  70% { transform: translateY(-2%); }
  100% { transform: translateY(0); }
}
```

**버튼 탭**
```css
.btn:active {
  transform: scale(0.97);
  transition: transform 100ms ease;
}
```

**산책 시작 버튼 — 특별 처리**
```css
/* 부드러운 펄스로 주목성 확보 (과하지 않게) */
@keyframes gentlePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(45, 138, 66, 0.2); }
  50% { box-shadow: 0 0 0 8px rgba(45, 138, 66, 0); }
}
.walk-start-btn {
  animation: gentlePulse 3s ease-in-out infinite;
}
```

**스켈레톤 로딩**
```css
/* 실버 그레이 쉬머 (뼈대 로딩) */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg,
    var(--mw-gray-100) 25%,
    var(--mw-gray-50) 50%,
    var(--mw-gray-100) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease infinite;
}
```

**숫자 카운트업 (산책 완료 시)**
```
거리, 시간 숫자가 0에서 최종값까지 카운트업
duration: 800ms, easing: ease-out
라이브러리 없이 requestAnimationFrame으로 구현
```

---

## 7. 아이콘

### Lucide React 사용
```
하단 네비:
  지도: <Map />
  산책: <Footprints />
  기록: <History />
  프로필: <User />

산책 중:
  시간: <Timer />
  거리: <Route />
  태그: <Tag />
  종료: <Square /> (정지 아이콘)

태그:
  그늘: <TreePine />
  물: <Droplets />
  위험: <AlertTriangle />
  큰 개: <Dog /> (없으면 <AlertCircle />)
  풀어도OK: <Smile />
  차: <Car />
  뷰: <Eye />
  가게: <Store />
```

### 아이콘 규칙
- 크기: 20px (기본), 24px (네비게이션), 16px (인라인)
- 스트로크 두께: 1.75px (기본 2px보다 살짝 얇게 — 세련됨)
- 색상: 주변 텍스트와 동일 (별도 색 지정 X)

---

## 8. 반응형 & 모바일

### 브레이크포인트
```
기본: 모바일 (~ 430px) → 이것만 완벽하게
md: 태블릿 (768px~) → MVP 이후
lg: 데스크톱 (1024px~) → MVP 이후
```

### 모바일 필수 체크리스트
- [ ] safe-area-inset 적용 (노치, 하단 바)
- [ ] 터치 타겟 44px 이상
- [ ] 300ms 탭 딜레이 제거 (`touch-action: manipulation`)
- [ ] 가로 스크롤 방지 (`overflow-x: hidden` on body)
- [ ] 입력 시 줌 방지 (`font-size: 16px` 이상 for input)
- [ ] 하단 네비게이션 항상 고정
- [ ] 키보드 올라올 때 하단 네비 숨김
- [ ] 지도 터치와 페이지 스크롤 충돌 방지

### PWA 설정
```json
{
  "name": "멍산책",
  "short_name": "멍산책",
  "description": "우리 동네 반려견 산책 루트",
  "start_url": "/app",
  "display": "standalone",
  "background_color": "#FAFAF7",
  "theme_color": "#2D8A42",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 9. 랜딩 페이지 디자인

### 구조 (스크롤 원페이지)

**섹션 1: 히어로**
```
높이: 100vh
배경: --mw-gray-50
중앙에:
  캐치프레이즈: "오늘은 어디로 산책할까?" (display, 28px, 800)
  서브: "매일 새로운 산책 루트를 만들어 드려요" (body, --mw-gray-500)
  CTA 버튼: "무료로 시작하기" (프라이머리 대형)
  아래에 앱 스크린샷 목업 (기울어진 폰 이미지)
```

**섹션 2: 핵심 가치 3개**
```
가로 스크롤 카드 (모바일) 또는 3열 그리드 (데스크톱)
1. "AI가 만드는 순환 루트" + 루트 생성 미니 애니메이션
2. "견주들의 실시간 구간 정보" + 태그 마커 예시
3. "자동 기록되는 산책 일지" + 통계 카드 예시
```

**섹션 3: 작동 방식**
```
3단계 설명 (세로 타임라인)
1단계: 시간을 선택하세요 (타임 셀렉터 UI 캡처)
2단계: 루트를 고르세요 (루트 카드 UI 캡처)
3단계: 산책을 즐기세요 (트래킹 화면 캡처)
```

**섹션 4: 소셜 증명**
```
"벌써 OOO마리 강아지가 산책 중" 카운터
유저 후기 캐러셀 (3~4개 — MVP에서는 더미)
```

**섹션 5: CTA + 푸터**
```
"지금 바로 새로운 산책을 시작하세요"
CTA 버튼 반복
푸터: 로고, 이용약관, 개인정보처리방침, 문의
```

---

## 10. 다크모드 (MVP 이후)

MVP에서는 라이트 모드만. 하지만 CSS 변수 기반으로 구성하여 나중에 다크모드 추가가 쉽도록 한다.

```css
/* 나중에 추가할 다크모드 변수 예시 */
@media (prefers-color-scheme: dark) {
  :root {
    --mw-gray-0: #1A1917;
    --mw-gray-50: #252422;
    --mw-gray-800: #F3F2EE;
    --mw-gray-900: #FAFAF7;
    /* 프라이머리는 동일하게 유지 */
  }
}
```

---

## 11. 로고 & 브랜딩

### 로고
- MVP에서는 텍스트 로고로 충분
- "멍산책" — Pretendard 700, --mw-green-500
- 앞에 🐾 이모지 또는 간단한 발바닥 SVG 아이콘

### 파비콘
- 16×16, 32×32: 발바닥 아이콘 (--mw-green-500 배경 + 흰 발바닥)
- apple-touch-icon 180×180: 동일

### OG 이미지
- 1200×630px
- 배경: --mw-green-500
- 중앙: "멍산책" 로고 + "매일 새로운 산책 루트" 서브텍스트
- 깔끔하게, 요소 최소화

---

## 12. Tailwind 설정

### tailwind.config.ts에 추가할 커스텀 설정
```typescript
const config = {
  theme: {
    extend: {
      colors: {
        mw: {
          green: {
            50: '#F0F7F1',
            100: '#D6EBDA',
            200: '#A8D5B0',
            300: '#6BBF7B',
            400: '#3DA854',
            500: '#2D8A42',
            600: '#246E35',
            700: '#1B5228',
          },
          gray: {
            0: '#FFFFFF',
            50: '#FAFAF7',
            100: '#F3F2EE',
            200: '#E5E3DD',
            300: '#C9C6BD',
            400: '#A09D94',
            500: '#787571',
            600: '#5C5955',
            700: '#3D3B38',
            800: '#252422',
            900: '#1A1917',
          },
          amber: {
            400: '#FBBF24',
            500: '#F59E0B',
          },
          danger: '#DC4A3F',
          warning: '#E8973E',
          info: '#4A90D9',
        },
      },
      fontFamily: {
        sans: ['Pretendard Variable', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'mw': '14px',
        'mw-sm': '10px',
        'mw-lg': '16px',
        'mw-xl': '24px',
      },
      animation: {
        'sheet-up': 'sheetUp 400ms cubic-bezier(0.32, 0.72, 0, 1)',
        'slide-up': 'slideUp 300ms cubic-bezier(0.32, 0.72, 0, 1)',
        'gentle-pulse': 'gentlePulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease infinite',
      },
    },
  },
};
```

### 자주 쓸 Tailwind 클래스 조합
```
페이지 컨테이너: "min-h-screen bg-mw-gray-50"
카드: "bg-white rounded-mw-lg border border-mw-gray-100 p-4"
제목: "text-mw-gray-900 text-xl font-bold"
본문: "text-mw-gray-800 text-[15px] leading-relaxed"
보조: "text-mw-gray-500 text-[13px]"
프라이머리 버튼: "bg-mw-green-500 text-white font-semibold h-[52px] rounded-mw active:scale-[0.97] transition-transform"
```

---

## 13. 디자인 체크리스트 (매 페이지마다 확인)

- [ ] Inter, Roboto 등 뻔한 폰트 사용하지 않았는가?
- [ ] 순수 검정(#000)이나 순수 회색(#888) 쓰지 않았는가?
- [ ] 과한 그림자 대신 테두리/배경 대비로 구분했는가?
- [ ] 그라데이션을 장식용으로 남발하지 않았는가?
- [ ] 텍스트 정렬이 좌측 정렬 위주인가? (중앙 정렬 남발 X)
- [ ] 빈 공간이 충분한가? (요소 사이 숨쉴 공간)
- [ ] 터치 타겟이 44px 이상인가?
- [ ] 로딩 상태를 스켈레톤으로 처리했는가?
- [ ] 빈 상태(데이터 없음)에 친절한 안내가 있는가?
- [ ] 에러 상태에 복구 방법을 안내하는가?
