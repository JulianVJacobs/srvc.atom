const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { createDefaultSteps, executeBootstrap } = require('./atom-bootstrap-lib.cjs');

test('default bootstrap steps are plugin-scoped and deterministic', () => {
  const steps = createDefaultSteps({ ATOM_BOOTSTRAP_USE_COMPOSE: '0' });
  const activeSteps = steps.filter((step) => step.command);
  assert.deepEqual(
    activeSteps.map((step) => step.id),
    ['plugin-enablement'],
  );

  assert.equal(activeSteps[0].command.command, 'sh');
  assert.match(activeSteps[0].command.args[1], /sfArticlePlugin already enabled/);
  assert.match(activeSteps[0].command.args[1], /plugins:enable sfArticlePlugin/);
});

test('createDefaultSteps supports explicit hook overrides', () => {
  const steps = createDefaultSteps({
    ATOM_BOOTSTRAP_USE_COMPOSE: '0',
    ATOM_BOOTSTRAP_ADMIN_HOOK: 'echo admin',
    ATOM_BOOTSTRAP_PLUGIN_HOOK: 'echo plugin',
    ATOM_BOOTSTRAP_BASELINE_HOOK: 'echo baseline',
  });
  const activeStepIds = steps.filter((step) => step.command).map((step) => step.id);
  assert.deepEqual(activeStepIds, [
    'admin-setup',
    'plugin-enablement',
    'baseline-initialization',
  ]);
});

test('executeBootstrap tolerates idempotent plugin-enablement errors', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'atom-bootstrap-lib-'));
  const stateFile = path.join(tempDir, 'state.json');
  const logs = [];

  const summary = executeBootstrap({
    stateFile,
    steps: [
      {
        id: 'plugin-enablement',
        description: 'Enable plugin',
        command: 'fake command',
      },
    ],
    runner: () => ({
      status: 1,
      stdout: '',
      stderr: 'sfArticlePlugin already enabled',
    }),
    logger: {
      log: (line) => logs.push(line),
    },
  });

  assert.equal(summary.executed, 1);
  assert.equal(summary.skipped, 0);
  assert.equal(summary.toleratedFailures, 1);
  assert.ok(logs.some((line) => /Treating plugin-enablement as successful/.test(line)));

  const second = executeBootstrap({
    stateFile,
    steps: [
      {
        id: 'plugin-enablement',
        description: 'Enable plugin',
        command: 'fake command',
      },
    ],
    runner: () => {
      throw new Error('runner should not be called for completed step');
    },
    logger: {
      log: (line) => logs.push(line),
    },
  });

  assert.equal(second.executed, 0);
  assert.equal(second.skipped, 1);

  fs.rmSync(tempDir, { recursive: true, force: true });
});
