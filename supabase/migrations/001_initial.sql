-- ================================================
-- 멍산책 (MungWalk) 초기 마이그레이션
-- 기존 Supabase 프로젝트에 mw_ 접두사 테이블 추가
-- ================================================

-- PostGIS 확장 (위치 기반 쿼리용)
create extension if not exists postgis;

-- ================================================
-- 1. mw_users (유저 프로필)
-- ================================================
create table if not exists mw_users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid references auth.users(id) on delete cascade,
  nickname text not null,
  neighborhood text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists mw_users_auth_id_idx on mw_users(auth_id);

-- ================================================
-- 2. mw_pets (반려견)
-- ================================================
create table if not exists mw_pets (
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

create index if not exists mw_pets_user_id_idx on mw_pets(user_id);

-- ================================================
-- 3. mw_walks (산책 기록)
-- ================================================
create table if not exists mw_walks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references mw_users(id) on delete cascade,
  pet_id uuid references mw_pets(id) on delete set null,
  started_at timestamptz not null,
  ended_at timestamptz,
  distance_meters integer default 0,
  duration_seconds integer default 0,
  route_geojson jsonb,
  share_card_url text,
  status text default 'completed' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamptz default now()
);

create index if not exists mw_walks_user_id_idx on mw_walks(user_id);
create index if not exists mw_walks_started_at_idx on mw_walks(started_at desc);

-- ================================================
-- 4. mw_tags (구간 태그)
-- ================================================
create table if not exists mw_tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references mw_users(id) on delete cascade,
  tag_type text not null check (tag_type in (
    'shade', 'water', 'danger', 'big_dog',
    'off_leash', 'traffic', 'scenic', 'pet_friendly'
  )),
  description text,
  location geography(Point, 4326) not null,
  helpful_count integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '90 days')
);

create index if not exists mw_tags_location_idx
  on mw_tags using gist(location);
create index if not exists mw_tags_active_idx
  on mw_tags(is_active) where is_active = true;

-- ================================================
-- 5. mw_tag_votes (태그 투표)
-- ================================================
create table if not exists mw_tag_votes (
  id uuid primary key default gen_random_uuid(),
  tag_id uuid references mw_tags(id) on delete cascade,
  user_id uuid references mw_users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(tag_id, user_id)
);

-- ================================================
-- 6. RLS 정책
-- ================================================

-- mw_users
alter table mw_users enable row level security;

create policy "mw_users_select_own" on mw_users
  for select using (auth.uid() = auth_id);

create policy "mw_users_insert_own" on mw_users
  for insert with check (auth.uid() = auth_id);

create policy "mw_users_update_own" on mw_users
  for update using (auth.uid() = auth_id);

-- mw_pets
alter table mw_pets enable row level security;

create policy "mw_pets_select_own" on mw_pets
  for select using (
    user_id in (select id from mw_users where auth_id = auth.uid())
  );

create policy "mw_pets_insert_own" on mw_pets
  for insert with check (
    user_id in (select id from mw_users where auth_id = auth.uid())
  );

create policy "mw_pets_update_own" on mw_pets
  for update using (
    user_id in (select id from mw_users where auth_id = auth.uid())
  );

create policy "mw_pets_delete_own" on mw_pets
  for delete using (
    user_id in (select id from mw_users where auth_id = auth.uid())
  );

-- mw_walks
alter table mw_walks enable row level security;

create policy "mw_walks_select_own" on mw_walks
  for select using (
    user_id in (select id from mw_users where auth_id = auth.uid())
  );

create policy "mw_walks_insert_own" on mw_walks
  for insert with check (
    user_id in (select id from mw_users where auth_id = auth.uid())
  );

create policy "mw_walks_update_own" on mw_walks
  for update using (
    user_id in (select id from mw_users where auth_id = auth.uid())
  );

-- mw_tags (모든 유저 읽기 가능, 본인만 작성/삭제)
alter table mw_tags enable row level security;

create policy "mw_tags_select_all" on mw_tags
  for select using (true);

create policy "mw_tags_insert_own" on mw_tags
  for insert with check (
    user_id in (select id from mw_users where auth_id = auth.uid())
  );

create policy "mw_tags_delete_own" on mw_tags
  for delete using (
    user_id in (select id from mw_users where auth_id = auth.uid())
  );

-- mw_tag_votes
alter table mw_tag_votes enable row level security;

create policy "mw_tag_votes_select_all" on mw_tag_votes
  for select using (true);

create policy "mw_tag_votes_insert_own" on mw_tag_votes
  for insert with check (
    user_id in (select id from mw_users where auth_id = auth.uid())
  );

create policy "mw_tag_votes_delete_own" on mw_tag_votes
  for delete using (
    user_id in (select id from mw_users where auth_id = auth.uid())
  );

-- ================================================
-- 7. 투표 시 helpful_count 자동 증가 트리거
-- ================================================
create or replace function mw_increment_helpful_count()
returns trigger as $$
begin
  update mw_tags
  set helpful_count = helpful_count + 1
  where id = NEW.tag_id;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger mw_tag_vote_after_insert
  after insert on mw_tag_votes
  for each row
  execute function mw_increment_helpful_count();

-- ================================================
-- 8. updated_at 자동 갱신 트리거
-- ================================================
create or replace function mw_set_updated_at()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

create trigger mw_users_updated_at
  before update on mw_users
  for each row execute function mw_set_updated_at();

create trigger mw_pets_updated_at
  before update on mw_pets
  for each row execute function mw_set_updated_at();
