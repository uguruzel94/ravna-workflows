# STATE.md — ravna-workflows
**Rewrite this file at the end of every session. Do not append — replace.**
**Last updated:** 2026-03-16 (session 4)

---

## CURRENT STATUS

**Phase:** Reading Skills Implementation (prospect-research v3 + company-lookup v1)
**Active skill:** company-lookup v1 (natural language query parser + Supabase filter builder)
**Overall system:** 2/8 skills written (prospect-research v3, company-lookup v1; testing pending)

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
- [x] `prospect-research/SKILL.md` v2 — written (discovery + research combined)
- [x] `prospect-research/SKILL.md` v3 — written (Outscraper + two-stage filtering + evidence-based ICP)
- [x] `prospect-research/evals.json` — created with 3 test cases
- [x] `company-lookup/SKILL.md` v1 — written (natural language parser + Supabase query builder)
- [ ] `prospect-research/SKILL.md` v3 — tested with real data (Outscraper API key needed)
- [ ] `prospect-research/SKILL.md` v3 — email tone verified
- [ ] `company-lookup/SKILL.md` v1 — tested with real data (Supabase queries)
- [ ] `followup-crm/SKILL.md` — written
- [ ] `newsletter-curator/SKILL.md` — written
- [ ] `orchestrator/SKILL.md` — written
- [ ] `consult-prep/SKILL.md` — written
- [ ] `curriculum-gen/SKILL.md` — written
- [ ] `client-onboarding/SKILL.md` — written
- [ ] `pipeline-intelligence/SKILL.md` — written

---

## LAST SESSION

**Date:** 2026-03-16 (session 5)
**What was done:**
- Created `company-lookup/SKILL.md` v1 (from pre-written plan):
  * Step 1: Natural language parser (Sonnet) converts queries → structured filter JSON
  * Step 2: Build + execute Supabase PostgREST queries with proper operator mapping
  * Step 3: Format results (summary/detailed modes, Turkish & English output)
  * Step 4: Optional Telegram notifications
  * Aggregate query support (COUNT, AVG, GROUP BY)
  * 7 verification tests included
  * Full schema reference and troubleshooting guide
- Updated STATE.md to reflect company-lookup completion
- Ready to test with real Supabase queries

**Key features of company-lookup:**
- Reads existing prospects from DB (prospect-research fills it)
- Filters on: score, city, industry, status, date windows, company name
- Turkish natural language support: "henüz ulaşmadığımız", "geçen hafta", "skor 9+", etc.
- Aggregate queries: "how many prospects?", "average score by city?"
- Display modes: summary (list), detailed (single company), aggregate (statistics)

---

## BLOCKERS

| Blocker | Impact | Resolution needed |
|---------|--------|-------------------|
| Outscraper API key not in `.env.local` | Can't test v3 discovery (Maps API endpoint) | Sign up at outscraper.com, get API key, add to `.env.local` as `OUTSCRAPER_API_KEY` |
| ✅ SKILL.md v3 async API bug | Discovery was returning Pending status forever | Fixed in session 4: Switched to correct POST /google-maps-search endpoint with proper JSON body, polling every 5s up to 60 minutes. Used organizationsPerQueryLimit field. Added Python SDK client header. (commit e61dbe4) |
| SKILL.md v3 not yet tested with real data | Don't know if Outscraper integration works end-to-end | Ready to test once API key available. Test with: keyword="tıbbi cihaz distributor", city="İstanbul", count=3 |

---

## OPEN DECISIONS

None at this time. Schema and SKILL.md design is finalized.

## NEXT ACTION

When you open Claude Code next:

> **Priority 1: Test prospect-research → company-lookup end-to-end**
> 1. Get Outscraper API key (if not already done):
>    - Sign up at https://outscraper.com
>    - Create API key (free tier: 500 records/month)
>    - Add to `.env.local`: `OUTSCRAPER_API_KEY=os-...`
>
> 2. Run prospect-research with real data:
>    - Input: { keyword: "tıbbi cihaz distributor", city: "İstanbul", count: 3 }
>    - Verify: prospects inserted into Supabase with score, contact data, ai_opportunities
>
> 3. Run company-lookup with test queries:
>    - "show me all companies with score above 8 in istanbul"
>    - "bana geçen hafta bulunan ilaç şirketlerini göster"
>    - "haven't contacted yet"
>    - "tell me about Terra İlaç" (detailed mode)
>    - "how many prospects do we have?" (aggregate)
>
> 4. Tune email tone in prospect-research if needed
>
> **Priority 2: Build followup-crm SKILL.md (P2)**
> - Depends on: prospect-research working + company-lookup validated
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
| 2026-03-15 | SKILL.md writing + doc updates | Sonnet | $0.02 |

**Monthly budget target:** Keep automated daily costs under $0.50/day (~$15/month)
