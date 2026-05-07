# sfArticlePlugin Persistence and Linking Contract

**Version:** 1.1.0  
**Lane:** `[1.1.0][01-native-shell-contract]`  
**Status:** published (baseline)  
**Last updated:** 2026-05-06

---

## 1. Purpose

This document defines the canonical boundary between plugin-owned data and
AtoM-linked data for the `sfArticlePlugin`.  It governs which fields the
plugin writes, which records it links to AtoM native objects, and how the
hosted-fallback coexistence policy is maintained during the 1.1.x hardening
phase.

Downstream lanes **must not** widen the plugin-owned surface or narrow the
AtoM-linked surface without re-contracting this document at the appropriate
semver increment.

---

## 2. Plugin-owned vs AtoM-linked field boundary

### 2.1 Plugin-owned fields

These fields are stored in plugin-managed tables and are fully owned by the
plugin.  AtoM core does not read or write them.

| Field | Type | Notes |
|-------|------|-------|
| `id` | int (PK, auto-increment) | Plugin-assigned; never reused on delete |
| `title` | varchar(255) | Required; human-readable article title |
| `body` | text | Optional; article body content |
| `author_label` | varchar(255) | Free-text author attribution |
| `published_at` | datetime (nullable) | Publication timestamp; NULL means draft |
| `created_at` | datetime | Plugin-set on first write |
| `updated_at` | datetime | Plugin-set on each update |
| `atom_actor_id` | int (nullable, FK hint) | See §2.2 |
| `atom_record_id` | int (nullable, FK hint) | See §2.2 |

### 2.2 AtoM-linked fields

These fields carry identifiers that reference existing AtoM records.  The
plugin stores only the identifier; it does **not** replicate or shadow the
AtoM record's content.

| Field | AtoM record type | Write policy |
|-------|-----------------|--------------|
| `atom_actor_id` | Authority record (actor) | Linked on create/update; never auto-created by the plugin |
| `atom_record_id` | Archival description | Linked on create/update; never auto-created by the plugin |

**Key invariant:** If the referenced AtoM record is deleted or its identifier
changes, the plugin record is _orphaned_ (the identifier becomes stale) but
is never cascaded-deleted automatically.  Orphan handling is out of scope for
1.1.x and is flagged as a follow-up item in the [Risks](#5-risks-and-follow-ups) section.

---

## 3. Create/update write policy

| Operation | Writer | Conditions |
|-----------|--------|------------|
| Create | Plugin (lane 03 persistence) | `title` must be present and non-empty |
| Update | Plugin (lane 03 persistence) | Record must already exist (`id` required) |
| Delete | Plugin (lane 03 persistence) | Soft-delete preferred; hard-delete only with explicit flag |
| Link update | Plugin (lane 03 persistence) | `atom_actor_id` / `atom_record_id` may be set to NULL to un-link |
| AtoM record write | AtoM core | Plugin never writes to AtoM's core tables directly |

**Idempotency:** Create submissions with duplicate `title + published_at` SHOULD
return the existing record rather than creating a duplicate.  The exact
duplicate-detection predicate is finalised by lane 03 but this contract
reserves the intent.

---

## 4. Identifier and linking rules

1. **Plugin-assigned identifiers** (`id`) are integers assigned by the plugin
   persistence layer (auto-increment or sequence).  They are stable for the
   lifetime of the record and are never recycled.

2. **AtoM identifiers** (`atom_actor_id`, `atom_record_id`) are the integer
   primary keys used by AtoM internally.  The plugin reads these from the AtoM
   API or database view; it does not construct them.

3. **Linking is optional on create.**  An article record may exist without any
   AtoM link.  The link may be established or updated in a subsequent edit.

4. **Link validation** is performed at write time by lane 03: the plugin
   confirms the referenced AtoM record exists before persisting the identifier.
   If the record is not found, the write is rejected with a validation error.

5. **Cross-plugin linking** (linking to records owned by another plugin) is
   out of scope for 1.1.x.

---

## 5. Hosted-fallback coexistence policy

The hosted workbench article route (`WORKBENCH_PLUGIN_API_BASE_URL`) remains
active during the entire 1.1.x phase.

| Condition | Behaviour |
|-----------|-----------|
| `hosted_fallback_enabled: true` (default) | Both native plugin route and hosted workbench link are available. No redirect or blocking. |
| `hosted_fallback_enabled: false` | Native plugin route is the sole entry point. Hosted link is hidden. May only be set after explicit client sign-off. |
| Native plugin error | No automatic redirect to hosted fallback; error is surfaced to the user. |
| Hosted workbench error | No automatic redirect to native plugin; error is surfaced to the user. |

The flag is controlled by `app_sfArticlePlugin_hosted_fallback_enabled` in
`config/app.yml` (see [plugin config](../atom/plugins/sfArticlePlugin/config/app.yml)).

---

## 6. Semver escalation triggers

This contract is scoped to **minor** changes.  The following conditions require
re-contracting at **major** before implementation:

- Direct writes to AtoM core tables (not plugin-owned tables).
- Removal or rename of any field listed in §2 while data already exists.
- Cutover away from hosted fallback without explicit client approval.
- Schema migration that drops or alters plugin-owned columns in a
  backwards-incompatible way.

---

## 7. Risks and follow-ups

| Risk | Mitigation / Follow-up |
|------|------------------------|
| Orphaned AtoM links after AtoM record deletion | Track in backlog; add reference-check job in a future lane. |
| Duplicate detection predicate not yet finalised | Lane 03 owns finalisation; this contract reserves the intent. |
| Hosted fallback removal timing | Requires explicit client decision gate (lane 04 output). |
| Plugin-owned table schema not yet created | Lane 03 delivers the schema/migration scripts. |
