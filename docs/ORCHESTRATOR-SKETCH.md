# Orchestrator Skill — Design Sketch

**Status:** Planned (P3)
**Date sketched:** 2026-03-16
**Session:** 5

---

## Purpose

Composite workflow orchestrator that chains multiple skills together. Enables complex end-to-end workflows in a single natural language prompt.

**Example use cases:**
- "research tıbbi cihaz distributor in bornova and telegram me the top 3 with phone + opportunities"
- "find 5 companies in izmir, filter the ones with score > 8, send me the top one's details"
- "discover prospects in ankara, auto-schedule follow-ups, telegram summary"

---

## Design

### Input
Natural language prompt that implies multi-step workflow:
```
"research tıbbi cihaz distributor in bornova and telegram me the top 3 with phone + opportunities"
```

### Pipeline
1. **Parse intent:** Detect that this is a composite workflow (research + filter + format + notify)
2. **Call prospect-research** with parsed params:
   - keyword: "tıbbi cihaz distributor"
   - location: "Bornova"
   - count: 10 (fetch extra to allow filtering)
3. **Filter & rank results** by score DESC
4. **Take top N** (user asked for 3)
5. **Format output:** name | phone | score | top_opportunity
6. **Send to Telegram** via Telegram Bot API
7. **Return summary** to user

### Step-by-step implementation

**STEP 1: Natural Language Parser (Sonnet)**
- Detect multi-step intent from query
- Extract: primary_skill (prospect-research / company-lookup), primary_params, secondary_skill, filter_params, output_format, notify (telegram/email/none)

Example parsing:
```json
{
  "primary_skill": "prospect-research",
  "primary_params": {
    "keyword": "tıbbi cihaz distributor",
    "location": "Bornova",
    "count": 10
  },
  "filter_params": {
    "sort_by": "score",
    "sort_order": "desc",
    "limit": 3
  },
  "output_format": {
    "fields": ["name", "phone", "score", "ai_opportunities.0.name"],
    "mode": "summary"
  },
  "notify": "telegram",
  "language": "tr"
}
```

**STEP 2: Execute primary skill**
- If prospect-research: call skill with primary_params, get results
- If company-lookup: call skill with primary_params, get results

**STEP 3: Filter & sort**
- Apply filter_params (sort, limit)
- Haiku subagent for simple filtering/sorting

**STEP 4: Format output**
- Extract requested fields from each result
- Format in requested mode (summary/table/json)
- Match language

**STEP 5: Notify (if requested)**
- If Telegram: format message, send via Telegram Bot API
- If email: format message, send via Resend API (future)
- Keep in-chat display as-is

---

## Triggering conditions

User asks for workflows like:
- "research X and [verb: filter/show/send] to [recipient: telegram/email]"
- "find prospects in X and [action] the top N with [details]"
- "discover companies in X, [sequence of actions]"

---

## Dependencies

- prospect-research skill (fully functional)
- company-lookup skill (fully functional)
- Supabase for reads
- Telegram Bot API for notifications
- Resend API for email (future)

---

## Implementation notes

**Complexity:** Medium. Parser is the tricky part (handling diverse natural language patterns).

**Cost:** Mostly Haiku (for filtering/formatting). Sonnet for intent parsing (1 call).

**Future enhancements:**
- Support for scheduling workflows (e.g., "run this every Monday")
- Sub-skill chaining (3+ skills in sequence)
- Conditional branching (if score > X, do Y)
- Batch operations (apply workflow to 10 prospect lists)

---

## Timeline

Not started. Depends on prospect-research & company-lookup validation. Estimated 2-3 sessions once dependencies are working.
