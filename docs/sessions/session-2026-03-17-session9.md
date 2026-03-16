# Session 9 — 2026-03-17

**Focus:** Infrastructure fix — env var sourcing + Supabase project_id setup

## Problem
- User reported "this issue repeatedly" — prospect-research skill failing silently
- Root cause 1: `.env.local` vars not exported; `source .env.local` only sets shell-local vars, invisible to child processes (curl, subagents)
- Root cause 2: SKILL.md didn't document Supabase project_id; agents had to guess it → "permission denied" errors

## What Changed

### .env.local
- Added `export ` prefix to all 8 vars (TELEGRAM_BOT_TOKEN, SUPABASE_URL, OUTSCRAPER_API_KEY, etc.)
- Added new var: `export SUPABASE_PROJECT_ID=zbzhyhpphsugepwcqmvg` (extracted from SUPABASE_URL subdomain)

### CLAUDE.md
- Updated "Environment variables" section to document `export` requirement
- Added explanation: why `export` is needed (vars must be inherited by child processes)
- Listed SUPABASE_PROJECT_ID as required with actual value

### SKILL.md (prospect-research)
- Updated STEP 0 (Setup & Environment) to list SUPABASE_PROJECT_ID as required env var
- Added clarification: always use `zbzhyhpphsugepwcqmvg` when calling Supabase MCP

### Memory
- Created `memory/MEMORY.md` (index) + `memory/feedback_env_vars.md` (persistent reminder)

## Verification
✅ Tested `source .env.local && echo $OUTSCRAPER_API_KEY` → key visible
✅ Tested `source .env.local && echo $SUPABASE_PROJECT_ID` → returns `zbzhyhpphsugepwcqmvg`

## Next
- Run prospect-research v3.3 end-to-end with Kemalpasa steel trading companies (5 records)
- Verify: Supabase inserts + Telegram notification + email drafts
- Commit: "fix: .env.local export + SUPABASE_PROJECT_ID"
