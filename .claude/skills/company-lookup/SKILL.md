# company-lookup SKILL.md

**Version:** 1.0
**Last updated:** 2026-03-16
**Triggers:** queries about existing prospects in the pipeline (Turkish or English)

---

## PURPOSE

After prospect-research runs and inserts companies into Supabase, you need a way to query them using natural language. This skill enables:

- "show me companies we found last week"
- "companies dealing with pharmacies in istanbul with score above 9 that haven't been contacted yet"
- "bana İstanbul'daki tıbbi cihaz şirketlerini göster"
- Aggregate: "how many prospects do we have?" "average score by city?"

This is **read-only** — no status updates. Those belong in followup-crm.

---

## EXECUTION FLOW

### STEP 1: Natural Language Parser (Sonnet)

**Goal:** Convert raw user query → structured filters JSON.

**Input:** User's question (Turkish or English).

**Output:** JSON object with parsed filters:

```json
{
  "language": "tr",
  "is_aggregate": false,
  "filters": [
    {"column": "score", "op": "gte", "value": 9},
    {"column": "city", "op": "ilike", "value": "*İstanbul*"},
    {"column": "status", "op": "eq", "value": "cold_ready"},
    {"column": "created_at", "op": "gte", "value": "2026-03-09T00:00:00Z"}
  ],
  "sort": "score.desc",
  "limit": 20,
  "display_mode": "summary"
}
```

**Parser Rules:**

#### Time expressions → absolute ISO timestamps (today = 2026-03-16)
- "last week" → `created_at >= 2026-03-09T00:00:00Z`
- "this month" → `created_at >= 2026-03-01T00:00:00Z`
- "today" → `created_at >= 2026-03-16T00:00:00Z`
- "last N days" → calculate backward from today
- Turkish equivalents: "geçen hafta", "bu ay", "bugün" etc.

#### Industry/sector → ILIKE with wildcards on `industry` column
- "pharmacies", "ilaç", "eczane" → `{"column": "industry", "op": "ilike", "value": "*ilaç*"}`
- "steel", "demir çelik", "çelik" → `{"column": "industry", "op": "ilike", "value": "*demir*"}`
- Support fuzzy matching (partial words)

#### Score threshold → INTEGER comparison
- "score above 9" / "skor 9'dan yüksek" → `{"column": "score", "op": "gte", "value": 9}`
- "score 8-10" / "skor 8-10" → two filters: `gte: 8` AND `lte: 10`

#### Status phrases → enum value
Map natural language to status enum:
| Phrase | Value |
|--------|-------|
| "haven't contacted", "henüz ulaşmadık", "mail atmadık" | `cold_ready` |
| "already contacted", "mail attık", "contacted" | `cold_sent` |
| "replied", "geri döndü", "yanıt verdi" | `replied` |
| "won", "kazandık", "kapandı" | `won` |
| "discarded", "elenmiş", "iptal" | `discarded` |

#### City → exact match, normalize Turkish chars
- "istanbul" → `İstanbul`
- "izmir" → `İzmir`
- Turkish-to-Latin: "i" → "ı", handle diacritics

#### Name search (company lookup by name)
- If query = `"show me [COMPANY_NAME]"` or `"tell me about [COMPANY_NAME]"`, set:
  - `{"column": "name", "op": "ilike", "value": "*COMPANY_NAME*"}`
  - `display_mode: "detailed"` (return full record)

#### Aggregate detection
If query contains "how many", "average", "total", "count", "total count":
- Set `is_aggregate: true`
- Parse what to aggregate (COUNT, AVG, GROUP BY)
- Examples:
  - "how many prospects?" → `SELECT COUNT(*) FROM prospects`
  - "average score by city" → `SELECT city, AVG(score), COUNT(*) FROM prospects GROUP BY city ORDER BY AVG(score) DESC`
  - "how many cold_ready in İstanbul?" → `SELECT COUNT(*) FROM prospects WHERE status='cold_ready' AND city='İstanbul'`

#### Telegram intent
- If query includes "send to telegram", "telegram'a gönder", "telegram'a paylaş":
  - Set `send_telegram: true`

#### Default behavior
- No filters = return all (limit 20, sorted by score DESC)
- Always default to `language` matching query (Turkish output if Turkish input)

---

### STEP 2: Build + Execute Supabase Query

**Goal:** Convert filters → PostgREST query + execute.

**Non-aggregate flow:**

1. Load API keys from `.env.local`:
   ```bash
   source /Users/uguruzel/Vibe/ravna-workflows/.env.local
   ```

2. Build query string from filters (using PostgREST operators):
   ```bash
   # Example for: score >= 9, city = İstanbul, status = cold_ready, created last 7 days
   PARAMS="score=gte.9&city=eq.%C4%B0stanbul&status=eq.cold_ready&created_at=gte.2026-03-09T00:00:00Z&order=score.desc&limit=20"
   ```

3. Execute curl call:
   ```bash
   RESULT=$(curl -s "${SUPABASE_URL}/rest/v1/prospects?select=*&${PARAMS}" \
     -H "apikey: ${SUPABASE_KEY}" \
     -H "Authorization: Bearer ${SUPABASE_KEY}")
   ```

4. Parse response JSON. On error, report to user with filter summary.

**PostgREST operator mapping:**
- `eq` → `column=eq.value` (exact match)
- `gte`, `gt`, `lte`, `lt` → `column=gte.value` (numeric comparison)
- `ilike` → `column=ilike.pattern` (case-insensitive substring match)

**Aggregate flow:**

Build SQL query string instead:
```bash
# Example: count cold_ready companies in İstanbul
SQL="SELECT COUNT(*) as count FROM prospects WHERE status='cold_ready' AND city='İstanbul'"

RESULT=$(curl -s "${SUPABASE_URL}/rest/v1/rpc/execute_sql" \
  -X POST \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"$SQL\"}")
```

Alternative: Use `/rest/v1/prospects` with aggregates if PostgREST supports it (check docs). If not, use direct SQL via RPC.

---

### STEP 3: Format + Display Results

**Summary mode** (multiple rows, user didn't ask for details):

```
📋 Sonuçlar: 3 şirket bulundu

1. Terra İlaç — İstanbul | Skor: 9/10 | Durum: cold_ready
   📞 +90 216 523 77 77 | 🌐 terrailac.com.tr
   🤖 Top fırsat: Tedarikçi kaynak yönetimi otomasyonu

2. İdol İlaç — İstanbul | Skor: 9/10 | Durum: cold_ready
   📞 +90 212 XXX XX XX | 🌐 idolilas.com
   🤖 Top fırsat: CRM entegrasyonu

3. Farma Dağıtım — İstanbul | Skor: 8/10 | Durum: cold_sent
   📞 +90 216 YYY ZZ ZZ | 🌐 farmadagitim.com
   🤖 Top fırsat: Fatura otomasyon

---
Filtreler uygulandı: score >= 9, city = İstanbul, status = cold_ready, created >= 2026-03-09
```

**Detailed mode** (single company or user asked "tell me about X"):

```
🎯 Terra İlaç — Full Profile

📍 İstanbul | Sektör: İlaç Dağıtım | Skor: 9/10
📞 +90 216 523 77 77
✉️  info@terrailac.com.tr
🌐 terrailac.com.tr
📋 Adres: Küçükyalı, İstanbul

⏱️ Tarih: 2026-03-15 | Durum: cold_ready | Sonraki Follow-up: —

🤖 AI Fırsatları:
1. Tedarikçi kaynak yönetimi otomasyonu (Malzeme takibi, sipariş tahmin)
2. CRM entegrasyonu (Müşteri veri merkez, otomatik follow-up)
3. Kontrat yönetimi (Sözleşme depolama, ödeme takibi)

💌 Draft Cold Email:
---
Merhaba,

Terra İlaç'ın operasyonlarını incelediğimizde, tedarikçi yönetimi ve fatura işlemleri için otomasyon fırsatları gördük. İlaç dağıtıcıları için tasarlanmış bir AI sistemi hakkında konuşmak ister misiniz?

15 dakikalık bir call'da, maliyet azaltma potansiyelini tartışabiliriz.

Saygılarımızla,
[Ugur]
---
```

**Zero results:**

```
❌ Sonuç yok.

Uyguladığınız filtreler:
- Skor >= 9
- Şehir = İstanbul
- Durum = cold_ready
- Tarih >= 2026-03-09

İpucu: Filtreleri rahatlatmayı deneyin (örneğin skor >= 8, tüm şehirler)
```

**Aggregate results:**

```
📊 İstatistikler

Toplam prospect: 47
Durum dağılımı:
  - cold_ready: 18
  - cold_sent: 15
  - replied: 8
  - discarded: 6

Ortalama skor (durum):
  - cold_ready: 7.8
  - replied: 8.2
  - won: 9.1

Şehir başına ortalama skor:
  İstanbul: 8.3 (12 şirket)
  Ankara: 7.9 (8 şirket)
  İzmir: 8.1 (7 şirket)
```

**Language:** Match query language (Turkish output for Turkish query, English for English).

---

### STEP 4: Optional Telegram Notification

If the parser detected `send_telegram: true`:

1. Format the summary (from Step 3) as a Telegram message.
2. Send via Telegram Bot API:
   ```bash
   curl -X POST \
     "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
     -d "chat_id=${TELEGRAM_CHAT_ID}&text=${MESSAGE}&parse_mode=HTML"
   ```
3. Keep the in-chat display as-is (user still sees results in Claude).

---

## SCHEMA REFERENCE

Available columns in `prospects` table:

| Column | Type | Filterable | Example |
|--------|------|-----------|---------|
| `id` | UUID | — | (read-only) |
| `name` | TEXT | ILIKE | "Terra İlaç" |
| `city` | TEXT | eq / ILIKE | "İstanbul" |
| `industry` | TEXT | ILIKE | "İlaç Dağıtım" |
| `website` | TEXT | — | "terrailac.com.tr" |
| `phone` | TEXT | — | "+90 216 523 77 77" |
| `email` | TEXT | — | "info@terrailac.com.tr" |
| `address` | TEXT | — | "Küçükyalı, İstanbul" |
| `score` | INTEGER (1–10) | gt/gte/lt/lte/eq | 9 |
| `status` | enum | eq | "cold_ready", "cold_sent", "replied", "audited", "proposal_sent", "won", "lost", "paused", "discarded" |
| `created_at` | TIMESTAMP | gte/lte | "2026-03-15T14:32:00Z" |
| `updated_at` | TIMESTAMP | gte/lte | "2026-03-15T14:32:00Z" |
| `next_follow_up` | TIMESTAMP | gte/lte | "2026-03-20T10:00:00Z" |
| `search_keyword` | TEXT | ILIKE | "tıbbi cihaz distributor" |
| `ai_opportunities` | JSONB | — | (parsed from prospect-research output) |
| `email_draft` | TEXT | — | (saved cold email) |

---

## VERIFICATION TESTS

Run these queries to verify the skill works:

### Test 1: Simple score filter
**Query:** "show me all companies with score above 8 in istanbul"
**Expected:** Returns 2-5 companies in İstanbul with score >= 8, sorted by score DESC.

### Test 2: Turkish time window + status
**Query:** "bana geçen hafta bulunan ilaç şirketlerini göster"
**Expected:** Turkish output, filters to: `created_at >= 2026-03-09`, `industry ilike *ilaç*`, sorted by score DESC.

### Test 3: Haven't contacted
**Query:** "haven't contacted yet"
**Expected:** Filters to `status = cold_ready`, returns all uncontacted companies.

### Test 4: Detailed company lookup
**Query:** "tell me about Terra İlaç"
**Expected:** Detailed record with full profile, 3 AI opportunities, email draft preview.

### Test 5: No filters
**Query:** "show me everything"
**Expected:** Returns all companies, limit 20, sorted by score DESC.

### Test 6: Aggregate query
**Query:** "how many prospects do we have?"
**Expected:** Outputs: `Total: 47`. Then breakdown by status and city.

### Test 7: Telegram intent (if Telegram bot is set up)
**Query:** "show me score 9+ companies in istanbul and send to telegram"
**Expected:** In-chat display + Telegram notification sent to `TELEGRAM_CHAT_ID`.

---

## KNOWN LIMITATIONS & FUTURE WORK

- **No pagination UI:** Limit is hard 20. Future: implement `offset/limit` in parser for "next page" / "show more".
- **No full-text search:** Searching by address/description not yet supported. Use exact name/city/industry only.
- **Aggregate via RPC:** Direct SQL aggregates may need a custom Postgres function. Test with simpler COUNT/GROUP queries first.
- **Turkish char normalization:** Case sensitivity might fail on ş, ç, ğ, ı — wrap in LOWER() or use collation.

---

## TROUBLESHOOTING

**"No results":**
- Check that prospect-research has run and inserted data (query Supabase directly: `SELECT COUNT(*) FROM prospects`)
- Relax filters (remove city, lower score threshold, expand date window)

**"API key not found":**
- Verify `.env.local` exists in `/Users/uguruzel/Vibe/ravna-workflows/`
- Check that `SUPABASE_URL` and `SUPABASE_KEY` are set

**"Invalid date":**
- Time expressions must convert to ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)
- Ensure today's date is correctly set to 2026-03-16

**"Encoding error in Turkish chars":**
- When building query params, URL-encode Turkish characters (e.g., "İ" → "%C4%B0")
- Use `jq --raw-output` or similar to handle JSON escaping

---

## SKILL METADATA (for triggering)

**Description:**
Query and filter companies found by prospect-research. Supports natural language (Turkish & English) with filters on score, city, industry, status, and time windows.

**Trigger phrases:**
- "show me prospects"
- "bana şirketleri göster"
- "companies we found [time]"
- "prospects with score [threshold]"
- "who haven't we contacted yet"
- "show me [company name]"
- "list companies in [city]"
- "henüz ulaşmadığımız"
- Any question about existing prospects in the pipeline

**Input:** Natural language query (Turkish or English).

**Output:** Formatted list of companies + optional Telegram notification.

**Dependencies:** Supabase database, prospect-research skill (to have populated data first).

**Permissions:** Read-only. No database writes.

