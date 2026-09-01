-- Recording that somebody signed in.
--
-- The obvious implementation is an UPDATE from the callback route, and it silently does
-- nothing: the only UPDATE policy on members is the admin one, so RLS discards the write
-- for every viewer and user, and the admin screen would show "never seen" for everyone
-- except admins with no error anywhere to explain it.
--
-- Widening the UPDATE policy to "you may update your own row" is worse, because RLS cannot
-- restrict which columns a policy covers: a member could then set their own role. So the
-- write goes through a definer function that touches exactly one column on exactly the
-- caller's own row, and members stays admin-write-only.
create or replace function public.touch_member_seen()
returns void
language sql
volatile
security definer
set search_path = public, pg_temp
as $$
  update public.members
     set last_seen_at = now()
   where email = lower(coalesce(auth.jwt() ->> 'email', ''))
$$;

comment on function public.touch_member_seen() is
  'Stamps last_seen_at on the calling member''s own row. The only write a non-admin can make.';

revoke execute on function public.touch_member_seen() from public, anon;
grant execute on function public.touch_member_seen() to authenticated;
