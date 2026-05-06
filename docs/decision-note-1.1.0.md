# 1.1.0 Decision Note

Lane: `[1.1.0][04-verification-decision]`
Audience: conductor, client stakeholder, final PR reviewer

---

## Summary

All verification gates for the 1.1.0 hardening and migration-foundation phase have passed. The native AtoM article plugin is demonstrably stable, parity-conformant, and safe to continue developing. The hosted fallback remains operational and unaffected. This note presents the evidence summary and a go/no-go recommendation for the conductor's final PR to `origin/main`.

---

## Evidence summary

### Behaviour checks (Add → Article → create/edit → save/update)

- Plugin bootstrap is deterministic: the route prefix registers cleanly and the health gate passes every time the stack restarts.
- The `Article` entry under the AtoM `Add` menu routes correctly to the native create form via the plugin-owned action.
- Create and edit form submissions reach the plugin-owned persistence path (durable, lane 03 output), not the in-memory fallback.
- Flash messages (success and error) render in the correct AtoM banner containers on both create and update paths.
- Required-field validation fires client-side and is enforced server-side; errors display adjacent to the offending fields and clear on correction.

### Parity checks (AtoM UX conventions)

- Layout, field grouping, label placement, required markers, and help text all match AtoM core form patterns.
- CSRF protection is present and functionally equivalent to core AtoM form submissions.
- No core AtoM templates or modules were patched; all behaviour comes from plugin-owned actions, templates, and form class.

### Fallback coexistence checks

- Hosted runtime (`getHostedPluginRuntime`) initialises independently of the native article module; no path collision exists.
- All hosted API routes (`/actors`, `/events`, `/claims`, `/victims`, `/perpetrators`, `/participants`, `/claim-linkages`) remain reachable and return contract-shaped responses.
- Permission guards and auth-header binding continue to function correctly on both runtimes.

### Residual risks

All residual risks are low-severity or scoped to future lanes. None constitute a blocker for the 1.1.0 merge. The highest-priority follow-up (R-01: potential AtoM information-object linkage dependency) is deferred to the next semver contract.

Full evidence table: `docs/verification-checklist-1.1.0.md`.

---

## Client decision packet

### Option A — Adopt native path: continue full migration

**Recommendation: APPROVED**

The native plugin path has demonstrated:

1. Stable, reproducible boot and enable behaviour in the live AtoM stack.
2. A first-class AtoM-conformant article create/edit/save/update UX without any core patching.
3. Durable article persistence under plugin-owned tables with correct link validation.
4. No regression to the hosted fallback path.

Proceeding with Option A unlocks the following next slice:

- Define and open a `1.2.0` (or `2.0.0` if a breaking data-model migration is required) contract covering:
  - AtoM information-object integration (if the article model must link to accession or authority records).
  - Full migration runbook: hosted fallback deprecation timeline, data-export/import tooling, client training plan.
  - Expanded article form surface (additional field groups, relationship pickers).

### Option B — Freeze at draft

If the client chooses not to proceed with the native plugin path, the following is the freeze state:

- The hosted workbench remains the primary article-capture path.
- The native plugin code is preserved in the repository as a draft baseline for future reference but is not deployed to production.
- No further work is done on this lane or subsequent 1.x slices unless the client direction changes.

---

## Conductor recommendation

**Approve Option A — native continuation.**

All 1.1.0 acceptance gates are satisfied. The surface area of the change is additive and plugin-scoped; no AtoM core modifications were made. The hosted fallback coexists safely and can remain available for as long as the client requires a parallel path. The risk profile is low and well-understood.

Recommended action for conductor final PR:

1. Merge this lane (`[1.1.0][04-verification-decision]`) to `phase/1.1.0`.
2. Open the final integration PR from `phase/1.1.0` to `origin/main`.
3. Include this decision note in the conductor PR body under "Decision".
4. After merge, open planning for the next semver slice targeting full AtoM-native migration.

---

## Rollback path

If production issues arise after merge:

1. Disable the plugin via `atom.bootstrap.reset` (removes plugin enable flag from the `settings` table).
2. The hosted fallback routes remain active and unaffected; no data-loss risk for the hosted in-memory store.
3. Plugin-owned database tables (`atom_article`, `atom_victim`, `atom_perpetrator`, etc.) can be dropped or left in place without affecting AtoM core operation.
4. Revert by reverting the `phase/1.1.0` merge commit on `main`; no cascading core changes to undo.
