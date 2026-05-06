# 1.1.0 Decision Note

Phase: Native article plugin hardening + migration foundation
Version: `1.1.0`
Conductor: `[1.1.0][00-conductor]`
Date: 2026-05-06

## Phase summary

Phase `1.1.0` continues the native AtoM plugin path established in `1.0.0`. The goal is to harden the plugin's boot path, wire native PHP templates into the article form flow, add durable persistence with link validation, and publish a cutover recommendation for the client.

## Semver rationale

- Change class: **minor**
- All changes are additive and plugin-scoped.
- No AtoM core template or module patches are allowed in this phase.
- Hosted fallback is preserved throughout.
- Escalation required if any lane requires breaking data model changes or hosted fallback removal.

## Lanes merged

| # | Lane | PR | Status |
|---|------|----|--------|
| 01 | `[1.1.0][01-live-plugin-bootstrap]` | pending | pending |
| 02 | `[1.1.0][02-php-template-bridge]` | pending | pending |
| 03 | `[1.1.0][03-persistence-migration]` | pending | pending |
| 04 | `[1.1.0][04-verification-cutover-plan]` | pending | pending |

## Owned surfaces confirmed

- **00-conductor**: Phase branch governance, manifest lifecycle, merge sequencing, final PR to `origin/main`.
- **01-live-plugin-bootstrap**: Plugin deployment/enable wiring, stack/runtime boot checks, bootstrap hook correctness.
- **02-php-template-bridge**: Plugin module PHP actions/templates/partials and route-to-template rendering behavior.
- **03-persistence-migration**: Plugin persistence schema/migration scripts, repository/service writes, linking enforcement.
- **04-verification-cutover-plan**: Verification scripts/checklists, migration evidence, cutover recommendation packet.

## Verification summary

> To be completed after all lanes are merged and final smoke validation on `phase/1.1.0` passes.

- Gate 1 (plugin-boot): pending
- Gate 2 (native-templates): pending
- Gate 3 (durable-persistence): pending
- Gate 4 (hosted-fallback): pending
- Gate 5 (cutover-recommendation): pending

## Decision gate outcome

> Pending. Final go/no-go decision to be recorded here after all lanes pass verification.

- [ ] All five acceptance gates passed with attached evidence.
- [ ] Semver contract validated (minor, additive only).
- [ ] No stop conditions triggered.
- [ ] Manifest removed before final PR to `origin/main`.
- [ ] Final PR opened from `phase/1.1.0` to `origin/main`.
