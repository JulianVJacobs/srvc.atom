# 1.1.0 Verification Checklist

Phase: Native article plugin hardening + migration foundation
Version: `1.1.0`
Conductor: `[1.1.0][00-conductor]`

## Lane verification status

| Lane | Title | Verification | Gate |
|------|-------|--------------|------|
| 01 | Live plugin bootstrap | pending | plugin-boot |
| 02 | PHP template bridge | pending | native-templates |
| 03 | Persistence migration | pending | durable-persistence |
| 04 | Verification + cutover plan | pending | cutover-recommendation |

## Acceptance gates

### Gate 1 – Plugin boot (`plugin-boot`)

- [ ] Plugin mounts into AtoM `/atom/src/plugins` deterministically.
- [ ] `plugin.yml` is present and valid (`enabled: true`, correct `pluginId` and `routes.prefix`).
- [ ] AtoM container starts with the plugin loaded (no boot errors in container logs).
- [ ] Plugin health route responds HTTP `200`.
- [ ] Bootstrap hook fires once and is idempotent on restart.

**Evidence required:** container boot log excerpt, health endpoint response.

### Gate 2 – Native PHP template rendering (`native-templates`)

- [ ] Plugin module action is registered and reachable at the plugin route.
- [ ] Article create template renders via plugin-owned PHP partial (not AtoM core template).
- [ ] Article edit template renders via plugin-owned PHP partial.
- [ ] AtoM-style layout (header, accordion/section structure, help text, flash messages) is present.
- [ ] No direct patch of AtoM core templates or modules in the diff.

**Evidence required:** screenshot or HTML snapshot of rendered create/edit form.

### Gate 3 – Durable persistence and link validation (`durable-persistence`)

- [ ] Article create/update writes reach a plugin-owned persistence layer (not in-memory).
- [ ] Article records survive container restart.
- [ ] Link validation logic enforces identifier/linking rules per the contract.
- [ ] Migration scripts apply cleanly to a fresh database with no errors.
- [ ] Rollback path for migration is documented.

**Evidence required:** migration apply log, record persistence test result.

### Gate 4 – Hosted fallback still available (`hosted-fallback`)

- [ ] Hosted fallback route is still accessible and returns expected response.
- [ ] No removal of hosted fallback routes in the diff across all lanes.

**Evidence required:** curl or integration test response for fallback route.

### Gate 5 – Cutover recommendation (`cutover-recommendation`)

- [ ] Cutover recommendation document is published in `docs/`.
- [ ] Recommendation includes: risks, rollback path, and explicit go/no-go decision.
- [ ] Migration evidence is attached (before/after data snapshots or migration rehearsal log).
- [ ] Decision gate passed by lane 04 conductor.

**Evidence required:** link to cutover recommendation doc, decision summary.

## Final smoke validation (phase/1.1.0 integrated)

- [ ] All four lane acceptance gates individually passed (evidence attached in PR bodies).
- [ ] Phase branch `phase/1.1.0` builds cleanly with all lanes merged.
- [ ] Semver contract validated: all changes are additive minor (no AtoM core patches, no breaking schema changes, no hosted fallback removal).
- [ ] Final PR body contains structured verification summary with evidence for all five gates.
- [ ] Manifest removed from `.github/fleet/1.1.0/manifest.yaml` before final PR merge.

## Stop conditions

- Any lane requires AtoM core template/module patching not allowed by the minor contract.
- Any lane changes files outside its owned surface without explicit re-contract.
- Missing verification summary or failing checks for any merge candidate.
- Contract drift between plan, lane scope, manifest, and implemented diff.
