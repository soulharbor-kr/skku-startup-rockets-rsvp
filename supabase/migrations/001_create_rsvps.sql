-- ============================================================
-- SKKU 스타트업 로켓츠 RSVP 테이블
-- Supabase SQL Editor 또는 supabase db push 로 실행하세요
-- ============================================================

create table public.rsvps (
  id          uuid        default gen_random_uuid() primary key,
  name        text        not null,
  contact     text        not null,
  affiliation text,
  intro       text,
  attendance  text        not null check (attendance in ('yes', 'no')),
  message     text,
  created_at  timestamptz default now()
);

alter table public.rsvps enable row level security;

-- API Routes는 service_role key로 RLS를 우회합니다
-- 아래 정책은 Supabase 대시보드 직접 조회용
create policy "anon_select" on public.rsvps
  for select to anon using (true);
