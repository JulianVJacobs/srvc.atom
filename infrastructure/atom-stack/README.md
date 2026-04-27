# AtoM host stack

This directory provides the containerized host runtime baseline for Phase `3.1.0` lanes.

## Shared environment contract

1. Copy `infrastructure/atom-stack/.env.example` to a local env file (for example `infrastructure/atom-stack/.env.local`).
2. Export `ATOM_STACK_ENV_FILE` to point at that file when you need overrides.
3. Replace the example database passwords before sharing or persisting the stack beyond local development.

Defaults include:

- deterministic service names (`atom-host`, `atom-db`, `atom-cache`)
- host health endpoint (`/healthz`)
- stack startup wait timeout (`ATOM_STACK_WAIT_TIMEOUT`, default `240` seconds)
- shared plugin bridge URL (`WORKBENCH_PLUGIN_API_BASE_URL`)

## Startup and readiness targets

From repository root:

- `npm run atom.stack.up` — boot stack and wait for container health checks
- `npm run atom.stack.readiness` — verify running services and host readiness endpoint
- `npm run atom.stack.ps` — show service state
- `npm run atom.stack.down` — stop stack and remove volumes/orphans
