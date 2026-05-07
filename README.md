# srvc.atom

AtoM service repository.

Owned surfaces:

- AtoM plugin runtime and routes
- Hosted AtoM stack definition
- Bootstrap, reset, and readiness scripts
- Service-side verification runbooks and migration rehearsal utilities

Typical commands:

- `npm run atom.stack.up`
- `npm run atom.stack.readiness`
- `npm run atom.bootstrap`
- `npm run atom.bootstrap.reseed`

Bootstrap defaults are plugin-only (`sfArticlePlugin` enable/disable). If you need full AtoM installation/search bootstrap from this script, explicitly set `ATOM_BOOTSTRAP_ADMIN_HOOK` and `ATOM_BOOTSTRAP_BASELINE_HOOK`.

Planning:

- `PLAN.md` tracks the AtoM-native plugin roadmap owned by `srvc.atom`, beginning with version `1.0.0` for the first-draft native article plugin.
- `1.0.0` is now launch-ready with an integrated lane plan where plugin scaffolding and persistence/linking contract definition are combined into lane `[1.0.0][01-native-shell-contract]`.
- Status update (2026-05-06): Phase `1.0.0` is complete (worker lanes merged, conductor merged to `main`, issues closed, branches removed). Next work moves to a new semver slice.
- Status update (2026-05-07): Phase `1.1.0` is complete and merged to `main`.
- Status update (2026-05-07): Phase `1.2.0` is complete and merged to `main`.
- Next planning step: define and approve the next semver slice in `PLAN.md` before launching additional lanes.
