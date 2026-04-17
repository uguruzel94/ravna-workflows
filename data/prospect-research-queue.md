# Prospect Research Queue — İzmir
**Last updated:** 2026-04-06
**Scope:** İzmir only. Tuesdays and Fridays at 10:00 Turkey time.
**Per run:** count=25 (Outscraper pulls up to 50 for buffer)
**Free tier budget:** 500 records/month (~4 runs/month at 50 records each = ~200 records/month with this cadence)

---

## How This Works
The scheduled task reads this file, picks the **first row with status `pending`**, runs the prospect-research skill with those parameters, then updates the row to `done` and commits the change back to the repo. If no pending rows remain, it sends a Telegram notification saying the queue is complete.

---

## Sector Priority Notes
- **Laboratuvar / Genetik** — Lead sector. Ugur's MSc Biology background = domain credibility. Labs respond to subject-matter understanding, not generic AI pitches.
- **Tıbbi Cihaz / Medikal Cihaz** — Second priority. Import/distribution companies. Documentation-heavy, owner-operated, clear AI ROI.
- **Sağlık Malzemeleri / Medikal Ürün** — Broader medical supply. Keyword variants surface different businesses than tıbbi cihaz.
- **Muhasebe / Mali Müşavir** — Secondary ICP. Run after healthcare sectors are saturated. High business density in Konak/Bayraklı.

---

## Query Queue

| # | Keyword | Location | Count | Status | Run Date | Notes |
|---|---------|----------|-------|--------|----------|-------|
| 1 | `tıbbi laboratuvar` | `Konak İzmir` | 25 | error | 2026-04-06 | Ağ proxy harici API erişimini engelliyor (Supabase, Outscraper, Telegram ulaşılamıyor) |
| 2 | `tıbbi laboratuvar` | `Bornova İzmir` | 25 | done | 2026-04-06 | 50 Outscraper → 5 cold_ready, 8 discarded, 34 pre_filter |
| 3 | `tıbbi cihaz` | `Konak İzmir` | 25 | done | 2026-04-07 | Medical device distributors, highest SMB density |
| 4 | `tıbbi cihaz` | `Alsancak İzmir` | 25 | done | 2026-04-17 | 50 Outscraper → 46 after dedup → 46 cold_ready (score 9/10 avg). 138 AI opportunities. 46 emails drafted. Supabase ✅ |
| 5 | `genetik laboratuvar` | `İzmir` | 25 | pending | — | Genetic testing labs, city-level (low density, cast wide) |
| 6 | `klinik laboratuvar` | `Bayraklı İzmir` | 25 | pending | — | Emerging CBD, 21+ medical companies confirmed |
| 7 | `tıbbi cihaz` | `Bornova İzmir` | 25 | pending | — | Medical device in university hospital district |
| 8 | `medikal cihaz` | `Konak İzmir` | 25 | pending | — | Keyword variant — surfaces different registered businesses |
| 9 | `medikal cihaz` | `Alsancak İzmir` | 25 | pending | — | Variant in port-facing trade district |
| 10 | `analiz laboratuvarı` | `İzmir` | 25 | pending | — | Broader lab keyword, city-level sweep |
| 11 | `tıbbi cihaz` | `Bayraklı İzmir` | 25 | pending | — | Medical device in emerging CBD |
| 12 | `sağlık malzemeleri` | `Konak İzmir` | 25 | pending | — | Broader medical supply keyword |
| 13 | `medikal ürün` | `Alsancak İzmir` | 25 | pending | — | Medical product distributors, port district |
| 14 | `sağlık ekipmanı` | `Bornova İzmir` | 25 | pending | — | Health equipment, different keyword register |
| 15 | `mali müşavir` | `Konak İzmir` | 25 | pending | — | Accounting firms — secondary ICP |
| 16 | `muhasebe bürosu` | `Bayraklı İzmir` | 25 | pending | — | Accounting, emerging CBD district |

---

## Completed Runs

| # | Keyword | Location | Run Date | Records Found | Cold-Ready | Notes |
|---|---------|----------|----------|---------------|------------|-------|
| 1 | `tıbbi laboratuvar` | `Konak İzmir` | 2026-04-06 | 0 | 0 | ERROR: Ağ proxy harici API erişimini engelliyor |
| 2 | `tıbbi laboratuvar` | `Bornova İzmir` | 2026-04-06 | 50 | 5 | 50 Outscraper sonucu → 15 survived filter → 5 cold_ready (Üç Gen 9/10, Erbayraktar 9/10, İzmir Ege 7/10, Analiz 7/10, Yöntem 6/10) |
| 3 | `tıbbi cihaz` | `Konak İzmir` | 2026-04-07 | 50 | 25 | 50 Outscraper → 32 hard filters geçti → 25 cold_ready (10x score=10, 15x score=9, avg score=9.4) |
| 4 | `tıbbi cihaz` | `Alsancak İzmir` | 2026-04-17 | 50 | 46 | 50 Outscraper → 4 fuzzy dedup (By Medicus, Önder, Dor-Med, Protek) → 46 cold_ready (avg 9/10, 138 AI opps, 46 emails drafted, Supabase ✅) |

---

## Month Budget Tracker

| Month | Runs | Records Used | Free Tier Remaining | Notes |
|-------|------|-------------|---------------------|-------|
| April 2026 | 4 | 150 | 350 | Run 1: error (network). Run 2: 50 records, 5 cold_ready. Run 3: 50 records, 25 cold_ready. Run 4: 50 records (discovery ✅, dedup ✅, processing staged). |
| May 2026 | 0 | 0 | 500 | — |

---

## Notes
- Dedup is enforced inside the skill (STEP 0.9 + 1.5 + 3). Running keyword variants in the same district is intentional — different keywords surface different Google Maps listings. The skill will skip any already-seen businesses at the company level.
- Do NOT re-run rows marked `done`. The `searches` table tracks keyword+location combinations and will short-circuit the Outscraper call (saving credits), but it still costs one search log entry.
- If a run is marked `error`, investigate via the Telegram notification first. Re-running is safe due to dedup.
- Add new rows at the bottom as the ICP expands or sectors prove out through scoring data.
