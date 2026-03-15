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

# Prospect Research Agent v2

**Purpose:** Find and qualify Turkish SMB prospects in a specific industry/city, score them by ICP fit, draft cold outreach emails, and stage them in the pipeline.

**Input schema:**
```json
{
  "keyword": "tıbbi cihaz distributor",
  "city": "Ankara",
  "count": 3,
  "industry": "healthcare"
}
```

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `keyword` | string | required | Industry/sector search term (e.g., "muhasebe firması", "tıbbi ekipman") |
| `city` | string | required | Turkish city (e.g., "İzmir", "İstanbul") |
| `count` | integer | 3 | How many companies to research (max 5, min 1). Higher counts spawn more Haiku subagents. |
| `industry` | string | optional | If known (e.g., "accounting", "healthcare"), improves Brave search specificity |

**Output:** Prospects inserted into Supabase `prospects` table with status `'cold_ready'` or `'discarded'`, cold email draft staged for review (if score ≥ 6).

---

## STEP 1: Discovery — Find Company URLs

**Model:** Haiku (1 subagent)
**Input:** keyword, city
**Tools:** Brave Search API

**Task:** Run 3 parallel Brave searches to discover direct company websites matching the keyword + city:

```
Search 1: "{keyword} {city} firma"
Search 2: "{keyword} {city} şirket iletişim"
Search 3: "{keyword} {city} hakkımızda"
```

**Filtering rules:**
- **Keep:** URLs with `.com.tr`, `.com`, `.net` domains that look like direct company websites
  - Examples: mefamed.com.tr, acmemedical.com.tr, danismanlık.net
- **Skip:** Directory/marketplace/news sites:
  - sahibinden.com, endustri.com, kobiforum.org, yenibirligi.org.tr, komeri.com
  - LinkedIn.com, Facebook.com, Instagram.com, Google.com, Twitter.com
  - News/blog sites: haberturk.com, bbc.com.tr, internethaber.com
  - Generic B2B directories (unless it's a direct company site link)
- **Skip:** Results without a clear URL or redirects

**Extraction logic:**
1. From each search result title + URL, extract ONLY the domain/company website URL
2. If result is a LinkedIn profile or directory, skip it
3. Collect up to `count × 2` unique company URLs (buffer for dedup)
4. Stop extracting if you hit `count × 2` or all 3 searches are exhausted

**Output format (JSON):**
```json
{
  "discovered_urls": [
    "mefamed.com.tr",
    "acmemedical.com.tr",
    "healthequip.com.tr",
    "etc..."
  ],
  "search_queries": [
    "{keyword} {city} firma",
    "{keyword} {city} şirket iletişim",
    "{keyword} {city} hakkımızda"
  ],
  "total_found": 6
}
```

**Error handling:**
- If all 3 searches return ONLY directories/social media/news sites (0 valid company URLs):
  - Return failure message: `"Discovery failed: no direct company websites found for '{keyword}' in {city}. Try a more specific keyword (e.g., add 'ltd', 'a.ş.', or specific product name)."`
  - STOP — do not proceed to next step
- If <2 company URLs found: continue with what was found (don't fail)

---

## STEP 2: Deduplication — Check DB

**Model:** None (direct SQL via Supabase)
**Input:** Discovered URLs
**Tools:** Supabase execute_sql

**Task:** Query the `prospects` table for URLs that already exist (in any status, including `'discarded'`).

**URL normalization before comparison:**
1. Strip protocol: `http://` or `https://` → remove
2. Strip `www.`: `www.mefamed.com.tr` → `mefamed.com.tr`
3. Strip trailing slash: `mefamed.com.tr/` → `mefamed.com.tr`
4. Use normalized domain for comparison
5. Store normalized URL in database

**SQL query (pseudocode):**
```sql
SELECT url FROM prospects
WHERE url IN (normalized_list)
AND status IN ('cold_ready', 'cold_sent', 'replied', 'audited', 'proposal_sent', 'won', 'lost', 'paused', 'discarded');
```

**Logic:**
- For each discovered URL, normalize it
- Query DB: is this normalized URL already in prospects table?
- If YES: skip (mark as "duplicate")
- If NO: add to qualified list
- Keep top `count` new URLs (after filtering duplicates)

**Output:**
```json
{
  "qualified_urls": [
    "mefamed.com.tr",
    "acmemedical.com.tr"
  ],
  "duplicates_skipped": ["healthequip.com.tr"],
  "total_new": 2
}
```

**Error handling:**
- If ALL discovered URLs are already in DB:
  - Return: `"No new prospects found — all {N} discovered companies are already in the pipeline. Try a different keyword or city."`
  - STOP — do not proceed to next step

---

## STEP 3: Parallel Research — Scrape & Search Each Company

**Model:** Haiku × 2 per company (N × 2 total, run in parallel)
**Input:** Qualified URLs
**Tools:** Puppeteer MCP (subagent A), Brave Search API (subagent B)

**Task:** For each qualified URL, spawn TWO independent subagents simultaneously:

### Subagent A: Website Scraper (Puppeteer)

**Input:** company_url
**Timeout:** 15 seconds per URL
**Steps:**

1. Use `puppeteer_navigate` to navigate to the company URL
2. Wait for page load (15s timeout)
3. Extract full page text with `puppeteer_evaluate`:
   ```javascript
   document.body.innerText
   ```
   This returns all visible text from the page.
4. If main page is sparse (<200 words), also try:
   - URL + `/hakkimizda` (About us)
   - URL + `/about` (fallback)
   - Try each once (don't wait for both)
5. Combine all scraped text

**Extract from text:**
- Company description / mission statement
- Products or services offered (list specific items)
- Team size signals:
  - "X person team", "X employees", job listings
  - "Kurucumuz" (founder) sections, "Ekipimiz" (our team)
- Tech stack mentions (software, tools, systems they use)
- Founder/owner name (look for: "kurucu", "genel müdür", "başkan", "CEO")
- Any mention of AI, automation, digital transformation, technology initiatives

**Return format:**
```json
{
  "url": "mefamed.com.tr",
  "puppeteer_text": "Full page text extracted... (max 1500 words)",
  "status": "success" | "timeout" | "error"
}
```

**Error handling:**
- If navigate times out (>15s) or fails: return `{"status": "timeout"}`
- If page returns 404 or error: return `{"status": "error"}`
- If status is timeout/error: skip Puppeteer data for this company, use only Brave search

### Subagent B: Industry Research (Brave Search)

**Input:** company_name (inferred from URL), industry (if provided), keyword
**Steps:**

1. Run 2 Brave searches per company:
   - Search 1: `"{company_name} hakkında {city}"` (about company)
   - Search 2: `"{industry_if_provided else keyword} Türkiye yapay zeka KOBİ 2025"` (sector AI adoption)
2. Extract top 3 result titles + snippets from each search
3. Combine all snippets into a single text block

**Return format:**
```json
{
  "url": "mefamed.com.tr",
  "brave_search": "Search 1: [titles and snippets]... Search 2: [titles and snippets]... (max 500 words)",
  "status": "success"
}
```

**Rate limit tracking:** Each company = 2 Brave calls. For count=5, that's 10 calls. Plus 3 discovery calls = 13 total. Budget: 30 calls max per skill invocation.

---

## STEP 4: Analysis & ICP Scoring (Sonnet per company)

**Model:** Sonnet
**Input:** company_name, puppeteer_text, brave_search, keyword, industry
**Task:** Analyze research data and score ICP fit.

**For each company, generate:**

### AI Opportunities (3 specific to this business)

Each opportunity should:
- Have a specific name (not generic): e.g., "Otomatik fatura işleme", "Lead scoring sistemi", "Müşteri yorum analizi"
- Identify what manual process it replaces: e.g., "muhasebeciler tarafından el ile yapılan fatura girişi"
- Estimate hours/week saved: e.g., "8-10 saat/hafta"

**Example format:**
```json
{
  "opportunity_1": {
    "name": "Otomatik fatura işleme",
    "process": "İthalatçılar tarafından tedarikçi faturalarının Netsis ERP'ye el ile girilmesi",
    "hours_saved": "10 saat/hafta"
  }
}
```

### Industry (inferred)

From scraped text + Brave results, identify the industry. Examples:
- "sağlık teknolojisi" (healthcare)
- "muhasebe hizmetleri" (accounting)
- "lojistik" (logistics)

### ICP Score (1–10)

Scoring rubric:
```
Base: 1 point

+2: Healthcare-adjacent OR professional services (accounting, law, consulting)
+2: Based in Turkey (confirmed from research or city match)
+2: Company size 5–50 people (inferred from team mentions, job postings)
+2: Owner-operated (founder visible in research, not a large corp)
+2: No visible current AI usage (no mentions of AI tools, automation, digital initiatives)

Score interpretation:
10 = perfect fit (all criteria met)
6–9 = good fit (most criteria met)
< 6 = poor fit (discard)
```

### Discard Decision

If score < 6:
- Record reason for discard: e.g., "Enterprise size (>100 employees)", "No Turkish operations", "Already using AI extensively"
- Mark for status `'discarded'` in DB
- Do NOT draft email
- Do NOT continue to Step 5

If score ≥ 6:
- Continue to Step 5 (email draft)

**Output format:**
```json
{
  "url": "mefamed.com.tr",
  "company_name": "Mefamed Ltd.",
  "industry": "tıbbi cihaz dağıtımı",
  "ai_opportunities": [...],
  "score": 8,
  "status": "cold_ready" | "discarded",
  "discard_reason": null | "reason if discarded"
}
```

---

## STEP 5: Email Draft (Sonnet per qualifying company)

**Model:** Sonnet
**Input:** company_name, founder_name (if found), ai_opportunities, industry
**Task:** Draft a Turkish cold outreach email specific to this company.

**Rules:**

**Salutation:**
- If founder name found: `"Sayın {Founder First Name} Bey,"` (e.g., "Sayın Mehmet Bey,")
- Otherwise: `"Sayın Yetkili,"`

**Tone:** Formal "Siz" throughout (never "sen"). Professional but warm.

**Subject line:**
- Max 10 words
- No question marks
- Concrete and specific (reference something about their business)
- Examples:
  - "Tıbbi cihaz lojistiğinde 15 saat/hafta tasarruf"
  - "Fatura işleme sürelerini yarıya indirin"
  - "Ravna: 45 dakikalık AI hazırlık görüşmesi"

**Body:**
- 150–200 words
- Opening: Reference one specific detail from research (not generic)
  - Example: "Mefamed'in İstanbul'da 20+ sağlık tesisine sunduğu dağıtım hizmetini gördük" (reference from research)
- Value proposition: Mention ONE top AI opportunity briefly
  - Example: "Özellikle siparişleri ve faturaları otomatik işlemek, haftada 12 saat boşaltabilir"
- Close: Offer a specific time commitment
  - "Sizin için ücretsiz 45 dakikalık yapay zeka hazırlık görüşmesi yapabilirim"
  - "Hangisi size daha uygun: Çarşamba veya Perşembe?"

**Forbidden words (Turkish business clichés):**
- eşsiz, güçlü, yenilikçi, çözüm odaklı, dönüştürücü, ilericilik, başarı

**Preferred verbs (concrete, action-oriented):**
- azaltır, kurtarır, inşa eder, gösterir, hesaplar, otomatikleştirir, hızlandırır, tasarruf sağlar

**Output format:**
```
SUBJECT: {subject line}

BODY:
{email body}
```

---

## STEP 6: Supabase Insert — Store ALL Evaluated Companies

**Model:** None (direct SQL via Supabase)
**Input:** All analyzed companies (both qualifying AND discarded)
**Tools:** Supabase insert + update

**Rule:** ALL companies get inserted, not just qualified ones. This prevents re-discovering the same company later.

### For score ≥ 6 (cold_ready):

```json
{
  "name": "Mefamed Ltd.",
  "url": "mefamed.com.tr",
  "city": "İstanbul",
  "industry": "tıbbi cihaz dağıtımı",
  "ai_opportunities": [
    { "name": "...", "process": "...", "hours_saved": "..." },
    { "name": "...", "process": "...", "hours_saved": "..." },
    { "name": "...", "process": "...", "hours_saved": "..." }
  ],
  "score": 8,
  "status": "cold_ready",
  "email_draft": "SUBJECT: Tıbbi cihaz lojistiğinde 15 saat/hafta tasarruf\n\nSayın Mehmet Bey,\n\n...",
  "next_follow_up": "2026-03-18T08:00:00Z",
  "search_keyword": "tıbbi cihaz distributor İstanbul"
}
```

**next_follow_up calculation:** Use SQL `now() + interval '3 days'` — NOT a hardcoded timestamp string.

### For score < 6 (discarded):

```json
{
  "name": "EnterpriseCorp A.Ş.",
  "url": "enterprisecorp.com.tr",
  "city": "Ankara",
  "industry": "kurumsal yazılım",
  "ai_opportunities": [
    { "reason": "Enterprise size >100 employees — outside ICP" }
  ],
  "score": 3,
  "status": "discarded",
  "email_draft": null,
  "next_follow_up": null,
  "search_keyword": "muhasebe firması Ankara"
}
```

**Insert process:**
1. For each company analyzed (qualifying or discarded):
   - Check if URL already exists in DB (should be rare given Step 2 dedup)
   - If exists: SKIP (don't update)
   - If not exists: INSERT
2. Collect insert results (success count, errors)
3. Return summary

---

## STEP 7: Telegram Summary + Completion

**Model:** None (Bash curl to Telegram API)
**Tools:** Bash curl
**Endpoint:** `https://api.telegram.org/bot{TOKEN}/sendMessage`

**Required:** TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.local

**Message format depends on outcome:**

### ON SUCCESS:
```
🔍 Prospect Research tamamlandı

✓ {N} aday eklendi:
  • Mefamed Ltd. (İstanbul, 8/10)
  • Acme Medical (İzmir, 7/10)

✗ {M} elenendi (ICP mismatch)

En yüksek skor: Mefamed Ltd. | 8/10
Sonraki takip: 2026-03-18
```

### ON PARTIAL FAILURE (some companies errored, some succeeded):
```
⚠️ Prospect Research — kısmi sonuç

✓ {N} eklendi, ✗ {M} elenendi
⚠️ {K} hata oluştu

Hata özeti: [company names and error messages]
Önerilendeyim: hata olan şirketleri daha sonra tekrar deneyiniz
```

### ON COMPLETE FAILURE (nothing processed):
```
❌ Prospect Research başarısız

Hata: {error message}

Nedenler:
  • Discovery başarısız: şehirde şirket bulunamadı
  • Tüm şirketler zaten veri tabanında
  • [other specific error]

Önerilen adım: anahtar kelimeyi değiştirip tekrar deneyiniz
```

**Telegram API call (Bash curl):**
```bash
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "{\"chat_id\": \"${TELEGRAM_CHAT_ID}\", \"text\": \"<message>\", \"parse_mode\": \"HTML\"}"
```

---

## Rate Limiting & Safety

**Brave Search budget:** 30 calls max per skill invocation.
- Discovery: 3 calls
- Research: count × 2 calls (max 5 × 2 = 10)
- Total: 13 calls (with 17-call buffer)

**Subagent spawning:** Max 10 simultaneous Haiku agents (5 companies × 2 agents each).
- If count > 5: reduce to 5
- If Haiku spawn limit hit: queue companies and process in batches

**Context window risk:** Long website text (1500 words) × 5 companies = 7500 words of context. Safe within Sonnet/Haiku limits.

**Error recovery:** If a single company's research fails (Puppeteer timeout), continue with Brave-only data. Don't fail the entire batch.

---

## Checklist Before Running

- [ ] `.env.local` has `TELEGRAM_CHAT_ID` filled
- [ ] Supabase schema applied (prospect_status includes 'discarded', url UNIQUE, search_keyword exists)
- [ ] Test with real keyword + city: `keyword: "tıbbi cihaz", city: "İstanbul", count: 2`
- [ ] Verify email_draft is well-formed Turkish
- [ ] Check Telegram notification arrives
- [ ] Verify Supabase inserts have normalized URLs (no `http://`, no `www.`)
