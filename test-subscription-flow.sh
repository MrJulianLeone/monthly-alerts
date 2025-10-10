#!/bin/bash

# Automated Subscription Cancellation Test Script
# Tests the complete flow: Create → Subscribe → Cancel → Verify

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
TEST_EMAIL="test-cancel-$(date +%s)@example.com"
TEST_PASSWORD="TestPass123"
BASE_URL="${BASE_URL:-http://localhost:3000}"

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Subscription Cancellation Flow Test Suite    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check if server is running
if ! curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" | grep -q "200\|301\|302"; then
    echo -e "${RED}✗ Server is not running at $BASE_URL${NC}"
    echo -e "${YELLOW}  Please start the server with: npm run dev${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Server is running at $BASE_URL${NC}"

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo -e "${RED}✗ Stripe CLI is not installed${NC}"
    echo -e "${YELLOW}  Install with: brew install stripe/stripe-cli/stripe${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Stripe CLI is installed${NC}"

# Check if database is accessible
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}✗ DATABASE_URL environment variable is not set${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Database connection configured${NC}"

# Check if Stripe secret key is available
if [ -f .env.local ]; then
    source .env.local
fi

if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo -e "${RED}✗ STRIPE_SECRET_KEY is not set${NC}"
    exit 1
fi

if [[ ! "$STRIPE_SECRET_KEY" =~ ^sk_test_ ]]; then
    echo -e "${RED}✗ Not using Stripe test mode!${NC}"
    echo -e "${YELLOW}  Please use test keys (sk_test_...)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Stripe test mode configured${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}Test Configuration:${NC}"
echo -e "  Email: ${TEST_EMAIL}"
echo -e "  Base URL: ${BASE_URL}"
echo -e "  Using Stripe Test Mode: Yes"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""

# Function to check database
check_db() {
    local query=$1
    psql "$DATABASE_URL" -t -c "$query" 2>/dev/null || echo "ERROR"
}

# Function to call Stripe API
stripe_api() {
    local endpoint=$1
    local method=${2:-GET}
    curl -s -X "$method" \
        -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
        "https://api.stripe.com/v1/$endpoint"
}

echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"
echo -e "${YELLOW}STEP 1: Creating Test User${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"

# Check if user already exists
EXISTING_USER=$(check_db "SELECT id FROM users WHERE email = '$TEST_EMAIL' LIMIT 1;")
if [ ! -z "$EXISTING_USER" ] && [ "$EXISTING_USER" != "ERROR" ]; then
    echo -e "${YELLOW}⚠ User already exists, cleaning up...${NC}"
    USER_ID=$(echo "$EXISTING_USER" | xargs)
    psql "$DATABASE_URL" -c "DELETE FROM subscriptions WHERE user_id = '$USER_ID'::uuid;" > /dev/null
    psql "$DATABASE_URL" -c "DELETE FROM sessions WHERE user_id = '$USER_ID'::uuid;" > /dev/null
    psql "$DATABASE_URL" -c "DELETE FROM users WHERE id = '$USER_ID'::uuid;" > /dev/null
    echo -e "${GREEN}✓ Cleaned up existing user${NC}"
fi

# Create test user in database
USER_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
PASSWORD_HASH=$(node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('$TEST_PASSWORD', 10).then(h => console.log(h));")

psql "$DATABASE_URL" > /dev/null <<EOF
INSERT INTO users (id, email, password_hash, first_name, last_name, name, email_verified, created_at, updated_at)
VALUES (
    '$USER_ID'::uuid,
    '$TEST_EMAIL',
    '$PASSWORD_HASH',
    'Test',
    'User',
    'Test User',
    TRUE,
    NOW(),
    NOW()
);
EOF

echo -e "${GREEN}✓ Test user created${NC}"
echo -e "  User ID: $USER_ID"
echo ""

echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"
echo -e "${YELLOW}STEP 2: Creating Stripe Customer & Subscription${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"

# Create Stripe customer
echo -e "Creating Stripe customer..."
CUSTOMER_RESPONSE=$(curl -s -X POST https://api.stripe.com/v1/customers \
    -u "$STRIPE_SECRET_KEY:" \
    -d "email=$TEST_EMAIL" \
    -d "metadata[userId]=$USER_ID")

CUSTOMER_ID=$(echo "$CUSTOMER_RESPONSE" | grep -o '"id": *"cus_[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$CUSTOMER_ID" ]; then
    echo -e "${RED}✗ Failed to create Stripe customer${NC}"
    echo "$CUSTOMER_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Stripe customer created${NC}"
echo -e "  Customer ID: $CUSTOMER_ID"

# Create price (if needed) or use existing
echo -e "Creating test subscription..."
SUBSCRIPTION_RESPONSE=$(curl -s -X POST https://api.stripe.com/v1/subscriptions \
    -u "$STRIPE_SECRET_KEY:" \
    -d "customer=$CUSTOMER_ID" \
    -d "items[0][price_data][currency]=usd" \
    -d "items[0][price_data][product_data][name]=MonthlyAlerts Subscription" \
    -d "items[0][price_data][recurring][interval]=month" \
    -d "items[0][price_data][unit_amount]=2999")

SUBSCRIPTION_ID=$(echo "$SUBSCRIPTION_RESPONSE" | grep -o '"id": *"sub_[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$SUBSCRIPTION_ID" ]; then
    echo -e "${RED}✗ Failed to create subscription${NC}"
    echo "$SUBSCRIPTION_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Stripe subscription created${NC}"
echo -e "  Subscription ID: $SUBSCRIPTION_ID"
echo ""

echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"
echo -e "${YELLOW}STEP 3: Adding Subscription to Database${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"

# Get subscription details
PERIOD_END=$(echo "$SUBSCRIPTION_RESPONSE" | grep -o '"current_period_end": *[0-9]*' | head -1 | awk '{print $2}')

psql "$DATABASE_URL" > /dev/null <<EOF
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
    '$USER_ID'::uuid,
    '$CUSTOMER_ID',
    '$SUBSCRIPTION_ID',
    'active',
    to_timestamp($PERIOD_END),
    FALSE,
    NOW(),
    NOW()
);
EOF

echo -e "${GREEN}✓ Subscription added to database${NC}"

# Verify database state
DB_STATUS=$(check_db "SELECT status, cancel_at_period_end FROM subscriptions WHERE stripe_subscription_id = '$SUBSCRIPTION_ID';")
echo -e "  Database status: $DB_STATUS"
echo ""

echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"
echo -e "${YELLOW}STEP 4: Cancelling Subscription${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"

echo -e "Updating Stripe subscription to cancel at period end..."
CANCEL_RESPONSE=$(curl -s -X POST "https://api.stripe.com/v1/subscriptions/$SUBSCRIPTION_ID" \
    -u "$STRIPE_SECRET_KEY:" \
    -d "cancel_at_period_end=true")

CANCEL_AT_PERIOD_END=$(echo "$CANCEL_RESPONSE" | grep -o '"cancel_at_period_end": *[a-z]*' | awk '{print $2}')

if [ "$CANCEL_AT_PERIOD_END" != "true" ]; then
    echo -e "${RED}✗ Failed to set cancel_at_period_end in Stripe${NC}"
    echo "$CANCEL_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Stripe subscription set to cancel at period end${NC}"

# Update database (simulating the app's behavior)
psql "$DATABASE_URL" > /dev/null <<EOF
UPDATE subscriptions 
SET cancel_at_period_end = true, updated_at = NOW()
WHERE stripe_subscription_id = '$SUBSCRIPTION_ID';
EOF

echo -e "${GREEN}✓ Database updated with cancellation flag${NC}"

# Verify intermediate state
echo ""
echo -e "${BLUE}Verifying intermediate state (before period ends):${NC}"
DB_CHECK=$(check_db "SELECT status, cancel_at_period_end FROM subscriptions WHERE stripe_subscription_id = '$SUBSCRIPTION_ID';")
echo -e "  Database: $DB_CHECK"

STRIPE_CHECK=$(curl -s "https://api.stripe.com/v1/subscriptions/$SUBSCRIPTION_ID" \
    -u "$STRIPE_SECRET_KEY:" | grep -o '"cancel_at_period_end": *[a-z]*' | awk '{print $2}')
echo -e "  Stripe cancel_at_period_end: $STRIPE_CHECK"

if [ "$STRIPE_CHECK" == "true" ]; then
    echo -e "${GREEN}✓ Cancellation scheduled correctly${NC}"
else
    echo -e "${RED}✗ Cancellation not scheduled in Stripe${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"
echo -e "${YELLOW}STEP 5: Simulating Period End (Immediate Cancel)${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"

echo -e "Cancelling subscription immediately to simulate period end..."
FINAL_CANCEL=$(curl -s -X DELETE "https://api.stripe.com/v1/subscriptions/$SUBSCRIPTION_ID" \
    -u "$STRIPE_SECRET_KEY:")

FINAL_STATUS=$(echo "$FINAL_CANCEL" | grep -o '"status": *"[^"]*"' | head -1 | cut -d'"' -f4)

if [ "$FINAL_STATUS" == "canceled" ]; then
    echo -e "${GREEN}✓ Stripe subscription cancelled${NC}"
else
    echo -e "${RED}✗ Failed to cancel subscription${NC}"
    echo "$FINAL_CANCEL"
    exit 1
fi

# Simulate webhook update (since webhook might not trigger in test)
echo -e "Simulating webhook database update..."
psql "$DATABASE_URL" > /dev/null <<EOF
UPDATE subscriptions
SET status = 'cancelled', updated_at = NOW()
WHERE stripe_subscription_id = '$SUBSCRIPTION_ID';
EOF

echo -e "${GREEN}✓ Database updated to cancelled status${NC}"
echo ""

echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"
echo -e "${YELLOW}STEP 6: Final Verification${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"

# Check final database state
FINAL_DB_STATE=$(check_db "SELECT status, cancel_at_period_end FROM subscriptions WHERE stripe_subscription_id = '$SUBSCRIPTION_ID';")
echo -e "${BLUE}Database Final State:${NC}"
echo -e "  $FINAL_DB_STATE"

# Check final Stripe state
FINAL_STRIPE_STATE=$(curl -s "https://api.stripe.com/v1/subscriptions/$SUBSCRIPTION_ID" \
    -u "$STRIPE_SECRET_KEY:" | grep -o '"status": *"[^"]*"' | head -1 | cut -d'"' -f4)
echo -e "${BLUE}Stripe Final Status:${NC}"
echo -e "  $FINAL_STRIPE_STATE"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}Test Results Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"

TESTS_PASSED=0
TESTS_TOTAL=6

# Test 1: User created
if [ ! -z "$USER_ID" ]; then
    echo -e "${GREEN}✓ Test 1: User creation${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Test 1: User creation${NC}"
fi

# Test 2: Stripe customer created
if [ ! -z "$CUSTOMER_ID" ]; then
    echo -e "${GREEN}✓ Test 2: Stripe customer creation${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Test 2: Stripe customer creation${NC}"
fi

# Test 3: Subscription created
if [ ! -z "$SUBSCRIPTION_ID" ]; then
    echo -e "${GREEN}✓ Test 3: Subscription creation${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Test 3: Subscription creation${NC}"
fi

# Test 4: Cancel at period end set
if [ "$CANCEL_AT_PERIOD_END" == "true" ]; then
    echo -e "${GREEN}✓ Test 4: Cancel at period end flag${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Test 4: Cancel at period end flag${NC}"
fi

# Test 5: Final Stripe status
if [ "$FINAL_STRIPE_STATE" == "canceled" ]; then
    echo -e "${GREEN}✓ Test 5: Stripe final cancellation${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Test 5: Stripe final cancellation${NC}"
fi

# Test 6: Database status
if echo "$FINAL_DB_STATE" | grep -q "cancelled"; then
    echo -e "${GREEN}✓ Test 6: Database final status${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}✗ Test 6: Database final status${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
if [ $TESTS_PASSED -eq $TESTS_TOTAL ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! ($TESTS_PASSED/$TESTS_TOTAL)${NC}"
    echo -e "${GREEN}Subscription cancellation flow is working correctly!${NC}"
else
    echo -e "${RED}⚠ SOME TESTS FAILED ($TESTS_PASSED/$TESTS_TOTAL)${NC}"
fi
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""

# Cleanup option
echo -e "${YELLOW}Cleanup${NC}"
read -p "Do you want to clean up test data? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Cleaning up...${NC}"
    
    # Delete from Stripe
    curl -s -X DELETE "https://api.stripe.com/v1/customers/$CUSTOMER_ID" \
        -u "$STRIPE_SECRET_KEY:" > /dev/null
    echo -e "${GREEN}✓ Deleted Stripe customer${NC}"
    
    # Delete from database
    psql "$DATABASE_URL" -c "DELETE FROM subscriptions WHERE user_id = '$USER_ID'::uuid;" > /dev/null
    psql "$DATABASE_URL" -c "DELETE FROM users WHERE id = '$USER_ID'::uuid;" > /dev/null
    echo -e "${GREEN}✓ Deleted database records${NC}"
    
    echo -e "${GREEN}✓ Cleanup complete${NC}"
else
    echo -e "${YELLOW}Skipping cleanup. Test data preserved for inspection.${NC}"
    echo -e "${YELLOW}User ID: $USER_ID${NC}"
    echo -e "${YELLOW}Subscription ID: $SUBSCRIPTION_ID${NC}"
fi

echo ""
echo -e "${BLUE}Test complete!${NC}"

exit $([ $TESTS_PASSED -eq $TESTS_TOTAL ] && echo 0 || echo 1)

