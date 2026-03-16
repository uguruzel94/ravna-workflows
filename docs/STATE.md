# STATE.md — ravna-workflows
**Rewrite this file at the end of every session. Do not append — replace.**
**Last updated:** 2026-03-15 (session 2)

---

## CURRENT STATUS

**Phase:** First Skill Implementation (prospect-research v3)
**Active skill:** prospect-research v3 (Outscraper + two-stage filtering + evidence-based ICP)
**Overall system:** 1/8 skills in development (v3 schema + SKILL.md complete, testing pending)

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
- [ ] `prospect-research/SKILL.md` v3 — tested with real data (Outscraper API key needed)
- [ ] `prospect-research/SKILL.md` v3 — email tone verified
- [ ] `followup-crm/SKILL.md` — written
- [ ] `newsletter-curator/SKILL.md` — written
- [ ] `orchestrator/SKILL.md` — written
- [ ] `consult-prep/SKILL.md` — written
- [ ] `curriculum-gen/SKILL.md` — written
- [ ] `client-onboarding/SKILL.md` — written
- [ ] `pipeline-intelligence/SKILL.md` — written

---

## LAST SESSION

**Date:** 2026-03-16
**What was done:**
- Created git branch `feature/prospect-research-v3`
- Updated `.claude/settings.json` with Playwright + Bash(*) + Supabase MCP permissions
- Applied Supabase migration: added `phone TEXT`, `address TEXT`, `email TEXT` columns to prospects table
- Completely rewrote `.claude/skills/prospect-research/SKILL.md` for v3:
  * Outscraper Google Maps API for discovery (replaces Brave Search)
  * Two-stage filtering: Stage 1 (Maps metadata pre-filter), Stage 2 (website scraping only for survivors)
  * Evidence-required ICP scoring rubric (each point needs proof)
  * Intent-driven category matching (replaces hardcoded rules)
  * Contact data extraction: phone (Maps) + address (Maps) + email (website)
  * Fixed Telegram formatting with jq + MarkdownV2
  * No hardcoded parallelism cap (default 10, user-controlled)

**Decisions confirmed:**
- Outscraper cost: ~$0.003/record, 50-record hard limit per run (~$0.15 max)
- Intent field lets clients describe ICP in plain language (no SKILL.md editing needed)
- Pre-filtering eliminates 40-60% of records before scraping (cost/time efficiency)
- Evidence-based scoring ensures quality > quantity (no more all-10 scores)
- MarkdownV2 escaping in Telegram via jq (fixes newline collapse bug)

**Problems encountered:**
- None. v3 design was pre-approved; implementation straightforward.

---

## BLOCKERS

| Blocker | Impact | Resolution needed |
|---------|--------|-------------------|
| Outscraper API key not in `.env.local` | Can't test v3 discovery (Maps API endpoint) | Sign up at outscraper.com, get API key, add to `.env.local` as `OUTSCRAPER_API_KEY` |
| SKILL.md v3 not yet tested with real data | Don't know if Outscraper integration works end-to-end | Test with: keyword="tıbbi cihaz distributor", city="İstanbul", count=3 |

---

## OPEN DECISIONS

None at this time. Schema and SKILL.md design is finalized.

## NEXT ACTION

When you open Claude Code next:

> 1. Get Outscraper API key:
>    - Sign up at https://outscraper.com
>    - Create API key (free tier: 500 records/month)
>    - Add to `.env.local`: `OUTSCRAPER_API_KEY=os-...`
>
> 2. Test prospect-research SKILL.md v3 with real data:
>    - Input: { keyword: "tıbbi cihaz distributor", city: "İstanbul", count: 3, intent: "Tıbbi cihaz distribütörleri, hastanelere satış. Dişçi, eczane değil." }
>    - Watch for: Maps discovery works, pre-filtering eliminates non-matches, website scraping extracts email, ICP scores vary, Telegram formatted correctly
>
> 3. Verify contact data (phone, address, email) in Supabase inserts
>
> 4. Tune email tone if needed and document in evals.json

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
