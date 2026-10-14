/**
 * Lightweight, high-precision test harness with quantitative assertion tracking.
 */

class TestHarness {
  constructor(options = {}) {
    this.options = options;
    this.currentSuite = 'Default Suite';
    this.currentTest = 'Default Test';
    this.stats = {
      totalSuites: 0,
      totalTests: 0,
      totalAssertions: 0,
      passedAssertions: 0,
      failedAssertions: 0,
      passedTests: 0,
      failedTests: 0,
      failures: [],
      startTime: Date.now(),
      endTime: null,
      durationMs: 0
    };
    this.currentTestPassed = true;
  }

  describe(suiteName, fn) {
    this.currentSuite = suiteName;
    this.stats.totalSuites++;
    console.log(`\n\x1b[1m\x1b[36m▶ Suite: ${suiteName}\x1b[0m`);
    fn();
  }

  test(testName, fn) {
    this.currentTest = testName;
    this.stats.totalTests++;
    this.currentTestPassed = true;
    const testStartTime = Date.now();

    try {
      fn();
      if (this.currentTestPassed) {
        this.stats.passedTests++;
        const duration = Date.now() - testStartTime;
        console.log(`  \x1b[32m✔\x1b[0m ${testName} \x1b[90m(${duration}ms)\x1b[0m`);
      } else {
        this.stats.failedTests++;
        console.log(`  \x1b[31m✖\x1b[0m ${testName}`);
      }
    } catch (err) {
      this.recordFailure(`Unexpected runtime error in "${testName}": ${err.message}`, 'none', 'error', err.stack);
      this.stats.failedTests++;
      console.log(`  \x1b[31m✖\x1b[0m ${testName} \x1b[31m[CRASH]\x1b[0m: ${err.message}`);
    }
  }

  recordPass(message) {
    this.stats.totalAssertions++;
    this.stats.passedAssertions++;
  }

  recordFailure(message, expected, actual, stack) {
    this.stats.totalAssertions++;
    this.stats.failedAssertions++;
    this.currentTestPassed = false;
    const failureInfo = {
      suite: this.currentSuite,
      test: this.currentTest,
      message,
      expected,
      actual,
      stack: stack || new Error().stack
    };
    this.stats.failures.push(failureInfo);
  }

  assert(condition, message = 'Condition must be truthy') {
    if (Boolean(condition)) {
      this.recordPass(message);
    } else {
      this.recordFailure(message, true, condition);
    }
  }

  assertEqual(actual, expected, message) {
    const desc = message || `Expected ${JSON.stringify(actual)} to strictly equal ${JSON.stringify(expected)}`;
    if (actual === expected) {
      this.recordPass(desc);
    } else {
      this.recordFailure(desc, expected, actual);
    }
  }

  assertNotEqual(actual, expected, message) {
    const desc = message || `Expected ${JSON.stringify(actual)} NOT to equal ${JSON.stringify(expected)}`;
    if (actual !== expected) {
      this.recordPass(desc);
    } else {
      this.recordFailure(desc, `Not ${expected}`, actual);
    }
  }

  assertDeepEqual(actual, expected, message) {
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    const desc = message || `Expected deep equality`;
    if (actualStr === expectedStr) {
      this.recordPass(desc);
    } else {
      this.recordFailure(desc, expectedStr, actualStr);
    }
  }

  assertIncludes(actual, substring, message) {
    const desc = message || `Expected content to include "${substring}"`;
    if (typeof actual === 'string' && actual.includes(substring)) {
      this.recordPass(desc);
    } else if (Array.isArray(actual) && actual.includes(substring)) {
      this.recordPass(desc);
    } else {
      this.recordFailure(desc, `Contains "${substring}"`, actual);
    }
  }

  assertMatch(actual, regex, message) {
    const desc = message || `Expected "${actual}" to match regex ${regex}`;
    if (typeof actual === 'string' && regex.test(actual)) {
      this.recordPass(desc);
    } else {
      this.recordFailure(desc, regex.toString(), actual);
    }
  }

  assertGreaterThanOrEqual(actual, expected, message) {
    const desc = message || `Expected ${actual} >= ${expected}`;
    if (typeof actual === 'number' && actual >= expected) {
      this.recordPass(desc);
    } else {
      this.recordFailure(desc, `>= ${expected}`, actual);
    }
  }

  assertLessThanOrEqual(actual, expected, message) {
    const desc = message || `Expected ${actual} <= ${expected}`;
    if (typeof actual === 'number' && actual <= expected) {
      this.recordPass(desc);
    } else {
      this.recordFailure(desc, `<= ${expected}`, actual);
    }
  }

  assertThrows(fn, message = 'Expected function to throw an error') {
    let threw = false;
    let thrownError = null;
    try {
      fn();
    } catch (err) {
      threw = true;
      thrownError = err;
    }
    if (threw) {
      this.recordPass(message);
    } else {
      this.recordFailure(message, 'To throw an error', 'Did not throw');
    }
  }

  finish() {
    this.stats.endTime = Date.now();
    this.stats.durationMs = this.stats.endTime - this.stats.startTime;
    return this.stats;
  }

  printSummary() {
    const stats = this.stats;
    const passRate = stats.totalAssertions > 0
      ? ((stats.passedAssertions / stats.totalAssertions) * 100).toFixed(1)
      : '0.0';

    console.log('\n=============================================================');
    console.log('                 E2E TEST EXECUTION SUMMARY                  ');
    console.log('=============================================================');
    console.log(`  Suites Executed     : ${stats.totalSuites}`);
    console.log(`  Test Cases Total    : ${stats.totalTests} (Passed: ${stats.passedTests}, Failed: ${stats.failedTests})`);
    console.log(`  Total Assertions    : ${stats.totalAssertions}`);
    console.log(`  Assertions Passed   : \x1b[32m${stats.passedAssertions}\x1b[0m`);
    console.log(`  Assertions Failed   : ${stats.failedAssertions > 0 ? `\x1b[31m${stats.failedAssertions}\x1b[0m` : '0'}`);
    console.log(`  Assertion Pass Rate : ${passRate}%`);
    console.log(`  Execution Time      : ${stats.durationMs}ms`);
    console.log('=============================================================');

    if (stats.failures.length > 0) {
      console.log('\n\x1b[1m\x1b[31mDETAILED FAILURE BREAKDOWN:\x1b[0m');
      stats.failures.forEach((f, idx) => {
        console.log(`\n\x1b[31m[${idx + 1}] ${f.suite} ➔ ${f.test}\x1b[0m`);
        console.log(`    Message  : ${f.message}`);
        console.log(`    Expected : ${f.expected}`);
        console.log(`    Actual   : ${f.actual}`);
      });
      console.log('\n');
    }
  }
}

module.exports = { TestHarness };
