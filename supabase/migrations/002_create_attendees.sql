create table public.attendees (
  id           uuid        default gen_random_uuid() primary key,
  name         text        not null,
  role         text,
  sector       text,
  tag          text,
  status       text        default 'confirmed' check (status in ('confirmed', 'waiting')),
  phone        text,
  email        text,
  intro        text,
  display_order int        default 999,
  created_at   timestamptz default now()
);

alter table public.attendees enable row level security;

create policy "select_all"    on public.attendees for select using (true);
create policy "update_contact" on public.attendees for update using (true) with check (true);

-- 참석 확정
insert into public.attendees (name, role, sector, tag, status, display_order) values
('홍성완', '성균관대 창업지원단 수석',         'univ',    '대학',    'confirmed', 1),
('승영욱', '포스페이스랩 대표',               'startup', '스타트업', 'confirmed', 2),
('민무홍', '성균관대 컴퓨터교육학과 교수',      'univ',    '대학',    'confirmed', 3),
('홍성후', '국립암센터 대외협력팀장',           'public',  '공공',    'confirmed', 4),
('천영록', '모트에이아이 대표',               'startup', '스타트업', 'confirmed', 5),
('노건준', '성균관대 인공지능학과 학생',        'univ',    '대학',    'confirmed', 6),
('이현웅', 'YTN 앵커',                      'media',   '미디어',  'confirmed', 7),
('박동찬', '파일러 CTO',                    'startup', '스타트업', 'confirmed', 8),
('김영현', '국OO 전무',                     'public',  '공공',    'confirmed', 9),
('함창욱', '신용보증기금 팀장',               'finance', '금융',    'confirmed', 10),
('박재훈', '국민은행 팀장',                  'finance', '금융',    'confirmed', 11),
('김정년', 'CYP 본부장',                    'invest',  '투자',    'confirmed', 12),
('문예슬', '피클스 대표 / 성형외과 원장',      'startup', '스타트업', 'confirmed', 13);

-- 참석 대기
insert into public.attendees (name, role, sector, tag, status, display_order) values
('홍민우', '카카오뱅크 팀장',                  'finance', '금융',    'waiting', 14),
('김진성', '대륙아주법인 연구원',              'public',  '전문직',  'waiting', 15),
('송락현', '한국물류데이터 대표',              'startup', '스타트업', 'waiting', 16),
('이강훈', '도우물류 대표',                   'startup', '스타트업', 'waiting', 17),
('이흥규', '라이폴리 대표',                   'startup', '스타트업', 'waiting', 18),
('박준호', '비엑스컨설팅 대표',               'startup', '스타트업', 'waiting', 19),
('조유진', '스마일게이트 인베스트먼트 팀장',    'invest',  '투자',    'waiting', 20),
('문희',   '한국투액셀러레이터 팀장',           'invest',  '투자',    'waiting', 21),
('승주완', '성균관대 책임',                    'univ',    '대학',    'waiting', 22),
('김준석', '더파운더스(아누아) 본부장',         'startup', '스타트업', 'waiting', 23),
('김세연', '블루버스인베스트먼트 대표',          'invest',  '투자',    'waiting', 24),
('이희종', '메디치인베스트먼트 이사',           'invest',  '투자',    'waiting', 25);
