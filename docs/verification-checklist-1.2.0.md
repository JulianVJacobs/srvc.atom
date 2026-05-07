# 1.2.0 Verification Checklist

Phase: Native article cutover prep + operational hardening
Version: `1.2.0`
Conductor: `[1.2.0][00-conductor]`

## Lane verification status

| Lane | Title | Verification | Gate |
|------|-------|--------------|------|
| 01 | Bootstrap idempotency | **PASS** | bootstrap-idempotency |
| 02 | Linking guardrails | **PASS** | linking-guardrails |
| 03 | Editor flow hardening | **NOT STARTED** | dependency |
| 04 | Cutover runbook gate | **NOT STARTED** | dependency |

## Acceptance gates

### Gate 1 – Bootstrap idempotency (`bootstrap-idempotency`) — PASS

- [x] Verification evidence shows repeated `atom.bootstrap`/`atom.bootstrap.reseed` runs are idempotent.

### Gate 2 – Linking diagnostics (`linking-guardrails`) — PASS

- [x] Invalid linkage states are detected deterministically with actionable diagnostics.

### Gate 3 – Native editor reliability (`editor-flow-hardening`) — NOT STARTED

- [ ] Worker PR opened and verified.
- [ ] Native create/edit retry paths remain stable under validation failures.

### Gate 4 – Hosted fallback coexistence (`hosted-fallback`) — PENDING

- [ ] No lane removes or breaks hosted fallback coexistence.

### Gate 5 – Cutover recommendation packet (`cutover-runbook-gate`) — NOT STARTED

- [ ] Runbook, residual risks, rollback path, and explicit go/no-go recommendation are published.

## Integrated lane checks

- [x] Repository startup gate satisfied on conductor phase branch (`phase/1.2.0`).
- [x] Recent completed CI run reviewed; no failed jobs in run `25473627187`.
- [x] Lane 01 and lane 02 branches are merged into this conductor PR branch.
- [ ] Lane 03 and lane 04 dependencies are still pending for phase/1.2.0 merge order (01 → 02/03 → 04).

## Final smoke validation (phase/1.2.0 integrated)

- [ ] All four lane acceptance gates pass with verification evidence.
- [ ] Semver contract validated (plugin-owned additive hardening only).
- [ ] Final integration PR from `phase/1.2.0` to `origin/main` prepared with structured summary.

## Stop conditions

- Any lane requires AtoM core template/module patching. ⛔ stop
- Any lane introduces backward-incompatible persistence/linking contract changes. ⛔ stop
- Any lane removes or breaks hosted fallback coexistence. ⛔ stop
- Missing verification summary or failing checks for merge candidates. ⛔ stop
- Contract drift between plan, lane scope, manifest, and implemented diff. ⛔ stop

## Lane [1.2.0][01-bootstrap-idempotency] evidence

| Check | Command | Result |
| --- | --- | --- |
| Focused script tests pass | `node --test scripts/atom-bootstrap-lib.test.cjs scripts/atom-bootstrap-reset.test.cjs` | PASS (3/3) |
| Repeated bootstrap is idempotent | `ATOM_BOOTSTRAP_USE_COMPOSE=0 ATOM_BOOTSTRAP_PLUGIN_HOOK="echo 'sfArticlePlugin already enabled' >&2; exit 1" node scripts/atom-bootstrap.cjs` (run twice) | PASS (`executed=1` then `skipped=1`) |
| Repeated reset+reseed is idempotent | `ATOM_BOOTSTRAP_USE_COMPOSE=0 ATOM_BOOTSTRAP_PLUGIN_HOOK="echo 'sfArticlePlugin already enabled' >&2; exit 1" node scripts/atom-bootstrap-reset.cjs --reseed` (run twice) | PASS (both reseeds complete; deterministic plugin state key) |
| Reset hook is non-destructive when plugin already disabled | `ATOM_BOOTSTRAP_USE_COMPOSE=0 ATOM_BOOTSTRAP_RESET_HOOK="echo 'sfArticlePlugin already disabled' >&2; exit 1" node scripts/atom-bootstrap-reset.cjs` | PASS (idempotent outcome tolerated) |
| Bootstrap default scope is plugin-only | `node --test scripts/atom-bootstrap-lib.test.cjs` (`default bootstrap steps are plugin-scoped and deterministic`) | PASS |

## Owned-surface confirmation

- Updated files are limited to bootstrap/reset scripts, plugin enablement defaults, env hook documentation, and focused script tests.
- No AtoM core template/module patching was introduced.
