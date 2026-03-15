# STATE.md — ravna-workflows
**Rewrite this file at the end of every session. Do not append — replace.**
**Last updated:** 2026-03-15 (session 2)

---

## CURRENT STATUS

**Phase:** First Skill Implementation (prospect-research v2)
**Active skill:** prospect-research v2 (discovery + research combined)
**Overall system:** 1/8 skills code-complete (needs testing)

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

### Schema Updates ✅ (this session)
- [x] `prospect_status` enum: added `'discarded'` value
- [x] `prospects` table: added `search_keyword TEXT` column
- [x] `prospects` table: added `url UNIQUE` constraint
- [x] `prospects` table: added `idx_prospects_url` index
- [x] `.claude/settings.json`: created with `Bash(curl:*)` permission

### Skills
- [x] `prospect-research/SKILL.md` v2 — written (discovery + research combined)
- [x] `prospect-research/evals.json` — created with 3 test cases
- [ ] `prospect-research/SKILL.md` — tested with real data
- [ ] `prospect-research/SKILL.md` — email tone verified
- [ ] `followup-crm/SKILL.md` — written
- [ ] `newsletter-curator/SKILL.md` — written
- [ ] `orchestrator/SKILL.md` — written
- [ ] `consult-prep/SKILL.md` — written
- [ ] `curriculum-gen/SKILL.md` — written
- [ ] `client-onboarding/SKILL.md` — written
- [ ] `pipeline-intelligence/SKILL.md` — written

---

## LAST SESSION

**Date:** 2026-03-15
**What was done:**
- Updated schema.sql: added 'discarded' enum, search_keyword column, UNIQUE url constraint, url index
- Created .claude/settings.json with Bash(curl:*) permission
- Wrote .claude/skills/prospect-research/SKILL.md v2 with full 7-step flow (discovery, dedup, parallel research, scoring, email, insert, telegram)
- Created evals.json with 3 test cases
- Updated ARCHITECTURE.md with new input schema and discovery step
- Updated CLAUDE.md CURRENT FOCUS section with v2 description
- Updated .env.local with TELEGRAM_CHAT_ID=657474307

**Decisions made:**
- Input schema changed from `{business_name, url, city}` to `{keyword, city, count, industry?}` to enable full discovery pipeline
- Discovery uses 3 Brave searches, filters out directories/social/news sites
- count max=5 (10 Haiku agents) to prevent context overload and rate limit violations
- ALL companies inserted (cold_ready or discarded) to prevent re-discovery

**Problems hit:**
- None. Plan was comprehensive and implementation straightforward.

---

## BLOCKERS

| Blocker | Impact | Resolution needed |
|---------|--------|-------------------|
| Supabase schema not yet applied to live DB | Can't test SKILL.md until schema is live | Apply migration: ALTER TYPE prospect_status ADD 'discarded'; ALTER TABLE prospects ADD UNIQUE(url), etc. |
| SKILL.md not yet tested with real data | Don't know if Brave discovery actually works | Test with: keyword="tıbbi cihaz distributor", city="İstanbul", count=2 |

---

## OPEN DECISIONS

None at this time. Schema and SKILL.md design is finalized.

## NEXT ACTION

When you open Claude Code next:

> 1. Apply Supabase schema migrations:
>    - ALTER TYPE prospect_status ADD VALUE 'discarded';
>    - ALTER TABLE prospects ADD COLUMN search_keyword TEXT;
>    - ALTER TABLE prospects ADD UNIQUE(url);
>    - CREATE INDEX idx_prospects_url ON prospects(url);
>
> 2. Test prospect-research SKILL.md with real data:
>    - Input: { keyword: "tıbbi cihaz distributor", city: "İstanbul", count: 2 }
>    - Watch for: Discovery finds companies, dedup works, email draft is Turkish, Telegram notifies
>
> 3. Debug any failures and tune email tone if needed
>
> 4. Document results in evals.json

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
