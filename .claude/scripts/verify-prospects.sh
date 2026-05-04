#!/bin/bash
# verify-prospects.sh — Health check for prospect-research inserts
# Session 2026-05-04: Guard against silent insert failures

set -e

source /Users/uguruzel/Vibe/ravna-workflows/.env.local

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Args: search_keyword, location (optional — if not provided, check all recent)
KEYWORD="${1:-}"
LOCATION="${2:-}"

echo "🔍 Prospect Database Health Check"
echo "================================="

# Check 1: Database connectivity
echo -n "Checking Supabase connectivity... "
if psql "$SUPABASE_CONNECTION_STRING" -c "SELECT 1;" > /dev/null 2>&1; then
  echo -e "${GREEN}✅${NC}"
else
  echo -e "${RED}❌ Cannot connect to Supabase${NC}"
  exit 1
fi

# Check 2: Total prospects
TOTAL=$(psql "$SUPABASE_CONNECTION_STRING" -c "SELECT COUNT(*) FROM prospects;" | grep -oE '[0-9]+' | head -1)
echo "Total prospects in DB: $TOTAL"

# Check 3: If keyword provided, check specific search
if [ -n "$KEYWORD" ]; then
  if [ -z "$LOCATION" ]; then
    LOCATION="*"  # Wildcard
  fi

  echo ""
  echo "Checking specific search: keyword='$KEYWORD', location='$LOCATION'"

  COUNT=$(psql "$SUPABASE_CONNECTION_STRING" -c \
    "SELECT COUNT(*) FROM prospects WHERE search_keyword = '$KEYWORD' AND city LIKE '$LOCATION';" \
    | grep -oE '[0-9]+' | head -1)

  if [ "$COUNT" -eq 0 ]; then
    echo -e "${RED}❌ 0 prospects found for this search${NC}"
    echo "This suggests STEP 8 insert failed silently."
    exit 1
  else
    echo -e "${GREEN}✅ $COUNT prospects found${NC}"

    # Breakdown by status
    psql "$SUPABASE_CONNECTION_STRING" -c \
      "SELECT status, COUNT(*) FROM prospects WHERE search_keyword = '$KEYWORD' AND city LIKE '$LOCATION' GROUP BY status;"
  fi
fi

# Check 4: Recent inserts (last 24h)
echo ""
echo "Recent inserts (last 24 hours):"
psql "$SUPABASE_CONNECTION_STRING" -c \
  "SELECT search_keyword, city, COUNT(*) as count FROM prospects WHERE created_at > NOW() - INTERVAL '24 hours' GROUP BY search_keyword, city ORDER BY created_at DESC;"

# Check 5: Searches table (dedup reference)
echo ""
echo "Recent searches (searches table):"
psql "$SUPABASE_CONNECTION_STRING" -c \
  "SELECT keyword, location, keyword_normalized, location_normalized, results_count FROM searches ORDER BY last_searched_at DESC LIMIT 10;"

echo ""
echo -e "${GREEN}✅ Health check complete${NC}"
