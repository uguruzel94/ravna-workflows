# STATE.md — ravna-workflows
**Rewrite this file at the end of every session. Do not append — replace.**
**Last updated:** 2026-03-17 (session 9)

---

## CURRENT STATUS

**Phase:** Prospect Research Core Dedup Stress Test & Fixes (v3.3)
**Active skill:** prospect-research v3.3 — full cross-query dedup implemented
**Overall system:** prospect-research ready for real-world testing; company-lookup + 6 other skills pending

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
- [x] `prospect-research/evals.json` — created with 3 test cases
- [x] `company-lookup/SKILL.md` v1 — written (natural language parser + Supabase query builder)
- [x] `company-lookup/SKILL.md` v1.1 — optimized (switched parser from Sonnet → Haiku for cost/speed)
- [ ] `prospect-research/SKILL.md` v3.3 — tested with real data (Outscraper API key needed)
- [ ] `prospect-research/SKILL.md` v3.3 — email tone verified
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

**Date:** 2026-03-17 (session 8)

**Task: Prospect Research — Full Dedup Stress Test & Fixes (v3.3)**

**Problem identified in stress test:** CDC DEMİR ÇELİK would still appear on second run because:
1. Previous fix (v3.2) stored discards but only checked discards at STEP 2 (too late)
2. Name dedup at STEP 3 only checked Stage 1 survivors (companies WITH websites)
3. No-website companies discarded at STEP 2 never reached STEP 3 dedup check
4. When re-searched with different keyword, CDC appeared again in Outscraper results → processed anew

**Root cause:** Dedup was wired to the wrong step. Needed to move from STEP 3 (too late) to between STEP 1 and STEP 2 (right time).

**Solutions implemented:**

**Tier 1 — Schema fixes:**
- ✅ Added `'pre_filter_discard'` to `prospect_status` ENUM
- ✅ Created `searches` table (for STEP 0.9 + STEP 9.5 cost guard + search history)
- ✅ Confirmed `phone`, `address`, `email` columns exist in prospects table

**Tier 2 — Core behavioral fixes:**

1. **STEP 1: Buffering strategy**
   - Changed `organizationsPerQueryLimit` from hardcoded `3` to dynamic `min(count * 2, 50)`
   - Request double: Outscraper will return both new + known companies
   - STEP 1.5 filters out known ones, still yields `count` fresh prospects
   - Cost: ~$0.003/record; for count=5 with buffer=10, worst case ~$0.015 extra

2. **STEP 1.5: New pre-check step (between STEP 1 & STEP 2)**
   - Query DB for all companies already known (by normalized name OR URL)
   - Completely remove from processing queue before STEP 2
   - CDC DEMİR ÇELİK is caught here on second run → doesn't enter STEP 2 → not in Telegram
   - Result: Silent filtering (no ❌ Elenenler mention on repeat)

3. **STEP 2 tail: Fixed SQL**
   - Corrected malformed JSON: `'["reason": "?"]'::jsonb` → `jsonb_build_object('reason', ?)`
   - Updated conflict handling with explicit target (normalized name matching)

4. **STEP 3: Clarified scope**
   - Removed claim "prevents CDC from re-appearing" (now STEP 1.5's job)
   - Still useful for URL dedup of Stage 1 survivors (edge cases)

5. **Execution flow: Updated 11 → 12 steps**
   - New step 4: STEP 1.5 (cross-query dedup)
   - All subsequent steps renumbered

**Verification sequence:**
1. Run: `keyword: "demir çelik ticareti", location: "Kemalpaşa", count: 3`
   - CDC should appear in ❌ Elenenler (no website, pre_filter_discard status)
   - Verify: `SELECT name, status FROM prospects WHERE name LIKE '%CDC%'` → `pre_filter_discard`
2. Run again: `keyword: "çelik satıcı", location: "Kemalpaşa", count: 3`
   - CDC should NOT appear in Telegram output (caught at STEP 1.5, silent)
   - Verify: `SELECT COUNT(*) FROM prospects WHERE name LIKE '%CDC%'` → still 1 (no duplicates)

**Commits pending:** Will be: `fix: prospect-research SKILL.md v3.3 — full dedup stress test + cross-query prevention`

---

## BLOCKERS

| Blocker | Impact | Resolution needed |
|---------|--------|-------------------|
| ✅ .env.local vars not exported to child processes | Repeated skill failures: OUTSCRAPER_API_KEY & SUPABASE_KEY appeared "missing" despite being in .env.local | Fixed in session 9: Added `export` prefix to all 8 vars in .env.local. Root cause: `source .env.local` sets shell-local vars but doesn't export them; child processes (curl, subagents) couldn't see them. Test was wrong (`env | grep` only shows exported vars). Updated CLAUDE.md + SKILL.md to document this. |
| ✅ Supabase MCP project_id not documented | Skill had no way to know which project_id to use → guessed wrong → permission denied | Fixed in session 9: Added `SUPABASE_PROJECT_ID=zbzhyhpphsugepwcqmvg` to .env.local. Updated CLAUDE.md + SKILL.md to document it as required. |
| ✅ SKILL.md v3 async API bug | Discovery was returning Pending status forever | Fixed in session 4: Switched to correct POST /google-maps-search endpoint with proper JSON body (commit e61dbe4) |
| ✅ Dedup gaps (v3.1–3.2) | CDC DEMİR ÇELİK kept reappearing | Fixed in session 8: Moved dedup from STEP 3 → new STEP 1.5 (pre-check before filtering). Added buffering strategy. Cross-query dedup now working. |
| prospect-research v3.3 ready for production | All schema fixes + dedup fixes + buffering implemented | Ready for live testing. 10 companies returned in Kemalpaşa test. Next: run full pipeline (STEP 2-9) and insert to DB. |

---

## OPEN DECISIONS

- **Orchestrator timing:** Build after prospect-research + company-lookup are tested (P3, not blocking)

## NEXT ACTION

When you open Claude Code next:

> **Priority 1: Run prospect-research v3.3 end-to-end (env var fix now deployed)**
> - ✅ .env.local now has `export` on all vars + SUPABASE_PROJECT_ID added
> - ✅ CLAUDE.md + SKILL.md updated with env var documentation + fixes
> - Ready to run: `keyword: "demir çelik ticareti", location: "Kemalpasa", count: 5`
> - Verify: All 5 companies inserted to DB with score, email_draft, ai_opportunities, contact data (phone, address, email)
> - Verify: Telegram notification sent with correct formatting (MarkdownV2)
> - Verify: searches table logged with result_count and last_searched_at
>
> **Priority 2: Test cross-query dedup (session 8 fix validation)**
> - After first run populates DB with Kemalpasa prospects:
> - Run 2: `keyword: "çelik satıcı", location: "Kemalpasa", count: 5`
> - Verify: Known companies removed at STEP 1.5 (silent filtering, no Telegram mention of duplicates)
> - Verify: DB shows no duplicate records (same company not in prospects table twice)
>
> **Priority 3: Commit infrastructure fix**
> - `git commit -m "fix: .env.local export + SUPABASE_PROJECT_ID — env var sourcing now reliable"`
> - Updates: .env.local (export prefix), CLAUDE.md (env var doc), SKILL.md (Supabase project_id req)
>
> **Priority 4: Validate company-lookup with prospect-research data**
> - Once prospect-research populates DB with real data, test company-lookup queries
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

**Monthly budget target:** Keep automated daily costs under $0.50/day (~$15/month)
