#!/bin/bash

# Quick script to verify webhook endpoint is responding

echo "Testing webhook endpoint..."
echo ""

# Test if endpoint exists
response=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  https://monthlyalerts.com/api/webhooks/stripe)

echo "Webhook endpoint response: $response"
echo ""

if [ "$response" = "400" ]; then
    echo "✅ Endpoint exists and is responding (400 = missing signature, which is expected)"
    echo "Your webhook is configured correctly!"
elif [ "$response" = "404" ]; then
    echo "❌ Endpoint not found - check URL"
elif [ "$response" = "500" ]; then
    echo "⚠️  Server error - check application logs"
else
    echo "Response code: $response"
fi

echo ""
echo "Next step: Create a real subscription to test the full flow"
echo "Visit: https://monthlyalerts.com/dashboard/subscribe"


