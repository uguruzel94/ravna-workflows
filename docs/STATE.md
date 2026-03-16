# STATE.md — ravna-workflows
**Rewrite this file at the end of every session. Do not append — replace.**
**Last updated:** 2026-03-17 (session 7)

---

## CURRENT STATUS

**Phase:** Reading Skills Refinement (prospect-research v3.1 + company-lookup v1.1)
**Active skill:** Both skills optimized post-review (district support, model selection)
**Overall system:** 2/8 skills written & refined (prospect-research, company-lookup; testing pending)

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
- [x] `prospects` table: added `search_keyword TEXT` column (session 2)
- [x] `prospects` table: added `url UNIQUE` constraint (session 2)
- [x] `prospects` table: added `idx_prospects_url` index (session 2)
- [x] `prospects` table: added `phone TEXT`, `address TEXT`, `email TEXT` columns (session 3)
- [x] `.claude/settings.json`: updated with `Bash(*)` + Playwright + Supabase MCP permissions (session 3)

### Skills
- [x] `prospect-research/SKILL.md` v3 — written (Outscraper + two-stage filtering + evidence-based ICP)
- [x] `prospect-research/SKILL.md` v3.1 — enhanced (district support, "location" instead of "city")
- [x] `prospect-research/SKILL.md` v3.2 — fixed dedup gaps (discard storage + name-based dedup)
- [x] `prospect-research/evals.json` — created with 3 test cases
- [x] `company-lookup/SKILL.md` v1 — written (natural language parser + Supabase query builder)
- [x] `company-lookup/SKILL.md` v1.1 — optimized (switched parser from Sonnet → Haiku for cost/speed)
- [ ] `prospect-research/SKILL.md` v3.1 — tested with real data (Outscraper API key needed)
- [ ] `prospect-research/SKILL.md` v3.1 — email tone verified
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

**Date:** 2026-03-17 (session 7)

**Task: Fix Prospect Research Deduplication Gaps**

**Problem:** CDC DEMİR ÇELİK (no website) re-appeared in multiple searches because:
1. Discarded companies at STEP 2 were never stored (no memory) → they reappear in every search
2. STEP 3 dedup only checked URLs (impossible for no-website companies)
3. Result: Same company kept getting re-researched, wasting time & API calls

**Solution implemented:**

1. **STEP 2 tail: Store discarded companies**
   - Added SQL insert for all Stage 1 discards with `status: 'pre_filter_discard'`
   - Stores: name, phone, address, city, industry (from Outscraper), discard reason
   - URL: NULL (they have no website)
   - Prevents any re-evaluation of filtered-out companies

2. **STEP 3: Extend dedup to check name + URL**
   - Added name normalization (lowercase, strip suffixes like "Şti.", "A.Ş.")
   - Updated SQL to check BOTH normalized URL AND normalized name
   - Now catches companies like "CDC DEMİR ÇELİK" by name match
   - Result: Second search for same area skips already-seen companies, even without websites

**Commits:**
- f43d83d: fix: prospect-research SKILL.md v3.2 — add discard storage + name-based dedup

**Verification ready:** Run two searches "demir çelik ticareti" + "Kemalpaşa" to verify CDC is caught on second run.

---

## BLOCKERS

| Blocker | Impact | Resolution needed |
|---------|--------|-------------------|
| Outscraper API key not in `.env.local` | Can't test v3.2 discovery (Maps API endpoint) | Sign up at outscraper.com, get API key, add to `.env.local` as `OUTSCRAPER_API_KEY` |
| ✅ SKILL.md v3 async API bug | Discovery was returning Pending status forever | Fixed in session 4: Switched to correct POST /google-maps-search endpoint with proper JSON body, polling every 5s up to 60 minutes. (commit e61dbe4) |
| ✅ Dedup gaps (v3.1) | CDC DEMİR ÇELİK kept reappearing | Fixed in session 7: Added discard storage (STEP 2 tail) + name-based dedup (STEP 3) (commit f43d83d) |
| SKILL.md v3.2 not yet tested with real data | Don't know if dedup fix works end-to-end | Ready to test once API key available. Test: run "demir çelik ticareti" + "Kemalpaşa" twice, verify CDC caught on second run |

---

## OPEN DECISIONS

- **Orchestrator timing:** Build after prospect-research + company-lookup are tested (P3, not blocking)

## NEXT ACTION

When you open Claude Code next:

> **Priority 1: Get Outscraper API key & test prospect-research end-to-end**
> 1. Sign up at https://outscraper.com, get API key (free: 500 records/month)
> 2. Add to `.env.local`: `OUTSCRAPER_API_KEY=os-...`
> 3. Run prospect-research:
>    - Input: `{keyword: "tıbbi cihaz distributor", location: "Bornova", count: 5}` (test district support)
>    - Verify: prospects inserted with score, contact data, ai_opportunities
>    - Verify: email drafts are good tone (if not, refine)
>
> **Priority 2: Validate company-lookup with prospect-research data**
> - Once prospect-research populates DB with real data, test company-lookup queries
> - Verify Haiku parser works for Turkish/English natural language
> - Test all 7 verification cases from SKILL.md
>
> **Priority 3: Build followup-crm SKILL.md (P2)**
> - Depends on: prospect-research + company-lookup both validated
> - Functionality: status updates, follow-up scheduling, manual contact logging
>
> **Priority 4: Build orchestrator SKILL.md (P3, future)**
> - Design sketch complete in ORCHESTRATOR-SKETCH.md
> - Enables composite workflows: "research + telegram top 3"
> - Start after initial 2-3 skills validated

---

## PIPELINE STATUS (update as you get real prospects)

| Name | Company | Sector | Status | Next action |
|------|---------|--------|--------|-------------|
| [Friend's contact] | Demir-çelik trading | Metals | First audit scheduled | Record Netsis workflow |

---

## COSTS THIS SESSION

| Date | Task | Model | Approx cost |
|------|------|-------|-------------|
| 2026-03-15 | SKILL.md writing + doc updates | Sonnet | $0.02 |

**Monthly budget target:** Keep automated daily costs under $0.50/day (~$15/month)
