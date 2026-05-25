# 스타트업 동문 모임 RSVP

**2026년 6월 2일 (화) 오후 7:00 — 삼성동 스파크플러스**

Next.js + Supabase + Railway 스택으로 만든 이벤트 RSVP 페이지입니다.

---

## 로컬 개발 세팅

### 1. Supabase 테이블 생성

Supabase 대시보드 → SQL Editor에서 `supabase/migrations/001_create_rsvps.sql` 실행

### 2. 환경 변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local`을 열고 Supabase 값 입력:

- `SUPABASE_URL` — Project Settings > API > Project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Project Settings > API > service_role (secret)

### 3. 개발 서버 실행

```bash
npm install
npm run dev
```

→ <http://localhost:3000>

---

## Railway 배포

1. GitHub 레포에 이 코드를 push
2. [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. 레포 선택 후 자동 빌드됨
4. Railway 대시보드 → Variables에 환경 변수 추가:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Settings → Generate Domain으로 URL 발급

Railway가 Next.js를 자동 감지해 `npm run build && npm start`로 실행합니다.

---

## 참석자 명단 수정

`pages/index.js` 상단의 `CONFIRMED` / `WAITING` 배열을 직접 편집하세요.
신규 RSVP 제출분은 Supabase `rsvps` 테이블에 저장되며 페이지에 실시간 반영됩니다.

## Supabase에서 RSVP 현황 확인

Supabase 대시보드 → Table Editor → `rsvps` 테이블에서 전체 응답을 확인할 수 있습니다.
