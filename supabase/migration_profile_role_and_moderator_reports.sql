alter table public.profiles add column if not exists role text;

update public.profiles
set
  role = 'user'
where
  role is null;

alter table public.profiles alter column role set default 'user';

alter table public.profiles alter column role set not null;

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where
      conname = 'profiles_role_check'
  ) then
    alter table public.profiles add constraint profiles_role_check check (role in ('user', 'moderator'));
  end if;
end $$;

drop policy if exists "reports_select_moderator" on public.reports;

create policy "reports_select_moderator" on public.reports for select to authenticated using (
  exists (
    select 1
    from public.profiles p
    where
      p.id = (select auth.uid ())
      and p.role = 'moderator'
  )
);
