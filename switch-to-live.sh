#!/bin/bash

# Script to help switch Stripe from test to live mode

echo "================================================"
echo "  Stripe: Switch from Test to Live Mode"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Backup current config
echo -e "${YELLOW}Backing up current test configuration...${NC}"
grep STRIPE .env.local > .env.local.test-backup 2>/dev/null
echo -e "${GREEN}✓ Backup saved to .env.local.test-backup${NC}"
echo ""

# Get live keys from user
echo -e "${YELLOW}Please enter your Stripe LIVE keys:${NC}"
echo ""
echo "Get these from: https://dashboard.stripe.com/apikeys (Live mode)"
echo ""

read -p "Secret Key (sk_live_...): " SECRET_KEY
read -p "Publishable Key (pk_live_...): " PUBLISHABLE_KEY
read -p "Webhook Secret (whsec_...): " WEBHOOK_SECRET

# Validate keys
if [[ ! $SECRET_KEY =~ ^sk_live_ ]]; then
    echo -e "${RED}Error: Secret key should start with 'sk_live_'${NC}"
    exit 1
fi

if [[ ! $PUBLISHABLE_KEY =~ ^pk_live_ ]]; then
    echo -e "${RED}Error: Publishable key should start with 'pk_live_'${NC}"
    exit 1
fi

# Update .env.local
echo ""
echo -e "${YELLOW}Updating .env.local...${NC}"

# Create temp file
cp .env.local .env.local.tmp

# Replace Stripe keys
sed -i.bak "s|^STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$SECRET_KEY|" .env.local.tmp
sed -i.bak "s|^STRIPE_PUBLISHABLE_KEY=.*|STRIPE_PUBLISHABLE_KEY=$PUBLISHABLE_KEY|" .env.local.tmp
sed -i.bak "s|^NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=.*|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$PUBLISHABLE_KEY|" .env.local.tmp
sed -i.bak "s|^STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET|" .env.local.tmp

# Replace original file
mv .env.local.tmp .env.local
rm .env.local.tmp.bak

echo -e "${GREEN}✓ .env.local updated with live keys${NC}"
echo ""

# Show verification
echo -e "${YELLOW}Verifying keys:${NC}"
grep STRIPE .env.local | sed 's/=.*/=***HIDDEN***/'
echo ""

echo -e "${GREEN}✓ Successfully switched to LIVE mode!${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT NEXT STEPS:${NC}"
echo ""
echo "1. Update Vercel environment variables:"
echo "   https://vercel.com/your-project/settings/environment-variables"
echo ""
echo "2. Set up live webhook in Stripe:"
echo "   https://dashboard.stripe.com/webhooks"
echo "   Endpoint: https://monthlyalerts.com/api/webhooks/stripe"
echo ""
echo "3. Redeploy your Vercel project"
echo ""
echo "4. Test with a real card subscription"
echo ""
echo -e "${YELLOW}To rollback to test mode:${NC}"
echo "   mv .env.local.test-backup .env.local"
echo ""
echo "================================================"

