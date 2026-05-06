const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const STATE_KEY_HASH_LENGTH = 16;
const DEFAULT_MAX_FAILURE_LINES = 40;
const repoRoot = path.resolve(__dirname, '..');
const defaultComposeFile = path.join(
  repoRoot,
  'infrastructure',
  'atom-stack',
  'docker-compose.yml',
);
const defaultComposeEnvFile = path.join(
  repoRoot,
  'infrastructure',
  'atom-stack',
  '.env.example',
);

const IDEMPOTENT_ERROR_PATTERN =
  /already exists|already enabled|duplicate|has already been taken|not changed/i;

const DEFAULT_STEPS = [
  {
    id: 'admin-setup',
    description: 'Provision initial AtoM administrator account',
    envKey: 'ATOM_BOOTSTRAP_ADMIN_HOOK',
    defaultHook:
      'php -d memory_limit=${ATOM_INSTALL_MEMORY_LIMIT:-2G} symfony tools:install --database-host="${ATOM_DB_HOST:-atom-db}" --database-port="${ATOM_DB_PORT:-3306}" --database-name="${ATOM_DB_NAME:-atom}" --database-user="${ATOM_DB_USER:-atom}" --database-password="${ATOM_DB_PASSWORD:-REPLACE_WITH_SECURE_DB_PASSWORD}" --search-host="${ATOM_SEARCH_HOST:-elasticsearch}" --search-port="${ATOM_SEARCH_PORT:-9200}" --search-index="${ATOM_SEARCH_INDEX:-atom}" --site-title="${ATOM_SITE_NAME:-AtoM}" --site-description="${ATOM_SITE_DESCRIPTION:-Local AtoM dev stack}" --site-base-url="${ATOM_SITE_BASE_URL:-http://127.0.0.1:62080}" --admin-email="${ATOM_ADMIN_EMAIL:-admin@example.invalid}" --admin-username="${ATOM_ADMIN_USERNAME:-admin}" --admin-password="${ATOM_ADMIN_PASSWORD:-Admin123!}" --no-confirmation',
  },
  {
    id: 'bootstrap-user-state',
    description: 'Apply required bootstrap user/state initialization',
    envKey: 'ATOM_BOOTSTRAP_STATE_HOOK',
    defaultHook: '',
  },
  {
    id: 'plugin-enablement',
    description: 'Enable AtoM plugin required for hosted integration',
    envKey: 'ATOM_BOOTSTRAP_PLUGIN_HOOK',
    defaultHook: '',
  },
  {
    id: 'baseline-initialization',
    description: 'Run baseline first-run initialization',
    envKey: 'ATOM_BOOTSTRAP_BASELINE_HOOK',
    defaultHook: 'php symfony search:populate',
  },
];

function parseBooleanFlag(value, fallback) {
  if (value === undefined) return fallback;
  return !['0', 'false', 'no', 'off'].includes(String(value).toLowerCase());
}

function resolveStateFile(env = process.env) {
  return path.resolve(
    env.ATOM_BOOTSTRAP_STATE_FILE || '.atom-host/bootstrap-state.json',
  );
}

function buildExecutionCommand(hook, env = process.env) {
  const trimmedHook = String(hook || '').trim();
  if (!trimmedHook) return '';

  const useCompose = parseBooleanFlag(env.ATOM_BOOTSTRAP_USE_COMPOSE, true);
  if (!useCompose) {
    return {
      command: 'sh',
      args: ['-lc', trimmedHook],
    };
  }

  const args = ['compose'];
  if (env.ATOM_STACK_COMPOSE_FILE) {
    args.push('-f', env.ATOM_STACK_COMPOSE_FILE);
  } else if (fs.existsSync(defaultComposeFile)) {
    args.push('-f', defaultComposeFile);
  }

  if (env.ATOM_STACK_ENV_FILE) {
    args.push('--env-file', env.ATOM_STACK_ENV_FILE);
  } else if (fs.existsSync(defaultComposeEnvFile)) {
    args.push('--env-file', defaultComposeEnvFile);
  }

  if (env.ATOM_STACK_PROJECT_NAME) {
    args.push('-p', env.ATOM_STACK_PROJECT_NAME);
  }

  args.push('exec', '-T', env.ATOM_STACK_SERVICE || 'atom');
  args.push('sh', '-lc', trimmedHook);

  return {
    command: 'docker',
    args,
  };
}

function createDefaultSteps(env = process.env) {
  return DEFAULT_STEPS.map((step) => {
    const hook = (env[step.envKey] || step.defaultHook || '').trim();
    return {
      id: step.id,
      description: step.description,
      command: buildExecutionCommand(hook, env),
    };
  });
}

function createStateKey(step) {
  const commandPayload =
    typeof step.command === 'string'
      ? step.command
      : JSON.stringify(step.command);
  const digest = crypto
    .createHash('sha256')
    .update(commandPayload || '')
    .digest('hex')
    .slice(0, STATE_KEY_HASH_LENGTH);
  return `${step.id}:${digest}`;
}

function readState(stateFile) {
  if (!fs.existsSync(stateFile)) {
    return { completed: {} };
  }

  try {
    const raw = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    return raw && typeof raw === 'object' && raw.completed
      ? raw
      : { completed: {} };
  } catch (error) {
    return { completed: {} };
  }
}

function writeState(stateFile, state) {
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });
  fs.writeFileSync(
    stateFile,
    JSON.stringify(
      {
        completed: state.completed,
        updatedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
}

function executeCommand(command) {
  const execution =
    typeof command === 'string'
      ? { command: 'sh', args: ['-lc', command] }
      : command;

  const result = spawnSync(execution.command, execution.args || [], {
    encoding: 'utf8',
  });

  if (result.error) {
    throw result.error;
  }

  return {
    status: result.status ?? 1,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

function formatCommandFailure(
  stdout,
  stderr,
  tailLines = DEFAULT_MAX_FAILURE_LINES,
) {
  const output = `${stdout || ''}\n${stderr || ''}`
    .split('\n')
    .filter(Boolean);
  const tail = output.slice(-tailLines).join('\n');
  return tail || 'No command output captured.';
}

function executeBootstrap({
  steps,
  stateFile = resolveStateFile(),
  force = false,
  runner = executeCommand,
  logger = console,
} = {}) {
  const resolvedSteps = (steps || []).filter((step) => step.command);
  const state = readState(stateFile);
  const summary = {
    executed: 0,
    skipped: 0,
    toleratedFailures: 0,
    stateFile,
  };

  for (const step of resolvedSteps) {
    const stateKey = createStateKey(step);
    if (!force && state.completed[stateKey]) {
      summary.skipped += 1;
      logger.log(`Skipping ${step.id}; already completed.`);
      continue;
    }

    logger.log(`Running ${step.id}: ${step.description}`);
    const output = runner(step.command);

    if (output.status !== 0) {
      const combinedOutput = `${output.stdout}\n${output.stderr}`;
      if (!IDEMPOTENT_ERROR_PATTERN.test(combinedOutput)) {
        const failureOutput = formatCommandFailure(output.stdout, output.stderr);
        throw new Error(
          `Bootstrap step "${step.id}" failed with status ${output.status}.\n${failureOutput}`.trim(),
        );
      }

      summary.toleratedFailures += 1;
      logger.log(`Treating ${step.id} as successful (idempotent outcome).`);
    }

    state.completed[stateKey] = new Date().toISOString();
    writeState(stateFile, state);
    summary.executed += 1;
  }

  return summary;
}

function resetBootstrapState(stateFile = resolveStateFile()) {
  try {
    fs.rmSync(stateFile, { force: true });
  } catch (error) {
    throw new Error(
      `Unable to remove bootstrap state at ${stateFile}: ${error.message}`,
    );
  }
}

module.exports = {
  IDEMPOTENT_ERROR_PATTERN,
  buildExecutionCommand,
  createDefaultSteps,
  executeBootstrap,
  executeCommand,
  formatCommandFailure,
  resetBootstrapState,
  resolveStateFile,
};
