#!/usr/bin/env node

/**
 * Gameplay Test Runner for PublicBingo
 * 
 * This script runs all gameplay-related tests and provides a comprehensive report
 * of the game's functionality, performance, and reliability.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test categories and their corresponding test files
const TEST_CATEGORIES = {
  'Game Logic': [
    'gameLogic.test.ts',
    'boardGenerator.test.ts'
  ],
  'Component Testing': [
    'BingoBoard.test.tsx',
    'GameRoom.test.tsx',
    'GameChat.test.tsx'
  ],
  'Integration Testing': [
    'gameIntegration.test.tsx'
  ],
  'WebSocket Testing': [
    'websocket.test.ts'
  ]
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${message}`, 'bright');
  log('='.repeat(60), 'cyan');
}

function logSection(message) {
  log('\n' + '-'.repeat(40), 'yellow');
  log(`  ${message}`, 'yellow');
  log('-'.repeat(40), 'yellow');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

// Test runner class
class GameplayTestRunner {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      categories: {}
    };
    this.startTime = Date.now();
  }

  async runTests() {
    logHeader('PUBLICBINGO GAMEPLAY TEST SUITE');
    logInfo('Starting comprehensive gameplay testing...\n');

    // Check if Jest is available
    try {
      execSync('npx jest --version', { stdio: 'pipe' });
    } catch (error) {
      logError('Jest is not available. Please install it first: npm install --save-dev jest');
      process.exit(1);
    }

    // Run tests for each category
    for (const [category, testFiles] of Object.entries(TEST_CATEGORIES)) {
      await this.runCategoryTests(category, testFiles);
    }

    // Generate report
    this.generateReport();
  }

  async runCategoryTests(category, testFiles) {
    logSection(`Running ${category} Tests`);
    
    this.results.categories[category] = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      tests: []
    };

    for (const testFile of testFiles) {
      const testPath = path.join(__dirname, testFile);
      
      // Check if test file exists
      if (!fs.existsSync(testPath)) {
        logWarning(`Test file not found: ${testFile}`);
        continue;
      }

      await this.runSingleTest(category, testFile, testPath);
    }

    // Log category summary
    const catResults = this.results.categories[category];
    logInfo(`${category}: ${catResults.passed}/${catResults.total} tests passed`);
    
    if (catResults.failed > 0) {
      logError(`${catResults.failed} tests failed in ${category}`);
    }
  }

  async runSingleTest(category, testFile, testPath) {
    logInfo(`Running ${testFile}...`);

    try {
      // Run the test with Jest
      const command = `npx jest "${testPath}" --verbose --json --silent`;
      const output = execSync(command, { 
        encoding: 'utf8',
        timeout: 60000 // 60 second timeout
      });

      const testResult = JSON.parse(output);
      
      // Parse test results
      const testInfo = {
        file: testFile,
        name: testFile.replace('.test.ts', '').replace('.test.tsx', ''),
        passed: testResult.numPassedTests,
        failed: testResult.numFailedTests,
        total: testResult.numTotalTests,
        duration: testResult.testResults[0]?.endTime - testResult.testResults[0]?.startTime || 0
      };

      this.results.categories[category].tests.push(testInfo);
      this.results.categories[category].total += testInfo.total;
      this.results.categories[category].passed += testInfo.passed;
      this.results.categories[category].failed += testInfo.failed;

      this.results.total += testInfo.total;
      this.results.passed += testInfo.passed;
      this.results.failed += testInfo.failed;

      if (testInfo.failed === 0) {
        logSuccess(`${testFile} - ${testInfo.passed}/${testInfo.total} tests passed (${testInfo.duration}ms)`);
      } else {
        logError(`${testFile} - ${testInfo.failed}/${testInfo.total} tests failed`);
      }

    } catch (error) {
      logError(`Failed to run ${testFile}: ${error.message}`);
      
      this.results.categories[category].total += 1;
      this.results.categories[category].failed += 1;
      this.results.total += 1;
      this.results.failed += 1;
    }
  }

  generateReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;

    logHeader('GAMEPLAY TEST RESULTS');

    // Overall summary
    logSection('Overall Summary');
    logInfo(`Total Tests: ${this.results.total}`);
    logSuccess(`Passed: ${this.results.passed}`);
    logError(`Failed: ${this.results.failed}`);
    logWarning(`Skipped: ${this.results.skipped}`);
    logInfo(`Duration: ${duration}ms`);
    logInfo(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);

    // Category breakdown
    logSection('Category Breakdown');
    for (const [category, results] of Object.entries(this.results.categories)) {
      const successRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : '0.0';
      const status = results.failed === 0 ? 'green' : 'red';
      
      log(`${category}: ${results.passed}/${results.total} (${successRate}%)`, status);
      
      // Show individual test results
      for (const test of results.tests) {
        const testStatus = test.failed === 0 ? 'green' : 'red';
        log(`  - ${test.name}: ${test.passed}/${test.total}`, testStatus);
      }
    }

    // Performance metrics
    logSection('Performance Metrics');
    this.analyzePerformance();

    // Recommendations
    logSection('Recommendations');
    this.generateRecommendations();

    // Save detailed report
    this.saveDetailedReport(duration);
  }

  analyzePerformance() {
    let totalDuration = 0;
    let testCount = 0;

    for (const category of Object.values(this.results.categories)) {
      for (const test of category.tests) {
        totalDuration += test.duration;
        testCount++;
      }
    }

    const avgDuration = testCount > 0 ? totalDuration / testCount : 0;
    logInfo(`Average test duration: ${avgDuration.toFixed(0)}ms`);

    if (avgDuration > 1000) {
      logWarning('Some tests are running slowly. Consider optimizing test setup.');
    } else {
      logSuccess('Test performance is good.');
    }
  }

  generateRecommendations() {
    if (this.results.failed === 0) {
      logSuccess('All tests passed! The gameplay functionality is working correctly.');
    } else {
      logError('Some tests failed. Please review the failed tests and fix the issues.');
    }

    if (this.results.total < 50) {
      logWarning('Consider adding more tests to improve coverage.');
    }

    logInfo('Recommendations:');
    logInfo('1. Run tests regularly during development');
    logInfo('2. Add tests for new features');
    logInfo('3. Monitor test performance');
    logInfo('4. Review failed tests promptly');
  }

  saveDetailedReport(duration) {
    const report = {
      timestamp: new Date().toISOString(),
      duration,
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        skipped: this.results.skipped,
        successRate: ((this.results.passed / this.results.total) * 100).toFixed(1)
      },
      categories: this.results.categories,
      recommendations: this.getRecommendationsList()
    };

    const reportPath = path.join(__dirname, 'gameplay-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    logInfo(`Detailed report saved to: ${reportPath}`);
  }

  getRecommendationsList() {
    const recommendations = [];
    
    if (this.results.failed > 0) {
      recommendations.push('Fix failed tests before proceeding');
    }
    
    if (this.results.total < 50) {
      recommendations.push('Add more comprehensive test coverage');
    }
    
    if (this.results.passed / this.results.total < 0.9) {
      recommendations.push('Improve test reliability');
    }
    
    return recommendations;
  }
}

// CLI argument parsing
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    category: null,
    verbose: false,
    watch: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--category':
      case '-c':
        options.category = args[++i];
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--watch':
      case '-w':
        options.watch = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
    }
  }

  return options;
}

function showHelp() {
  logHeader('GAMEPLAY TEST RUNNER HELP');
  logInfo('Usage: node runGameplayTests.js [options]');
  logInfo('');
  logInfo('Options:');
  logInfo('  -c, --category <category>  Run tests for specific category');
  logInfo('  -v, --verbose              Enable verbose output');
  logInfo('  -w, --watch                Watch mode for development');
  logInfo('  -h, --help                 Show this help message');
  logInfo('');
  logInfo('Categories:');
  for (const category of Object.keys(TEST_CATEGORIES)) {
    logInfo(`  - ${category}`);
  }
}

// Main execution
async function main() {
  const options = parseArguments();
  
  if (options.watch) {
    logInfo('Starting test runner in watch mode...');
    execSync('npx jest --watch src/tests/', { stdio: 'inherit' });
    return;
  }

  const runner = new GameplayTestRunner();
  
  if (options.category && TEST_CATEGORIES[options.category]) {
    logInfo(`Running tests for category: ${options.category}`);
    await runner.runCategoryTests(options.category, TEST_CATEGORIES[options.category]);
  } else {
    await runner.runTests();
  }
}

// Run the test runner
if (require.main === module) {
  main().catch(error => {
    logError(`Test runner failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { GameplayTestRunner, TEST_CATEGORIES };
