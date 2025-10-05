#!/bin/bash

# Script to run database migrations in order
# Usage: ./run-migrations.sh "your-database-url"

if [ -z "$1" ]; then
  echo "❌ Error: DATABASE_URL required"
  echo "Usage: ./run-migrations.sh \"postgresql://user:pass@host/db\""
  echo ""
  echo "Get your DATABASE_URL from:"
  echo "  - Neon Dashboard: https://console.neon.tech"
  echo "  - Vercel: https://vercel.com/julian-leones-projects/monthly-alerts/settings/environment-variables"
  exit 1
fi

DATABASE_URL="$1"

echo "🗄️  Running database migrations..."
echo ""

# Run migrations in order
migrations=(
  "scripts/004_create_auth_tables.sql"
  "scripts/001_create_subscriptions_table.sql"
  "scripts/002_create_alerts_table.sql"
  "scripts/003_create_admin_users_table.sql"
)

for migration in "${migrations[@]}"; do
  echo "📝 Running: $migration"
  psql "$DATABASE_URL" -f "$migration"
  if [ $? -eq 0 ]; then
    echo "✅ Success: $migration"
  else
    echo "❌ Failed: $migration"
    exit 1
  fi
  echo ""
done

echo "🎉 All migrations completed successfully!"
echo ""
echo "Next steps:"
echo "  1. Sign up at https://monthlyalerts.com/signup"
echo "  2. Run: psql \"\$DATABASE_URL\" -f scripts/005_add_admin_user.sql"
