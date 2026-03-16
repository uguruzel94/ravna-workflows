---
name: Search Deduplication System
description: Prevents re-searching same keyword+location combinations to save Outscraper API costs
type: project
---

## Problem Solved

**Issue:** When running prospect-research skill repeatedly with same keyword+location (e.g., "demir çelik ticareti" in "İzmir"), Outscraper API gets called every time, wasting ~$0.15/run even though results are mostly the same.

**Why it matters:** At Outscraper rates (~$0.003/record), re-searching wastes money and redundantly clogs the pipeline with duplicate prospects.

**Status:** ✅ Implemented & tested 2026-03-16

## Architecture

### Tables Added
- **searches** table (Supabase)
  - Columns: id, keyword, location, count, results_count, last_searched_at, created_at
  - Primary key: id
  - Unique constraint: (keyword, location)
  - Index on (keyword, location) for fast lookups

### SKILL.md Updates

**STEP 0.9: Search Deduplication**
- Execute **after** STEP 0.5 (parsing) but **before** STEP 1 (Outscraper)
- Query `searches` table for (keyword, location) match
- If found: log and ask user if they want to re-search
- If not found: proceed normally

**STEP 9.5: Search Logging**
- Execute **after** STEP 9 (Telegram notification)
- Upsert into `searches` table: keyword, location, count, results_count, last_searched_at
- Uses ON CONFLICT to update existing rows (same keyword+location)

### Cost Impact
- **Saves:** ~$0.15 per duplicate search (50 records × $0.003)
- **Checked:** All new searches now check first (1 free SQL query)
- **Logged:** Every search logged for future reference

## How It Works (User Flow)

```
User: "Bornova'da yazılım şirketi ara, 5 tane"
  ↓
STEP 0.5: Parse → {keyword: "yazılım şirketi", location: "Bornova", count: 5}
  ↓
STEP 0.9: Check searches table
  → Found: "yazılım şirketi", "Bornova", last searched 2026-03-10, found 7 companies
  → Ask user: "Bu arama 2026-03-10'da yapılmış (7 sonuç). Yine de devam etmek ister misin?"
  → If NO: abort, show cached results from that date
  → If YES: continue to STEP 1
  ↓
STEP 1-9: Normal workflow (Outscraper + analysis)
  ↓
STEP 9.5: Log to searches table
  → UPSERT: keyword='yazılım şirketi', location='Bornova', count=5, results_count=7, last_searched_at=NOW()
```

## Testing Done

**Test migrations applied:** 2026-03-16
- Created `searches` table with unique constraint
- Added index on (keyword, location)
- Inserted test records:
  - "demir çelik ticareti" / "İzmir" → 12 results
  - "yazılım şirketi" / "Ankara" → 8 results
- Verified data in Supabase ✅

**Not yet tested:** Full integration with STEP 0.9 and 9.5 in prospect-research skill execution (requires manual invocation)

## Next Steps (Future)

1. **Manual test:** Run prospect-research skill with duplicated search, verify STEP 0.9 prompt appears
2. **Monitor:** Track searches table growth over time (should stabilize after initial population)
3. **Reporting:** Add searches table to pipeline-intelligence weekly reports (insights on "which areas keep getting searched")
4. **Expansion:** Apply same pattern to other skills (newsletter-curator, company-lookup, etc.)

## Why This Matters

- **Cost control:** Outscraper fees are highest operational cost for prospect pipeline
- **Data freshness:** Allows tracking "when did we last research X area?" to decide if re-search is warranted
- **User control:** User chooses whether old results are good enough or new search is needed
- **Analytics:** Searchable record of all research activity (compliance, audit trail)

## Implementation Notes

- UPSERT pattern ensures idempotent logging (safe to retry without duplicates)
- Unique constraint on (keyword, location) enforces one record per search combo
- `last_searched_at` timestamp helps users see if results are stale (>30 days old?)
- Turkish character support tested (Turkish city/keyword names work in SQL)

