# Verification Checklist — 1.1.0 [02-add-menu-route]

## Lane identity

- Lane: `[1.1.0][02-add-menu-route]`
- Target branch: `phase/1.1.0`
- Allowed change class: minor (additive, reversible)

## Owned surface

- Menu extension wiring
- Plugin route registration for Article entry point
- Navigation binding and access path checks for Add → Article

## Verification summary

### Add menu shows Article

- `ARTICLE_ADD_MENU_ENTRY` is defined with `group: 'add'`, `label: 'Article'`, `routePath: '/articles'`, `permission: 'articles:read'`.
- `registerMenuExtensions` registers this entry on the `PluginScaffold` via `registerMenuExtension`.
- `bootstrapPlugin` calls `registerMenuExtensions(plugin)` after route registration, so every bootstrapped plugin instance exposes the Article Add-menu entry via `getMenuExtensions()`.
- The host runtime (AtoM PHP side) reads `getMenuExtensions()` to inject the entry into the native Add menu without patching AtoM core templates.

### Navigation opens plugin route

- `GET /articles` is registered on the scaffold in `bootstrapPlugin`.
- Authorized requests (`articles:read` permission) receive HTTP 200 with `{ module: 'article', routePath: '/articles', status: 'route-registered' }`.
- Unauthorized or unauthenticated requests receive HTTP 403.
- Route presence is verified by `getRoutes()` returning the `/articles` route.

### No core patch introduced

- All changes are additive and confined to plugin-owned files:
  - `plugin/contracts/menu.ts` (new)
  - `plugin/menu/register-menu-extensions.ts` (new)
  - `plugin/scaffold/plugin-scaffold.ts` (additive: `registerMenuExtension` / `getMenuExtensions`)
  - `plugin/bootstrap.ts` (additive: `/articles` route and `registerMenuExtensions` call)
  - `plugin/auth/checkPermission.ts` (additive: `articles:read` permission mapping)
  - `plugin/index.ts` (additive: new exports)
- No AtoM core templates, modules, or non-plugin files were modified.
- Form behavior and persistence are not implemented here (owned by lane 03).

## Blockers

None. All stop conditions pass:
- No core AtoM menu template edits outside plugin-owned extension path.
- Route binding does not require persistence or form behavior.
- No scope drift beyond menu/route integration.

## PR metadata

- PR title prefix: `[1.1.0][02-add-menu-route]`
- PR base: `phase/1.1.0`
- Repository: `JulianVJacobs/srvc.atom`
