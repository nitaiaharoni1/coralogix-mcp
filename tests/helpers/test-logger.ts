/**
 * Professional test logger for clean test output
 */

export class TestLogger {
  private static testCount = 0;
  private static currentSuite = '';

  static setSuite(suiteName: string) {
    this.currentSuite = suiteName;
    this.testCount = 0;
    process.stdout.write(`\n[${suiteName}]\n`);
  }

  static test(testName: string) {
    this.testCount++;
    process.stdout.write(`  ${this.testCount}. ${testName}... `);
  }

  static success(message?: string) {
    if (message) {
      process.stdout.write(`PASS (${message})\n`);
    } else {
      process.stdout.write(`PASS\n`);
    }
  }

  static error(message: string) {
    process.stdout.write(`FAIL: ${message}\n`);
  }

  static info(message: string) {
    process.stdout.write(`    INFO: ${message}\n`);
  }

  static warning(message: string) {
    process.stdout.write(`    WARN: ${message}\n`);
  }

  static progress(message: string) {
    process.stdout.write(`    ${message}... `);
  }

  static complete(message?: string) {
    process.stdout.write(`done${message ? ` (${message})` : ''}\n`);
  }

  static setup(message: string) {
    process.stdout.write(`SETUP: ${message}\n`);
  }

  static teardown(message: string) {
    process.stdout.write(`TEARDOWN: ${message}\n`);
  }

  static summary(passed: number, total: number) {
    const failed = total - passed;
    if (failed === 0) {
      process.stdout.write(`\nRESULT: All ${total} tests passed\n\n`);
    } else {
      process.stdout.write(`\nRESULT: ${passed}/${total} tests passed (${failed} failed)\n\n`);
    }
  }
} 