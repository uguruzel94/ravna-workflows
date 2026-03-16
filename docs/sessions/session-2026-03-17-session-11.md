# Session 11 — 2026-03-17

## Task
Implement the four-bug dedup fix plan for prospect-research v3.5 (complete deployment).

## What was built

### Part 1: DB Cleanup
- Inspected duplicates using normalized REGEXP_REPLACE
- Found: 2 duplicate prospects (CDC DEMİR ÇELİK ×2, PARS DIS TICARET ×2)
- Deleted newer rows, kept earliest created_at per normalized name
- Result: 0 duplicates

### Part 2: Schema Migration
- Added `keyword_normalized` + `location_normalized` TEXT columns
- Backfilled all existing searches using translate() for Turkish→ASCII
- Dropped old UNIQUE(keyword, location) constraint
- Set columns NOT NULL
- Added new UNIQUE(keyword_normalized, location_normalized) constraint
- Created idx_searches_normalized index
- Result: 3 duplicate searches reduced to 1

### Part 3: schema.sql Update
- Updated canonical definition to include normalized columns
- Ensures fresh projects get correct schema

### Part 4: SKILL.md Updates
- Added ⛔ DEDUP GUARD header (with mandatory logging requirement)
- Fixed STEP 0.9: Removed `?` placeholders, documented literal string substitution
- Fixed STEP 9.5: Added normalized columns to INSERT, updated CONFLICT clause

### Part 5: Verification
- ✅ V1: Schema correct (both columns NOT NULL)
- ✅ V2: No duplicate searches (0 rows with COUNT > 1)
- ✅ V3: No duplicate prospects (0 rows with COUNT > 1)

## Commits
- `fix: prospect-research SKILL.md v3.5 — complete dedup fix (DB + schema + guard)`

## Status
✅ All 4 bugs fixed and deployed. DB verified. Ready for end-to-end testing with real Outscraper data.

## Next
Priority 1: Run prospect-research v3.5 with real keywords (e.g., "demir çelik ticareti", "Kemalpasa", count: 5)
