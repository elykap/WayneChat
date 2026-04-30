create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  role text not null default 'user' check (role in ('user', 'moderator')),
  created_at timestamptz not null default now()
);

create index profiles_created_at_idx on public.profiles (created_at desc);

create table public.communities (
  id uuid primary key default gen_random_uuid (),
  slug text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now ()
);

create index communities_slug_idx on public.communities (slug);

create table public.posts (
  id uuid primary key default gen_random_uuid (),
  community_id uuid not null references public.communities (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now (),
  updated_at timestamptz not null default now ()
);

create index posts_community_created_idx on public.posts (community_id, created_at desc);

create table public.replies (
  id uuid primary key default gen_random_uuid (),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now ()
);

create index replies_post_created_idx on public.replies (post_id, created_at);

create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Member'
    )
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
execute procedure public.handle_new_user ();


alter table public.profiles enable row level security;
alter table public.communities enable row level security;
alter table public.posts enable row level security;
alter table public.replies enable row level security;

create policy "profiles_select_authenticated"
  on public.profiles
  for select
  to authenticated
  using (true);

create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (id = (select auth.uid ()));

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid ()))
  with check (id = (select auth.uid ()));

create policy "communities_select_authenticated"
  on public.communities
  for select
  to authenticated
  using (true);


create policy "posts_select_authenticated"
  on public.posts
  for select
  to authenticated
  using (true);

create policy "posts_insert_own"
  on public.posts
  for insert
  to authenticated
  with check (author_id = (select auth.uid ()));

create policy "posts_update_own"
  on public.posts
  for update
  to authenticated
  using (author_id = (select auth.uid ()))
  with check (author_id = (select auth.uid ()));

create policy "posts_delete_own"
  on public.posts
  for delete
  to authenticated
  using (author_id = (select auth.uid ()));

create policy "replies_select_authenticated"
  on public.replies
  for select
  to authenticated
  using (true);

create policy "replies_insert_own"
  on public.replies
  for insert
  to authenticated
  with check (author_id = (select auth.uid ()));

create policy "replies_update_own"
  on public.replies
  for update
  to authenticated
  using (author_id = (select auth.uid ()))
  with check (author_id = (select auth.uid ()));

create policy "replies_delete_own"
  on public.replies
  for delete
  to authenticated
  using (author_id = (select auth.uid ()));

create table public.reports (
  id uuid primary key default gen_random_uuid (),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('post', 'reply')),
  target_post_id uuid references public.posts (id) on delete cascade,
  target_reply_id uuid references public.replies (id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now (),
  constraint reports_target_check check (
    (
      target_type = 'post'
      and target_post_id is not null
      and target_reply_id is null
    )
    or (
      target_type = 'reply'
      and target_reply_id is not null
      and target_post_id is null
    )
  )
);

create index reports_reporter_created_idx on public.reports (reporter_id, created_at desc);

create index reports_target_post_idx on public.reports (target_post_id)
where
  target_post_id is not null;

create index reports_target_reply_idx on public.reports (target_reply_id)
where
  target_reply_id is not null;

alter table public.reports enable row level security;

create policy "reports_insert_own" on public.reports for insert to authenticated
with check
  (reporter_id = (select auth.uid ()));

create policy "reports_select_own" on public.reports for select to authenticated using (reporter_id = (select auth.uid ()));

create policy "reports_select_moderator" on public.reports for select to authenticated using (
  exists (
    select 1
    from public.profiles p
    where
      p.id = (select auth.uid ())
      and p.role = 'moderator'
  )
);
