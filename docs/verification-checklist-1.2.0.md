# 1.2.0 Verification Checklist

Phase: Native article cutover prep + operational hardening
Version: `1.2.0`
Conductor: `[1.2.0][00-conductor]`

## Lane verification status

| Lane | Title | Verification | Gate |
|------|-------|--------------|------|
| 01 | Bootstrap idempotency | **BLOCKED** | worker-pr-base |
| 02 | Linking guardrails | **BLOCKED** | dependency + worker-pr-base |
| 03 | Editor flow hardening | **NOT STARTED** | dependency |
| 04 | Cutover runbook gate | **NOT STARTED** | dependency |

## Acceptance gates

### Gate 1 – Bootstrap idempotency (`bootstrap-idempotency`) — BLOCKED

- [ ] Worker PR base is `phase/1.2.0`.
- [ ] Verification evidence shows repeated `atom.bootstrap`/`atom.bootstrap.reseed` runs are idempotent.

### Gate 2 – Linking diagnostics (`linking-guardrails`) — BLOCKED

- [ ] Worker PR base is `phase/1.2.0`.
- [ ] Invalid linkage states are detected deterministically with actionable diagnostics.

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
- [ ] All worker lane PRs target `phase/1.2.0`.
- [ ] All lane dependencies satisfied in approved merge order (01 → 02/03 → 04).

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
