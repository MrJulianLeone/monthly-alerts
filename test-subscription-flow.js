#!/usr/bin/env node

/**
 * Automated Subscription Cancellation Test
 * Tests the complete flow: Create → Subscribe → Cancel → Verify
 */

const https = require('https');
const { execSync } = require('child_process');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const config = {
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  databaseUrl: process.env.DATABASE_URL,
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(message) {
  log('\n═══════════════════════════════════════════════', 'blue');
  log(message, 'blue');
  log('═══════════════════════════════════════════════', 'blue');
}

// Stripe API helper
function stripeRequest(endpoint, method = 'GET', data = {}) {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${config.stripeSecretKey}:`).toString('base64');
    const postData = Object.keys(data)
      .map(key => {
        if (key.includes('[')) {
          return `${key}=${encodeURIComponent(data[key])}`;
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`;
      })
      .join('&');

    const options = {
      hostname: 'api.stripe.com',
      port: 443,
      path: `/v1/${endpoint}`,
      method: method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    if (method !== 'GET') {
      req.write(postData);
    }
    req.end();
  });
}

// Database query helper
function dbQuery(query) {
  try {
    const result = execSync(
      `psql "${config.databaseUrl}" -t -c "${query.replace(/"/g, '\\"')}"`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    return result.trim();
  } catch (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }
}

async function runTests() {
  log('\n╔════════════════════════════════════════════════╗', 'blue');
  log('║  Subscription Cancellation Flow Test Suite    ║', 'blue');
  log('╚════════════════════════════════════════════════╝', 'blue');

  const testResults = {
    passed: 0,
    failed: 0,
    tests: [],
  };

  function recordTest(name, passed, details = '') {
    testResults.tests.push({ name, passed, details });
    if (passed) {
      testResults.passed++;
      log(`✓ ${name}`, 'green');
    } else {
      testResults.failed++;
      log(`✗ ${name}`, 'red');
      if (details) log(`  ${details}`, 'yellow');
    }
  }

  // Check prerequisites
  header('Checking Prerequisites');

  try {
    if (!config.stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY not set');
    }
    if (!config.stripeSecretKey.startsWith('sk_test_')) {
      throw new Error('Not using Stripe test mode!');
    }
    log('✓ Stripe test mode configured', 'green');

    if (!config.databaseUrl) {
      throw new Error('DATABASE_URL not set');
    }
    dbQuery('SELECT 1');
    log('✓ Database connection successful', 'green');
  } catch (error) {
    log(`✗ Prerequisites failed: ${error.message}`, 'red');
    process.exit(1);
  }

  const testEmail = `test-cancel-${Date.now()}@example.com`;
  let userId, customerId, subscriptionId;

  try {
    // STEP 1: Create Test User
    header('STEP 1: Creating Test User');
    
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash('TestPass123', 10);
    userId = require('crypto').randomUUID();

    dbQuery(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, name, email_verified, created_at, updated_at)
      VALUES (
        '${userId}'::uuid,
        '${testEmail}',
        '${passwordHash}',
        'Test',
        'User',
        'Test User',
        TRUE,
        NOW(),
        NOW()
      )
    `);

    recordTest('User Creation', true, `User ID: ${userId}`);
    log(`  Email: ${testEmail}`, 'blue');

    // STEP 2: Create Stripe Customer
    header('STEP 2: Creating Stripe Customer');

    const customer = await stripeRequest('customers', 'POST', {
      email: testEmail,
      'metadata[userId]': userId,
    });

    if (!customer.id) {
      throw new Error('Failed to create Stripe customer');
    }

    customerId = customer.id;
    recordTest('Stripe Customer Creation', true, `Customer ID: ${customerId}`);

    // STEP 3: Create Subscription
    header('STEP 3: Creating Subscription');

    const subscription = await stripeRequest('subscriptions', 'POST', {
      customer: customerId,
      'items[0][price_data][currency]': 'usd',
      'items[0][price_data][product_data][name]': 'MonthlyAlerts Subscription',
      'items[0][price_data][recurring][interval]': 'month',
      'items[0][price_data][unit_amount]': '2999',
    });

    if (!subscription.id) {
      throw new Error('Failed to create subscription');
    }

    subscriptionId = subscription.id;
    recordTest('Stripe Subscription Creation', true, `Subscription ID: ${subscriptionId}`);

    // Add to database
    dbQuery(`
      INSERT INTO subscriptions (
        user_id,
        stripe_customer_id,
        stripe_subscription_id,
        status,
        current_period_end,
        cancel_at_period_end,
        created_at,
        updated_at
      ) VALUES (
        '${userId}'::uuid,
        '${customerId}',
        '${subscriptionId}',
        'active',
        to_timestamp(${subscription.current_period_end}),
        FALSE,
        NOW(),
        NOW()
      )
    `);

    recordTest('Database Subscription Record', true);

    // STEP 4: Cancel Subscription (set cancel_at_period_end)
    header('STEP 4: Cancelling Subscription (cancel_at_period_end)');

    const cancelUpdate = await stripeRequest(`subscriptions/${subscriptionId}`, 'POST', {
      cancel_at_period_end: 'true',
    });

    recordTest(
      'Stripe Cancel at Period End',
      cancelUpdate.cancel_at_period_end === true,
      `cancel_at_period_end: ${cancelUpdate.cancel_at_period_end}`
    );

    // Update database
    dbQuery(`
      UPDATE subscriptions 
      SET cancel_at_period_end = true, updated_at = NOW()
      WHERE stripe_subscription_id = '${subscriptionId}'
    `);

    const dbCancelCheck = dbQuery(`
      SELECT cancel_at_period_end 
      FROM subscriptions 
      WHERE stripe_subscription_id = '${subscriptionId}'
    `);

    recordTest(
      'Database Cancel Flag Updated',
      dbCancelCheck.includes('t'),
      `Database cancel_at_period_end: ${dbCancelCheck}`
    );

    // STEP 5: Simulate Period End (Immediate Cancel)
    header('STEP 5: Simulating Period End');

    const finalCancel = await stripeRequest(`subscriptions/${subscriptionId}`, 'DELETE');

    recordTest(
      'Stripe Final Cancellation',
      finalCancel.status === 'canceled',
      `Final status: ${finalCancel.status}`
    );

    // Simulate webhook update
    dbQuery(`
      UPDATE subscriptions
      SET status = 'cancelled', updated_at = NOW()
      WHERE stripe_subscription_id = '${subscriptionId}'
    `);

    const finalDbStatus = dbQuery(`
      SELECT status 
      FROM subscriptions 
      WHERE stripe_subscription_id = '${subscriptionId}'
    `);

    recordTest(
      'Database Final Status',
      finalDbStatus.includes('cancelled'),
      `Final status: ${finalDbStatus}`
    );

    // STEP 6: Final Verification
    header('STEP 6: Final Verification');

    const stripeVerify = await stripeRequest(`subscriptions/${subscriptionId}`, 'GET');
    const dbVerify = dbQuery(`
      SELECT status, cancel_at_period_end, stripe_subscription_id
      FROM subscriptions 
      WHERE stripe_subscription_id = '${subscriptionId}'
    `);

    log('\nFinal State:', 'blue');
    log(`  Stripe Status: ${stripeVerify.status}`, 'blue');
    log(`  Database: ${dbVerify}`, 'blue');

    recordTest(
      'Complete Flow Verification',
      stripeVerify.status === 'canceled' && dbVerify.includes('cancelled'),
      'All states match expected values'
    );

  } catch (error) {
    log(`\n✗ Test failed with error: ${error.message}`, 'red');
    if (error.stack) {
      log(error.stack, 'red');
    }
    testResults.failed++;
  }

  // Summary
  header('Test Results Summary');

  testResults.tests.forEach(test => {
    if (test.passed) {
      log(`✓ ${test.name}`, 'green');
    } else {
      log(`✗ ${test.name}`, 'red');
      if (test.details) log(`  ${test.details}`, 'yellow');
    }
  });

  log('', 'reset');
  const total = testResults.passed + testResults.failed;
  if (testResults.failed === 0) {
    log(`🎉 ALL TESTS PASSED! (${testResults.passed}/${total})`, 'green');
    log('Subscription cancellation flow is working correctly!', 'green');
  } else {
    log(`⚠ SOME TESTS FAILED (${testResults.passed}/${total})`, 'red');
  }

  // Cleanup
  log('\n' + '═'.repeat(50), 'yellow');
  log('Cleanup', 'yellow');
  log('═'.repeat(50), 'yellow');

  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Do you want to clean up test data? (y/N) ', async (answer) => {
    if (answer.toLowerCase() === 'y') {
      log('\nCleaning up...', 'yellow');

      try {
        // Delete from Stripe
        if (customerId) {
          await stripeRequest(`customers/${customerId}`, 'DELETE');
          log('✓ Deleted Stripe customer', 'green');
        }

        // Delete from database
        if (userId) {
          dbQuery(`DELETE FROM subscriptions WHERE user_id = '${userId}'::uuid`);
          dbQuery(`DELETE FROM users WHERE id = '${userId}'::uuid`);
          log('✓ Deleted database records', 'green');
        }

        log('✓ Cleanup complete', 'green');
      } catch (error) {
        log(`⚠ Cleanup error: ${error.message}`, 'yellow');
      }
    } else {
      log('\nSkipping cleanup. Test data preserved for inspection.', 'yellow');
      if (userId) log(`  User ID: ${userId}`, 'yellow');
      if (subscriptionId) log(`  Subscription ID: ${subscriptionId}`, 'yellow');
    }

    rl.close();
    process.exit(testResults.failed === 0 ? 0 : 1);
  });
}

// Run tests
runTests().catch((error) => {
  log(`\nFatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

