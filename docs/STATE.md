# STATE.md — ravna-workflows
**Rewrite this file at the end of every session. Do not append — replace.**
**Last updated:** 2026-03-17 (session 11)

---

## CURRENT STATUS

**Phase:** prospect-research v3.5 — Complete Dedup Fix Deployment (all 4 bugs + DB cleanup + schema migration)
**Active skill:** prospect-research v3.5 — normalization + two-pass dedup + DEDUP GUARD + ⛔ markers + DB constraints
**Overall system:** prospect-research architecture hardened; ready for end-to-end testing; company-lookup + 6 other skills pending

---

## WHAT'S DONE

### Infrastructure ✅
- [x] Repo initialized (`ravna-workflows`)
- [x] CLAUDE.md in place
- [x] docs/ structure created
- [x] MCPs installed in Claude Code (supabase, brave-search, puppeteer, filesystem)
- [x] `.env.local` created with all API keys filled
- [x] Supabase project created
- [x] Telegram bot created (via BotFather) + chat ID filled (657474307)
- [x] Resend account created + domain verified

### Schema Updates ✅
- [x] `prospect_status` enum: added `'discarded'` value (session 2)
- [x] `prospect_status` enum: added `'pre_filter_discard'` value (session 8)
- [x] `prospects` table: added `search_keyword TEXT` column (session 2)
- [x] `prospects` table: added `url UNIQUE` constraint (session 2)
- [x] `prospects` table: added `idx_prospects_url` index (session 2)
- [x] `prospects` table: added `phone TEXT`, `address TEXT`, `email TEXT` columns (session 3)
- [x] `searches` table: created (session 8, for STEP 0.9 + STEP 9.5 dedup)
- [x] `.claude/settings.json`: updated with `Bash(*)` + Playwright + Supabase MCP permissions (session 3)

### Skills
- [x] `prospect-research/SKILL.md` v3 — written (Outscraper + two-stage filtering + evidence-based ICP)
- [x] `prospect-research/SKILL.md` v3.1 — enhanced (district support, "location" instead of "city")
- [x] `prospect-research/SKILL.md` v3.2 — fixed dedup gaps (discard storage + name-based dedup)
- [x] `prospect-research/SKILL.md` v3.3 — comprehensive stress test & full cross-query dedup (session 8)
  - ✅ STEP 1: Buffering strategy (request `count * 2` to handle known-company overlap)
  - ✅ STEP 1.5: Cross-query dedup (NEW — prevents CDC reappear across different keywords)
  - ✅ STEP 2 tail: Fixed JSON syntax + conflict handling
  - ✅ STEP 3: Clarified scope (Stage 1 survivors only; cross-query handled by STEP 1.5)
  - ✅ Execution flow: Updated to 12 steps (added STEP 1.5)
- [x] `prospect-research/SKILL.md` v3.4 — four-bug dedup fix (session 10 — identified)
  - ✅ Fix 1: STEP 0.9 normalization (Turkish→ASCII, strip suffixes before searches table lookup)
  - ✅ Fix 2: STEP 1.5 mandatory DB Gate (⛔ marker, direct Supabase MCP, two-pass: exact SQL + Haiku fuzzy)
  - ✅ Fix 3: STEP 3 safety net (⛔ marker, clarified as final check before STEP 4)
  - ✅ Fix 4: Pre-Outscraper warning (re-run cost + low likelihood message)
  - ✅ Execution flow: Updated with ⛔ markers for direct SQL steps (0.9, 1.5, 3, 8, 9, 9.5)
- [x] `prospect-research/SKILL.md` v3.5 — complete dedup fix deployment (session 11)
  - ✅ DB cleanup: Deleted 2 duplicate prospects (CDC DEMİR ÇELİK, PARS DIS TICARET)
  - ✅ Schema migration: Added keyword_normalized + location_normalized columns, backfilled, added UNIQUE constraint + index
  - ✅ DEDUP GUARD header: Inserted before STEP 0.9 with mandatory logging requirement
  - ✅ STEP 0.9 SQL fixed: Removed `?` placeholders, now uses literal string values for normalized lookups
  - ✅ STEP 9.5 INSERT fixed: Added normalized columns, changed CONFLICT to use normalized constraint
  - ✅ schema.sql updated: searches table definition now includes normalized columns
  - ✅ All verification checks passed: No duplicate searches (V2) or prospects (V3), schema correct (V1)
- [x] `prospect-research/evals.json` — created with 3 test cases
- [x] `company-lookup/SKILL.md` v1 — written (natural language parser + Supabase query builder)
- [x] `company-lookup/SKILL.md` v1.1 — optimized (switched parser from Sonnet → Haiku for cost/speed)
- [ ] `prospect-research/SKILL.md` v3.5 — tested with real data (Outscraper API key needed)
- [ ] `prospect-research/SKILL.md` v3.4 — email tone verified
- [ ] `company-lookup/SKILL.md` v1.1 — tested with real data (Supabase queries)
- [ ] `orchestrator/SKILL.md` — sketched (design in ORCHESTRATOR-SKETCH.md), P3
- [ ] `followup-crm/SKILL.md` — written (P2)
- [ ] `newsletter-curator/SKILL.md` — written (P2)
- [ ] `consult-prep/SKILL.md` — written (P3)
- [ ] `curriculum-gen/SKILL.md` — written (P4)
- [ ] `client-onboarding/SKILL.md` — written (P5)
- [ ] `pipeline-intelligence/SKILL.md` — written (P6)

---

## LAST SESSION

**Date:** 2026-03-17 (session 11)

**Task: Prospect Research — Complete Dedup Fix Implementation (v3.5 — DB cleanup + schema migration + SKILL.md updates)**

**What was done:**

**Part 1 — Database Cleanup**
- Inspected duplicates: Found 2 duplicate prospects (CDC DEMİR ÇELİK × 2, PARS DIS TICARET × 2)
- Deleted newer duplicates, kept earliest created_at per normalized name (using REGEXP_REPLACE for consistency)
- Result: 0 duplicate prospects in DB

**Part 2 — Schema Migration**
- Added `keyword_normalized TEXT` and `location_normalized TEXT` columns to searches table (nullable first)
- Backfilled all existing rows using: `lower(translate(keyword/location, 'çşığüöÇŞİĞÜÖ', 'csiguoCsIGUO'))`
- Dropped old UNIQUE constraint on raw (keyword, location)
- Set both columns NOT NULL
- Added new UNIQUE constraint on (keyword_normalized, location_normalized)
- Created index `idx_searches_normalized` for STEP 0.9 query performance
- Result: 3 duplicate searches reduced to 1, schema hardened

**Part 3 — schema.sql Update**
- Updated canonical schema definition to include normalized columns in searches table
- Ensures fresh Supabase projects get correct schema from day 1

**Part 4 — SKILL.md Updates**
- Added ⛔ DEDUP GUARD header (before line 13) with 3 forbidden steps and mandatory logging requirement
- Fixed STEP 0.9: Removed `?` placeholders, documented literal string substitution, added translate() formula
- Fixed STEP 9.5: Added normalized columns to INSERT, changed CONFLICT clause to use normalized constraint

**Part 5 — Verification**
- ✅ V1: Schema correct — both normalized columns present and NOT NULL
- ✅ V2: No duplicate searches (0 rows with COUNT(*) > 1)
- ✅ V3: No duplicate prospects (0 rows with COUNT(*) > 1)
- All verification queries returned empty results (confirming fix worked)

**Commit:** `fix: prospect-research SKILL.md v3.5 — complete dedup fix (DB + schema + guard)` (deployed)

---

## LAST SESSION (session 10)

**Date:** 2026-03-17 (session 10)

**Task: Prospect Research — Four-Bug Dedup Fix Analysis (v3.4 — STEP 0.9 + 1.5 + 3 hardening)**

**Problems discovered (from v3.3):** During Kemalpasa demir çelik ticareti search, KANAAT DEMİR and MERT ÇELİK were already in DB from 2026-03-16, but:
1. STEP 1.5 and STEP 3 were silently skipped (bundled into Haiku subagent, which did memory intent-matching but never executed SQL)
2. STEP 0.9 exact-match lookup didn't normalize, so "demir çelik" vs "demir celik" or "Kemalpasa, İzmir" vs "Kemalpasa" were treated as different searches
3. Haiku fuzzy name check didn't exist for STEP 1.5 edge cases (abbreviations, misspellings, variant names)
4. Re-running a confirmed search warned user but didn't mention that all companies were likely already in DB (wasting Outscraper cost)

**Root causes identified (the four bugs):**
1. **Bug 1 (main):** STEP 1.5 never ran SQL — text was ambiguous enough to allow delegation to subagent
2. **Bug 2:** STEP 0.9 didn't normalize keyword+location before lookup
3. **Bug 3:** Company name matching was brittle (SQL regex didn't handle all Turkish variants)
4. **Bug 4:** Re-run confirmation didn't warn about cost or low likelihood of new results

**Solutions implemented (v3.4):**

**Fix 1 — STEP 0.9 Normalization:**
- Added Turkish→ASCII conversion before searches table lookup
- Keyword: lowercase + ç→c, ş→s, ı→i, ğ→g, ü→u, ö→o + strip "ticareti/satıcısı/dağıtıcısı"
- Location: lowercase + Turkish→ASCII + strip ", İzmir"/", İstanbul" suffixes
- Result: "demir çelik ticareti" + "Kemalpasa, İzmir" → normalized → matches previous "demir celik" + "kemalpasa"

**Fix 2 — STEP 1.5 Mandatory DB Gate (Two-Pass):**
- ⛔ Added marker: NEVER delegate to subagent. Direct Supabase MCP call only.
- **Pass 1 (exact SQL):** Query for normalized name + URL matches in DB → remove exact duplicates
- **Pass 2 (Haiku fuzzy):** For remaining companies, pass to Haiku: "Do any incoming names match existing DB names from same city?" → catch abbreviations/misspellings
- Result: SQL handles exact matches, Haiku handles edge cases. KANAAT DEMİR removed at Pass 1.

**Fix 3 — STEP 3 Safety Net:**
- ⛔ Added marker: This is final check before STEP 4 research (catches edge cases STEP 1.5 missed)
- Clarified scope: URL + name dedup for Stage 1 survivors only (cross-query handled by STEP 1.5)

**Fix 4 — Pre-Outscraper Warning:**
- Updated STEP 0.9 re-run message: "This search found N companies on [date]. These are likely already in your DB. Outscraper cost ~$X. There may be new listings since then. Proceed?"
- Prevents user from wasting money on re-runs

**Documentation updates:**
- Updated Full 12-Step Execution Flow with ⛔ markers on critical direct-SQL steps (0.9, 1.5, 3, 8, 9, 9.5)
- Clarified which steps must NOT be delegated to subagents

**Commit:** `fix: prospect-research SKILL.md v3.4 — four-bug dedup fix (STEP 0.9 + 1.5 + 3)` (deployed)

---

## BLOCKERS

| Blocker | Impact | Resolution needed |
|---------|--------|-------------------|
| ✅ .env.local vars not exported to child processes | Repeated skill failures: OUTSCRAPER_API_KEY & SUPABASE_KEY appeared "missing" despite being in .env.local | Fixed in session 9: Added `export` prefix to all 8 vars in .env.local. Updated CLAUDE.md + SKILL.md to document this. |
| ✅ Supabase MCP project_id not documented | Skill had no way to know which project_id to use → guessed wrong → permission denied | Fixed in session 9: Added `SUPABASE_PROJECT_ID=zbzhyhpphsugepwcqmvg` to .env.local. Updated CLAUDE.md + SKILL.md. |
| ✅ SKILL.md v3 async API bug | Discovery was returning Pending status forever | Fixed in session 4: Switched to correct POST /google-maps-search endpoint (commit e61dbe4). |
| ✅ Dedup gaps (v3.1–3.3) | CDC DEMİR ÇELİK kept reappearing; STEP 1.5 silently skipped | Fixed in sessions 10–11: Identified 4 root causes (subagent delegation, missing normalization, raw SQL constraints, no re-run warning). Deployed v3.5: DB cleanup (deleted 2 duplicate prospects), schema migration (added normalized columns + UNIQUE constraint + index), SKILL.md hardening (⛔ DEDUP GUARD header, fixed STEP 0.9/9.5 SQL, mandatory logging). All verification checks passed. |
| prospect-research v3.5 needs end-to-end test | All fixes deployed and DB verified, but untested with real Outscraper data | Next: Run with `keyword: "demir çelik ticareti", location: "Kemalpasa", count: 5`. Verify: DB inserts, Telegram notification, searches table log, no duplicates on re-run. |

---

## OPEN DECISIONS

- **Orchestrator timing:** Build after prospect-research + company-lookup are tested (P3, not blocking)

## NEXT ACTION

When you open Claude Code next:

> **Priority 1: Run prospect-research v3.5 end-to-end (complete dedup fix now fully deployed)**
> - ✅ DB cleanup: 2 duplicate prospects deleted
> - ✅ Schema migration: normalized columns added, UNIQUE constraint updated, index created
> - ✅ SKILL.md: ⛔ DEDUP GUARD header + fixed STEP 0.9/9.5 SQL + mandatory logging
> - ✅ All verification checks passed
> - Ready to run: `keyword: "demir çelik ticareti", location: "Kemalpasa", count: 5`
> - Verify: All 5 companies inserted to DB with score, email_draft, ai_opportunities, contact data
> - Verify: Telegram notification sent with correct formatting (MarkdownV2)
> - Verify: searches table logged with keyword_normalized, location_normalized, results_count, last_searched_at
> - Verify: STEP 0.9 logs actual SQL result (if any) or report "no previous search found"
> - Verify: STEP 1.5 logs SQL result from Pass 1 (exact matches removed)
> - Verify: STEP 3 logs final dedup check before research
>
> **Priority 2: Test STEP 0.9 normalization + two-pass dedup (v3.5 variant spelling test)**
> - After first run populates DB with Kemalpasa prospects:
> - Run 2: `keyword: "demir celik ticareti", location: "Kemalpasa, İzmir", count: 5` (variant spelling/location)
> - Verify: STEP 0.9 recognizes as same search (normalized values match) and asks user
> - Verify: Asks user before re-running Outscraper (with cost warning + likelihood message)
> - Verify: STEP 1.5 Pass 1 (exact SQL) removes known companies
> - Verify: STEP 1.5 Pass 2 (Haiku fuzzy) catches any near-duplicates
> - Verify: DB shows no duplicate records after second run
> - Verify: searches table shows updated last_searched_at (UPSERT worked)
>
> **Priority 3: Test re-run with different keyword (cross-query dedup)**
> - Run 3: `keyword: "çelik satıcı", location: "Kemalpasa", count: 5` (different keyword, same city)
> - Verify: STEP 1.5 Pass 1 removes companies from previous search (KANAAT DEMİR, etc.)
> - Verify: Telegram shows only NEW prospects (net addition, no duplicate mentions)
>
> **Priority 4: Validate company-lookup with prospect-research data**
> - Once prospect-research populates DB with 10+ real prospects, test company-lookup
> - Verify Haiku parser works for Turkish/English natural language
> - Test all 7 verification cases from SKILL.md
>
> **Priority 5: Build followup-crm SKILL.md (P2)**
> - Depends on: prospect-research + company-lookup both validated
> - Functionality: status updates, follow-up scheduling, manual contact logging

---

## PIPELINE STATUS (update as you get real prospects)

| Name | Company | Sector | Status | Next action |
|------|---------|--------|--------|-------------|
| [Friend's contact] | Demir-çelik trading | Metals | First audit scheduled | Record Netsis workflow |

---

## COSTS THIS SESSION

| Date | Task | Model | Approx cost |
|------|------|-------|-------------|
| 2026-03-17 (session 8) | Dedup stress test + v3.3 fixes + schema updates | Haiku | $0.01 |
| 2026-03-17 (session 9) | Env var debugging + .env.local export fix + SUPABASE_PROJECT_ID setup + CLAUDE.md + SKILL.md updates | Haiku | $0.01 |
| 2026-03-17 (session 10) | Four-bug dedup fix analysis: Root cause analysis, STEP 0.9 normalization + STEP 1.5 two-pass refactor + STEP 3 safety net + ⛔ markers | Haiku | $0.01 |
| 2026-03-17 (session 11) | Complete dedup fix deployment: DB cleanup (3 DELETE queries) + schema migration (6 ALTER/CREATE queries) + schema.sql update + SKILL.md fixes (DEDUP GUARD header, STEP 0.9 SQL, STEP 9.5 INSERT) + verification (3 SELECT queries) + STATE.md update + commit | Haiku | $0.01 |

**Monthly budget target:** Keep automated daily costs under $0.50/day (~$15/month)
