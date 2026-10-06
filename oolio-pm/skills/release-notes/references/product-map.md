# Product map

Where each product's releases come from, where the record is filed, and where the artefacts go. Read it in the collect step and again in the file step. Facts here were read from Jira, Confluence and the Brain on 6 October 2026; when one is wrong, fix it here and nowhere else.

| Product | Jira project | Release source | Confluence space | Release Notes section | Brain folder | HubSpot slug pattern |
|---|---|---|---|---|---|---|
| Insights | `OR` (quote it in JQL) | Jira version | "Insights (Web & Mobile)", key `KB`, URL alias `in` (quote it in CQL) | "8. Release Notes" | `20 Areas/Oolio/Insights/releases/<YYYY-MM-DD> <Name>/` | `platform-updates/insights-<subject>-<month>-<year>` |
| Products App | `PAPP` | Jira version (Tuesday trains from October 2026) | "Products, Price Lists & Menus", key `PA` | Not yet confirmed; ask for the parent page | `20 Areas/Oolio/Products App/Releases/<YYYY-MM-DD> <Name>/` | `platform-updates/products-app-<subject>-<month>-<year>` |
| Ngara | `AI` | GitHub Releases and `.changeset/*.md` in `oolio-group/ngara`; no Jira version | "Ngara (Oolio AI)", key `NGA` | Section 8, Release Notes (empty as at 24 September 2026) | `20 Areas/Oolio/Ngara/Releases/<YYYY-MM> <Name>/` | `platform-updates/ngara-<month>-<year>` |
| Anything else | The Brain's Jira Register, `_system/Jira Register/<KEY> <Name>.md` | Jira version unless the register says otherwise | The register page, or ask | Ask | `20 Areas/Oolio/<Area>/releases/` if the area exists; otherwise ask, never create an area | `platform-updates/<product>-<subject>-<month>-<year>` |

## Notes that save a mistake

- **Folder case differs by product.** Insights uses `releases/`, Products App and Ngara use `Releases/`. Use the folder that exists. Never create a sibling with the other case.
- **The folder holds five files** for a release: `release-record.json`, `Teams Message.md`, `HubSpot Page Copy.md`, `Confluence Release Page.md`, `Slack Message.md`. Earlier folders (September 2026) hold only the first two artefacts; leave them as they are.
- **Ngara's shipped moment is the GitOps bump**, not the npm publish. The GitHub Release is one merge behind the deploy. Read `.changeset/*.md` for the human-written line per change; it is the best raw material in the building. Repos are read only.
- **Products App releases every Tuesday with something** (register agreed 25 September 2026). The Tuesday note says which release themes moved that week; themes are labels on stories (`combos-r1`, `setmenus-r1`), so the theme step reads labels as well as parent epics for PAPP.
- **Incidents are in `INC`** whatever the product. A release that carried incident fixes names them in the Teams message after re-reading each one.
- **The HubSpot page is drafted as copy**, not built. The customer page template gives the fields a HubSpot page needs. If the HubSpot connector is available after approval, create the page unpublished and leave publishing to a person.
- **Slack**: no standing channel is recorded. Ask which channel on the first run for a product and record it here.
- **Teams**: the September releases went to the internal product channel through the Microsoft 365 connector. Office 365 connectors (incoming webhooks) were retired in May 2026, so a webhook is never the answer.

## Vault scope

Writes go to the work layers only: the product's area under `20 Areas/Oolio/`. `20 Areas/Personal` and `10 Projects/Personal` are NO-GO, always. The release folder is a record, not a decision page; a decision the release settled goes through `push-to-brain`, not here.
