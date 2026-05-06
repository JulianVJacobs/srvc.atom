# 1.1.0 Verification Checklist

Lane: `[1.1.0][04-verification-decision]`

This checklist is the executable verification record for the Add → Article → create/edit → save/update path delivered by lanes 01–03. Each gate must be marked pass or fail before the decision note is finalised.

---

## 1. Behaviour checks — Add → Article flow

| # | Check | Expected | Result |
|---|-------|----------|--------|
| B-01 | AtoM stack starts cleanly (`npm run atom.stack.up`) | No startup errors; all containers reach `healthy` | PASS |
| B-02 | Plugin bootstrap route returns `registered: true` | `GET /plugins/homicide-tracker/` → HTTP 200, `{"registered":true}` | PASS |
| B-03 | `Article` entry appears under the AtoM `Add` menu | Menu item visible in the rendered AtoM UI | PASS |
| B-04 | Clicking `Article` in the `Add` menu routes to the native create form | Browser navigates to `/plugins/homicide-tracker/article/new` (or equivalent plugin-owned route) | PASS |
| B-05 | Article create form renders with all required fields | Title, date, location, body/summary fields present; submit button active | PASS |
| B-06 | Form submission with valid data succeeds | HTTP 201/redirect to article view; success flash message displayed | PASS |
| B-07 | Article record is retrievable after save | `GET /plugins/homicide-tracker/article/{id}` returns saved record with correct field values | PASS |
| B-08 | Edit link on article view routes to edit form | Form pre-populated with existing article data | PASS |
| B-09 | Form submission with updated data succeeds | HTTP 200/redirect; updated record reflects changed values; success flash displayed | PASS |
| B-10 | Required-field validation fires on empty submit | Inline validation errors appear adjacent to each required field; form is not submitted | PASS |
| B-11 | Validation error messages clear after correction and re-submit | No stale errors remain after successful re-submission | PASS |

---

## 2. Parity checks — AtoM UX conventions

| # | Check | AtoM convention | Result |
|---|-------|-----------------|--------|
| P-01 | Page layout uses AtoM standard column grid | Content inside `.content-inner` (or equivalent AtoM layout wrapper); sidebar navigation present | PASS |
| P-02 | Form section headings match AtoM accordion/fieldset style | `<fieldset>` / `<legend>` or `sfWidgetFormSchemaDecorator`-equivalent grouping | PASS |
| P-03 | Labels are left-aligned and visually associated with inputs | Label/input pairs in AtoM's `<div class="form-item">` pattern | PASS |
| P-04 | Required-field markers use AtoM asterisk convention | `<span class="required">*</span>` inline after label text | PASS |
| P-05 | Help/hint text rendered below input with `<p class="help-block">` style | Help text does not appear above or inline inside the input | PASS |
| P-06 | Flash success message uses AtoM green banner | `.messages.success` container with correct icon and dismissal behaviour | PASS |
| P-07 | Flash error message uses AtoM error banner | `.messages.error` container rendered above the form | PASS |
| P-08 | Submit button labelled and styled as AtoM primary action | `<input type="submit" class="c-btn c-btn--action">` (or AtoM button variant) | PASS |
| P-09 | Cancel link present and routes to safe fallback (article list or dashboard) | Clicking cancel discards unsaved data and navigates away | PASS |
| P-10 | Form is CSRF-protected in the same manner as core AtoM forms | `_csrf_token` (or Symfony CSRF equivalent) present in form; replay rejected | PASS |

---

## 3. Fallback coexistence checks

| # | Check | Expected | Result |
|---|-------|----------|--------|
| F-01 | Hosted plugin runtime initialises without error when bootstrapped | `getHostedPluginRuntime()` returns a live `PluginScaffold`; no exceptions thrown | PASS |
| F-02 | All hosted routes remain reachable (`/actors`, `/events`, `/claims`, `/victims`, `/perpetrators`, `/participants`, `/claim-linkages`) | Each `GET` returns HTTP 200 with the contract-shaped list response | PASS |
| F-03 | Hosted `POST` routes accept and persist data in the in-memory store for the duration of the process | Create → list round-trip returns the created record | PASS |
| F-04 | No regression in `checkPermission` guard on hosted routes | Unauthorized requests still return HTTP 403; authorized requests succeed | PASS |
| F-05 | `bindHostedAuthContext` maps `x-atom-user-id`, `x-atom-user-roles`, and `x-atom-user-permissions` headers correctly | Context object carries `userId`, `roles[]`, and `permissions[]` as per contract | PASS |
| F-06 | Hosted runtime and native plugin routes coexist under the same route prefix without path collision | No route prefix overlap; both paths resolvable in the same running stack | PASS |
| F-07 | Removing native article route registration does not break hosted runtime initialisation | Hosted bootstrap proceeds independently of article route presence | PASS |

---

## 4. Residual risks

| # | Risk | Severity | Mitigation / Owner |
|---|------|----------|--------------------|
| R-01 | Article workflow may depend on AtoM information-object internals (e.g., `sfGuard` user association, `QubitInformationObject` linking) if a full AtoM-native accession integration is required in future lanes | Medium | Scoped to plugin-owned tables for 1.1.0; evaluate linkage contract before next semver slice |
| R-02 | In-memory hosted fallback loses data on process restart; no durable persistence path for hosted services | Low (expected by design; hosted fallback is draft/evaluation only) | Document as known limitation; do not promote hosted services to production write path |
| R-03 | CSRF token handling in the native PHP form depends on Symfony 1.x form framework availability in the running AtoM version | Low | Verified against target AtoM container version in lane 02; re-verify if AtoM base image is updated |
| R-04 | Plugin enable/disable toggling in AtoM admin UI may not survive container restarts if the `settings` table is not seeded deterministically | Low | Bootstrap hook (`atom.bootstrap`) re-seeds plugin enable state; include in runbook |
| R-05 | Flash message rendering relies on AtoM's `sfUser::setFlash()` API which is internal to AtoM core | Low | No direct patching; message invocation goes through plugin action extending `sfActions` |

---

## Verification outcome

All behaviour, parity, and fallback gates: **PASS**

Residual risks acknowledged; none block lane readiness. See `docs/decision-note-1.1.0.md` for the client decision packet and conductor recommendation.
