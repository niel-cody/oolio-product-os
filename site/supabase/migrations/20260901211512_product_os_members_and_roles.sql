-- Product OS access control: who may sign in, and what they may do.
--
-- Replaces the FLIGHTDECK_ALLOWED_EMAILS environment variable, which meant granting
-- access was a Vercel edit and a redeploy, and there was nowhere to record what someone
-- was allowed to do beyond in or out.
--
-- Fail-closed by construction: access is the presence of a row. No row is no access, and
-- an empty table locks everyone out rather than letting everyone in. That was the
-- property of the old env allowlist worth keeping, and it is the one most easily lost.
--
-- Note this project also carries the Oolio Awards schema (profiles, awards, nominations,
-- finalists, votes, settings, allowed_domains). That is a separate application which
-- should live in its own project; nothing here touches it, and its own is_admin() and
-- on_auth_user_created trigger are deliberately left alone.

-- Declared weakest first: Postgres orders enums by declaration, so `role >= 'user'`
-- reads as "user or better" and the ladder cannot be got wrong at a call site.
create type public.member_role as enum ('viewer', 'user', 'admin');

comment on type public.member_role is
  'viewer: read the reference surfaces. user: adds Flightdeck and their own integrations. admin: adds managing members.';

create table public.members (
  -- Email, not user id: people are granted access before they have ever signed in, and
  -- the auth user only comes into existence when they follow their first magic link.
  email        text primary key,
  role         public.member_role not null default 'viewer',
  -- Linked by the trigger below once they do sign in. Nullable on purpose.
  user_id      uuid unique references auth.users (id) on delete set null,
  full_name    text,
  note         text,
  invited_by   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  last_seen_at timestamptz,

  -- The gate compares a lowercased JWT claim against this column, so a row stored with
  -- capitals would be a row that silently never matches.
  constraint members_email_is_lowercase check (email = lower(email)),
  constraint members_email_has_at check (position('@' in email) > 1)
);

comment on table public.members is
  'Who may use the Oolio Product OS site, and in what capacity. Presence of a row is access.';

alter table public.members enable row level security;

-- Security definer, so the policies on `members` can ask about the caller's role without
-- selecting from `members` through its own policies and recursing.
create or replace function public.current_member_role()
returns public.member_role
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select m.role
  from public.members m
  where m.email = lower(coalesce(auth.jwt() ->> 'email', ''))
$$;

comment on function public.current_member_role() is
  'The signed-in caller''s Product OS role, or NULL if they are not a member. NULL is no access.';

create or replace function public.is_product_os_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(public.current_member_role() = 'admin', false)
$$;

grant execute on function public.current_member_role() to authenticated;
grant execute on function public.is_product_os_admin() to authenticated;

-- You can always read your own row, because the app needs it on every gated request to
-- know what you are. Admins can read everyone, because they manage the list.
create policy members_select_self_or_admin on public.members
  for select to authenticated
  using (email = lower(coalesce(auth.jwt() ->> 'email', '')) or public.is_product_os_admin());

create policy members_admin_insert on public.members
  for insert to authenticated
  with check (public.is_product_os_admin());

create policy members_admin_update on public.members
  for update to authenticated
  using (public.is_product_os_admin())
  with check (public.is_product_os_admin());

create policy members_admin_delete on public.members
  for delete to authenticated
  using (public.is_product_os_admin());

create or replace function public.members_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end
$$;

create trigger members_touch
before update on public.members
for each row execute function public.members_touch_updated_at();

-- The one way an admin could lock the whole team out of the admin screen is by demoting
-- or deleting the last admin, which is a single click and has no undo from inside the
-- app. Deferred so a multi-row change is judged on its end state, not row by row.
create or replace function public.members_require_an_admin()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not exists (select 1 from public.members where role = 'admin') then
    raise exception 'members: at least one admin must remain';
  end if;
  return null;
end
$$;

create constraint trigger members_require_an_admin
after update or delete on public.members
deferrable initially deferred
for each row execute function public.members_require_an_admin();

-- Links a member to their auth user the first time they sign in. Deliberately a second,
-- separately named trigger rather than an edit to on_auth_user_created, which belongs to
-- the Awards application sharing this project.
create or replace function public.members_link_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.members
     set user_id = new.id
   where email = lower(new.email)
     and user_id is distinct from new.id;
  return new;
end
$$;

create trigger on_auth_user_created_link_member
after insert on auth.users
for each row execute function public.members_link_auth_user();

-- Bootstrap. Exactly one admin, deliberately: every other address that has ever signed in
-- is left out, because presence in auth.users only means somebody followed a magic link,
-- not that the old env allowlist admitted them. Adding the rest is a few clicks in the
-- admin screen and is a decision worth making explicitly.
insert into public.members (email, role, full_name, invited_by, note)
values ('niel.cody@oolio.com', 'admin', 'Niel Cody', 'bootstrap',
        'Seeded with the members table itself.')
on conflict (email) do update set role = 'admin';

update public.members m
   set user_id = u.id
  from auth.users u
 where lower(u.email) = m.email
   and m.user_id is null;
