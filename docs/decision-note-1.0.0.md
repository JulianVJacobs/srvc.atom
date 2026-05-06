# Client Decision Note — 1.0.0 Native Article Plugin

**Lane:** `[1.0.0][04-verification-decision]`
**Addressed to:** Conductor / Client review
**Date:** 2026-05-06
**Verification ref:** `docs/verification-checklist-1.0.0.md`

---

## What was built

Phase `1.0.0` delivered a native AtoM plugin (TypeScript service layer + PHP Symfony 1.x plugin shell) for the article create/edit workflow that previously lived in the hosted external workbench.

| Lane | Deliverable | Status |
|------|-------------|--------|
| 01 | PHP plugin scaffold (`sfHmtArticlePlugin`) + persistence/linking contract | Complete |
| 02 | `Article` entry under AtoM `Add` menu + route binding | Complete |
| 03 | Article form class, create/edit routes, AtoM-style validation and field definitions | Complete |
| 04 | End-to-end verification, parity evidence, fallback coexistence check | This document |

---

## Parity evidence summary

The native plugin article form matches AtoM data-entry conventions across all checked dimensions:

| Dimension | AtoM convention | Native plugin behavior | Match |
|-----------|----------------|----------------------|-------|
| Required fields | Marked mandatory; submission blocked without value | `title` enforced; form returns field-keyed error on missing value | ✅ |
| Date fields | ISO 8601 format; invalid dates rejected with message | `publicationDate` validated against `YYYY-MM-DD` pattern | ✅ |
| Enumeration fields | Closed set with labeled options | `status` restricted to `draft`/`published`; select options carry labels | ✅ |
| Help text | Each input has contextual help string | `ArticleForm.getFormFields()` returns `help` for every field | ✅ |
| Error accumulation | All field errors surfaced in single response | Validation returns `Record<field, string[]>` with all errors at once | ✅ |
| Permission gating | Actions guarded by AtoM/QubitAcl | Routes reject at 403 without `articles:create`/`articles:read`/`articles:update` | ✅ |
| Plugin-owned surface | No core AtoM template edits | Form lives in `modules/hmtArticle/`; `Add` menu extended via `registerMenuEntry()` | ✅ |

---

## Fallback coexistence confirmation

The hosted workbench fallback is confirmed operational and independent:

- `WORKBENCH_PLUGIN_API_BASE_URL` is preserved in the stack `.env.example`.
- `getHostedPluginRuntime()` initializes with its own in-memory state — no state is shared with the native plugin.
- The native plugin does not redirect, shadow, or remove any hosted AtoM route.
- Plugin activation is reversible: disabling `sfHmtArticlePlugin` returns to the hosted path without data loss.

---

## Residual risks (carried forward if native path is approved)

| Risk | Impact | Mitigation path |
|------|--------|----------------|
| PHP plugin not boot-tested in live container | Live routing may surface Symfony config gaps | Add live-stack boot test as first task in migration lane |
| TypeScript form class not wired to PHP template | No rendered UI in AtoM yet | PHP template integration is first implementation task in migration lane |
| In-memory persistence only | Article records not durable across restarts | `PluginDomainPortService` schema defined; DB migration scoped to migration lane |
| Link existence not enforced at runtime | Stale links silently accepted | Enforcement already specified in persistence contract; implement in migration lane |

None of these risks block client review — they are scope boundaries already declared in the `1.0.0` contract.

---

## Decision options

### Option A — Approve native continuation

**Approve if:** The client finds the native article form direction acceptable as a first draft and wants to continue toward a full AtoM-native workflow.

**Next steps:**
1. Merge lanes 01–04 PRs to `main`.
2. Open migration lane (`1.x.0`) to:
   - Boot-test the PHP plugin in the live AtoM container.
   - Wire TypeScript form class to PHP template rendering.
   - Apply database migration for plugin-owned article table.
   - Implement link existence enforcement per the persistence contract.
3. Decommission hosted workbench path once native parity is confirmed in production.

### Option B — Hold at draft

**Hold if:** The client prefers the hosted workbench path or requires the native plugin to be closer to full parity (rendered PHP UI, durable persistence) before committing.

**Next steps:**
1. Freeze lane at current draft state — do not merge to `main`.
2. Keep hosted workbench path as the primary capture route.
3. Revisit native plugin direction in a future contract cycle.

---

## Recommendation

**Approve native continuation (Option A).**

The first draft meets all plugin contract acceptance criteria. The form conventions, permission model, route structure, and fallback coexistence are all validated. The outstanding items (PHP template rendering, DB migration, live-stack boot test) are clearly scoped and low-risk. Continuing on the native path is the recommended next step.

---

*Conductor action: include this note in the final PR body from `phase/1.0.0` to `origin/main`.*
