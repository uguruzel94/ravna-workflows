# Ravna Architecture Map — Repository Structure

**Last updated:** March 7, 2026
**System version:** v3 (3-layer agent system with Claude Code + MCPs)
**Status:** Design & Build Phase

---

## 📦 Project Structure

```
ravna/
│
├── .claude/
│   ├── claude.md                    # Environment, MCPs, shared instructions
│   ├── settings.json                # Claude Code settings, permissions
│   └── skills/
│       │
│       ├── orchestrator/
│       │   ├── SKILL.md             # Daily Orchestrator agent (8am cron)
│       │   └── config.json          # (no inputs — runs on fixed schedule)
│       │
│       ├── prospect-research/
│       │   ├── SKILL.md             # Prospect Research agent + 2× Haiku subagents
│       │   └── config.json          # Input schema: { business_name, url, city }
│       │
│       ├── followup-crm/
│       │   ├── SKILL.md             # Follow-up / CRM agent
│       │   └── config.json          # (no inputs — triggered by orchestrator)
│       │
│       ├── newsletter-curator/
│       │   ├── SKILL.md             # Newsletter Curator + Haiku filter + Sonnet editor
│       │   └── config.json          # (no inputs — triggered by orchestrator on Monday)
│       │
│       ├── consult-prep/
│       │   ├── SKILL.md             # Consultation Prep + 2× parallel Haiku research
│       │   └── config.json          # Input schema: { prospect_id, call_date }
│       │
│       ├── curriculum-gen/
│       │   ├── SKILL.md             # Curriculum Generator agent
│       │   └── config.json          # Input schema: { client_id }
│       │
│       ├── client-onboarding/
│       │   ├── SKILL.md             # Client Onboarding agent
│       │   └── config.json          # Input schema: { prospect_id, tier, fee_try }
│       │
│       └── pipeline-intelligence/
│           ├── SKILL.md             # Pipeline Intelligence agent (Sunday 20:00 cron)
│           └── config.json          # (no inputs — runs on fixed schedule)
│
├── /data/
│   ├── /newsletters/
│   │   ├── draft-2026-W10.html
│   │   ├── draft-2026-W11.html
│   │   └── ...
│   │
│   ├── /briefs/
│   │   ├── acme-corp-2026-03-07.md
│   │   ├── digitalnomad-agency-2026-03-06.md
│   │   └── ...
│   │
│   ├── /curricula/
│   │   ├── acme-corp-program.md
│   │   ├── digitalnomad-agency-program.md
│   │   └── ...
│   │
│   └── /reports/
│       ├── week-10.md               # Pipeline Intelligence output
│       ├── week-11.md
│       └── ...
│
├── .env.local
│   ├── TELEGRAM_BOT_TOKEN=...
│   ├── RESEND_API_KEY=...
│   ├── SUPABASE_URL=...
│   ├── SUPABASE_KEY=...
│   └── BRAVE_SEARCH_API_KEY=...
│
├── README.md                        # This file's sibling — overview + quick start
├── ARCHITECTURE.md                  # This file — detailed structure
└── SKILL-MANIFEST.md                # (Optional) Catalog of all skills + dependencies

```

---

## 🧠 Layer 0: Orchestrator

**Single entry point for all daily automation.**

```
Layer 0: Orchestrator
└── Daily Orchestrator (scheduled 08:00)
    ├── [Sonnet] Fetch today's context from Supabase
    ├── [Sonnet] Route decision: what needs to run today?
    ├── [IF follow-ups due] → Invoke followup-crm/ skill
    ├── [IF new prospects queued] → Invoke prospect-research/ skill
    ├── [IF Monday] → Invoke newsletter-curator/ skill
    ├── [Sonnet] Compile all outputs into morning brief
    └── [Telegram API] Send single Telegram digest
```

**Why this layer exists:**
- Replaces 3 separate scheduled tasks (CRM, Prospect, Newsletter)
- One thing to debug instead of three
- Context-aware routing: doesn't blindly run crons
- One Telegram notification instead of three interruptions

**When to trigger:**
- Scheduled: Daily at 08:00 (configurable)
- Manual: Can run on-demand anytime for ad-hoc batches

**Key dependencies:**
- Supabase (read: prospects, interactions, newsletter schedule)
- Telegram Bot API (write: morning digest)
- Subagent invocations (to skills below)

---

## ⚙️ Layer 1: Skills (Domain-Specific Agents)

**Six independently-invokable skills. Orchestrator invokes them, or you can run manually.**

### P1: Prospect Research Agent
```
prospect-research/
├── SKILL.md
│   ├── Input: { keyword, city, count, industry? }
│   ├── Flow:
│   │   ├── [STEP 0] Discovery: [Haiku] 3 Brave searches → find company URLs
│   │   ├── [STEP 1] Dedup: [SQL] Check DB for existing URLs (normalized)
│   │   ├── [STEP 2] Parallel Research: For each company:
│   │   │   ├── [Haiku subagent A] Puppeteer scrape website
│   │   │   └── [Haiku subagent B] Brave search + industry research — PARALLEL
│   │   ├── [STEP 3] Analysis & Scoring: [Sonnet per company] Identify 3 AI opportunities + ICP score
│   │   ├── [STEP 4] Email Draft: [Sonnet per qualifying company] Turkish cold email (score ≥6)
│   │   ├── [STEP 5] Insert: [Supabase] Store ALL evaluated companies (cold_ready + discarded)
│   │   └── [STEP 6] Telegram: Send summary notification
│   └── Output: N prospects in DB (cold_ready or discarded), cold email drafts staged
└── config.json
```

**Run as:** Manual (from CLI) OR triggered by Orchestrator
**Cost:** ~$0.30–0.60 per batch of 5 (1× Haiku discovery, 10× Haiku research parallel, 5× Sonnet analysis)
**Build time:** 2–3 days
**Key insight:** Discovery + research combined in one pass. Parallel Haiku research agents handle website + Brave search in parallel, cutting time in half.
**Input schema:** `{ keyword: "tıbbi cihaz", city: "İstanbul", count: 3, industry?: "healthcare" }`
**count limit:** Max 5 (spawns 10 Haiku agents). Higher counts spawn sequentially in batches.

---

### P2: Follow-up / CRM Agent
```
followup-crm/
├── SKILL.md
│   ├── Input: None (triggered by Orchestrator or manually)
│   ├── Flow:
│   │   ├── [Supabase] Query prospects due for follow-up today
│   │   ├── [Sonnet] For each: determine stage, draft appropriate message
│   │   ├── [Supabase] Stage drafts in pending_approval status
│   │   └── [Telegram API] Send drafts to you for approval
│   └── Output: Follow-up drafts staged for approval
└── config.json
```

**Run as:** Triggered by Orchestrator (daily 08:00) OR manual
**Cost:** ~$0.10–0.25 per day (depends on # due)
**Build time:** 1–2 days
**Note:** Runs inside Orchestrator session (no separate cost)

---

### P2: Newsletter Curator
```
newsletter-curator/
├── SKILL.md
│   ├── Input: None (triggered by Orchestrator on Mondays)
│   ├── Flow:
│   │   ├── [Brave Search] 6 targeted queries (AI news, Turkish tech, etc.)
│   │   ├── [Haiku subagent] Score articles for relevance → keep top 5–7
│   │   ├── [Puppeteer] Scrape full content
│   │   ├── [Sonnet] Write Turkish summaries + intro
│   │   ├── [Sonnet subagent] Fresh-context editor review
│   │   ├── [Sonnet] Apply feedback, final draft
│   │   ├── [File system] Write to /data/newsletters/draft-YYYY-WW.html
│   │   └── [Supabase] Create newsletter_issues record, status: pending_approval
│   └── Output: Reviewed newsletter draft staged for approval
└── config.json
```

**Run as:** Triggered by Orchestrator (Monday only) OR manual
**Cost:** ~$0.05/day (amortized weekly)
**Build time:** 2–3 days
**Key insight:** Writer/editor pattern (second fresh context) produces best output

---

### P3: Consultation Prep Agent
```
consult-prep/
├── SKILL.md
│   ├── Input: { prospect_id, call_date }
│   ├── Flow:
│   │   ├── [Supabase] Fetch prospect record + interaction history
│   │   ├── [Haiku subagent] Industry research (AI adoption, trends) — PARALLEL
│   │   ├── [Haiku subagent] Competitor scrape (assess tech sophistication) — PARALLEL
│   │   ├── [Sonnet] Receive both, synthesize → AI opportunities mapped to processes
│   │   ├── [Sonnet] Generate 3 ROI scenarios (conservative/realistic/optimistic) in TRY
│   │   ├── [Sonnet] Draft call brief: opening, 5 questions, top 3 objections + responses
│   │   ├── [File system] Write to /data/briefs/[prospect]-[date].md
│   │   └── [Telegram API] Send formatted brief immediately
│   └── Output: One-page call brief with opportunities, ROI, talking points
└── config.json
```

**Run as:** Manual (you trigger before a call)
**Cost:** ~$0.10 per call (2× Haiku parallel + 1× Sonnet)
**Build time:** 2–3 days
**Key insight:** Parallel research subagents cut prep time in half

---

### P4: Curriculum Generator
```
curriculum-gen/
├── SKILL.md
│   ├── Input: { client_id }
│   ├── Flow:
│   │   ├── [Supabase] Fetch client record (industry, tier, goals) + curriculum_modules library
│   │   ├── [Sonnet] Select and sequence relevant modules
│   │   ├── [Sonnet] Generate session plans (objectives, exercises, tools to install)
│   │   ├── [Sonnet] Generate tool setup checklist specific to their stack
│   │   ├── [Sonnet] Draft recommended Claude skills + MCP config for post-program
│   │   ├── [File system] Write to /data/curricula/[client]-program.md
│   │   └── [Supabase] Insert client_curricula record
│   └── Output: Customized multi-day training plan + setup checklist
└── config.json
```

**Run as:** Manual (after audit completed, before engagement starts)
**Cost:** ~$0.10 per engagement (1× Sonnet)
**Build time:** 2–3 days
**Prerequisite:** curriculum_modules table seeded (15–20 base modules)

---

### P5: Client Onboarding Agent
```
client-onboarding/
├── SKILL.md
│   ├── Input: { prospect_id, tier, fee_try }
│   ├── Flow:
│   │   ├── [Supabase] INSERT client record, set status: active
│   │   ├── [Supabase] INSERT project_milestones from tier template
│   │   ├── [Shell exec] Trigger curriculum-gen skill with client_id
│   │   ├── [Sonnet] Draft personalized welcome email
│   │   ├── [Resend API] Send welcome email
│   │   ├── [Sonnet] Generate your prep checklist
│   │   └── [Telegram API] Send checklist + key dates
│   └── Output: Active client in DB + curriculum queued + welcome sent
└── config.json
```

**Run as:** Manual (when contract is signed)
**Cost:** ~$0.10 per client (1× Sonnet + triggered curriculum-gen)
**Build time:** 1 day
**Note:** Build last — only needed at first signed deal

---

## 📡 Layer 2: Intelligence

**Strategic reflection agent. Weekly review of what's working.**

```
Layer 2: Intelligence
└── Pipeline Intelligence Agent (scheduled Sunday 20:00)
    ├── [Supabase] Pull week's data: prospects added, emails sent, replies, stages moved, deals closed
    ├── [Sonnet] Conversion rates by sector, city, email angle
    ├── [Sonnet] Pattern recognition: which angles work? Which sectors stalled?
    ├── [Brave Search] Check latest AI developments relevant to your targets
    ├── [Sonnet] Generate 3–5 tactical recommendations for next week
    ├── [File system] Write to /data/reports/week-[N].md
    ├── [Supabase] INSERT pipeline_reports record
    └── [Telegram API] Send Sunday evening brief
```

**Why this layer exists:**
- Your skills execute tasks; but nothing was making the system *learn*
- Pipeline Intelligence closes that loop
- Highest strategic ROI of everything here (minimal cost, maximum insight)

**When to run:**
- Scheduled: Sunday 20:00 (so you read it before Monday morning)
- Manual: Can run anytime to get a fresh analysis

**Key dependencies:**
- Supabase (read: all interactions, prospects, closed deals)
- Brave Search (live market research)

---

## 🗄️ Database Schema (Supabase)

```
supabase/
│
├── prospects
│   ├── id (uuid, primary key)
│   ├── name (text)
│   ├── url (text)
│   ├── industry (text)
│   ├── city (text)
│   ├── ai_opportunities (jsonb)     # [{ opportunity, process, hours_saved }]
│   ├── email_draft (text)
│   ├── score (int)                  # ICP fit 1–10
│   ├── status (enum: cold_sent, replied, audited, proposal_sent, won, lost, paused)
│   ├── next_follow_up (timestamp)
│   ├── created_at (timestamp)
│   └── updated_at (timestamp)
│
├── interactions
│   ├── id (uuid, primary key)
│   ├── prospect_id (uuid, foreign key → prospects)
│   ├── type (enum: cold_email, reply, call, audit, proposal_sent)
│   ├── notes (text)
│   ├── sent_at (timestamp)
│   └── created_at (timestamp)
│
├── clients
│   ├── id (uuid, primary key)
│   ├── prospect_id (uuid, foreign key → prospects)
│   ├── tier (enum: audit, program, advisory)
│   ├── start_date (timestamp)
│   ├── status (enum: active, on_hold, completed, paused)
│   ├── monthly_fee_try (int)        # TRY
│   ├── contract_date (timestamp)
│   └── updated_at (timestamp)
│
├── project_milestones
│   ├── id (uuid, primary key)
│   ├── client_id (uuid, foreign key → clients)
│   ├── name (text)                  # e.g., "Day 1 kickoff", "Pre-training setup"
│   ├── due_date (timestamp)
│   ├── status (enum: pending, in_progress, completed)
│   └── created_at (timestamp)
│
├── newsletter_issues
│   ├── id (uuid, primary key)
│   ├── issue_number (int)
│   ├── html_content (text)
│   ├── status (enum: draft, pending_approval, sent, archived)
│   ├── sent_at (timestamp)
│   └── created_at (timestamp)
│
├── subscribers
│   ├── id (uuid, primary key)
│   ├── email (text, unique)
│   ├── name (text)
│   ├── source (enum: newsletter_signup, client, lead)
│   ├── subscribed_at (timestamp)
│   ├── status (enum: active, unsubscribed)
│   └── updated_at (timestamp)
│
├── curriculum_modules
│   ├── id (uuid, primary key)
│   ├── module_name (text)           # e.g., "LLM Fundamentals", "Prompt Engineering"
│   ├── content (jsonb)              # { description, duration_mins, topics[], exercises[] }
│   ├── tags (text[])                # e.g., ["beginner", "fundamentals", "all-tiers"]
│   ├── level (enum: beginner, intermediate, advanced)
│   ├── duration_mins (int)
│   └── created_at (timestamp)
│
├── client_curricula
│   ├── id (uuid, primary key)
│   ├── client_id (uuid, foreign key → clients)
│   ├── modules (jsonb)              # Selected modules + sequence
│   ├── file_path (text)             # /data/curricula/[client]-program.md
│   ├── generated_at (timestamp)
│   └── updated_at (timestamp)
│
└── pipeline_reports
    ├── id (uuid, primary key)
    ├── week_number (int)
    ├── report_content (text)        # Full markdown report
    ├── file_path (text)             # /data/reports/week-[N].md
    ├── generated_at (timestamp)
    └── updated_at (timestamp)
```

---

## 🔌 MCPs & External Tools

```
MCPs (Model Context Protocol Servers)
│
├── supabase/mcp-server-supabase
│   ├── Purpose: Database reads/writes for all skills
│   ├── Tools: query(), insert(), update(), delete()
│   └── Auth: SUPABASE_URL + SUPABASE_KEY in .env
│
├── @modelcontextprotocol/server-brave-search
│   ├── Purpose: Live web search for research agents
│   ├── Tools: search()
│   └── Auth: BRAVE_SEARCH_API_KEY in .env
│
├── @modelcontextprotocol/server-puppeteer
│   ├── Purpose: Website scraping (Prospect Research, Consultation Prep)
│   ├── Tools: navigate(), screenshot(), click(), type()
│   └── No auth needed (local browser automation)
│
├── @modelcontextprotocol/server-filesystem
│   ├── Purpose: Read/write local files (newsletters, briefs, curricula, reports)
│   ├── Tools: read(), write(), delete()
│   └── No auth needed (local file access)
│
└── Custom HTTP Integrations (via Bash)
    ├── Telegram Bot API
    │   ├── Purpose: All human-in-the-loop approvals + notifications
    │   ├── Endpoint: https://api.telegram.org/bot{TOKEN}/sendMessage
    │   └── Auth: TELEGRAM_BOT_TOKEN in .env
    │
    └── Resend Email API
        ├── Purpose: Send cold outreach, newsletters, client emails
        ├── Endpoint: https://api.resend.com/emails
        └── Auth: RESEND_API_KEY in .env
```

---

## 📋 Build Sequence (Priority Order)

### Week 1–2: Infrastructure Setup
1. Install MCPs in Claude Code
   ```bash
   mcp add supabase/mcp-server-supabase
   mcp add @modelcontextprotocol/server-brave-search
   mcp add @modelcontextprotocol/server-puppeteer
   mcp add @modelcontextprotocol/server-filesystem
   ```

2. Create Supabase tables (schema above)
3. Seed curriculum_modules table (15–20 base entries)
4. Set environment variables (.env.local)
5. Create Telegram Bot (via BotFather) + Resend account

### Week 2–3: P1 — Prospect Research
- Build `prospect-research/SKILL.md` with Haiku scraper subagents
- Test with 5–10 real business URLs from your warm leads' networks
- Refine Turkish email drafting

### Week 3: P2 — Follow-up CRM
- Build `followup-crm/SKILL.md`
- Test with staged prospects in DB
- Set up Telegram approval loop

### Week 3–4: P2 — Newsletter Curator
- Build `newsletter-curator/SKILL.md` with Haiku filter + Sonnet editor
- Create first 2–3 newsletter drafts manually to tune
- Set up Monday cron (or manual trigger for testing)

### Week 4: P3 — Daily Orchestrator
- Build `orchestrator/SKILL.md` that wires P1 + P2a + P2b
- Test with mock data
- Schedule for 08:00 daily

### Week 5: P3 — Consultation Prep
- Build `consult-prep/SKILL.md` with 2× parallel Haiku research subagents
- Refine ROI scenario generation for Turkish market

### Week 5: P4 — Curriculum Generator
- Build `curriculum-gen/SKILL.md`
- Finalize curriculum_modules library (15–20 base modules)

### Week 6: P5 — Client Onboarding
- Build `client-onboarding/SKILL.md`
- Test with mock client signup

### Week 7+: P6 — Pipeline Intelligence
- Build `pipeline-intelligence/SKILL.md`
- Schedule for Sunday 20:00
- Let it run for 2–3 weeks before interpreting recommendations

---

## 💰 Cost Breakdown

| Component | Model | Frequency | Est. Cost |
|-----------|-------|-----------|-----------|
| Daily Orchestrator | Sonnet | 1× daily | $0.02–0.05 |
| Prospect Research | Haiku×2 + Sonnet | 2–3/day | $0.05–0.15 |
| Follow-up CRM | Sonnet | 1× daily | $0.10–0.25 |
| Newsletter Curator | Haiku + Sonnet×2 | 1× weekly | $0.05/day avg |
| Consult Prep | Haiku×2 + Sonnet | Manual, 2–3/week | $0.10–0.30/call |
| Curriculum Gen | Sonnet | Manual, 1× per client | $0.10 |
| Client Onboarding | Sonnet | Manual, once per client | $0.10 |
| Pipeline Intelligence | Sonnet | 1× weekly | $0.03/day avg |
| **Total Daily (automated)** | — | — | **~$0.25–0.50** |
| **Total Monthly (automated)** | — | — | **~$8–15** |

---

## 🚀 Running the System

### Manual Skill Invocation
```bash
# Run a single skill
claude --skill prospect-research -- '{"business_name": "Acme Digital", "url": "acme.com", "city": "İzmir"}'

# Run with explicit model
claude --skill consult-prep --model sonnet -- '{"prospect_id": "uuid-123", "call_date": "2026-03-10"}'
```

### Scheduled Tasks
```bash
# Create a scheduled task (from Claude Code CLI)
/schedule
# → Name: Daily Orchestrator
# → Prompt: (contents of orchestrator/SKILL.md)
# → Schedule: 0 8 * * * (daily at 8am)

# List all scheduled tasks
/list-tasks
```

### Monitoring
- **Telegram:** All approvals, notifications, and outputs flow through Telegram
- **File system:** Check `/data/newsletters/`, `/data/briefs/`, `/data/curricula/`, `/data/reports/` for artifacts
- **Supabase Studio:** Monitor DB for prospect/client/interaction records in real-time
- **Claude Code logs:** Check session output for debugging and token usage

---

## 🛠️ Debugging & Troubleshooting

| Issue | Likely Cause | Fix |
|-------|--------------|-----|
| Subagent not spawning | Task too simple, or subagent role unclear | Check SKILL.md prompt — be explicit about subagent role |
| Haiku scraper returns empty | Puppeteer MCP not installed, or URL unreachable | Test Puppeteer MCP independently; check URL access |
| Telegram messages not appearing | Bot token invalid, or chat ID wrong | Verify `TELEGRAM_BOT_TOKEN` in .env; test API directly |
| Newsletter editor subagent says "draft looks good" (unhelpful) | Editor prompt too generic | Be specific: "You are an editor. Your job is to find and flag: awkward Turkish phrasing, unclear business relevance, tone inconsistencies." |
| Orchestrator runs all skills every day | Routing logic broken | Check: is orchestrator reading `next_follow_up` and newsletter date correctly? |
| Cost exploding | Subagents spawning recursively, or long prompts | Check: no infinite loops in subagent prompts; trim CLAUDE.md to <500 lines |

---

## 📖 Quick Reference

**For starting tomorrow:**
- Folder: `~/.claude/skills/` — this is where all 8 SKILL.md files live
- Start with: `prospect-research/SKILL.md` (P1)
- Test with: 2–3 real business URLs from your network
- Next: Wire that into `orchestrator/SKILL.md` (Layer 0)

**File you're reading now:**
- This is the architecture & repo map
- Use it as a reference when building, debugging, or explaining the system

---

**Next step:** Choose your first skill to build, or ask if you want a starter SKILL.md template.
