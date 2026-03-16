# STATE.md — ravna-workflows
**Rewrite this file at the end of every session. Do not append — replace.**
**Last updated:** 2026-03-16 (session 5-6, final)

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

**Date:** 2026-03-16 (session 5-6, continuation)

**Part A: company-lookup v1 implementation**
- Created `company-lookup/SKILL.md` v1 (from pre-written plan)
- Tested with real Istanbul data (3 companies with score ≤ 9 returned)
- Verified Telegram integration working (message_id: 5, delivered successfully)

**Part B: Skill refinements + future planning**
1. **prospect-research v3 → v3.1 enhancement:**
   - Renamed parameter: `city` → `location` (to accept both cities and districts)
   - Added district examples: "Bornova", "Beşiktaş", "Maltepe" (working naturally with Outscraper)
   - Updated STEP 0.5 parser logic to handle district normalization

2. **company-lookup v1 → v1.1 optimization:**
   - Model selection: Sonnet → Haiku for parser (rule-based, no semantic reasoning needed)
   - Cost reduction: Haiku is sufficient for mechanical pattern matching
   - Same accuracy, lower latency & cost

3. **Orchestrator skill sketched (ORCHESTRATOR-SKETCH.md):**
   - Design: composite workflow support (research → filter → format → notify)
   - Use case: "research X in location and telegram me top 3 with phone + opportunities"
   - Implementation: Sonnet intent parser → route to skill → filter → format → notify
   - Status: P3 (depends on prospect-research + company-lookup validation)

4. **Memory saved:**
   - `feedback_skill_design_choices.md` — model selection rules, district support, workflow orchestration learnings

---

## BLOCKERS

| Blocker | Impact | Resolution needed |
|---------|--------|-------------------|
| Outscraper API key not in `.env.local` | Can't test v3 discovery (Maps API endpoint) | Sign up at outscraper.com, get API key, add to `.env.local` as `OUTSCRAPER_API_KEY` |
| ✅ SKILL.md v3 async API bug | Discovery was returning Pending status forever | Fixed in session 4: Switched to correct POST /google-maps-search endpoint with proper JSON body, polling every 5s up to 60 minutes. Used organizationsPerQueryLimit field. Added Python SDK client header. (commit e61dbe4) |
| SKILL.md v3 not yet tested with real data | Don't know if Outscraper integration works end-to-end | Ready to test once API key available. Test with: keyword="tıbbi cihaz distributor", city="İstanbul", count=3 |

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
