# CLAUDE.md — 새해 자기개발 트래커

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **이름** | 새해 자기개발 트래커 (Self-Dev Tracker) |
| **설명** | 새해 목표를 설정하고 매일 달성 여부를 캘린더에 기록하는 자기개발 트래킹 앱 |
| **타겟** | 새해 목표를 세우고 꾸준히 관리하고 싶은 한국어 사용자 |
| **분위기** | 따뜻하고 동기부여가 되는 톤. 작은 성취도 칭찬하고 격려하는 느낌. 무겁지 않고 가볍고 즐거운 UX |
| **색상** | Primary `#667eea` (보라-파랑), Accent `#f093fb` (핑크), 카테고리별 컬러 시스템 |
| **레퍼런스** | Habitica, Streaks 앱, Notion 캘린더 |

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | React 18 |
| 빌드 도구 | Vite 5 |
| 차트 | Chart.js 4 + react-chartjs-2 |
| 날짜 유틸 | date-fns 3 |
| 스타일링 | 순수 CSS (CSS Custom Properties 기반 디자인 토큰) |
| 상태 관리 | React useState + useCallback (no external store) |
| 데이터 저장 | localStorage (현재) → 추후 Firebase/Supabase 연동 예정 |
| 폰트 | Noto Sans KR (Google Fonts) |
| 배포 | Vercel (GitHub 연동 자동 배포) |
| 패키지 매니저 | npm |

---

## 파일 구조

```
self-dev-tracker/
├── index.html                  # 앱 진입점, 뷰포트 메타, 폰트 로드
├── vite.config.js              # Vite 설정 (React 플러그인)
├── package.json
└── src/
    ├── main.jsx                # React 마운트
    ├── App.jsx                 # 루트 컴포넌트: 헤더, 탭 네비게이션, 탭별 라우팅
    ├── components/
    │   ├── Calendar.jsx        # 월간/주간 캘린더 + 날짜별 목표 체크 패널
    │   ├── GoalManager.jsx     # 목표 CRUD + 카테고리 필터 + 모달 폼
    │   └── Statistics.jsx      # 월별 통계, Chart.js 차트 3종 (Line, Bar, Doughnut)
    ├── hooks/
    │   └── useAppState.js      # 앱 전역 상태 관리 훅 (goals, completions, theme 등)
    ├── utils/
    │   ├── constants.js        # CATEGORIES, WEEKDAYS, MONTHS, FEEDBACK, generateId
    │   └── storage.js          # localStorage 읽기/쓰기, completion 계산 유틸
    └── styles/
        └── global.css          # 전체 스타일: 디자인 토큰, 컴포넌트 스타일, 반응형
```

---

## 데이터 구조

```js
// goals: Goal[]
{
  id: "1234567890-abc1234",   // generateId()
  name: "매일 30분 운동",
  category: "exercise",       // CATEGORIES의 id
  description: "...",
  createdAt: "2026-01-01T00:00:00.000Z"
}

// completions: Record<DateKey, Record<GoalId, boolean>>
{
  "2026-03-01": { "1234567890-abc1234": true },
  "2026-03-02": { "1234567890-abc1234": false }
}
```

---

## 카테고리 시스템

| id | 라벨 | 이모지 | 색상 |
|----|------|--------|------|
| exercise | 운동 | 💪 | `#FF6B6B` |
| reading | 독서 | 📚 | `#4ECDC4` |
| study | 공부 | 📝 | `#45B7D1` |
| hobby | 취미 | 🎨 | `#96CEB4` |
| health | 건강 | 🥗 | `#88D8B0` |
| mindfulness | 마음챙김 | 🧘 | `#FFEAA7` |
| other | 기타 | ✨ | `#DDA0DD` |

---

## 스타일 규칙

- CSS Custom Properties로 디자인 토큰 관리 (`--primary`, `--bg-card`, `--radius` 등)
- 다크모드: `[data-theme='dark']` 속성 셀렉터로 토큰 오버라이드
- BEM-lite 클래스 네이밍: `.block__element--modifier`
- 반응형 브레이크포인트: `768px` (태블릿), `480px` (모바일)
- 모바일에서 모달은 하단 시트(bottom sheet)로 표시

---

## 코드 컨벤션

- 컴포넌트: 함수형, default export
- 상태 로직은 `useAppState` 훅에 집중
- 순수 계산 함수는 `utils/`에 분리
- 이벤트 핸들러는 `useCallback` 래핑
- 한국어 UI 텍스트는 컴포넌트 내 인라인으로 작성 (i18n 미사용)

---

## 예정 작업

- [ ] Firebase Auth + Firestore 연동 (로그인 후 데이터 클라우드 저장)
- [ ] 모바일 반응형 마무리 개선
