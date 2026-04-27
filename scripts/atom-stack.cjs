#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const stackDir = path.join(repoRoot, 'infrastructure', 'atom-stack');
const composeFile = path.join(stackDir, 'docker-compose.yml');
const defaultEnvFile = path.join(stackDir, '.env.example');
const defaultHostPort = '62080';
const defaultHealthPath = '/healthz';

function getEnvFilePath() {
  const configured = process.env.ATOM_STACK_ENV_FILE;
  if (!configured) return defaultEnvFile;
  return path.isAbsolute(configured)
    ? configured
    : path.resolve(repoRoot, configured);
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const entries = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separator = trimmed.indexOf('=');
    if (separator < 0) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    entries[key] = value;
  }

  return entries;
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: process.env,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function runCapture(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: process.env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    if (result.stderr) {
      process.stderr.write(result.stderr);
    }
    process.exit(result.status ?? 1);
  }

  return result.stdout.trim();
}

async function checkHttpReadiness(url, attempts = 30, delayMs = 2000) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json, text/plain' },
      });

      if (response.ok) {
        return;
      }

      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error(`Host readiness check failed for ${url}: ${lastError?.message}`);
}

async function verifyReadiness(composeArgs, envEntries) {
  const output = runCapture('docker', [
    'compose',
    ...composeArgs,
    'ps',
    '--format',
    'json',
  ]);

  const services = output
    ? output
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => JSON.parse(line))
    : [];
  const expectedServices = ['atom-db', 'atom-cache', 'atom-host'];

  for (const serviceName of expectedServices) {
    const service = services.find((candidate) => candidate.Service === serviceName);

    if (!service) {
      throw new Error(`Service ${serviceName} is missing from compose status output`);
    }

    const state = String(service.State || '').toLowerCase();
    const health = String(service.Health || '').toLowerCase();

    if (state !== 'running') {
      throw new Error(`Service ${serviceName} is not running (state: ${service.State})`);
    }

    if (health && health !== 'healthy') {
      throw new Error(
        `Service ${serviceName} is not healthy (health: ${service.Health})`,
      );
    }
  }

  const hostPort = envEntries.ATOM_HOST_PORT || defaultHostPort;
  const healthPath = envEntries.ATOM_HOST_HEALTH_PATH || defaultHealthPath;
  const readinessUrl = `http://127.0.0.1:${hostPort}${healthPath}`;

  await checkHttpReadiness(readinessUrl);
  process.stdout.write(`Readiness checks passed for ${readinessUrl}\n`);
}

async function main() {
  const command = process.argv[2] || 'up';
  const envFile = getEnvFilePath();
  const envEntries = parseEnvFile(envFile);
  const composeArgs = ['-f', composeFile, '--env-file', envFile];

  if (!fs.existsSync(composeFile)) {
    throw new Error(`Compose file not found: ${composeFile}`);
  }

  if (command === 'up') {
    const waitTimeout =
      process.env.ATOM_STACK_WAIT_TIMEOUT || envEntries.ATOM_STACK_WAIT_TIMEOUT || '240';
    run('docker', [
      'compose',
      ...composeArgs,
      'up',
      '-d',
      '--wait',
      '--wait-timeout',
      waitTimeout,
    ]);
    await verifyReadiness(composeArgs, envEntries);
    return;
  }

  if (command === 'down') {
    run('docker', ['compose', ...composeArgs, 'down', '--volumes', '--remove-orphans']);
    return;
  }

  if (command === 'ps') {
    run('docker', ['compose', ...composeArgs, 'ps']);
    return;
  }

  if (command === 'readiness') {
    await verifyReadiness(composeArgs, envEntries);
    return;
  }

  throw new Error(`Unsupported atom stack command: ${command}`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});

module.exports = {
  parseEnvFile,
};
