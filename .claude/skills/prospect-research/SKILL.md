---
name: prospect-research
description: >
  Find and qualify Turkish SMB prospects for Ravna cold outreach.
  Use this skill whenever Ugur wants to find new clients, research companies,
  discover prospects in a specific industry or city, fill the pipeline,
  run lead generation, or says anything like "find me companies", "research
  prospects in X sector", "look for clients in Y city", "who should I cold email",
  "discover SMBs in X industry". Also invoked by the Orchestrator when a
  keyword queue has pending entries.
---

## ⛔⛔⛔ DEDUP GUARD — READ BEFORE EXECUTING ANY STEP ⛔⛔⛔

These 3 steps MUST be executed as **direct MCP tool calls — no Agent subagent wrapping**:

| Step | Forbidden action |
|------|-----------------|
| STEP 0.9 | NEVER use Agent tool. Call `mcp__plugin_supabase_supabase__execute_sql` directly. |
| STEP 1.5 Pass 1 | NEVER use Agent tool. Call `mcp__plugin_supabase_supabase__execute_sql` directly. |
| STEP 3 | NEVER use Agent tool. Call `mcp__plugin_supabase_supabase__execute_sql` directly. |

**Self-check:** Before running any of these steps — "Am I about to use the Agent tool?"
If YES → STOP. You are violating this rule. Use `mcp__plugin_supabase_supabase__execute_sql` directly with `project_id: "zbzhyhpphsugepwcqmvg"`.

**Mandatory logging:** After each ⛔ step, you MUST log the actual SQL result with row count and matched names. If you cannot produce the actual result, you did not run the step. Run it again.

**Note:** STEP 1.5 Pass 2 (Haiku fuzzy) IS allowed as a subagent — only Pass 1 (SQL) is forbidden.

---

# Prospect Research Agent v3

**Purpose:** Discover and qualify Turkish SMB prospects using structured Maps data + website research, score by evidence-based ICP fit, extract contact details, draft cold outreach emails, and stage them in the pipeline.

**Version:** v3 — Outscraper discovery + two-stage filtering + evidence-based ICP scoring

**Key improvements over v2:**
- **Discovery source:** Outscraper (Google Maps) instead of Brave Search — structured data with phone/address/ratings
- **Two-stage filtering:** Maps metadata pre-filter (reviews, ratings, category) before any website scraping
- **Contact extraction:** Phone (Maps) + address (Maps) + email (website scraping)
- **ICP scoring:** Evidence-required rubric — each point needs proof, not assumptions
- **Intent matching:** Natural language `intent` field replaces hardcoded category rules
- **Parallelism:** No hardcoded cap — default 10, user-controlled
- **Cost control:** Hard limit of 50 records per run (configurable)

---

## INPUT SCHEMA

```json
{
  "keyword": "tıbbi cihaz distributor",
  "location": "Bornova",
  "count": 10,
  "intent": "Tıbbi cihaz ve medikal ekipman distribütörleri. Hastanelere, kliniklere veya laboratuvarlara satan firmalar. Dişçi, eczane, veteriner, optik değil.",
  "industry": "healthcare"
}
```

| Param | Required | Type | Default | Notes |
|-------|----------|------|---------|-------|
| `keyword` | yes | string | — | Search term for Outscraper Maps query. E.g., "tıbbi cihaz distributor", "muhasebe firması" |
| `location` | yes | string | — | Turkish city or district name (e.g., "İstanbul", "Ankara", "Bornova", "Besiktas"). Districts are automatically normalized to parent city for Maps API if needed. |
| `count` | no | integer | 10 | How many companies to research. No hardcoded cap; respects user input. |
| `intent` | no | string | inferred | Natural language: what to find AND what to exclude. E.g., "healthcare + distribution, no retail clinics". Used by Sonnet for intent matching. If omitted, Sonnet infers from keyword + industry. |
| `industry` | no | string | — | Helps with Brave fallback and Sonnet context. |

**The `intent` field is key:** It lets clients describe their ICP in plain language without editing SKILL.md. Replaces all hardcoded category logic.

---

## STEP 0: Setup & Environment

**Required env vars** (in `.env.local`, all with `export` prefix):
- `OUTSCRAPER_API_KEY` — Outscraper account (https://outscraper.com). Free tier: 500 records/month. Cost: ~$0.003/record (~$0.15 max per run of 50 records).
- `TELEGRAM_BOT_TOKEN` — Telegram bot (for notifications)
- `TELEGRAM_CHAT_ID` — Chat ID for status messages
- `SUPABASE_PROJECT_ID` — Required for Supabase MCP tool calls. Value: `zbzhyhpphsugepwcqmvg` (extracted from SUPABASE_URL subdomain). **Always use this exact value when calling `mcp__plugin_supabase_supabase__execute_sql` or any Supabase MCP tool.**

**CRITICAL — env var sourcing:** Always run `source /Users/uguruzel/Vibe/ravna-workflows/.env.local` before any bash command that uses these vars. The `.env.local` file uses `export` so all vars are available to child processes.

**If `OUTSCRAPER_API_KEY` not set:**
- Log: `"⚠️ Outscraper unavailable — running degraded mode via Brave Search"`
- Fall back to v2 behavior (3 Brave searches for discovery)
- Continue normally through rest of pipeline

---

## STEP 0.5: Natural Language Parser (Turkish + English)

**Model:** Sonnet (1 call, upfront)
**Input:** User query in Turkish or English (natural language)
**Output:** JSON schema matching INPUT SCHEMA above

**Task:** Convert user input to structured schema:

### Turkish examples:
- `"bana İzmir'de demir çelik ticareti yapan 5 şirket bulabilir misin?"` → `{keyword: "demir çelik ticareti", location: "İzmir", count: 5}`
- `"İstanbul'da muhasebe firması ara, 10 tane"` → `{keyword: "muhasebe firması", location: "İstanbul", count: 10}`
- `"Bornova'da yazılım şirketi ara, 7 tane"` → `{keyword: "yazılım şirketi", location: "Bornova", count: 7}` (district supported, unambiguous)
- `"Göztepe'de tıbbi cihaz distributor ara"` → **AMBIGUOUS**: Ask "Göztepe hangi şehirde? İstanbul mı yoksa İzmir mi?" (wait for response, then parse with clarified city)
- `"Ankara'da yazılım şirketi, ama küçük, 7 tane"` → `{keyword: "yazılım şirketi", location: "Ankara", count: 7, intent: "küçük şirket, yazılım"}`

### English examples:
- `"Find me 5 steel trading companies in Izmir"` → `{keyword: "steel trading", location: "İzmir", count: 5}`
- `"Search for accounting firms in Istanbul, 10 results"` → `{keyword: "accounting firm", location: "İstanbul", count: 10}`
- `"Find 3 companies in Bornova"` → `{keyword: "companies", location: "Bornova", count: 3}` (district supported, unambiguous)
- `"Find companies in Göztepe"` → **AMBIGUOUS**: Ask "Which city is Göztepe in? Istanbul or Izmir?" (wait for response, then continue)

**Parser logic:**
1. Detect language (Turkish or English)
2. Extract: `keyword` (what sector/service), `location` (Turkish city or district), `count` (number, default 10)
3. Infer `intent` if user provides exclusions (e.g., "ama değil", "except", "no")
4. If location is English name (e.g., "Izmir" or "Besiktas"), convert to Turkish ("İzmir", "Beşiktaş")
5. Normalize district names (e.g., "bornova" → "Bornova", "besiktas" → "Beşiktaş")
6. **AMBIGUOUS DISTRICT CHECK:**
   - If location is a district (not a city) AND exists in multiple cities, STOP and ask for clarification
   - **Ambiguous districts example list:**
     - "Göztepe" → İstanbul & İzmir
     - "Alsancak" → İzmir & other cities
     - "Karşıyaka" → İzmir & Konya
   - **Clarification prompt (Turkish):** "Göztepe hangi şehirde? İstanbul mı yoksa İzmir mi?"
   - **Clarification prompt (English):** "Which city is Göztepe in? Istanbul or Izmir?"
   - Wait for user response, re-parse location, continue
7. Output JSON matching INPUT SCHEMA with `location` field (now unambiguous)
8. Set response language = detected language

**Continue all subsequent steps (1-9) in the detected language.**

---

## STEP 0.9: Search Deduplication — Prevent Re-Searching Same Areas

**Model:** None (direct SQL)
**Tools:** Supabase execute_sql
**Cost:** Free (1 query)

**Task:** Check if this `keyword` + `location` combination has already been searched. **Normalize both before lookup to catch spelling/Turkish-character variants.**

### Normalization (before DB lookup):

**Keyword normalization:**
1. Lowercase: `"Demir Çelik Ticareti"` → `"demir çelik ticareti"`
2. Turkish → ASCII: `ç→c`, `ş→s`, `ı→i`, `ğ→g`, `ü→u`, `ö→o`
   - `"demir çelik ticareti"` → `"demir celik ticareti"`
3. Strip common suffixes: `" ticareti"`, `" satıcısı"`, `" dağıtıcısı"`
   - `"demir celik ticareti"` → `"demir celik"`

**Location normalization:**
1. Lowercase + Turkish→ASCII: `"İzmir"` → `"izmir"`, `"Bornova"` → `"bornova"`
2. Strip city suffix: `", İzmir"` → empty, `", İstanbul"` → empty
   - `"Kemalpasa, İzmir"` → `"kemalpasa"`
   - `"İzmir"` → `"izmir"`
3. Normalize district to parent if ambiguous:
   - `"Göztepe, İstanbul"` → `"istanbul"`
   - (User should clarify ambiguous districts in STEP 0.5)

**Store normalized values:** Add `keyword_normalized` and `location_normalized` columns to `searches` table (or override existing columns with normalized values).

### SQL Query:

**IMPORTANT:** The Supabase MCP `execute_sql` tool accepts a complete SQL string — substitute normalized values as SQL string literals, not `?` placeholders.

**Before running the query, compute:**
- `keyword_normalized`: `lower(translate(keyword, 'çşığüöÇŞİĞÜÖ', 'csiguoCsIGUO'))` then strip suffixes like ` ticareti`, ` satıcısı`, ` dağıtıcısı` (post-transliteration form)
- `location_normalized`: `lower(translate(split_part(location, ',', 1), 'çşığüöÇŞİĞÜÖ', 'csiguoCsIGUO'))`

```sql
SELECT id, results_count, last_searched_at FROM searches
WHERE keyword_normalized = 'demir celik'
  AND location_normalized = 'kemalpasa';
```

**Logic:**
1. After parsing input in STEP 0.5, compute normalized values using the functions above
2. Immediately check `searches` table using normalized values as SQL string literals
3. If found (SQL exact match):
   - Log: `"⏭️ Bu arama daha önce yapılmış: '{keyword}' + '{location}' ({results_count} sonuç, son arama: {last_searched_at})"`
   - Pre-warning: `"Bu aramadan N şirket DB'nize zaten eklendi. Outscraper maliyeti ~$0.X doğacak ve yeni sonuç gelme ihtimali düşük. [date]'den bu yana yeni listelemeler olmuş olabilir."`
   - Ask user: `"Yine de devam etmek ister misin?"`
   - If yes → continue to STEP 1
   - If no → abort gracefully
4. If not found (SQL exact match failed):
   a. Query: `SELECT DISTINCT keyword_normalized FROM searches WHERE location_normalized = '{location_normalized}' ORDER BY last_searched_at DESC LIMIT 20;`
   b. If 0 prior searches for this location → continue to STEP 1 normally (skip Haiku)
   c. If ≥1 prior searches for this location → **call Haiku semantic check** (see below)
5. Haiku semantic dedup:
   - **Prompt:** Use the template below
   - **Result:** Haiku answers "YES: {matching_keyword}" or "NO"
   - If YES → warn user: `"⚠️ Benzer bir arama daha önce yapılmış olabilir: '{prior_keyword}'. Yine de devam etmek ister misin?"` (similar to SQL warning, but for semantic match)
     - If yes → continue to STEP 1
     - If no → abort gracefully
   - If NO → continue to STEP 1 normally

**Why this matters:**
- Outscraper costs ~$0.003/record. Re-searching the same area wastes money.
- If you found "demir çelik ticareti İzmir" last week with 10 results, a search for "demir celik ticareti Izmir" (Turkish chars stripped) should be recognized as the same.
- Normalization prevents duplicate Outscraper calls due to typos or Turkish character variants.
- Even after normalization, semantic equivalence check catches cases like "demir çelik ticareti" vs "çelik satıcısı" (same industry, overlapping results) — two-pass dedup strategy.

**Haiku Semantic Layer Prompt (for step 5c above):**

```
You are a search deduplication assistant for Turkish business prospect research.

Current search keyword: "{current_keyword}"
Current location: "{location}"
Previous searches in the same location:
{list of previous keywords, one per line}

Task: Is the current keyword semantically equivalent to ANY previous keyword?
"Semantically equivalent" means: if Outscraper were run with both keywords in the same city,
they would return substantially the same companies (>60% overlap).

Examples:
- "demir çelik ticareti" = "çelik satıcısı" → YES (same industry)
- "demir çelik ticareti" = "demir çelik distributor" → YES
- "demir çelik ticareti" = "muhasebe firması" → NO (different industry)
- "tıbbi cihaz" = "medikal ekipman dağıtım" → YES

Answer format: "YES: {matching_keyword}" or "NO"
```

**Cost & timing:**
- 1 Haiku call per run if location has prior searches (~$0.001)
- Only triggered if SQL exact match fails AND prior searches exist in location
- False positives are warnings, not blocks — user always decides

**Output:**
```json
{
  "search_exists": true,
  "keyword": "demir çelik ticareti",
  "keyword_normalized": "demir celik",
  "location": "İzmir",
  "location_normalized": "izmir",
  "results_count": 12,
  "last_searched_at": "2026-03-15T10:30:00Z"
}
```

---

### Ambiguous Districts Reference

Turkish cities have districts with identical or similar names. Keep this reference handy:

| District | Cities | Example |
|----------|--------|---------|
| Göztepe | İstanbul, İzmir | "Göztepe'de yazılım şirketi ara" → ask which Göztepe |
| Alsancak | İzmir, and others | "Alsancak'da muhasebe ara" → clarify |
| Karşıyaka | İzmir, Konya | "Karşıyaka'da distributor ara" → clarify |
| Çeşme | İzmir (district) | Usually İzmir, but verify if ambiguity arises |

If user says "I mean İzmir's Göztepe" → set `location: "Göztepe, İzmir"` for precision.

---

## STEP 1: Discovery — Outscraper Maps Search (Async + Polling)

**Model:** Haiku (1 subagent)
**Tools:** Bash (curl to Outscraper API)
**Cost:** ~$0.15 per run max (50 records × $0.003)

**Task:** Submit async job, poll for completion.

```bash
# IMPORTANT: Always separate 'source' from curl on different lines
source /Users/uguruzel/Vibe/ravna-workflows/.env.local
JOB=$(curl -s -X POST "https://api.app.outscraper.com/google-maps-search" \
  -H "X-API-KEY: ${OUTSCRAPER_API_KEY}" \
  -H "Content-Type: application/json" \
  -H "client: Python SDK" \
  -d "{\"query\": [\"tıbbi cihaz distributor İstanbul\"], \"organizationsPerQueryLimit\": $(( count * 2 > 50 ? 50 : count * 2 )), \"language\": \"tr\"}")

JOB_ID=$(echo "$JOB" | jq -r '.id')

# Poll every 5s, up to 60 minutes (SDK default)
for i in {1..720}; do
  sleep 5
  RESULT=$(curl -s "https://api.outscraper.cloud/requests/$JOB_ID" \
    -H "X-API-KEY: ${OUTSCRAPER_API_KEY}")
  STATUS=$(echo "$RESULT" | jq -r '.status')
  if [ "$STATUS" != "Pending" ]; then
    echo "$RESULT" | jq '.data'
    break
  fi
done
```

**Critical fixes:**
- Use `POST /google-maps-search` (not `GET /maps/search`)
- Field is `organizationsPerQueryLimit` (not `limit`)
- Add header `client: Python SDK` (required by Outscraper SDK)
- Always separate `source .env.local` from curl on different lines
- Specify query as JSON array: `\"query\": [\"search term\"]`

**Cost guard & buffering:** Request `organizationsPerQueryLimit = min(count * 2, 50)` to create a buffer for duplicate filtering in STEP 1.5. The Outscraper API returns results across multiple searches, and known companies (like CDC DEMİR ÇELİK) re-appear in different keyword searches of the same area. By requesting double, STEP 1.5 can filter out known-company overlap while still yielding `count` new prospects. Cost: ~$0.003/record; for count=5 with buffer=10, worst case ~$0.015 extra if half are duplicates.

**Why async?** The Outscraper API processes maps/search asynchronously by design. Job ID is returned immediately, results polled after processing.

**Per-company data returned (from `.data[0]` array):**
- `title` — official company name
- `phone` — phone number (if listed)
- `website` — company website URL
- `address` — full address
- `type` — Google Maps category (e.g., "Tıbbi cihaz dağıtıcısı", "Diş hekimi", "Eczane")
- `review_count` — number of Google reviews
- `rating` — Google rating (1-5 stars)

**Output format (from polling result):**
```json
[
  [
    {
      "title": "Mefamed Ltd.",
      "phone": "+90 (212) 123-4567",
      "website": "mefamed.com.tr",
      "address": "Levent, İstanbul",
      "type": "Tıbbi cihaz dağıtıcısı",
      "review_count": 45,
      "rating": 4.8
    },
    { ... }
  ]
]
```

**Error handling:**
- If job doesn't complete within 120s: log warning, return partial/empty results
- If API key missing: log warning, fall back to Brave searches (log: "degraded mode")
- If API returns error: fall back to Brave searches
- If no results found: return empty array, continue (don't fail)

---

## ⛔ STEP 1.5: Already-Seen Pre-check (Cross-Query Deduplication)

**MANDATORY: Run as Direct Supabase MCP Call. NEVER delegate to subagent.**

**Model (Pass 1):** None — direct SQL
**Model (Pass 2):** Haiku — fuzzy name check for near-duplicates
**Tools:** Supabase execute_sql (Pass 1), Haiku subagent (Pass 2)
**Cost:** Free (1-2 queries)

**Purpose:** Prevent companies that already exist in the DB (from ANY previous search) from being re-processed. This catches the case where CDC DEMİR ÇELİK was found in a "demir çelik ticareti" search and re-appears in a different keyword search like "çelik satıcı" in the same city.

**Task:** Before STEP 2 filtering, remove already-known companies from the Outscraper results using two passes:
- **Pass 1:** Direct SQL exact-match dedup (URL + normalized name)
- **Pass 2:** Haiku fuzzy name check for edge cases (abbreviations, misspellings, variant names)

### Pass 1 — Exact SQL Dedup (Direct Supabase MCP Call)

**Name and URL Normalization:**

**Name normalization:**
1. Lowercase: `"CDC DEMİR ÇELİK"` → `"cdc demir çelik"`
2. Strip common suffixes: `Ltd.`, `Şti.`, `A.Ş.`, `LTD.ŞTİ.`, `SAN VE TİC`, `ŞUBE`
3. Strip extra whitespace

**URL normalization:**
1. Strip protocol: `https://mefamed.com.tr` → `mefamed.com.tr`
2. Strip `www.`: `www.mefamed.com.tr` → `mefamed.com.tr`
3. Strip trailing slash: `mefamed.com.tr/` → `mefamed.com.tr`

**SQL Query (direct Supabase MCP call):**

```sql
SELECT id, name, url FROM prospects
WHERE LOWER(translate(
  REGEXP_REPLACE(REGEXP_REPLACE(name, '\s+(Paz\.|İnş\.|San\.|Tic\.|Ltd\.|Şti\.|A\.Ş\.|LTD\.ŞTİ\.|SAN VE TİC|ŞUBE)(\s+.*)?$', '', 'i'), '\s+', ' ', 'g'),
  'çşığüöÇŞİĞÜÖ',
  'csiguoCsIGUO'
))
      IN (list_of_normalized_names)
   OR (url IS NOT NULL AND url IN (list_of_normalized_urls));
```

**CRITICAL — Turkish character normalization:**

The IN list must be pre-normalized to ASCII using the same `translate()` mapping that the SQL applies:
- Build the IN list: for each incoming name, apply `lower(translate(name, 'çşığüöÇŞİĞÜÖ', 'csiguoCsIGUO'))` BEFORE adding to the SQL string
- Example: `"CDC DEMİR ÇELİK"` → `"cdc demir celik"` (normalized), then add to the IN list as a string literal
- Both sides of the SQL comparison now use identical normalization, fixing the Turkish character mismatch that broke dedup for companies without URLs

**Logic:**
1. Build list of incoming company names + URLs from Outscraper STEP 1 results
2. Normalize each name: `lower(translate(name, 'çşığüöÇŞİĞÜÖ', 'csiguoCsIGUO'))` BEFORE adding to the SQL IN list
3. Normalize each URL (strip protocol + www + trailing slash)
4. Execute SQL query above (direct Supabase MCP call — no delegation)
5. Mark matched companies as "already_known" → **remove from processing queue entirely**
6. Log: `"N already-known companies removed by exact SQL match"`

**Output from Pass 1:**
```json
{
  "batch_in": 12,
  "exact_match_removed": 2,
  "batch_after_pass1": 10,
  "removed_names": ["CDC DEMİR ÇELİK", "Acme Çelik Ltd."]
}
```

### Pass 2 — Haiku Fuzzy Name Check (for edge cases)

**When to use:** After Pass 1 SQL exact dedup, if remaining companies > 0.

**Task:** Haiku subagent: Given incoming company names (from Outscraper) and existing company names from same city (from DB), identify probable duplicates that SQL missed.

**Haiku prompt:**
```
You are a company name deduplication specialist for Turkish SMBs.

Incoming companies (from Outscraper):
[list of names]

Existing companies in same city (from DB):
[list of names from prospects table WHERE city = ?]

Task: For each incoming company, does it match ANY existing company name?
Consider:
- Abbreviations: "Acme Ltd" vs "ACME"
- Misspellings: "Kanatt" vs "Kanaat"
- Variant capitalization of Turkish chars
- Short forms: "A-B Ticaret" vs "A-B T."
- Owner name additions: "Mefamed Ltd" vs "Mehmet's Mefamed"

Return ONLY name pairs that are likely the same company, one per line:
  "Kanaat Demir" = "Kanatt Demir İzmir Şubesi"
  "Acme Celik Ltd." = "ACME CELİK"

If no matches found, respond: "No matches"
```

**Logic:**
1. Fetch all company names from DB for the input `location` (city)
2. For each remaining company from Pass 1, pass to Haiku (bulk, not per-company)
3. Parse Haiku response: name pairs that match
4. Remove matched companies from processing queue
5. Log: `"K additional companies removed by fuzzy match"`

**Output from Pass 2:**
```json
{
  "batch_before_pass2": 10,
  "fuzzy_match_removed": 1,
  "batch_after_pass2": 9,
  "removed_by_fuzzy": ["Kanaat Demir İzmir Merkez"]
}
```

### Why This Two-Pass Approach?

**STEP 0.9** prevents re-calling Outscraper for the **exact same keyword+location** (cost guard).

**STEP 1.5 Pass 1** handles cross-query overlap via exact SQL match: when you search "demir çelik ticareti İzmir" one day and "çelik satıcı İzmir" the next, Outscraper returns overlapping company names. CDC with exact match filters out immediately.

**STEP 1.5 Pass 2** catches edge cases SQL misses: abbreviations, misspellings, variant names. This is a second safety net using Haiku's semantic understanding of company name variations.

### Final Output (combined)

```json
{
  "batch_in": 12,
  "exact_match_removed": 2,
  "fuzzy_match_removed": 1,
  "batch_final": 9,
  "removed_names": ["CDC DEMİR ÇELİK", "Acme Çelik Ltd.", "Kanaat Demir İzmir Merkez"]
}
```

**Continue to STEP 2 with remaining 9 companies only.**

---

## STEP 2: Stage 1 Pre-filter — Maps Metadata Only

**Model:** Haiku (1 subagent)
**Tools:** None (pure logic)
**Cost:** Free (no API calls)

**Task:** Filter Outscraper results using Maps metadata. Discard companies that don't meet basic criteria:

### Hard filters (automatic discard):
1. **No website listed** — can't scrape for email
2. **Review count > 200** — signals B2C or large enterprise (likely outside ICP)
3. **Rating < 3.5 stars** — signals inactive/ghost/problematic listing

### Intent matching (Haiku + `intent` field):

For each company, pass to Haiku:
- Company name + Maps `type` (category)
- User-provided `intent` field (or inferred intent)
- Ask: **"Does this company match the intent? Answer yes/no only."**

Logic:
- If intent says "no veterinarians" and Maps type = "Veteriner", → discard
- If intent says "healthcare distribution" and Maps type = "Tıbbi cihaz dağıtıcısı", → keep
- If unsure, ask Haiku to evaluate

This stage typically eliminates 40-60% of records without any website scraping.

**Keep top `count` survivors** after Stage 1 (after re-sorting by rating if needed).

**Output:**
```json
{
  "stage1_survivors": [
    {
      "business_name": "Mefamed Ltd.",
      "phone": "+90 (212) 123-4567",
      "website": "mefamed.com.tr",
      "address": "Levent, İstanbul",
      "type": "Tıbbi cihaz dağıtıcısı",
      "rating": 4.8,
      "intent_match": "yes"
    }
  ],
  "discarded_stage1": [
    {
      "business_name": "DrSmile Kliniği",
      "reason": "intent_mismatch — Diş hekimi (excluded in intent)"
    }
  ],
  "total_stage1": 10
}
```

**Insert discards into Supabase (STEP 2 tail):**

After filtering, insert ALL discarded companies into `prospects` with `status: 'pre_filter_discard'`.
This prevents them from ever being re-evaluated.

For each entry in `discarded_stage1`:
- name: company name from Outscraper
- phone: from Outscraper (if available)
- address: from Outscraper (if available)
- city: from input `location`
- url: NULL
- industry: Maps category (e.g. "İnşaat Malzemesi Toptancısı")
- score: 0
- status: 'pre_filter_discard'
- ai_opportunities: [{"reason": "<discard reason>"}]
- email_draft: NULL
- search_keyword: from input `keyword + location`

SQL:
```sql
INSERT INTO prospects (name, phone, address, city, url, industry, score, status,
  ai_opportunities, email_draft, search_keyword, created_at)
VALUES (?, ?, ?, ?, NULL, ?, 0, 'pre_filter_discard',
  jsonb_build_array(jsonb_build_object('reason', ?)), NULL, ?, NOW())
ON CONFLICT(LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '\s+(Ltd\.|Şti\.|A\.Ş\.|LTD\.ŞTİ\.|SAN VE TİC|ŞUBE)$', '', 'i'), '\s+', ' ', 'g'))) DO NOTHING;
```

**Note on conflict:** With STEP 1.5 pre-check in place, discards at STEP 2 are guaranteed to be new (not seen before). The `ON CONFLICT DO NOTHING` serves as a safety net for edge cases. If removing, rely on STEP 1.5 as the primary guard.

---

## ⛔ STEP 3: Deduplication — Check Supabase DB (URL + Name) — Safety Net

**Model:** None (direct SQL)
**Tools:** Supabase execute_sql
**Note:** This is a safety net for edge cases. STEP 1.5 (two-pass dedup) should catch most duplicates before STEP 3.

**Task:** Query `prospects` table for URLs AND names that already exist (any status, including `'discarded'` and `'pre_filter_discard'`). Final check before STEP 4 research.

**URL normalization:**
1. Strip protocol: `https://mefamed.com.tr` → `mefamed.com.tr`
2. Strip `www.`: `www.mefamed.com.tr` → `mefamed.com.tr`
3. Strip trailing slash: `mefamed.com.tr/` → `mefamed.com.tr`

**Name normalization:**
1. Lowercase
2. Strip common suffixes: `Ltd.`, `Şti.`, `A.Ş.`, `LTD.ŞTİ.`, `SAN VE TİC`, `ŞUBE`
3. Strip extra whitespace

Example: `"CDC DEMİR ÇELİK"` → `"cdc demir çelik"`

**SQL:**
```sql
-- Check existing URLs
SELECT DISTINCT url FROM prospects
WHERE url IN (list_of_normalized_urls);

-- Check existing names
SELECT DISTINCT name FROM prospects
WHERE LOWER(translate(
  REGEXP_REPLACE(REGEXP_REPLACE(name, '\s+(Paz\.|İnş\.|San\.|Tic\.|Ltd\.|Şti\.|A\.Ş\.|LTD\.ŞTİ\.|SAN VE TİC|ŞUBE)(\s+.*)?$', '', 'i'), '\s+', ' ', 'g'),
  'çşığüöÇŞİĞÜÖ',
  'csiguoCsIGUO'
))
  IN (list_of_normalized_names);
```

**Logic:**
- For each Stage 1 survivor, normalize BOTH the URL and the name
- Check if either the URL OR the normalized name already exists in DB
- If yes: skip (mark as "duplicate")
- If no: add to research queue
- This catches edge cases where companies WITH websites might duplicate across different batches. For companies WITHOUT websites (like no-website discards), cross-query dedup is handled in STEP 1.5

**Keep top `count` new companies** after dedup.

**Output:**
```json
{
  "qualified_for_research": [
    {
      "business_name": "Mefamed Ltd.",
      "url_normalized": "mefamed.com.tr",
      "phone": "+90 (212) 123-4567",
      "address": "Levent, İstanbul"
    }
  ],
  "duplicates_skipped": 2,
  "total_qualified": 5
}
```

---

## STEP 4: Stage 2 Research — Website Scraping + Contact Extraction

**Model:** Haiku × 1 per company (N agents, parallel)
**Tools:** Playwright MCP
**Cost:** Depends on website accessibility

**Task:** For each qualified company, scrape website and extract contact/business data.

### Subagent: Website Scraper (Playwright)

**Per company:**
1. Navigate to company URL (15s timeout)
2. Extract full page text: `document.body.innerText`
3. If sparse (<200 words), try:
   - `/iletisim` (contact page)
   - `/about` or `/hakkimizda` (about page)
   - Pick whichever is accessible
4. Combine all text

**Extract from scraped text:**
- **Email:** regex `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}` — store first match
- **Founder/owner name:** keywords: "kurucu", "genel müdür", "başkan", "CEO", "yönetici"
- **Team size signals:** "X kişi", "X personel", "X çalışan", job listings, "Ekipimiz"
- **Products/services:** specific items listed on homepage/about
- **Tech stack:** software, CRM, ERP, automation tools mentioned
- **AI mentions:** "yapay zeka", "AI", "otomasyon", "dijital dönüşüm", "veri analizi"

**Return per company:**
```json
{
  "business_name": "Mefamed Ltd.",
  "url": "mefamed.com.tr",
  "phone": "+90 (212) 123-4567",  // from Maps
  "address": "Levent, İstanbul",  // from Maps
  "email": "info@mefamed.com.tr",  // extracted from website
  "scraped_text": "Full page text... (max 1500 words)",
  "founder_name": "Mehmet Kaya",
  "team_size_indicator": "20+ employees (from job listings)",
  "has_ai_mentions": false,
  "scrape_status": "success" | "timeout" | "error"
}
```

**Error handling:**
- Timeout/404/error: return what was found (phone + address from Maps still present)
- No email found: leave `email: null`
- Proceed anyway — don't fail the company

---

## STEP 5: ICP Scoring — Evidence-Required Rubric (Sonnet per company)

**Model:** Sonnet (per company)
**Input:** Outscraper data + scraped website text + `intent`
**Task:** Score ICP fit with evidence required for each point.

### Scoring rubric:

```
Base: 1 point

+2: Intent matches
  EVIDENCE: Company name + Maps category align with stated intent
  → Use: intent field (if provided) OR inferred from keyword + industry
  → Hard discard if: company clearly violates intent exclusions
  → Example: intent says "no veterinarians", Maps type = "Veteriner" → reject

+2: Turkey confirmed
  EVIDENCE: Turkish address (Maps data) OR .com.tr/.net.tr domain
  OR Turkish phone prefix (+90 / 0XXX)
  → Usually always confirmed from Outscraper

+2: Team size 5–50 people
  EVIDENCE: Website shows staff count OR job listings count
  OR /about page mentions team size OR social signals (LinkedIn company pages referenced)
  → 0 points if: single-page site, no team signals (likely solo)
  → 0 points if: multiple locations on Maps (signals chain/large org)
  → 0 points if: >100 reviews with no team mentions (proxy for scale)

+2: Owner-operated
  EVIDENCE: Founder/owner name visible on website
  OR single Maps location + <50 reviews + small team mention
  → 0 points if: Limited company name (A.Ş.) with no individual visible

+2: No visible AI/digital tool usage
  EVIDENCE: Scan scraped website for keywords:
  "yapay zeka", "AI", "otomasyon", "dijital dönüşüm", "ERP", "CRM",
  "yazılım platform", "veri analizi", "machine learning"
  → 0 points if: any of these terms found (they already have tools)
  → +2 points if: none found (opportunity exists)

---

Score interpretation:
10 = perfect ICP fit (all criteria met + strong evidence)
6–9 = good fit (most criteria met)
< 6 = poor fit → DISCARD, do not draft email
```

### Discard decision:
If score < 6:
- Record discard reason (e.g., "Enterprise size >100 employees", "Extensive AI usage already", "No Turkish operations")
- Insert with `status: 'discarded'` (no email drafted)
- Log reason for analytics

If score ≥ 6:
- Continue to Step 6 (email draft)

**Output per company:**
```json
{
  "business_name": "Mefamed Ltd.",
  "url": "mefamed.com.tr",
  "score": 8,
  "status": "cold_ready" | "discarded",
  "discard_reason": null | "reason if scored <6",
  "scoring_breakdown": {
    "intent_match": { "points": 2, "evidence": "Tıbbi cihaz dağıtıcı, hastanelere satış — matches intent" },
    "turkey_confirmed": { "points": 2, "evidence": "İstanbul address + .com.tr domain + +90 phone" },
    "team_size": { "points": 2, "evidence": "~20 employees (job listings on website)" },
    "owner_operated": { "points": 2, "evidence": "Founder Mehmet Kaya visible on /about page" },
    "no_ai_usage": { "points": 0, "evidence": "Website mentions 'dijital dönüşüm' — may already have tools" }
  }
}
```

---

## STEP 6: AI Opportunities Analysis (Sonnet per qualifying company)

**Model:** Sonnet
**Input:** Scraped text + business type + team size + founder name
**Task:** Identify 3 specific AI opportunities tailored to THIS company.

Each opportunity must:
- Have a **specific name** (not generic): "Otomatik fatura işleme", "Lead scoring", "Ürün yorum analizi"
- Identify the **manual process** it replaces: "muhasebeciler tarafından el ile yapılan fatura girişi"
- Estimate **hours/week saved**: "8–10 saat/hafta"
- Be **concrete to their industry**: Don't suggest "customer sentiment analysis" to a tool supplier

**Example:**
```json
{
  "opportunity_1": {
    "name": "Otomatik tedarikçi fatura işleme",
    "process": "Mefamed'in Netsis ERP'ye el ile fatura girişi",
    "hours_saved": "10 saat/hafta",
    "reasoning": "İthalat-dağıtım süreçlerinde fatura hacmi yüksek"
  },
  "opportunity_2": {
    "name": "Müşteri talep tahmini",
    "process": "Satış ekibinin tarihsel verilerle manuel hata ve tahmin",
    "hours_saved": "6 saat/hafta"
  },
  "opportunity_3": {
    "name": "Tıbbi cihaz uyumluluk kontrol otomasyonu",
    "process": "Her tedavi cihazının yasal uyumluluğu el ile kontrol edilmesi",
    "hours_saved": "4 saat/hafta"
  }
}
```

---

## STEP 7: Email Draft (Sonnet per qualifying company)

**Model:** Sonnet
**Input:** Company name, founder name (if found), ai_opportunities, industry
**Task:** Draft Turkish cold outreach email.

### Rules:

**Salutation:**
- If founder name found: `"Sayın {Founder First Name} Bey,"` (e.g., "Sayın Mehmet Bey,")
- Otherwise: `"Sayın Yetkili,"`

**Tone:** Formal "Siz" throughout. Professional, warm, not pushy.

**Subject line:**
- Max 10 words
- No question marks
- Concrete, references something about their business
- Examples:
  - "Tıbbi cihaz lojistiğinde 15 saat/hafta tasarruf"
  - "Fatura işleme sürelerini yarıya indirin"
  - "45 dakikalık AI hazırlık görüşmesi"

**Body:**
- 150–200 words
- **Opening:** Reference one specific detail from research (never generic)
  - Example: "Mefamed'in İstanbul'da 20+ sağlık tesisine sunduğu dağıtım hizmetini gördük"
- **Value prop:** Mention ONE top AI opportunity
  - Example: "Siparişleri ve faturaları otomatik işlemek, haftada 12 saat boşaltabilir"
- **Close:** Offer specific next step
  - "Sizin için ücretsiz 45 dakikalık yapay zeka hazırlık görüşmesi yapabilirim"
  - "Hangisi size daha uygun: Çarşamba veya Perşembe?"

**Forbidden words (Turkish biz-speak clichés):**
- eşsiz, güçlü, yenilikçi, çözüm odaklı, dönüştürücü, ilericilik, başarı, verimlilik, stratejik

**Preferred verbs (concrete, action):**
- azaltır, kurtarır, inşa eder, gösterir, hesaplar, otomatikleştirir, hızlandırır, tasarruf sağlar

**Output:**
```
SUBJECT: Tıbbi cihaz lojistiğinde 15 saat/hafta tasarruf

BODY:
Sayın Mehmet Bey,

Mefamed'in İstanbul'da 20+ sağlık tesisine sunduğu dağıtım hizmetini gördük.

Tıbbi cihaz ve medikal ekipmanın sevkiyat öncesi kontrol ve lojistik işlemleri önemli zaman alıyor. Özellikle siparişlerin Netsis ERP'ye girilmesi ve tedarikçi faturalarının işlenmesi, sizin ekibinin her hafta 15 saatini alıyor.

Bunun yerine bu işlemleri otomatikleştiren bir sistem kurabiliriz. İlk adım olarak Ravna'da ücretsiz bir 45 dakikalık yapay zeka hazırlık görüşmesi yapıyoruz. Sizin için fırsat olan başka otomasyonları da tanıyacaksınız.

Hangisi size daha uygun: Çarşamba veya Perşembe günü 10:00?

Saygılarımla,
Ugur Üzel
Ravna — Şirketinizin yarı-zamanlı yapay zeka direktörü
```

---

## STEP 8: Supabase Insert — Store ALL Companies

**Model:** None (direct SQL)
**Tools:** Supabase (insert)
**Rule:** ALL companies inserted (cold_ready OR discarded). Prevents re-discovery.

### For score ≥ 6 (cold_ready):

```json
{
  "name": "Mefamed Ltd.",
  "url": "mefamed.com.tr",  // normalized (no www, no protocol)
  "phone": "+90 (212) 123-4567",
  "address": "Levent, İstanbul",
  "email": "info@mefamed.com.tr",
  "city": "İstanbul",
  "industry": "tıbbi cihaz dağıtımı",
  "ai_opportunities": [
    { "name": "...", "process": "...", "hours_saved": "..." },
    { "name": "...", "process": "...", "hours_saved": "..." },
    { "name": "...", "process": "...", "hours_saved": "..." }
  ],
  "score": 8,
  "status": "cold_ready",
  "email_draft": "SUBJECT: ...\n\nBODY: ...",
  "next_follow_up": "2026-03-19T08:00:00Z",  // now() + 3 days
  "search_keyword": "tıbbi cihaz distributor İstanbul"
}
```

### For score < 6 (discarded):

```json
{
  "name": "EnterpriseCorp A.Ş.",
  "url": "enterprisecorp.com.tr",
  "phone": null,
  "address": null,
  "email": null,
  "city": "Ankara",
  "industry": "kurumsal yazılım",
  "ai_opportunities": [
    { "reason": "Enterprise size >100 employees — outside ICP" }
  ],
  "score": 2,
  "status": "discarded",
  "email_draft": null,
  "next_follow_up": null,
  "search_keyword": "muhasebe firması Ankara"
}
```

**Insert logic:**
1. For each analyzed company (qualifying or discarded):
   - Check if URL already in DB (rare post-dedup)
   - If exists: skip
   - If not exists: insert
2. Return counts: N inserted, M skipped (already exist), K errors

---

## STEP 9: Telegram Notification (Fixed with jq + MarkdownV2)

**Model:** None (Bash curl)
**Tools:** Bash
**Endpoint:** `https://api.telegram.org/bot{TOKEN}/sendMessage`

**Fix:** Use `jq` to build JSON body, eliminates newline collapse.

### ON SUCCESS:

```bash
MESSAGE=$(cat <<'EOF'
🔍 *Prospect Research Tamamlandı*

✅ *Eklenen adaylar \(N\):*
  • Mefamed Ltd\. — İstanbul \| 8/10
  • Acme Medikal — İzmir \| 7/10

❌ *Elenenler \(M\):*
  • Dişçi Kliniği \(intent dışı\)
  • Büyük Holding A\.Ş\. \(kurumsal — 250 yorum\)

📊 *En yüksek skor:* Mefamed Ltd\. \| 8/10
📞 *İletişim verisi:* N telefon, M e\-posta bulundu
📅 *Sonraki takip:* 2026\-03\-18
🔑 *Arama:* tıbbi cihaz distributor İstanbul
EOF
)

jq -n \
  --arg chat_id "$TELEGRAM_CHAT_ID" \
  --arg text "$MESSAGE" \
  '{chat_id: $chat_id, text: $text, parse_mode: "MarkdownV2"}' | \
curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d @-
```

**MarkdownV2 escaping required for:**
- `.` → `\.`
- `-` → `\-`
- `(` `)` → `\(` `\)`
- `|` → `\|`
- `{` `}` → `\{` `\}`
- `!` `#` `+` `=` `<` `>` → escape with backslash

### ON PARTIAL FAILURE:

```
⚠️ Prospect Research — kısmi sonuç

✅ N eklendi, ❌ M elenendi
⚠️ K hata oluştu

Hata özeti: [company names and error types]
Önerilen adım: hata olan şirketleri daha sonra tekrar deneyiniz
```

### ON COMPLETE FAILURE:

```
❌ Prospect Research başarısız

Hata: {error message}

Nedenler:
  • Discovery başarısız: şehirde şirket bulunamadı
  • Tüm şirketler zaten veri tabanında
  • [other specific error]

Önerilen adım: anahtar kelimeyi değiştirip tekrar deneyiniz
```

---

## STEP 9.5: Log Search to `searches` Table

**Model:** None (direct SQL)
**Tools:** Supabase (execute_sql or apply_migration)
**Task:** Record this search in the `searches` table for future dedup.

**SQL (INSERT OR UPDATE):**

**Before executing, compute normalized values using the same logic as STEP 0.9:**
- `keyword_normalized`: `lower(translate(keyword, 'çşığüöÇŞİĞÜÖ', 'csiguoCsIGUO'))` then strip suffixes
- `location_normalized`: `lower(translate(split_part(location, ',', 1), 'çşığüöÇŞİĞÜÖ', 'csiguoCsIGUO'))`

```sql
-- CRITICAL: keyword_normalized must have suffixes stripped BEFORE insertion.
-- Same logic as STEP 0.9: strip ' ticareti', ' saticisi', ' dagıtıcısı' AFTER transliteration.
-- Example: 'demir celik ticareti' → 'demir celik' (suffix removed)

INSERT INTO searches (
  keyword, location, keyword_normalized, location_normalized,
  count, results_count, last_searched_at
)
VALUES (
  'demir çelik ticareti', 'İzmir',
  'demir celik', 'izmir',
  5, 12, NOW()
)
ON CONFLICT (keyword_normalized, location_normalized) DO UPDATE SET
  keyword = EXCLUDED.keyword,
  location = EXCLUDED.location,
  count = EXCLUDED.count,
  results_count = EXCLUDED.results_count,
  last_searched_at = NOW();
```

**Where:**
- `keyword` — from STEP 0.5 parsed input (e.g., "demir çelik ticareti")
- `location` — from STEP 0.5 parsed input (e.g., "İzmir")
- `keyword_normalized` — computed value (string literal, no placeholders)
- `location_normalized` — computed value (string literal, no placeholders)
- `count` — how many prospects were requested (e.g., 5)
- `results_count` — how many actual results Outscraper returned (e.g., 12)

**Why UPSERT?** If the same search is run again (even with variant spelling like "Kemalpasa" vs "Kemalpaşa"), the ON CONFLICT clause fires and updates the record. This prevents duplicate rows and lets users see "searched last on 2026-03-17" and "found 12 companies".

**Example after run:**
```
searches table:
| keyword | location | keyword_normalized | location_normalized | count | results_count | last_searched_at |
|---------|----------|--------------------|--------------------|-------|---------------|------------------|
| demir çelik ticareti | İzmir | demir celik ticareti | izmir | 5 | 12 | 2026-03-17 10:45:00 |
```

**Timing:** Execute STEP 9.5 **after STEP 9** (Telegram notification), so the entire workflow is logged.

---

## RATE LIMITING & COST

**Outscraper:** 50 records max per run (~$0.15 cost)

**Contact extraction:** Website scraping (Playwright) × count companies. No additional cost.

**Subagent spawning:** count × 1 agents (parallel). Default count=10, configurable.

**Safety:** If count > 50, cap at 50.

---

## Autonomous Operation

For unattended/cron runs:
```bash
claude --dangerously-skip-permissions
```

Bypasses permission dialogs for this session and all subagents. Needed for Orchestrator scheduling. Requires updated `.claude/settings.json` with tool allowlist.

---

## Full 12-Step Execution Flow

**When invoked, this skill executes ALL steps automatically:**

1. **STEP 0.5** — Parse natural language input (Turkish or English) → JSON schema (Sonnet)
2. **⛔ STEP 0.9** — Check if (keyword + location) already searched, **with normalization** → ask user if repeat is OK (DIRECT SQL — no delegation)
3. **STEP 1** — Run Outscraper discovery with buffer (async job + polling) (Haiku)
4. **⛔ STEP 1.5** — Cross-query dedup: **Two-pass** — Pass 1: exact SQL match, Pass 2: Haiku fuzzy check (DIRECT SQL Pass 1, Haiku Pass 2 — no full delegation)
5. **STEP 2** — Pre-filter by Maps metadata (intent matching + hard filters) (Haiku)
6. **⛔ STEP 3** — Dedup against Supabase (URL + name) — safety net (DIRECT SQL — no delegation)
7. **STEP 4** — Website scraping + email extraction (parallel) (Haiku per company)
8. **STEP 5** — ICP scoring (Sonnet per company)
9. **STEP 6** — AI opportunities analysis (Sonnet per company)
10. **STEP 7** — Email draft (Turkish or English, matching input language) (Sonnet per company)
11. **STEP 8** — **Insert all companies into Supabase** (cold_ready OR discarded) (DIRECT SQL — no delegation)
12. **STEP 9** — **Send Telegram notification** with results (Bash curl — no delegation)
13. **STEP 9.5** — **Log search to `searches` table** (upsert keyword + location + result count) (DIRECT SQL — no delegation)

**CRITICAL RULES:**
- **Steps marked ⛔ must use DIRECT Supabase MCP calls, NEVER delegate to subagent**
- **STEP 0.9:** Normalize keyword + location BEFORE querying `searches` table
- **STEP 1.5:** Two-pass approach — Pass 1 is mandatory direct SQL, Pass 2 (Haiku) for fuzzy edge cases
- **STEP 3:** Safety net — catches edge cases STEP 1.5 may have missed

**IMPORTANT:** Steps 8–9.5 execute automatically. No manual intervention needed after invocation.

**Cost optimization:** STEP 0.9 (with normalization) prevents re-searching variants, saving ~$0.15 per duplicate search. STEP 1.5 two-pass dedup reduces unnecessary website scraping downstream.

---

## Checklist Before Running

- [ ] `.env.local` has `OUTSCRAPER_API_KEY` filled
- [ ] `.env.local` has `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` filled
- [ ] Supabase schema applied (phone, address, email columns added)
- [ ] `.claude/settings.json` updated with Playwright + Bash(*) + Supabase MCP
- [ ] Test with real data: `keyword: "tıbbi cihaz distributor", city: "İstanbul", count: 3`
- [ ] Verify email_draft is well-formed (no clichés, formal "Siz")
- [ ] Verify contact data (phone, address, email) populated in DB inserts
- [ ] Verify Telegram notification arrives with proper formatting
- [ ] Test natural language parser with Turkish: `"bana İzmir'de demir çelik ticareti yapan 5 şirket bulabilir misin?"`
- [ ] Test natural language parser with English: `"Find me 5 steel trading companies in Izmir"`

