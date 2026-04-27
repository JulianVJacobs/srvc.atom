#!/usr/bin/env node

const {
  createDefaultSteps,
  executeBootstrap,
  resolveStateFile,
} = require('./atom-bootstrap-lib.cjs');

const force = process.argv.includes('--force');
const steps = createDefaultSteps(process.env);
const stateFile = resolveStateFile(process.env);

try {
  const summary = executeBootstrap({
    steps,
    force,
    stateFile,
  });

  console.log(
    `AtoM bootstrap complete (executed=${summary.executed}, skipped=${summary.skipped}, toleratedFailures=${summary.toleratedFailures}).`,
  );
} catch (error) {
  console.error(`AtoM bootstrap failed: ${error.message}`);
  process.exit(1);
}
