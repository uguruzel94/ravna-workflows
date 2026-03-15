# Demir-Çelik Ticareti A.Ş. — AI Readiness Audit & Engagement Plan
**Version:** 1.0 | First Real Engagement
**Date Created:** March 2026
**Status:** Pre-Phase-1
**Confidentiality:** Internal (anonymize company name as needed)

---

## 1. COMPANY CONTEXT

**Business:** Steel/iron trading (demir çelik ticareti)
**Size:** 3 people (owner, father, 1 employee)
**Market:** Turkish steel market — highly volatile pricing, rapid changes
**Current Tools:** Netsis (accounting software), email, manual spreadsheets, phone calls, door-to-door
**Market Position:** Same sector where government AI for tax system is already active; sector experiencing widespread AI-related disruption (negative tax-related press); company and peers mostly afraid of AI (equate it to doomsday scenario, not a business tool)
**Knowledge Level:** Only know ChatGPT; treat it like Google or fortune-telling app

**Key Context:**
- Government already using AI in tax system → affecting their business negatively
- Sector has deep skepticism and fear about AI (genel korku dünyayı yönetecek bir entity)
- This company is RIGHT where you need to be: clear pain, clear need, clear resistance to overcome
- Winning here = proof that AI works in real business, not theory
- Winning here also = credibility in their entire sector network

---

## 2. CURRENT PAIN POINTS (From Initial Conversation)

### A. Customer Acquisition & Lead Generation
**Current State:** Manual, low-tech, door-to-door sales methods still primary; door-to-door card distribution for customer hunting
**Problem:** Time-intensive, low-scalability, difficult to track follow-ups, new customers via email (generic, likely low conversion)
**Estimated Time/Week:** 8–12 hours
**Pain Quote:** "Hala insanların dükkanlarına gidip kart vermek gibi müşteri bulma yöntemleri var" *(Still using methods like going door-to-door handing out cards)*

**AI Opportunity:**
- Automated lead outreach emails (drafted, reviewed, sent)
- Follow-up sequences for price inquiry prospects
- CRM-like system for tracking who contacted, who responded, next action
- Could turn email into a lead generation engine instead of information channel

---

### B. Customer Communication & Pricing
**Current State:** All price inquiries answered manually via email; manual price lookup every time
**Problem:** Turkish market prices change constantly; no centralized pricing database; each customer inquiry requires manual research and response
**Estimated Time/Week:** 6–10 hours
**Pain Quote:** "Türkiye piyasasında fiyatlar çok değişiyor. Doğru düzgün veritabanları da yok." *(Turkish market prices change constantly. There's no proper database.)*

**AI Opportunity:**
- Automated market price monitoring (daily/hourly from Turkish sources)
- Price comparison tool (quick: "Ø16 price today?")
- Pre-filled price quote templates (AI-generated, owner approves before sending)
- Telegram bot for instant price lookups (voice: "fiyat?", reply: current + trend)
- Historical price tracking to inform deal decisions

---

### C. Inventory & Market Tracking
**Current State:** Manual tracking; no structured data collection; no trend analysis
**Problem:** Missing insights about market movement, competitive positioning, inventory turnover; decisions made on incomplete information
**Estimated Time/Week:** 4–6 hours
**Pain Quote:** "Veri girişi, verileri bulmak, navigasyon konularında düzgün bir yapay zeka/tech entegrasyonu" *(Data entry, finding data, navigation — proper AI/tech integration needed)*

**AI Opportunity:**
- Automated market news aggregation (daily market summary)
- Price trend visualization + alerts (when prices cross thresholds)
- Inventory turnover analysis per product line
- Competitive positioning insights (who's buying/selling at what price?)

---

### D. Invoicing & Accounting
**Current State:** Using Netsis (Turkish accounting software); manual process; takes "cok vakit" (a lot of time)
**Problem:** Verbal deal → manual entry into Netsis → manual calculations → time-consuming; repetitive data entry; error-prone; blocks other work
**Estimated Time/Week:** 5–8 hours
**Pain Quote:** "Netsis kullanıyorlar ve çok vakit alıyormuş. Ben bu süreci tam bilmiyorum ama göstermelerini istedim." *(They use Netsis and it takes a lot of time. I don't fully understand the process yet but I asked them to show me.)*

**Ugur's Concept:**
> "Eger yapay zeka entegrasyonu veri tabanlarini iyi tanirsa bir ai asistan bot gibi bir seye sesle mesaj veya yazi bile olabilir — yaptiklari deali yazar/konusurlarsa otomatik isleme, fatura kesme ve human intheloop ile onay icin is sahibine geri donus ve onay sonrasi musteriye iletme sisteme girme gibi surecler."

*Translation:* If AI understands the database well, it could work as an AI assistant bot — someone describes a deal (voice/text) → auto-processes → generates invoice + sends approval request to owner → after approval → sends to customer + logs in system.

**AI Opportunity:**
- Telegram/voice bot: "Sold 5 tons of Ø16 at ₺25/kg to [customer name]"
- Auto-extracts: product, quantity, price, customer
- Pre-fills Netsis invoice with extracted data
- Human-in-the-loop: sends owner approval request (Telegram/email)
- After approval: invoice auto-sends to customer + logs in Netsis
- Time saved: 4–6 hours/week, zero manual Netsis entry for routine deals

---

### E. Reporting & Management
**Current State:** No automated reporting; manual compilation of updates; decisions made on ad-hoc information
**Problem:** Owner/father don't have visibility into business health; missing market trends; can't see patterns (best customers, best margins, seasonal changes)
**Estimated Time/Week:** 3–5 hours

**AI Opportunity:**
- Weekly market intelligence report (automated, sent via Telegram/email)
- Dashboard: top customers, deal margins, inventory status, market trends
- Daily price movement alerts
- Monthly business summary (revenue trend, margin trend, market positioning)

---

## 3. TOTAL IMPACT ESTIMATE

| Category | Hours/Week | Urgency |
|----------|-----------|---------|
| Lead generation & outreach | 8–12 | HIGH |
| Price communication | 6–10 | HIGH |
| Market tracking | 4–6 | MEDIUM |
| Invoicing & data entry | 5–8 | HIGH |
| Reporting & analysis | 3–5 | MEDIUM |
| **TOTAL** | **26–41 hours/week** | — |

**Translation:** Currently, roughly **1–1.5 full-time people worth of work** is being eaten by repetitive, non-strategic tasks.

**With AI Integration:** Owner + father can focus on what only humans can do: relationship-building, deal negotiation, market positioning, strategy.

---

## 4. PROPOSED IMPLEMENTATION ROADMAP

### PHASE 1: AUDIT & DEEP UNDERSTANDING (Week 1)
**Goal:** Complete audit, deliver report, get sign-off on top 3 priorities

**Tasks:**
- [ ] Netsis process deep-dive (observe 3-5 invoices being created live, screen record, narrate each step)
- [ ] Map current workflow: daily routine (hour-by-hour for one working day)
- [ ] Identify all data sources:
  - Where are customer contacts stored? (spreadsheet? Netsis? personal phone?)
  - Where do they get market price data? (websites? news? WhatsApp groups?)
  - What does a typical deal look like? (what data points?)
  - What information does a final invoice need?
- [ ] Gather sample data:
  - Last 10 customer contacts (name, phone, email, product interest)
  - Last 5 deals (customer, product, quantity, price, date, outcome)
  - 3 recent invoices (screenshot or PDF to analyze)
  - 1 market price source they use
- [ ] Document Netsis structure & access:
  - Can we access Netsis API documentation?
  - If not, can Puppeteer automate invoice creation?
  - Who has admin access? Can Ugur get read/write access?
- [ ] Create audit report (using ravna-audit-framework structure):
  - Problem statement
  - 3-5 top opportunities ranked by impact
  - Time savings estimate
  - Phased roadmap (sketch)
  - Budget estimate

**Deliverable:** Written Audit Report (Turkish, 2 pages max) + Phase 1–2 detailed plan

**Owner's commitment:** Share Netsis workflow, gather sample data, review report

---

### PHASE 2: MVP — QUICK WINS (Weeks 2–4)
**Goal:** Show immediate value — 8–10 hours/week saved, team trained, systems running

#### 2a. Email Automation for Lead Outreach
**What:** Pre-drafted outreach emails for lead follow-up (owner reviews → approves → sends)
**How:**
- Ugur builds email templates for 5 scenarios: cold lead, price inquiry follow-up, existing customer check-in, past-customer re-engagement, new product announcement
- Owner fills in customer details (name, company, last interaction)
- Claude AI drafts personalized email in Turkish
- Owner reviews 30 seconds, clicks "send"

**Time saved:** 5–8 hours/week
**Tools:** Claude.ai or simple Claude Code script → Telegram input → Gmail integration (or manual paste)
**Launch date:** End of Week 2

#### 2b. Market Price Alerts via Telegram
**What:** Automated daily market price tracking, alerts when prices move
**How:**
- Identify 2-3 Turkish steel market data sources (government stats, industry reports, news aggregators)
- Build Claude Code script to scrape/fetch daily prices for their key products (Ø16, main product lines)
- Send daily summary via Telegram bot (prices, changes, trend direction)
- Optional: alerts when a price crosses a threshold they set ("notify me if Ø16 drops below ₺24/kg")

**Time saved:** 3–5 hours/week (they're no longer manually checking multiple sources)
**Tools:** Claude Code + Brave Search/Puppeteer (for web scraping) + Telegram Bot API + simple Supabase table for price history
**Launch date:** End of Week 2

#### 2c. Quick Price Lookup Tool
**What:** Voice or text message to Telegram: "Ø16 fiyatı?" → instant response with current price + 7-day trend
**How:**
- Same market price data from 2b
- Telegram bot responds to quick queries
- Can be used by any team member, anytime

**Time saved:** 1–2 hours/week (fewer "boss, what's the Ø16 price today?" interruptions)
**Tools:** Telegram Bot API + Supabase price history
**Launch date:** End of Week 3

#### 2d. Team Training & Documentation
**What:** 1-hour in-person training on new tools
**How:**
- Demo each tool (email templates, Telegram bot, price lookup)
- Show them how to use it (fill in customer name → email drafted; ask Telegram → price comes back)
- Explain the logic (this isn't magic, it's data + AI pattern matching)
- Give them the "confidence talk": we start simple, prove it works, expand later
- Leave one-page reference sheet (Turkish) on the wall

**Time:** 1 hour (entire team present)
**Date:** End of Week 3

**Deliverable:** All 3 systems live, team trained, email templates ready for first real use, Telegram bot sending daily prices

**Owner's commitment:** Review and approve first 10 emails before sending; give Ugur feedback on what's working/not working

---

### PHASE 3: NETSIS INVOICE AUTOMATION (Weeks 5–8)
**Goal:** 50%+ of invoices auto-created, 2–3 hours/week saved, zero errors (human review 100%)

**The System:**
```
Owner/employee tells Telegram bot (voice or text):
"Sold 5 tons of Ø16 at ₺25/kg to Acme Steel"
           ↓
Claude Code AI extracts:
- Product: Ø16
- Quantity: 5 tons
- Price: ₺25/kg
- Customer: Acme Steel
           ↓
Netsis invoice auto-populated with extracted data
(IF Netsis API available) OR Puppeteer automates field entry
           ↓
System sends owner approval link via Telegram:
"Invoice #XYZ ready for Acme Steel — review below — approve/reject?"
           ↓
Owner clicks "Approve"
           ↓
Invoice auto-sends to customer's email + logged in Netsis
           ↓
Deal recorded in Supabase (for future analysis)
```

**Week 5:**
- [ ] Understand exact Netsis structure (database schema, required fields, API)
- [ ] Build data extraction logic (test with 10 verbal descriptions → extracted data accuracy)
- [ ] Build Netsis integration (API or Puppeteer automation)

**Week 6:**
- [ ] Beta test with 5 real deals (owner provides real deals from last week)
- [ ] Iterate based on feedback (missing fields? wrong format? redo)
- [ ] Document approval workflow for owner

**Week 7:**
- [ ] Scale to 10+ deals
- [ ] Fine-tune error handling (what if customer name is ambiguous? fallback to human review)
- [ ] Team training (employee practices with 5 deals)

**Week 8:**
- [ ] Monitoring (check every generated invoice for accuracy before sending)
- [ ] Documentation & SOP (how to use, what to do if system fails)
- [ ] Metrics: % of invoices auto-generated, error rate, time saved

**Deliverable:** Telegram invoice bot live, 15+ real deals processed, zero errors (human review 100%), team trained

**Owner's commitment:** Provide access to Netsis (read/write), test with 5 real deals, approve/reject via Telegram

---

### PHASE 4: DASHBOARD & MARKET INTELLIGENCE (Weeks 9–12)
**Goal:** Automated reporting, visibility into business health, 15+ hours/week total saved

#### 4a. Customer & Deal Tracking Dashboard
**What:** Simple web dashboard showing:
- Top 10 customers (by volume, by margin)
- Recent deals (last 30 days)
- Inventory status by product
- Profit margin by deal, by customer, by product line

**How:**
- Data flowing into Supabase from Phase 3 (each invoice = one record)
- Simple web interface (Astro or Next.js) showing key metrics
- Owner checks dashboard every morning (5 minutes instead of 30 minutes of manual spreadsheet digging)

**Time saved:** 2–3 hours/week
**Tools:** Supabase + simple web frontend
**Launch date:** Week 11

#### 4b. Weekly Market Intelligence Report
**What:** Automated report sent every Sunday evening to owner's email/Telegram:
- Prices moved up/down (and by how much)
- What competitors are buying/selling at
- News affecting the market (government policy, industry trends)
- Recommendations based on current market state ("good time to buy Ø16" vs "prices dropping, wait")

**How:**
- Claude Code script aggregates market data + news from the week
- Writes a 1-page report in Turkish
- Sends via email + Telegram

**Time saved:** 2–3 hours/week (owner no longer compiles this manually)
**Tools:** Claude Code + Brave Search + Telegram
**Launch date:** Week 10

#### 4c. Market Trend Analysis & Price Prediction
**What:** Simple trend charts showing 90-day price history + basic prediction
**How:**
- Dashboard includes chart: "Ø16 price last 90 days" with trend line
- Prediction (simple): "at current trend, Ø16 will be ₺X in 2 weeks"
- No fancy ML needed — just Claude analyzing the pattern

**Time saved:** 1–2 hours/week (owner makes more informed decisions faster)
**Tools:** Supabase + dashboard
**Launch date:** Week 12

**Deliverable:** Dashboard live, reports flowing weekly, team using both for decision-making

**Owner's commitment:** Check dashboard daily, read weekly report, give feedback on what's useful/not useful

---

### PHASE 5: OPTIMIZATION & HANDOFF (Week 13+)
**Goal:** Make everything owner-operable, document everything, you step back

**Tasks:**
- [ ] Documentation of every system (how it works, how to maintain it, how to fix it if broken)
- [ ] SOP for team (step-by-step how to use each tool)
- [ ] Cost optimization (consolidate tools, drop unused ones, optimize spending)
- [ ] Training: can the father or employee run these systems without Ugur?
- [ ] Plan for next improvements (owner-led)

**Deliverable:** Company runs 90% of the system independently, Ugur on "maintenance mode" only (1-2 hours/month)

---

## 5. TECHNOLOGY STACK

### Core Tools
| Tool | Purpose | Cost | Why |
|------|---------|------|-----|
| Claude Code CLI | Orchestration, automation, bot logic | Free | Full control, integrated with everything |
| Telegram Bot API | Alerts, notifications, voice/text input | Free | Perfect for Turkish SMBs, familiar interface |
| Supabase | Database for customers, deals, prices | ~₺500/month (free tier acceptable) | PostgreSQL, easy integration, good for Turkey |
| Brave Search API | Market price data, news aggregation | ~₺800/month | Fast, reliable, no AI bloat |
| Puppeteer (MCP) | Netsis automation if no API | Free | Automate data entry, screenshot analysis |
| Resend | Email delivery for outreach | ~₺700/month | Reliable, Turkish-friendly |
| Google Workspace/Gmail | Email sending infrastructure | Existing | Already have it |

### Architecture Diagram
```
┌─────────────────────────────────────────────────┐
│           TELEGRAM BOT (Human Input)             │
│  - "Sold 5 tons of Ø16 at ₺25/kg to Acme"     │
│  - "Ø16 fiyatı?"                               │
│  - Approve invoice?                             │
└──────────────┬──────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────┐
│      CLAUDE CODE ORCHESTRATOR                    │
│  ├─ Email Generator (lead outreach)             │
│  ├─ Price Extractor (market monitoring)         │
│  ├─ Invoice Data Parser (Telegram input)        │
│  ├─ Netsis Integrator (invoice creation)        │
│  ├─ Report Generator (weekly intelligence)      │
│  └─ Dashboard Data Processor                    │
└──────────────┬──────────────────────────────────┘
               │
       ┌───────┼───────┐
       ↓       ↓       ↓
    ┌──────────────────┐    ┌──────────────────┐
    │   SUPABASE       │    │   NETSIS API     │
    │ (Local DB)       │    │ or Puppeteer     │
    │                  │    │ automation       │
    │ - customers      │    │                  │
    │ - deals          │    │ - invoice create │
    │ - prices         │    │ - invoice send   │
    │ - margins        │    │                  │
    └─────────┬────────┘    └──────────────────┘
              │
      ┌───────┴─────────┐
      ↓                 ↓
┌──────────────┐  ┌────────────────────┐
│ DASHBOARD    │  │ TELEGRAM/EMAIL OUT  │
│ (web UI)     │  │                    │
│              │  │ - daily prices     │
│ - customers  │  │ - weekly report    │
│ - deals      │  │ - alerts           │
│ - margins    │  │ - approvals        │
│ - trends     │  │ - invoice delivery │
└──────────────┘  └────────────────────┘
```

### Estimated Monthly Costs
```
Telegram Bot API:         ₺0 (free)
Brave Search API:         ~₺800 (market data)
Supabase:                 ₺0-500 (free tier to paid tier)
Resend:                   ₺700 (email)
Google Workspace:         [existing]
Claude API:               ~₺1,500-2,000 (for automation)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:                    ~₺3,000-3,500/month
```

**Justification:** First 3 months, this is an investment in removing 15+ hours/week of work. Value generated >> costs.

---

## 6. SUCCESS METRICS

### Phase 1 (Week 1)
- [ ] Audit report delivered and understood
- [ ] Owner agrees on top 3 priorities
- [ ] Netsis process fully documented
- [ ] Team has agreed to the plan

### Phase 2 (Week 4)
- [ ] Email templates drafted, 3+ sent successfully
- [ ] Daily price alerts coming to Telegram consistently
- [ ] Team using price lookup tool 5+ times/day
- [ ] Owner estimate: "saving 6-8 hours/week minimum"
- [ ] Zero customer complaints about email quality
- [ ] Owner approval on expanding to Phase 3

### Phase 3 (Week 8)
- [ ] 15+ invoices created via bot
- [ ] 0 invoices with errors (human review 100%)
- [ ] Netsis workflow 50%+ automated
- [ ] Team comfortable using bot (zero support requests)
- [ ] Owner: "saving 2-3 hours/week easily"
- [ ] Approval to move to Phase 4

### Phase 4 (Week 12)
- [ ] Dashboard live with 90+ days of data
- [ ] Weekly reports being read (owner asks follow-up questions based on them)
- [ ] Trend analysis being used in deal decisions ("you said prices are dropping, so I negotiated lower")
- [ ] Total estimated savings: 15+ hours/week
- [ ] Team fully autonomous (can use system without Ugur)

### Phase 5 (Week 13+)
- [ ] Documentation complete and tested (father can follow it alone)
- [ ] Zero monthly support requests from company
- [ ] System still running smoothly after Ugur steps back
- [ ] Company wants to expand to next features (autonomously or with Ugur's help)

---

## 7. THE AUDIT REPORT (To Deliver After Phase 1)

**Format:** Turkish, 2 pages, written for owner + father

**Structure:**
```
[ŞİRKET ADI] — Yapay Zeka Hazırlık Raporu
Hazırlayan: Uğur [Soyadı] | Ravna
Tarih: [date]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ÖZET
[2-3 cümle. Şirketi över, ama dürüst gözlem.]

"Demir çelik ticareti zor bir iş. Hızlı değişen piyasa, sabit müşteri kaybetme riski, tekrar eden idari işler — hepsi aynı anda. Gözlemlediğim kadarıyla, ekibiniz bu zorlukları çok iyi idare ediyor. Ama şu an, haftada 26-41 saat insan emeği, saf tekrar eden görevlere gidiyor — müşteri bulmak, fiyat vermek, fatura kesmek. Bu saatler geri kazanılabilir. Yapay zeka bunu yapabilir."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TESPİT ETTİĞİMİZ 3 TEMEL FIRSAT

1. MÜŞTERI BULMAK VE İLETİŞİM
   Mevcut: Elle yazılı e-postalar, kapı kapı dolaşma
   Çözüm: AI tarafından hazırlanan kişiselleştirilmiş e-postalar + müşteri takip sistemi
   Tahmini tasarruf: 8-10 saat/hafta

2. FİYAT TAKIBI VE YANIT
   Mevcut: Manuel internet araması her soruda, e-mail yanıtları
   Çözüm: Otomatik günlük piyasa takibi + anında fiyat sorgusu (Telegram)
   Tahmini tasarruf: 6-10 saat/hafta

3. FATURA KESMEK VE VERİ GİRİŞİ
   Mevcut: Sözlü anlaşma → Netsis'e elle girme → hesaplamalar → müşteriye gönderme
   Çözüm: Ses/yazı → otomatik fatura → onay → gönderme sistemi
   Tahmini tasarruf: 5-8 saat/hafta

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOPLAM ETKİ
Haftalık tasarruf:    26-41 saat
Aylık tasarruf:       104-164 saat
Yıllık tasarruf:      1,248-1,968 saat

Buna neden olur:
- Daha çok müşteri bulmaya zaman
- Daha iyi fiyat kararları
- Eksik işler yok ("unuttuk faturayı göndermeyi" diye sorunlar yok)
- Sahip + baba, stratejiye odaklanabilir

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ÖNERİLEN SONRAKI ADIM
[1 paragraf. Doğal, satış yapmayan.]

"Bu üç alanı haftalar içerisinde hayata geçirmek mümkün. Başlangıçta basit — e-posta şablonları ve fiyat bildirimleri. Daha sonra müşteri ve fatura sistemleri. Her adımda insan kontrolü var — karar siz alıyorsunuz, yapay zeka sadece işi hallediyor.

Önerdiğim: ilk hafta derinlemesine planlama yapıp, ikinci hafta başlarız. Dördüncü hafta sonu itibarıyla 8-10 saat/hafta tasarruf göreceksiniz.

Siz başında kalırsınız. Yapay zeka hizmetçisi gibi düşün — siz söylersiniz, yapıyor."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

İletişim: ugur@ravna.ai | +90 XXX XXX XX XX
```

---

## 8. CRITICAL NEXT STEPS (Before Next Meeting)

### Tasks for Ugur:
1. **Record Netsis workflow** (15 min video)
   - Screen-record yourself or the owner creating 2-3 invoices
   - Narrate: what data goes in, in what order, what fields are required?
   - Save this video — analyze it later, reference it during implementation

2. **Gather sample data** (1 hour)
   - Last 10 customer contacts (name, company, phone, email, product interest)
   - Last 5 actual deals (customer, product, qty, price, date, any notes)
   - 3 recent invoices (PDF or screenshot)
   - 1-2 examples of market price sources they use (website, WhatsApp channel, etc.)

3. **Ask about Netsis access**
   - Can Ugur get read/write access to Netsis?
   - Is there an API available? (if yes, ask for documentation)
   - If not, Puppeteer automation might be needed (more complex, but doable)

### Tasks for the Owner:
1. **Agree to Phase 1 & 2 timeline**
2. **Commit time for:**
   - Showing Netsis workflow (45 min)
   - Reviewing draft emails (10 min/day for week 1)
   - Testing Telegram price alerts (passive, just use them)
   - 1-hour team training (week 3)

### Timeline
- **Today (initial conversation):** Done ✓
- **Within 3 days:** Ugur records Netsis, gathers sample data
- **Within 1 week:** Ugur prepares Phase 1-2 detailed plan, schedules next meeting
- **Within 2 weeks:** Phase 1 audit complete, report delivered
- **Weeks 2-4:** Phase 2 MVP live
- **Weeks 5-8:** Phase 3 invoice bot live
- **Weeks 9-12:** Phase 4 dashboard + reporting
- **Week 13+:** Handoff, company runs independently

---

## 9. POSITIONING & FRAMING (For Owner's Skepticism)

**The core tension:** Government uses AI for taxes. Why shouldn't you use it for your business?

**Exact script to use if owner expresses fear:**

> "Hükümet yapay zekayı vergi sisteminizde kullanıyor — elektronik vergi levhasında, muhasebede. Siz neden kullanmayasınız kendi işinizde, müşteri bulma, fiyat takibi, fatura işlemlerinde?
>
> Burada yapay zeka, işçi değildir. Siz ve babanız hala başımdasınız. Siz kararları alıyorsunuz. Yapay zeka, sadece sizin için tekrar eden, zaman alan işleri çıkartıyor.
>
> Başında olmak istiyorsan, olmayacaksın. Seni ve babanı serbest bırakıyor — strateji düşünmek, müşteri ilişkisi kurmak, pazarı anlamak için zaman yaratıyor.
>
> Belki ChatGPT'yi sadece ödev gibi kullanıyorsun. Ama iş dünyasında yapay zeka, bir operasyon yöneticisi gibi çalışıyor — o tutar işleri, sen üst seviyelere bakıyorsun."

**Translation essence:**
"Government is already using AI in your taxes. Why shouldn't you use it to find customers, track prices, and create invoices? Here, AI is not a replacement — it's a tool that makes you and your father free to do what only humans can do. Start simple, prove it works, grow from there."

---

## 10. DOCUMENT & RECORD EVERYTHING

**This is your first real case study.** Every conversation, every demo, every win needs to be captured.

**Document system:**
```
/audits/
  demir-celik-trading/
    01-initial-conversation-notes.md    ← what you just received
    02-netsis-process-recording.mp4     ← their Netsis workflow
    03-audit-meeting-notes.md           ← Phase 1 meeting
    04-audit-report.md                  ← final report (Turkish)
    05-phase2-email-templates.md        ← live email examples
    06-phase2-feedback.md               ← what worked, what didn't
    07-phase3-invoice-bot-logs.md       ← real invoices created
    08-success-metrics-week4.md         ← proof of time saved
    09-client-testimonial.md            ← what they say (permission?)
    10-outcome.md                       ← final case study
```

After you close this engagement (successfully, hopefully), you'll have:
- Before/after metrics (26 hours/week → actually 15 hours/week? document it)
- Real company, real problems, real solutions
- Permission to anonymize and use as case study #1
- Talking points for prospect #2 ("I helped a steel trading company in Turkey...")

---

## SUMMARY: THIS IS YOUR MOMENT

This company is **perfect** for your first engagement:
- Clear pain points (26–41 hours/week of wasted time)
- Skeptical about AI (= bigger win if you prove it works)
- Sector with market resistance (= differentiation for you)
- Small enough to move fast (3 people, decisions made immediately)
- Tech-adjacent enough (already using Netsis, comfortable with email, WhatsApp)

If you nail this, you have:
1. Proof that you can do what you say (case study)
2. Detailed playbook for the next engagement (Phase 1-5 template)
3. Sector expertise (steel trading) that you can claim
4. Success story in Turkish (for all Turkish prospects)

Now: record that Netsis workflow, schedule your Phase 1 audit, and show them that Ravna works.
