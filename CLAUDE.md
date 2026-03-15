# CLAUDE.md — ravna-workflows
**Last updated:** March 2026
**Read this at the start of every session, before doing anything.**
**Keep this file under 500 lines. Edit ruthlessly, don't append endlessly.**

---

## WHO I AM

**Ugur Üzel** — Fractional CAIO (Chief AI Officer), founder of Ravna.
- MSc Biology, ODTÜ — neuroscience, neurochemistry, molecular biology. Research-grade analytical thinking.
- Programming since middle school. Comfortable in Claude Code, MCPs, agents, Python, shell.
- Tools I use daily: Claude Code CLI, Claude.ai (Projects), Perplexity, Gemini ecosystem.
- Work style: embedded and hands-on. I go to client offices for 1-2 weeks. I build real things, not recommendations.
- Public presence: none by choice. No LinkedIn playbook. My outreach is cold email → WhatsApp → phone.
- Location: Manisa / İzmir, Turkey. Market: Turkey-first, international later.

---

## WHAT RAVNA IS

**Positioning:** "Şirketinizin yarı-zamanlı yapay zeka direktörü." — I become the AI function inside a company. Embedded. Hands-on. Then I hand everything over and they own it.

**This is not:** a course, a SaaS tool, a bot vendor, a freelance dev shop.

**Target clients (ICP):**
- Primary: Healthcare-adjacent Turkish SMBs — medical device distributors, genetic/clinical labs, CROs, occupational health clinics, private clinic management companies
- Secondary: Professional services — accounting firms (muhasebe), law offices, insurance agencies
- Profile: 5-50 person companies, owner-operated, documentation-heavy, no AI usage yet

**Service tiers:**
- Tier 1: AI Readiness Audit — ₺10,000–18,000 (free for first 2-3 engagements → case studies)
- Tier 2: Embedded AI Program (2-3 days) — ₺40,000–70,000
- Tier 3: Monthly Advisory Retainer — ₺8,000–15,000/month

**First real engagement:** Demir-çelik trading company (owner's friend). 3-person team. Pain points: lead gen, price tracking, Netsis invoice automation. See `docs/engagements/demir-celik-plan.md`.

**Revenue goal:** First paid client by month 2-3 of operations.

---

## WHAT THIS REPO IS

`ravna-workflows` is the agentic backend of Ravna's business operations. It automates:
- Lead generation and prospect research (finding and qualifying clients)
- Follow-up and CRM (managing the sales pipeline)
- Newsletter curation (weekly Turkish AI newsletter)
- Consultation prep (automated call briefs before prospect meetings)
- Curriculum generation (custom training plans for clients)
- Client onboarding (automated welcome + kickoff when a deal closes)
- Pipeline intelligence (weekly analysis of what's working)

**Architecture:** 3-layer agent system.
- Layer 0: Daily Orchestrator (single entry point, routes to skills)
- Layer 1: 7 Skills (independently invokable domain agents)
- Layer 2: Pipeline Intelligence (weekly strategic reflection)

**Full architecture reference:** `docs/ARCHITECTURE.md`
**Visual diagram:** `docs/architecture-v3.jsx`

---

## TECH STACK

### Claude Code Models
- **Sonnet** — all reasoning, analysis, drafting, decision-making
- **Haiku** — all mechanical work: scraping, filtering, scoring, parallel sub-tasks
- **Never Opus in automation** — too slow, too expensive for scheduled tasks

### MCPs (installed in Claude Code)
| MCP | Purpose |
|-----|---------|
| `supabase/mcp-server-supabase` | All database reads/writes |
| `@modelcontextprotocol/server-brave-search` | Live web research |
| `@modelcontextprotocol/server-puppeteer` | Website scraping |
| `@modelcontextprotocol/server-filesystem` | Read/write local files (briefs, newsletters, curricula) |

### External Integrations (via Bash/curl)
| Service | Purpose | Auth |
|---------|---------|------|
| Telegram Bot API | All human-in-the-loop approvals + notifications | `TELEGRAM_BOT_TOKEN` |
| Resend API | Cold outreach emails, newsletters, client emails | `RESEND_API_KEY` |

### Database
- **Supabase** — PostgreSQL. 8 tables: prospects, interactions, clients, project_milestones, newsletter_issues, subscribers, curriculum_modules, client_curricula, pipeline_reports
- Schema: `supabase/schema.sql`

### Environment variables
Stored in `.env.local` (never committed):
```
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
RESEND_API_KEY=
SUPABASE_URL=
SUPABASE_KEY=
BRAVE_SEARCH_API_KEY=
```

### Plugins
- **Claude Code Superpowers** (official plugin) — check what commands and tools this adds before starting a new task. Run the plugin's help command to see what's available.

---

## SKILL LOCATIONS

All skills live in `.claude/skills/`. Each skill is a SKILL.md file with natural language instructions.

| Skill | Path | Status | Priority |
|-------|------|--------|----------|
| Prospect Research | `.claude/skills/prospect-research/SKILL.md` | 🔨 BUILD FIRST | P1 |
| Follow-up / CRM | `.claude/skills/followup-crm/SKILL.md` | ⏳ Pending | P2 |
| Newsletter Curator | `.claude/skills/newsletter-curator/SKILL.md` | ⏳ Pending | P2 |
| Daily Orchestrator | `.claude/skills/orchestrator/SKILL.md` | ⏳ Pending | P3 |
| Consultation Prep | `.claude/skills/consult-prep/SKILL.md` | ⏳ Pending | P3 |
| Curriculum Generator | `.claude/skills/curriculum-gen/SKILL.md` | ⏳ Pending | P4 |
| Client Onboarding | `.claude/skills/client-onboarding/SKILL.md` | ⏳ Pending | P5 |
| Pipeline Intelligence | `.claude/skills/pipeline-intelligence/SKILL.md` | ⏳ Pending | P6 |

---

## WORKING CONVENTIONS

### How I work with Claude Code
- **Known/repeating tasks** (running a skill, processing leads, building a SKILL.md I've already designed) → Direct execution. Don't plan, just build.
- **New/complex tasks** (new skill architecture, a client engagement tool I haven't scoped) → Context first, plan together, then execute step by step.
- I prefer to see what's being built before it's built when it matters. Ask if unsure.

### Subagent patterns
- Mechanical parallel work (scraping, filtering, scoring) → Haiku subagents, run in parallel
- Sequential reasoning → Single Sonnet call
- Long documents needing fresh review → Writer Sonnet → Editor Sonnet (separate context)
- Never nest subagents more than 1 level deep unless absolutely necessary

### Naming conventions
- SKILL.md files: UPPERCASE, in their own folder
- Data outputs: `[entity]-[date].md` e.g. `acme-corp-2026-03-12.md`
- Session logs: `sessions/session-[YYYY-MM-DD].md`
- Git commits: `feat:`, `fix:`, `test:`, `docs:`, `refactor:` prefixes

### Turkish copy rules (for email drafts, newsletter, reports)
- Always formal "Siz" — never "Sen"
- Short sentences. No filler words.
- Avoid: eşsiz, güçlü, yenilikçi, çözüm odaklı (Turkish biz-speak clichés)
- Use concrete verbs: azaltır, kurtarır, inşa eder, gösterir

---

## PROGRESS TRACKING SYSTEM

Three layers, each serving a different purpose:

### 1. STATE.md (always current — read/write each session)
`docs/STATE.md` — Rolling file. Answers: where are we, what was last done, what's next, what's blocked. Rewrite (not append) at end of every session.

### 2. Session logs (append-only history)
`docs/sessions/session-[YYYY-MM-DD].md` — Created each session. What was built, decisions made, what changed. Short — max 30 lines. Use the template in `docs/SESSION-TEMPLATE.md`.

### 3. Git commits (canonical trail)
Every completed unit of work gets a commit. Message format:
```
feat: prospect-research SKILL.md v1 — Haiku parallel scrape + Sonnet analysis

What: First version of prospect-research skill. 2x Haiku subagents (puppeteer + brave search in parallel), Sonnet analysis + ICP scoring, Turkish cold email draft, Supabase insert.
Status: Tested with 3 URLs, working. Pending: tune email tone.
```

**Rule:** At the end of every session, before closing Claude Code:
1. Update `docs/STATE.md`
2. Write `docs/sessions/session-[today].md`
3. Commit everything with a descriptive message

---

## CURRENT FOCUS

**Active build: `prospect-research/SKILL.md` v2 — Discovery + Research Combined**

What it does:
- Input: `{ keyword, city, count, industry? }` (discovers companies, not pre-given)
- **Discovery:** 3 Brave searches find matching company websites in city/sector
- **Dedup:** Query DB for existing URLs (prevents re-research)
- **Research:** For each company, 2 Haiku subagents parallel (Puppeteer scrape + Brave search)
- **Scoring:** Sonnet identifies 3 AI opportunities, scores ICP fit 1-10 (Turkish SMB profile)
- **Email:** Sonnet drafts Turkish cold email (formal "Siz", no clichés)
- **Insert:** ALL companies stored (cold_ready or discarded)
- **Telegram:** Summary notification sent
- Output: N prospects in DB, drafts staged for approval

**Test set:** `keyword: "tıbbi cihaz distributor", city: "İstanbul", count: 2` (real test).

**Why this first:** Discovery is the constraint. Ravna must FIND prospects, not just evaluate given ones. This skill fills the pipeline from zero.

---

## KEY FILES REFERENCE

| File | What it is |
|------|-----------|
| `CLAUDE.md` | This file. Session context. |
| `docs/STATE.md` | Current status, last action, next action, blockers |
| `docs/ARCHITECTURE.md` | Full system architecture, layer descriptions, build sequence |
| `docs/architecture-v3.jsx` | Visual React diagram of the 3-layer system |
| `docs/sessions/` | Session logs (one per work session) |
| `docs/engagements/` | Client-specific audit and engagement plans |
| `supabase/schema.sql` | Full DB schema to set up Supabase tables |
| `.env.local` | API keys (not committed) |
| `.claude/skills/` | All SKILL.md agent files |
| `data/` | Runtime outputs: briefs, newsletters, curricula, reports |

---

## CONSTRAINTS & REMINDERS

- Keep CLAUDE.md under 500 lines. If it grows, prune — don't append.
- Never commit `.env.local` or any file with API keys.
- Subagents cost money. Test with 2-3 real inputs before any automated loop.
- The Telegram bot is the human-in-the-loop layer. Nothing emails a client without owner approval.
- If a skill touches Resend (sends emails), always include an approval step via Telegram first.
- Turkish prospect emails must be reviewed by Ugur before sending. Always.
