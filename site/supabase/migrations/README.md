# Database migrations

The Supabase schema this site depends on, checked in so the database's shape is reviewable
in the same place as the code that reads it. Applied to project `nbfsbctmfpzgkduighgq`
(`oolio-product-os`) and recorded in Supabase's own migration history under the same names.

| Migration | What it does |
|---|---|
| `20260901211512_product_os_members_and_roles.sql` | The `members` table, the `member_role` enum, RLS, the last-admin guard, and the bootstrap admin |
| `20260901211609_product_os_members_harden_functions.sql` | Pins `search_path` and removes the RPC exposure Supabase's linter found in the first cut |
| `20260901211926_product_os_members_touch_last_seen.sql` | `touch_member_seen()`, because a plain update is discarded by RLS for everyone but admins |

Earlier migrations on this project are not reproduced here. `flightdeck_calendar_store`
predates this directory, and the four `oolio_prizes_*` migrations belong to a different
application that shares this project — see the note in [`../README.md`](../README.md).

## Applying

These were applied through the Supabase MCP rather than the CLI, so there is no local
`supabase/config.toml` and no linked project. To apply by hand, run each file in order in the
SQL editor, newest last. Each is written to be run once.
