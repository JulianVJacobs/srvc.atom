# Phase 1.0.0 Coordination Manifest

> **Conductor lane:** `[1.0.0][00-conductor]`
> **Status:** ACTIVE — all worker PRs open, awaiting review and merge sequencing
> **Last updated:** 2026-05-06

---

## Phase identity

| Field | Value |
|---|---|
| Planned version | `1.0.0` |
| Phase name | AtoM-native article plugin first draft |
| Phase branch | `phase/1.0.0` |
| Conductor branch | `copilot/phase-100` |
| Final merge target | `origin/main` |
| Semver contract | minor change class (additive, plugin-scoped only — see note below) |
| Merge policy | eager-after-green into `phase/1.0.0` |

---

## Phase branch governance

- `phase/1.0.0` is the integration target for all worker lanes.
- Worker PRs must target `phase/1.0.0` and pass verification before merge.
- No worker PR may patch AtoM core templates or modules; any such requirement triggers a contract escalation.
- Conductor merges worker PRs in the approved order defined in the merge sequence below.
- After all lanes are green, conductor opens one final PR from `phase/1.0.0` to `origin/main`.
- This manifest is removed from the final PR. The final PR body carries the structured summary instead.

---

## Semver scope enforcement

> **Note on version label vs. change class:** `1.0.0` is the phase/milestone identifier for this plugin fleet (the first owned release line for the AtoM-native plugin shell). The `srvc.atom` service package is currently at `0.1.0`. The **change class** for this phase is "minor" — meaning all work must be additive and plugin-scoped. If any lane requires a breaking or incompatible change, the contract must be escalated before implementation.

- **Allowed:** additive plugin-owned files, new routes, new module actions, new templates inside the plugin surface, new persistence/linking contract artifacts, documentation, verification scripts.
- **Requires escalation (stop condition):** patching AtoM core templates or modules, incompatible data-model migrations, removal of the hosted fallback route, any cutover of the primary capture path before native parity is demonstrated.

---

## Branch topology note

> **⚠ Topology:** All worker PRs currently target `copilot/phase-100` (the conductor branch) rather than `phase/1.0.0`. This happened because `phase/1.0.0` was not pushed to `origin` before the worker agents opened their PRs. The integration branch `phase/1.0.0` must be pushed to `origin` and all worker PR bases retargeted before the merge sequence begins.

---

## Lane registry

### `[1.0.0][01-native-shell-contract]` — Plugin shell and persistence/linking contract

| Field | Value |
|---|---|
| Status | `OPEN — draft, pending review` |
| PR | [#2](https://github.com/JulianVJacobs/srvc.atom/pull/2) |
| Branch | `copilot/01-native-shell-contract-scaffold-plugin` |
| Current base | `copilot/phase-100` (retarget to `phase/1.0.0` required) |
| Owned surface | Plugin scaffold wiring, plugin configuration baseline, contract artifacts, persistence boundary definition |
| Merge prerequisite | None — merges first |
| Blocker | Retarget base to `phase/1.0.0` |
| Files changed | `atom-plugins/sfHmtArticlePlugin/` (scaffold), `docs/persistence-linking-contract.md`, `infrastructure/atom-stack/docker-compose.yml`, `.env.example` |
| Scope check | ✅ All changes in plugin-owned or supporting stack surfaces; no AtoM core patching |

Verification required before merge:
- [ ] PHP AtoM plugin scaffold present and mountable under `/atom/src/plugins`
- [ ] Plugin configuration baseline establishes route/event registration required by downstream lanes
- [ ] Persistence and linking contract documented: plugin-owned vs AtoM-linked boundary, write policy, identifier/linking rules, fallback coexistence policy
- [ ] No AtoM core template or module patched

---

### `[1.0.0][02-add-menu-route]` — Add `Article` menu entry and route binding

| Field | Value |
|---|---|
| Status | `OPEN — draft, pending review` |
| PR | [#3](https://github.com/JulianVJacobs/srvc.atom/pull/3) |
| Branch | `copilot/lane-100-02-add-menu-route` |
| Current base | `copilot/phase-100` (retarget to `phase/1.0.0` required) |
| Owned surface | Menu extension wiring and plugin route registration for `Article` entry point |
| Merge prerequisite | Lane 01 merged and green |
| Blocker | Retarget base to `phase/1.0.0`; lane 01 not yet merged |
| Files changed | `plugin/auth/checkPermission.ts`, `plugin/bootstrap.ts`, `plugin/contracts/http.ts`, `plugin/contracts/plugin-api-contract.ts`, `plugin/controllers/resource-controllers.ts`, `plugin/plugin.yml`, `plugin/routes/register-plugin-routes.ts`, `plugin/runtime/hosted-atom-runtime.ts`, `plugin/scaffold/plugin-scaffold.ts`, `plugin/tests/add-menu-route.test.ts` |
| Scope check | ✅ All changes in plugin-owned surface; no AtoM core patching |
| Conflict note | ⚠ Overlaps with lane 03 on `checkPermission.ts`, `plugin-api-contract.ts`, `resource-controllers.ts`, `register-plugin-routes.ts`, `hosted-atom-runtime.ts` — merge sequencing must be enforced |

Verification required before merge:
- [ ] `Article` entry visible in the AtoM `Add` menu
- [ ] Menu entry bound to plugin module route (no AtoM core route patched)
- [ ] Change is additive and reversible
- [ ] No AtoM core template or module patched

---

### `[1.0.0][03-native-form-surface]` — AtoM-style article create/edit form

| Field | Value |
|---|---|
| Status | `OPEN — draft, pending review` |
| PR | [#4](https://github.com/JulianVJacobs/srvc.atom/pull/4) |
| Branch | `copilot/100-03-native-form-surface` |
| Current base | `copilot/phase-100` (retarget to `phase/1.0.0` required) |
| Owned surface | Module actions, form class, templates/partials, validation and submission behavior |
| Merge prerequisite | Lane 01 merged and green; lane 02 route baseline stable |
| Blocker | Retarget base to `phase/1.0.0`; lanes 01 and 02 not yet merged |
| Files changed | `plugin/auth/checkPermission.ts`, `plugin/contracts/plugin-api-contract.ts`, `plugin/controllers/resource-controllers.ts`, `plugin/form/article-form.ts`, `plugin/index.ts`, `plugin/routes/register-plugin-routes.ts`, `plugin/runtime/hosted-atom-runtime.ts`, `plugin/tests/article-form.test.ts`, `plugin/tests/plugin-api-contract.integration.test.ts` |
| Scope check | ✅ All changes in plugin-owned surface; no AtoM core patching |
| Conflict note | ⚠ Overlaps with lane 02 on multiple plugin files — must merge after lane 02 and resolve conflicts on `phase/1.0.0` |

Verification required before merge:
- [ ] Article create/edit form renders in AtoM visual language
- [ ] Form submission reaches a deterministic plugin-owned save path
- [ ] AtoM section layout, help text, validation placement, flash messages, and submit behavior matched
- [ ] Hosted fallback remains available
- [ ] No AtoM core template or module patched

---

### `[1.0.0][04-verification-decision]` — Parity validation and client decision gate

| Field | Value |
|---|---|
| Status | `OPEN — draft, pending review` |
| PR | [#5](https://github.com/JulianVJacobs/srvc.atom/pull/5) |
| Branch | `copilot/100-04-verification-decision` |
| Current base | `copilot/phase-100` (retarget to `phase/1.0.0` required) |
| Owned surface | Verification scripts/checklist, parity evidence, fallback coexistence validation, decision summary |
| Merge prerequisite | Lanes 02 and 03 merged and green |
| Blocker | Retarget base to `phase/1.0.0`; lanes 01–03 not yet merged |
| Files changed | `docs/verification-checklist-1.0.0.md`, `docs/decision-note-1.0.0.md`, `plugin/tests/verification-e2e.test.ts`, `PLAN.md` |
| Scope check | ✅ All changes in verification/decision surface; no AtoM core patching |

Verification required before merge:
- [ ] Native article form meets AtoM UX expectations (documented evidence)
- [ ] Native plugin capture compared against hosted fallback for completeness and maintainability
- [ ] Hosted fallback coexistence validated on `phase/1.0.0`
- [ ] First-draft decision summary prepared for client presentation
- [ ] All acceptance criteria for `1.0.0` verified

---

## Merge sequence

```
01-native-shell-contract  ──►  phase/1.0.0
02-add-menu-route         ──►  phase/1.0.0   (after 01 green)
03-native-form-surface    ──►  phase/1.0.0   (after 01 green, 02 route baseline stable)
04-verification-decision  ──►  phase/1.0.0   (after 02 and 03 green)
phase/1.0.0               ──►  origin/main   (after 04 green, manifest removed, final PR opened)
```

---

## Acceptance criteria for `1.0.0`

- [ ] `Article` appears in the AtoM `Add` menu
- [ ] Selecting `Article` opens a native PHP AtoM screen owned by the plugin
- [ ] The first-draft article form renders with AtoM-consistent structure and styling
- [ ] Form submission reaches a deterministic plugin-owned save path
- [ ] Hosted fallback remains available during evaluation
- [ ] Persistence/linking contract explicitly documented and implemented in the plugin baseline (lane 01 output)

---

## Next required actions (conductor)

1. **Push `phase/1.0.0` to `origin`** — worker PR bases must be retargeted to `phase/1.0.0` once it is available on the remote.
2. **Retarget worker PR bases** — update PRs #2, #3, #4, #5 from `copilot/phase-100` to `phase/1.0.0`.
3. **Review lane 01 (PR #2)** — no merge dependencies; first in sequence.
4. **Review lanes 02 and 03 (PRs #3, #4)** — after lane 01 is green; merge lane 02 first, then lane 03 (conflict resolution required on shared plugin files).
5. **Review lane 04 (PR #5)** — after lanes 02 and 03 are green.
6. **Open final PR** from `phase/1.0.0` to `origin/main` — remove this manifest; carry structured summary in PR body.

---

## Stop conditions (contract enforcement)

Any of the following halts merging and requires conductor escalation:

1. A lane requires AtoM core template or module patching not allowed by the minor contract.
2. A lane changes files outside its owned surface without explicit re-contract.
3. A lane is missing a verification summary or has failing checks at the time of merge.
4. Contract drift is detected between the plan, the lane scope, and the implemented diff.

---

## Final PR template (to be used when all lanes are green)

The final PR from `phase/1.0.0` to `origin/main` will carry:

- **Semver rationale:** additive plugin-only changes; no AtoM core patching; version `1.0.0` is the first owned release line for the AtoM-native plugin shell and article capture draft.
- **Merged lanes:** summary of all four worker lanes with their PR numbers and verification outcomes.
- **Owned surfaces:** phase branch governance, manifest lifecycle, merge sequencing, scope/contract enforcement.
- **Verification summary:** integrated checks from worker lanes plus final smoke validation on `phase/1.0.0`.
- **Decision-gate outcome:** client-facing decision summary from lane 04.

---

## Conductor log

| Date | Action |
|---|---|
| 2026-05-06 | Conductor lane opened; `phase/1.0.0` phase branch initialized locally; manifest published |
| 2026-05-06 | All four worker PRs opened by worker agents (#2–#5); manifest updated with PR registry, scope checks, and topology note |
