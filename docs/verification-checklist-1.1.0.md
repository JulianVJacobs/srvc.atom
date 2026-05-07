# 1.1.0 Verification Checklist

Phase: Native article plugin hardening + migration foundation
Version: `1.1.0`
Conductor: `[1.1.0][00-conductor]`

## Lane verification status

| Lane | Title | Verification | Gate |
|------|-------|--------------|------|
| 01 | Live plugin bootstrap | **PASS** | plugin-boot |
| 02 | Add Article menu entry and route binding | **PASS** | native-templates |
| 03 | Native form surface (sfHomicideMediaTrackerPlugin) | **PASS** | durable-persistence |
| 04 | Verification + cutover plan | **PASS** | cutover-recommendation |

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

### Gate 3 – Durable persistence and form surface (`durable-persistence`) — PASS (lane 03)

- [x] `atom/plugins/sfHomicideMediaTrackerPlugin/` contains PHP AtoM plugin: routing, model, form class, actions, and templates.
- [x] `QubitHmtArticle` model uses deterministic UUID v4 IDs with explicit `insert()`/`update()`/`deleteById()` paths.
- [x] `ArticleEditForm` validates all six fields with AtoM-standard `sfWidget`/`sfValidator` pairs.
- [x] `executeCreate`, `executeEdit`, `executeDelete` actions handle GET (render) and POST (validate + persist); use AtoM `notice`/`error` flash conventions.
- [x] Shared `_form.php` partial uses four collapsible AtoM sections (Identification, Access points, Description, Administration).
- [x] `sfHomicideMediaTrackerPlugin` bind-mount added to both `atom` and `atom_worker` in `docker-compose.yml` (`:ro`).
- [x] No AtoM core templates or modules were modified.

**Evidence:** lane 03 PR #9 diff — `atom/plugins/sfHomicideMediaTrackerPlugin/`, `docker-compose.yml`, `.env.example`.

### Gate 4 – Hosted fallback still available (`hosted-fallback`) — PASS (lane 04)

- [x] Hosted fallback route is still accessible and returns expected response.
- [x] No removal of hosted fallback routes in the diff across all lanes.

**Evidence:** lane 04 PR #10, fallback coexistence checks F-01–F-07 below.

### Gate 5 – Cutover recommendation (`cutover-recommendation`) — PASS (lane 04)

- [x] Cutover recommendation document is published (`docs/decision-note-1.1.0.md`).
- [x] Recommendation includes: risks, rollback path, and explicit go/no-go decision.
- [x] Residual risks table published (R-01–R-05, none block merge).
- [x] Decision gate passed: **approve-native-continuation**.

**Evidence:** `docs/decision-note-1.1.0.md`, residual risks table R-01–R-05 below.

## Final smoke validation (phase/1.1.0 integrated)

- [x] All four lane acceptance gates individually passed (evidence attached in PR bodies).
- [x] Semver contract validated: all changes are additive minor (no AtoM core patches, no breaking schema changes, no hosted fallback removal).
- [x] Final PR body contains structured verification summary with evidence for all five gates.
- [x] Manifest removed from `.github/fleet/1.1.0/manifest.yaml` before final PR merge.

## Stop conditions

- Any lane requires AtoM core template/module patching not allowed by the minor contract. ✓ None triggered.
- Any lane changes files outside its owned surface without explicit re-contract. ✓ None triggered.
- Missing verification summary or failing checks for any merge candidate. ✓ All lanes pass.
- Contract drift between plan, lane scope, manifest, and implemented diff. ✓ No drift detected.

---

## Detailed evidence — lane 04 tabular checks

### 1. Behaviour checks — Add → Article flow

| # | Check | Expected | Result |
|---|-------|----------|--------|
| B-01 | AtoM stack starts cleanly (`npm run atom.stack.up`) | No startup errors; all containers reach `healthy` | PASS |
| B-02 | Plugin bootstrap route returns `registered: true` | `GET /plugins/homicide-tracker/` → HTTP 200, `{"registered":true}` | PASS |
| B-03 | `Article` entry appears under the AtoM `Add` menu | Menu item visible in the rendered AtoM UI | PASS |
| B-04 | Clicking `Article` in the `Add` menu routes to the native create form | Browser navigates to plugin-owned route | PASS |
| B-05 | Article create form renders with all required fields | Title, date, location, body/summary fields present; submit button active | PASS |
| B-06 | Form submission with valid data succeeds | HTTP 201/redirect to article view; success flash message displayed | PASS |
| B-07 | Article record is retrievable after save | `GET /plugins/homicide-tracker/article/{id}` returns saved record | PASS |
| B-08 | Edit link on article view routes to edit form | Form pre-populated with existing article data | PASS |
| B-09 | Form submission with updated data succeeds | HTTP 200/redirect; updated record reflects changed values | PASS |
| B-10 | Required-field validation fires on empty submit | Inline validation errors appear adjacent to each required field | PASS |
| B-11 | Validation error messages clear after correction and re-submit | No stale errors remain after successful re-submission | PASS |

### 2. Parity checks — AtoM UX conventions

| # | Check | AtoM convention | Result |
|---|-------|-----------------|--------|
| P-01 | Page layout uses AtoM standard column grid | Content inside `.content-inner` layout wrapper | PASS |
| P-02 | Form section headings match AtoM accordion/fieldset style | `sfWidgetFormSchemaDecorator`-equivalent grouping | PASS |
| P-03 | Labels are left-aligned and visually associated with inputs | Label/input pairs in AtoM's `<div class="form-item">` pattern | PASS |
| P-04 | Required-field markers use AtoM asterisk convention | `<span class="required">*</span>` inline after label text | PASS |
| P-05 | Help/hint text rendered below input | Help text does not appear above or inline inside the input | PASS |
| P-06 | Flash success message uses AtoM green banner | `.messages.success` container with correct icon and dismissal | PASS |
| P-07 | Flash error message uses AtoM error banner | `.messages.error` container rendered above the form | PASS |
| P-08 | Submit button labelled and styled as AtoM primary action | AtoM button variant present | PASS |
| P-09 | Cancel link present and routes to safe fallback | Clicking cancel discards unsaved data and navigates away | PASS |
| P-10 | Form is CSRF-protected in the same manner as core AtoM forms | Symfony CSRF equivalent present in form | PASS |

### 3. Fallback coexistence checks

| # | Check | Expected | Result |
|---|-------|----------|--------|
| F-01 | Hosted plugin runtime initialises without error | `getHostedPluginRuntime()` returns a live `PluginScaffold` | PASS |
| F-02 | All hosted routes remain reachable (`/actors`, `/events`, `/claims`, `/victims`, `/perpetrators`, `/participants`, `/claim-linkages`) | Each `GET` returns HTTP 200 with contract-shaped list response | PASS |
| F-03 | Hosted `POST` routes accept and persist data | Create → list round-trip returns the created record | PASS |
| F-04 | No regression in `checkPermission` guard on hosted routes | Unauthorized requests still return HTTP 403 | PASS |
| F-05 | `bindHostedAuthContext` maps auth headers correctly | Context object carries `userId`, `roles[]`, `permissions[]` | PASS |
| F-06 | Hosted runtime and native plugin routes coexist | No route prefix overlap; both paths resolvable in the same stack | PASS |
| F-07 | Removing native article route registration does not break hosted runtime | Hosted bootstrap proceeds independently | PASS |

### 4. Residual risks

| # | Risk | Severity | Mitigation / Owner |
|---|------|----------|--------------------|
| R-01 | Article workflow may depend on AtoM information-object internals if full AtoM-native accession integration is required | Medium | Scoped to plugin-owned tables for 1.1.0; evaluate linkage contract before next semver slice |
| R-02 | In-memory hosted fallback loses data on process restart | Low (expected by design; hosted fallback is draft/evaluation only) | Document as known limitation; do not promote to production write path |
| R-03 | CSRF token handling depends on Symfony 1.x form framework availability in the running AtoM version | Low | Verified against target AtoM container version; re-verify if AtoM base image is updated |
| R-04 | Plugin enable/disable toggling may not survive container restarts if `settings` table is not seeded deterministically | Low | Bootstrap hook re-seeds plugin enable state; include in runbook |
| R-05 | Flash message rendering relies on AtoM's `sfUser::setFlash()` API | Low | No direct patching; invocation through plugin action extending `sfActions` |

---

**Verification outcome: ALL BEHAVIOUR, PARITY, AND FALLBACK GATES — PASS**

Decision note: `docs/decision-note-1.1.0.md` — recommendation: **approve-native-continuation**.
