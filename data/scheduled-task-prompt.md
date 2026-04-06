# Cloud Scheduled Task Prompt
**Use this when creating the task at claude.ai/code/scheduled**
**Task name:** Ravna — Prospect Research Queue Runner
**Schedule:** Custom cron: `0 10 * * 2,5` (Tuesday and Friday at 10:00 — confirm account timezone is Europe/Istanbul)
**Repository:** uguruzel94/ravna-workflows (default branch)

---

## PROMPT (paste verbatim into the task prompt field)

```
You are running the Ravna prospect research automation for Ugur Üzel, founder of Ravna.

Your job:
1. Read the file `data/prospect-research-queue.md` from the repository root.
2. Find the first row in the Query Queue table where Status is `pending`.
3. If no pending rows exist, stop — the queue is complete. No action needed.
4. Extract: Keyword, Location, Count from that row.
5. Read `.claude/skills/prospect-research/SKILL.md` fully before doing anything else.
6. Run the prospect-research skill exactly as written in SKILL.md, using:
   - keyword: [extracted keyword]
   - location: [extracted location]
   - count: [extracted count]
   All required environment variables are already in the environment (no .env.local to source).
7. After the skill completes (success, partial, or failure):
   - Update that row's Status from `pending` to `done` (or `error` if it failed)
   - Fill in the Run Date column with today's date (YYYY-MM-DD)
   - Update the Completed Runs table: row #, keyword, location, run date, records found, cold-ready count, brief notes
   - Update the Month Budget Tracker with current month's totals
8. Commit the updated file:
   git add data/prospect-research-queue.md
   git commit -m "data: queue row [#] done — [keyword] [location]"
   git push

CRITICAL RULES:
- Read SKILL.md fully before executing. It has 13 steps with specific dedup, scoring, and database logic.
- Do NOT source any .env.local file. Env vars are already in the environment.
- Do NOT send emails. The skill drafts them but they require manual approval before sending.
- The skill already sends a Telegram notification on completion. Do NOT send additional ones.
- If the skill fails, mark the row `error` in the queue, note the reason in the Notes column, then commit.
- Turkish input keywords → skill and all output in Turkish. The skill enforces this automatically.
```

---

## Environment Variables
Add these in the cloud environment settings (Settings → Environments → your environment → Edit).

**Security note:** On a personal Pro/Max account, these are only visible to you. They are stored encrypted by Anthropic. The "visible to anyone using this environment" warning applies to shared Team/Enterprise environments where teammates share the same environment — not relevant for a solo account.

```
OUTSCRAPER_API_KEY=<from your .env.local>
TELEGRAM_BOT_TOKEN=<from your .env.local>
TELEGRAM_CHAT_ID=<from your .env.local>
SUPABASE_URL=<from your .env.local>
SUPABASE_KEY=<from your .env.local>
SUPABASE_PROJECT_ID=zbzhyhpphsugepwcqmvg
BRAVE_SEARCH_API_KEY=<from your .env.local>
RESEND_API_KEY=<from your .env.local>
```

---

## Setup Script
Add this in the cloud environment settings → Setup Script field.

The setup script runs at the start of each new cloud session (i.e., on every scheduled task run). It takes ~10-20 seconds. Brave Search and Outscraper run via curl — no MCP install needed for those. Supabase comes in via the Connector. Only Playwright needs explicit installation for website scraping (STEP 4 of the skill).

```bash
#!/bin/bash
# Install Playwright MCP for website scraping (STEP 4 of prospect-research skill)
# Check first to avoid reinstalling if already present
if ! npx @playwright/mcp --version &>/dev/null 2>&1; then
  npm install -g @playwright/mcp@latest || true
fi
```

The `|| true` prevents the task from failing if the install hits a transient error.

---

## Connectors to Add
In the task creation form, under Connectors:
- **Supabase** — required for all DB reads/writes (STEP 1.5, 3, 8, 9.5 of the skill)

Brave Search, Outscraper, Telegram, and Resend all use direct curl calls — no connector needed, just the env vars above.

---

## Repository Settings
- Add `uguruzel94/ravna-workflows`
- Enable **Allow unrestricted branch pushes** so the task can commit the queue update directly to main

---

## Schedule Note
The UI only offers: Hourly, Daily, Weekdays, Weekly. None of these is "Tuesday and Friday."

Workaround options:
1. Create **two separate tasks** — one scheduled Weekly on Tuesday at 10:00, one on Friday at 10:00. Same prompt, same environment. Each runs once a week.
2. Or create one task as Weekly (e.g., Tuesday), then update the cron to `0 10 * * 2,5` via the CLI: `claude /schedule update` (if this is supported for cloud tasks).

Option 1 (two tasks) is simpler and more reliable. Each task reads the same queue file and picks the next pending row.

---

## Testing
Before letting it run on schedule:
1. Click **Run now** from the task detail page
2. Watch the session that gets created — you can see every step
3. Verify: Telegram notification arrives, Supabase has new rows, queue.md row 1 is marked `done` and committed to GitHub
4. If Playwright fails, check the session log — it will tell you exactly which command failed
