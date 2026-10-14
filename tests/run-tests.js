#!/usr/bin/env node

/**
 * Automated Opaque-Box E2E Test Suite Runner for Sinar Minimalis
 * Runs tests across Tier 1, Tier 2, Tier 3, and Tier 4.
 */

const { TestHarness } = require('./harness/test-harness');
const { runTier1Tests } = require('./tier1-smoke-integrity');
const { runTier2Tests } = require('./tier2-boundaries-corners');
const { runTier3Tests } = require('./tier3-cross-feature');
const { runTier4Tests } = require('./tier4-real-world');

// Parse CLI flags
const args = process.argv.slice(2);
let targetTier = null;
let reportOnly = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--tier' && args[i + 1]) {
    targetTier = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i].startsWith('--tier=')) {
    targetTier = parseInt(args[i].split('=')[1], 10);
  } else if (args[i] === '--report-only') {
    reportOnly = true;
  }
}

console.log('=============================================================');
console.log('      SCARLET ROSTER AUTOMATED E2E TEST SUITE RUNNER         ');
console.log('=============================================================');
if (targetTier) {
  console.log(`Execution Filter: Tier ${targetTier} only`);
} else {
  console.log('Execution Filter: All 4 Tiers (Full Test Suite)');
}

const harness = new TestHarness();

try {
  if (!targetTier || targetTier === 1) {
    runTier1Tests(harness);
  }
  if (!targetTier || targetTier === 2) {
    runTier2Tests(harness);
  }
  if (!targetTier || targetTier === 3) {
    runTier3Tests(harness);
  }
  if (!targetTier || targetTier === 4) {
    runTier4Tests(harness);
  }
} catch (suiteError) {
  console.error('\n\x1b[31mFATAL SUITE EXECUTION ERROR:\x1b[0m', suiteError);
  process.exit(1);
}

const stats = harness.finish();
harness.printSummary();

// Return appropriate exit code
if (stats.failedAssertions > 0 && !reportOnly) {
  process.exit(1);
} else {
  process.exit(0);
}
