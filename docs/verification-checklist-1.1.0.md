# 1.1.0 Verification Checklist

Phase: Native article plugin hardening + migration foundation
Version: `1.1.0`
Conductor: `[1.1.0][00-conductor]`

## Lane verification status

| Lane | Title | Verification | Gate |
|------|-------|--------------|------|
| 01 | Live plugin bootstrap | pass | plugin-boot |
| 02 | Add Article menu entry and route binding | pass | native-templates |
| 03 | Native form surface | pending | durable-persistence |
| 04 | Verification + cutover plan | pending | cutover-recommendation |

## Acceptance gates

### Gate 1 – Plugin boot (`plugin-boot`) — PASS (lane 01)

- [x] Plugin mounts into AtoM `/atom/src/plugins` deterministically.
- [x] `sfArticlePluginConfiguration.class.php` is present and registers `sfArticle` module at AtoM boot.
- [x] Bind-mounts added in `docker-compose.yml` for `atom` and `atom_worker` services (`:ro`).
- [x] Bootstrap hook (`scripts/atom-bootstrap-lib.cjs`) runs `php symfony plugins:enable sfArticlePlugin`; overridable via `ATOM_BOOTSTRAP_PLUGIN_HOOK`.
- [x] Variable documented in `.env.example`.

**Evidence:** lane 01 PR #7 diff — `atom/plugins/sfArticlePlugin/`, `docker-compose.yml`, `scripts/atom-bootstrap-lib.cjs`, `.env.example`.

### Gate 2 – Menu entry and route registration (`native-templates`) — PASS (lane 02)

- [x] `ARTICLE_ADD_MENU_ENTRY` is defined with `group: 'add'`, `label: 'Article'`, `routePath: '/articles'`, `permission: 'articles:read'`.
- [x] `registerMenuExtensions` registers the entry via `PluginScaffold.registerMenuExtension`.
- [x] `bootstrapPlugin` calls `registerMenuExtensions(plugin)` so every bootstrapped instance exposes the Article Add-menu entry via `getMenuExtensions()`.
- [x] `GET /articles` is registered and returns HTTP 200 for authorized requests, 403 otherwise.
- [x] No AtoM core templates, modules, or non-plugin files were modified.

**Evidence:** lane 02 PR #8 diff — `plugin/contracts/menu.ts`, `plugin/menu/register-menu-extensions.ts`, `plugin/scaffold/plugin-scaffold.ts`, `plugin/bootstrap.ts`, `plugin/auth/checkPermission.ts`, `plugin/index.ts`.

### Gate 3 – Durable persistence and link validation (`durable-persistence`)

- [ ] Article create/update writes reach a plugin-owned persistence layer (not in-memory).
- [ ] Article records survive container restart.
- [ ] Link validation logic enforces identifier/linking rules per the contract.
- [ ] Migration scripts apply cleanly to a fresh database with no errors.
- [ ] Rollback path for migration is documented.

**Evidence required:** lane 03 PR diff, migration apply log, record persistence test result.

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
- [ ] Phase branch builds cleanly with all lanes merged.
- [ ] Semver contract validated: all changes are additive minor (no AtoM core patches, no breaking schema changes, no hosted fallback removal).
- [ ] Final PR body contains structured verification summary with evidence for all five gates.
- [ ] Manifest removed from `.github/fleet/1.1.0/manifest.yaml` before final PR merge.

## Stop conditions

- Any lane requires AtoM core template/module patching not allowed by the minor contract.
- Any lane changes files outside its owned surface without explicit re-contract.
- Missing verification summary or failing checks for any merge candidate.
- Contract drift between plan, lane scope, manifest, and implemented diff.

---

## Per-lane verification records

### Lane 02 — `[1.1.0][02-add-menu-route]`

**Owned surface:** menu extension wiring, plugin route registration for Article entry point, navigation binding and access path checks.

**Verification summary:**

- Add menu shows Article: `ARTICLE_ADD_MENU_ENTRY` constant present with correct shape; `registerMenuExtensions` wires it at bootstrap.
- Navigation opens plugin route: `GET /articles` responds HTTP 200 (authorized) / 403 (unauthorized); route present in `getRoutes()`.
- No core patch: all changes confined to `plugin/` directory; no AtoM core files modified.

**Blockers:** none. All stop conditions pass.
