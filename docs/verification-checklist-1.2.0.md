# 1.2.0 Verification Checklist

Phase: Native article cutover prep + operational hardening
Version: `1.2.0`
Lane: `[1.2.0][04-cutover-runbook-gate]`

## Lane verification status

| Lane | Title | Verification | Gate |
| --- | --- | --- | --- |
| 01 | Bootstrap idempotency | PASS (branch-level evidence only) | plugin-boot-idempotency |
| 02 | Linking guardrails | BLOCKED (not merged) | linking-guardrails |
| 03 | Native create/edit hardening | BLOCKED (not merged; CI still running) | editor-flow-hardening |
| 04 | Cutover runbook + decision | PASS (artifacts produced) | cutover-recommendation |

## Acceptance gate summary

### Gate 1 – Behavior checks (`editor-flow-hardening`) — BLOCKED

- [ ] End-to-end create/edit validation for hardened native flow on integrated phase branch.
- [ ] Retry-path and flash/error behavior validated on merged lane 03 output.

**Evidence:** lane 03 branch (`copilot/lane-120-03-editor-flow-hardening`) currently contains only planning commit and is not merged into integration branch.

### Gate 2 – Guardrail checks (`linking-guardrails`) — BLOCKED

- [ ] Deterministic invalid-linkage diagnostics validated from merged lane 02 output.
- [ ] Guardrail outcomes recorded against integrated phase branch.

**Evidence:** lane 02 branch (`copilot/1-2-0-enforce-linking-guardrails`) currently contains only planning commit and is not merged into integration branch.

### Gate 3 – Hosted fallback coexistence (`hosted-fallback`) — PASS

- [x] Hosted fallback route surface remains present in current phase scope.
- [x] No fallback-removal changes introduced by this lane.

**Evidence:** current branch diff remains verification/decision artifacts only; no hosted runtime route removals.

### Gate 4 – Cutover recommendation packet (`cutover-recommendation`) — PASS

- [x] Verification runbook updated (`docs/verification-runbook-1.2.0.md`).
- [x] Decision note with rollback and go/no-go recommendation published (`docs/decision-note-1.2.0.md`).
- [x] Manifest readiness/blockers/PR metadata updated (`.github/fleet/1.2.0/manifest.yaml`).

## Residual risks

| ID | Risk | Severity | Mitigation / Owner |
| --- | --- | --- | --- |
| R-01 | Lane 02 and 03 implementation deltas are not integrated, so acceptance evidence cannot be completed. | High | Merge lanes 02/03 into `phase/1.2.0` and re-run this checklist. Owner: conductor. |
| R-02 | Lane 03 CI run is still in progress; operational hardening stability is unproven. | Medium | Wait for green run, investigate failures if any, then re-verify. Owner: lane 03. |
| R-03 | Branch governance drift (`phase/1.2.0` and `lane/1.2.0/04-cutover-runbook-gate` not present in remote heads) can delay gate enforcement. | Medium | Align branch naming with contract before final cutover gate. Owner: conductor. |

## Verification outcome

- Behavior checks: **BLOCKED**
- Guardrail checks: **BLOCKED**
- Fallback coexistence checks: **PASS**
- Residual risk profile: **NOT READY FOR CUTOVER**

**Decision gate:** `no-go-pending-lane-merge-and-stability`
