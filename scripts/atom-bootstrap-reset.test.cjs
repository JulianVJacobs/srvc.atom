const test = require('node:test');
const assert = require('node:assert/strict');
const os = require('os');
const path = require('path');
const { spawnSync } = require('node:child_process');

test('atom-bootstrap-reset treats idempotent reset hook failure as success', () => {
  const stateFile = path.join(
    os.tmpdir(),
    `atom-bootstrap-reset-${Date.now()}-${Math.random()}.json`,
  );
  const repoRoot = path.resolve(__dirname, '..');
  const result = spawnSync('node', ['scripts/atom-bootstrap-reset.cjs'], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      ATOM_BOOTSTRAP_USE_COMPOSE: '0',
      ATOM_BOOTSTRAP_STATE_FILE: stateFile,
      ATOM_BOOTSTRAP_RESET_HOOK: "echo 'sfArticlePlugin already disabled' >&2; exit 1",
    },
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(
    `${result.stdout}\n${result.stderr}`,
    /Treating reset hook as successful \(idempotent outcome\)\./,
  );
});
