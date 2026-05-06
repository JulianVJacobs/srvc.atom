# sfHmtArticlePlugin

AtoM-native article workflow plugin for the Homicide Media Tracker.

## Purpose

Adds a native `Article` data-entry surface to the AtoM `Add` menu so that
article records can be created and edited inside AtoM without leaving the
application.

## Lane ownership

| Lane | Scope |
|------|-------|
| `[1.0.0][01-native-shell-contract]` | Plugin scaffold, config/routing baseline, persistence/linking contract |
| `[1.0.0][02-add-menu-route]` | Add-menu wiring and plugin route registration for the Article entry |
| `[1.0.0][03-native-form-surface]` | Module actions, form class, templates, validation, and submit behaviour |
| `[1.0.0][04-verification-decision]` | Parity verification and client decision gate |

## Plugin structure

```
sfHmtArticlePlugin/
├── config/
│   ├── plugin.yml      — plugin enabled flag
│   └── routing.yml     — route baseline (index, create, edit)
├── lib/
│   └── sfHmtArticlePlugin.class.php  — plugin bootstrap / listener hooks
└── modules/
    └── hmtArticle/
        ├── actions/
        │   └── actions.class.php     — action stubs (index, create, edit)
        └── templates/
            └── indexSuccess.php      — index template stub
```

## Deployment

The plugin is mounted into the AtoM container at
`/atom/src/plugins/sfHmtArticlePlugin` via a bind-mount defined in
`infrastructure/atom-stack/docker-compose.yml`.

To enable the plugin after initial stack bootstrapping:

```bash
php symfony plugin:enable sfHmtArticlePlugin
php symfony cc
```

Set `ATOM_BOOTSTRAP_PLUGIN_HOOK` in your local env file to run this
automatically during `npm run atom.bootstrap`:

```
ATOM_BOOTSTRAP_PLUGIN_HOOK=php symfony plugin:enable sfHmtArticlePlugin && php symfony cc
```

## Contract reference

See `docs/persistence-linking-contract.md` for the full persistence and
linking contract governing plugin-owned vs AtoM-linked field boundaries.
