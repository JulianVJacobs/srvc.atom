# Persistence and Linking Contract

**Plugin:** `sfHmtArticlePlugin`
**Lane:** `[1.0.0][01-native-shell-contract]`
**Version:** `1.0.0`
**Status:** Baseline — established in this lane, owned through `1.0.0` lifecycle.

---

## 1. Plugin-owned vs AtoM-linked field boundary

### Plugin-owned fields

Fields whose canonical home is the plugin's own data model.  The plugin is
the sole writer for these fields.  AtoM core does **not** read or write them
directly; they are exposed through plugin-owned module actions only.

| Field | Type | Notes |
|-------|------|-------|
| `article_title` | string | Free-text headline for the article record |
| `article_body` | text | Full article body copy |
| `article_source_url` | string (URL) | Source URL if the article was captured from the web |
| `article_publication_date` | date | Date of original publication |
| `article_status` | enum (`draft`, `published`, `archived`) | Plugin-managed publication state |
| `plugin_created_at` | datetime | Plugin write timestamp (not the AtoM `updatedAt`) |
| `plugin_updated_at` | datetime | Plugin last-update timestamp |

### AtoM-linked fields

Fields that reference existing AtoM records.  The plugin stores only the
AtoM object identifier; the referenced record continues to be owned and
maintained by AtoM core.

| Field | AtoM record type | Notes |
|-------|-----------------|-------|
| `linked_information_object_id` | Archival description (`informationObject`) | Optional; links the article to an archival description |
| `linked_actor_id` | Authority record (`actor`) | Optional; links the article to a named actor |

The plugin **must not** create, update, or delete the referenced AtoM records
as a side-effect of article save operations.  Linking is reference-only.

---

## 2. Create/update write policy

### Create

1. All plugin-owned fields are written in a single plugin transaction.
2. The plugin generates its own internal identifier (UUID or auto-increment
   primary key inside the plugin table).
3. AtoM-linked fields are validated for referential existence before write:
   if the referenced AtoM record does not exist, the create is rejected with a
   user-visible validation error.
4. The hosted workbench capture path remains available during and after
   create.  A native-plugin create does **not** disable or replace a hosted
   record with the same source URL.

### Update

1. Only plugin-owned fields may be updated through the plugin edit action.
2. The plugin **must not** update linked AtoM records.
3. Re-linking (changing `linked_information_object_id` or
   `linked_actor_id`) is allowed; the old link is replaced, not deleted from
   AtoM.
4. `plugin_updated_at` is refreshed on every successful save.

---

## 3. Identifier and linking rules

### Plugin identifier

- Each article record has a **plugin-owned** primary key (`id`) that is stable
  across the lifetime of the record.
- The plugin key must not be shared with or adopted from AtoM object
  identifiers.

### AtoM link identifier

- The plugin stores AtoM object identifiers as plain foreign keys
  (`linked_information_object_id`, `linked_actor_id`).
- These IDs are the AtoM `id` primary key values of the corresponding AtoM
  tables (`information_object`, `actor`).
- The plugin **does not** validate continued AtoM record existence on every
  read; stale links are tolerated and surfaced as a "record not found"
  indicator in the UI without preventing access to the article record itself.

### Uniqueness

- Article records are uniquely identified by plugin key only.
- Multiple article records may link to the same AtoM information object or
  actor (many-to-one linking is permitted).

---

## 4. Hosted fallback coexistence policy

The hosted workbench capture path (`WORKBENCH_PLUGIN_API_BASE_URL`) must
remain functional during the entire `1.0.0` evaluation window.

Rules:

1. **No cutover** — the native plugin and the hosted fallback are active
   simultaneously.  The client chooses which path to use; neither path is
   removed or redirected during `1.0.0`.
2. **No shared state** — article records created through the hosted path and
   article records created through the native plugin are stored independently.
   There is no automatic migration or merge between the two stores.
3. **No interference** — the native plugin must not alter AtoM routes,
   templates, or menus in a way that breaks or hides the hosted fallback path.
4. **Decision gate** — lane `[1.0.0][04-verification-decision]` produces the
   parity and client-preference verdict.  If the client selects the native
   plugin, a separate migration lane is opened to consolidate data.  If the
   client retains the hosted path, the plugin lane is frozen at draft/prototype
   status and this contract remains advisory.

---

## 5. Stop conditions for this contract

The following changes require a re-contract before implementation:

- Any AtoM core template or module patch that is required to deliver article
  persistence.
- A schema migration that creates AtoM core tables or alters existing AtoM
  core tables.
- A cutover that disables or replaces the hosted fallback path before the
  decision gate is reached.
- Any change that makes the plugin-owned data model depend on AtoM internal
  implementation details beyond the stable public AtoM object IDs listed above.
