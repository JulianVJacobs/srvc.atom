#!/usr/bin/env node

const {
  buildExecutionCommand,
  createDefaultSteps,
  executeBootstrap,
  executeCommand,
  formatCommandFailure,
  resetBootstrapState,
  resolveStateFile,
} = require('./atom-bootstrap-lib.cjs');

const shouldReseed = process.argv.includes('--reseed');
const forceReseed = process.argv.includes('--force');
const stateFile = resolveStateFile(process.env);
const resetHook = (process.env.ATOM_BOOTSTRAP_RESET_HOOK || '').trim();

try {
  if (resetHook) {
    const resetCommand = buildExecutionCommand(resetHook, process.env);
    const output = executeCommand(resetCommand);
    if (output.status !== 0) {
      const failureOutput = formatCommandFailure(output.stdout, output.stderr);
      throw new Error(
        `Reset hook failed with status ${output.status}.\n${failureOutput}`.trim(),
      );
    }
  }

  resetBootstrapState(stateFile);
  console.log(`Cleared bootstrap state at ${stateFile}.`);

  if (shouldReseed) {
    const summary = executeBootstrap({
      steps: createDefaultSteps(process.env),
      stateFile,
      force: forceReseed,
    });
    console.log(
      `AtoM bootstrap reseed complete (executed=${summary.executed}, skipped=${summary.skipped}, toleratedFailures=${summary.toleratedFailures}).`,
    );
  }
} catch (error) {
  console.error(`AtoM bootstrap reset/reseed failed: ${error.message}`);
  process.exit(1);
}
