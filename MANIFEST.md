# Phase 1.0.0 Coordination Manifest

> **Conductor lane:** `[1.0.0][00-conductor]`
> **Status:** ACTIVE — awaiting worker lanes
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

## Lane registry

### `[1.0.0][01-native-shell-contract]` — Plugin shell and persistence/linking contract

| Field | Value |
|---|---|
| Status | `PENDING` |
| PR | — |
| Branch | — |
| Owned surface | Plugin scaffold wiring, plugin configuration baseline, contract artifacts, persistence boundary definition |
| Merge prerequisite | None — merges first |
| Blocker | None |

Verification required before merge:
- [ ] PHP AtoM plugin scaffold present and mountable under `/atom/src/plugins`
- [ ] Plugin configuration baseline establishes route/event registration required by downstream lanes
- [ ] Persistence and linking contract documented: plugin-owned vs AtoM-linked boundary, write policy, identifier/linking rules, fallback coexistence policy
- [ ] No AtoM core template or module patched

---

### `[1.0.0][02-add-menu-route]` — Add `Article` menu entry and route binding

| Field | Value |
|---|---|
| Status | `PENDING` |
| PR | — |
| Branch | — |
| Owned surface | Menu extension wiring and plugin route registration for `Article` entry point |
| Merge prerequisite | Lane 01 merged and green |
| Blocker | Blocked on lane 01 |

Verification required before merge:
- [ ] `Article` entry visible in the AtoM `Add` menu
- [ ] Menu entry bound to plugin module route (no AtoM core route patched)
- [ ] Change is additive and reversible
- [ ] No AtoM core template or module patched

---

### `[1.0.0][03-native-form-surface]` — AtoM-style article create/edit form

| Field | Value |
|---|---|
| Status | `PENDING` |
| PR | — |
| Branch | — |
| Owned surface | Module actions, form class, templates/partials, validation and submission behavior |
| Merge prerequisite | Lane 01 merged and green; lane 02 route baseline stable |
| Blocker | Blocked on lane 01 |

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
| Status | `PENDING` |
| PR | — |
| Branch | — |
| Owned surface | Verification scripts/checklist, parity evidence, fallback coexistence validation, decision summary |
| Merge prerequisite | Lanes 02 and 03 merged and green |
| Blocker | Blocked on lanes 02 and 03 |

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
| 2026-05-06 | Conductor lane opened; `phase/1.0.0` phase branch initialized; manifest published |
