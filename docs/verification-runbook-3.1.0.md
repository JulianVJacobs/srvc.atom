# 3.1.0 Integrated Verification Runbook

This runbook is the executable verification protocol for lane `[3.1.0][05-verification-runbook]`.

## Acceptance gates and pass/fail criteria

1. **Stack startup gate**
   - Command: `npm run verify.integrated`
   - Check: `app/api/health` returns HTTP `200` with `status: healthy`.
2. **Bootstrap gate**
   - Command: `npm run verify.integrated`
   - Check: plugin bootstrap route `/` returns `registered: true`.
3. **Plugin route health gate**
   - Command: `npm run verify.integrated`
   - Check: plugin route `/actors` returns HTTP `200` and contract-shaped payload.
4. **Host-shell access gate**
   - Command: `npm run verify.integrated`
   - Check: preload bridge exposes IPC-backed `app` and `database` operations and invokes expected IPC channels.

Any failed assertion or non-zero command exit is a verification failure.

## Local runbook (clean environment)

### Reset

```bash
git clean -fdx
```

### Bring-up

```bash
npm ci
```

### Verification

```bash
npm run lint
npm run test
npm run verify.integrated
```

### Teardown

```bash
rm -rf node_modules .next dist
```

## CI runbook

Workflow: `.github/workflows/integrated-verification.yml`

Execution steps:

1. `actions/checkout@v4`
2. `actions/setup-node@v4` (`node-version: 20`, npm cache enabled)
3. `npm ci`
4. `npm run verify.integrated`

CI must exit `0` for the lane to be marked ready-to-merge.
