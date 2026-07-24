# Cipher Website Demo — Expected Cancer Cases Estimator

**Implementation guide for the interactive cancer-analysis demo on the Cipher Health Analytics website.**
Prepared 2026-07-23 · Companion files: `cancer-demo-prototype.html` (complete working prototype), `cancer-demo-data.json` (all reference data)

---

## 1. What this demo is

The Cipher AutoKey application includes a Cancer analytics page whose lead visual answers the question *"How many cancer cases should we expect in this population?"* It shows newly coded cancer cases by type against SEER age/sex-adjusted expected counts.

The website demo is a self-contained, no-data-required taste of that analysis. A visitor enters three things about their own member population — **member count**, **male/female mix**, and an **age-distribution profile** chosen from industry presets — and the demo instantly renders the number of new cancer cases, by cancer type, that SEER incidence rates predict that population will generate in one year. It uses the exact same reference data and the same age/sex-adjustment math as the shipping application, and it reproduces the application's visual language precisely (fonts, tokens, chart chrome, KPI cards).

Because the visitor supplies no claims data, the demo shows **expected cases only** — the app's benchmark side of the chart — rendered as the primary bar series. The app's observed-vs-expected comparison is the hook: the closing call-to-action invites the visitor to load their own claims in AutoKey to see how their *observed* cases compare to these expected values.

**No backend is required.** Everything is static: reference data is ~11 KB of JSON, and all computation is a few hundred multiplications done in the browser on every input change. This makes it trivial to host on Vercel as a static asset, an iframe-able page, or a React island.

---

## 2. Inputs

| Input | Control | Range / values | Default |
|---|---|---|---|
| Member population | Numeric text input | 100 – 5,000,000 (clamp on blur; digits only) | 10,000 |
| Population profile | Select (6 presets, §4) | one of six preset keys | National average workforce |
| % Female / % Male | Two linked numeric inputs, 0–100 | integers; editing either sets the other to `100 − value` | 50 / 50 |

Behavioral notes:

- **Member population** means *covered lives* — employees **plus dependents**. The presets (§4) distribute members across the full 0–85+ age range, so children and (in one preset) retirees are included. The helper text under the input should say "Employees + dependents".
- The **sex mix** applies uniformly across all age buckets. This is a deliberate simplification (documented in the methodology note, §5.4); it keeps the input model to a single number.
- All three inputs recompute the output **live** (debounce keystrokes ~150 ms; selects recompute immediately). There is no "Calculate" button — immediacy is part of the demo's point.
- Invalid or empty member counts fall back to the last valid value on blur. While the field is empty mid-edit, keep the previous render.

---

## 3. Reference data: SEER incidence rates

This is the same reference pack the application ships (`reference-packs/cancer_incidence`, source file `cancer_incidence_by_category_v3.csv`, classification: public). It contains **age/sex-specific annual incidence rates per 100,000 person-years** for **22 cancer categories** across **19 age buckets** and **2 sexes** (673 non-zero rows; buckets absent from the source are zero-rate).

**Age buckets (canonical order, used everywhere):**
`Less than 1 year, 1-4, 5-9, 10-14, 15-19, 20-24, 25-29, 30-34, 35-39, 40-44, 45-49, 50-54, 55-59, 60-64, 65-69, 70-74, 75-79, 80-84, 85+ years`

**Cancer categories (`cancer_category_short` → full label):**
Bladder, Brain & CNS, Breast, Cervical, Colorectal, Esophageal, Head & Neck, Kidney, Leukemia, Liver, Lung, Lymphoma, Melanoma, Myeloma, Other/Rare, Ovarian, Pancreatic, Prostate, Stomach, Testicular, Thyroid, Uterine.

**Sex-specific categories** carry rates for only one sex and must contribute zero for the other: Cervical, Ovarian, Uterine (female only); Prostate, Testicular (male only). Breast carries a male rate array in the pack, but every male value is 0 — the pack treats breast cancer as female-only. Implementations should simply consume whatever the rate arrays say (never hard-code sex rules), so a future pack update with non-zero male breast rates flows through automatically.

The full table is provided in `cancer-demo-data.json` in this shape:

```json
{
  "ageBuckets": ["Less than 1 year", "1-4 years", "...", "85+ years"],
  "cancerLabels": { "Breast": "Breast cancer", "...": "..." },
  "ratesPer100k": {
    "Breast":   { "F": [0, 0, "...", 425.81, 361.19], "M": [0, "..."] },
    "Prostate": { "M": [0, "...", 793.4, "..."] }
  }
}
```

Each rate array has exactly 19 entries aligned to `ageBuckets`. A missing sex key means "no rates for that sex — contribute 0."

Sanity anchors (use these to verify any re-implementation): all-site rate for females 50–54 ≈ **597 per 100k**; males 50–54 ≈ **464 per 100k**. A 10,000-member national-average population at 50/50 sex yields ≈ **35 expected new cases per year**.

---

## 4. Age-distribution presets

Six named profiles, each a percentage distribution of **all members (employees + dependents)** across the 19 age buckets. Percentages are stored to 2 decimals and may sum to 99.99–100.01; **always normalize by the actual sum at compute time** (divide each weight by the sum) rather than assuming exactly 100.

### 4.1 The presets

| Key | Label | Character | Avg. age | Under 20 | 65+ | Expected cases /10k @ 50/50 |
|---|---|---|---|---|---|---|
| `national` | National average workforce | Balanced employer book; typical dependent load | 36.9 | 20.2% | 4.3% | ~35.4 |
| `tech` | Technology & professional services | Young professional; fewer dependents | 35.0 | 15.9% | 2.8% | ~27.0 |
| `manufacturing` | Manufacturing & industrial | Older tenured hourly workforce | 38.6 | 19.6% | 3.7% | ~38.5 |
| `retail` | Retail & hospitality | Youngest; high turnover; fewest dependents | 34.7 | 17.4% | 3.3% | ~28.4 |
| `healthcare_edu` | Healthcare & education | Mid-career skew; family-heavy | 37.4 | 21.6% | 5.0% | ~37.4 |
| `public_retiree` | Public sector & retiree-heavy | Oldest; includes pre-65/65+ retirees | 43.3 | 15.7% | 12.9% | ~55.9 |

The rightmost column is the built-in sanity check: the presets should visibly separate — a retiree-heavy population should produce roughly **double** the expected cases of a tech population of the same size. That spread *is* the demo's message (population age drives expected burden).

### 4.2 Full weights (percent of members per bucket)

Buckets in canonical order (`<1, 1-4, 5-9, 10-14, 15-19, 20-24, 25-29, 30-34, 35-39, 40-44, 45-49, 50-54, 55-59, 60-64, 65-69, 70-74, 75-79, 80-84, 85+`):

| Bucket | national | tech | manufacturing | retail | healthcare_edu | public_retiree |
|---|---|---|---|---|---|---|
| Less than 1 year | 0.80 | 0.90 | 0.70 | 0.60 | 0.80 | 0.50 |
| 1-4 years | 3.60 | 3.40 | 3.20 | 2.40 | 3.60 | 2.40 |
| 5-9 years | 5.00 | 4.20 | 4.80 | 3.20 | 5.40 | 3.80 |
| 10-14 years | 5.50 | 3.90 | 5.60 | 3.40 | 6.20 | 4.60 |
| 15-19 years | 5.20 | 3.20 | 5.30 | 7.80 | 5.60 | 4.40 |
| 20-24 years | 5.90 | 6.20 | 4.90 | 13.20 | 4.60 | 3.80 |
| 25-29 years | 8.40 | 12.50 | 6.40 | 12.40 | 7.00 | 5.20 |
| 30-34 years | 9.10 | 13.80 | 7.40 | 10.60 | 8.20 | 6.20 |
| 35-39 years | 9.40 | 12.80 | 8.40 | 9.20 | 9.00 | 7.40 |
| 40-44 years | 9.30 | 10.40 | 9.40 | 8.20 | 9.40 | 8.60 |
| 45-49 years | 9.00 | 8.20 | 10.40 | 7.60 | 9.60 | 9.60 |
| 50-54 years | 8.90 | 6.60 | 11.20 | 7.00 | 9.60 | 10.40 |
| 55-59 years | 8.40 | 5.20 | 10.60 | 6.20 | 8.80 | 10.60 |
| 60-64 years | 6.80 | 4.00 | 8.20 | 5.00 | 7.00 | 9.60 |
| 65-69 years | 2.50 | 1.60 | 2.40 | 2.00 | 3.00 | 6.40 |
| 70-74 years | 1.00 | 0.60 | 0.80 | 0.80 | 1.20 | 3.60 |
| 75-79 years | 0.50 | 0.30 | 0.30 | 0.30 | 0.50 | 1.60 |
| 80-84 years | 0.20 | 0.10 | 0.10 | 0.10 | 0.20 | 0.80 |
| 85+ years | 0.10 | 0.10 | 0.10 | 0.10 | 0.10 | 0.50 |

### 4.3 Methodology and honesty

These distributions are **illustrative composites**, not published statistics. They were constructed to be directionally faithful to U.S. Bureau of Labor Statistics Current Population Survey data on the age of employed persons by industry (BLS CPS Table 18b — e.g., median worker age ≈ 29–30 in accommodation/food services, ≈ 38 in professional/tech occupations, ≈ 44 in manufacturing and education, ≈ 45 in public administration), overlaid with typical commercial-plan dependent composition (children ≈ 15–22% of covered lives; young/high-turnover industries carry the fewest dependents; only the public/retiree preset carries meaningful 65+ membership). If the marketing team wants to cite a source on the page, cite them as "illustrative profiles modeled on BLS workforce age data" — do not present them as actuals. The demo's disclaimer (§7) covers this.

---

## 5. Calculation

### 5.1 Formula

For a population of `N` members, female share `f` (0–1, male share `1−f`), and normalized preset weights `w[b]` over buckets `b`:

```
expected[cancer] = Σ over b, s∈{F,M} of  N · w[b] · share(s) · rate[cancer][s][b] / 100,000
```

where `share(F) = f`, `share(M) = 1−f`, and `rate[cancer][s][b]` is 0 when the sex key is absent.

- `totalExpected = Σ expected[cancer]`
- `perThousand = totalExpected / N × 1,000`

### 5.2 Fidelity to the application

This is exactly the app's aggregate SQL (`cancer_incidence_chart.py`):
`seer_expected_count = SUM(person_years_in_bucket × seer_rate_per_100k / 100,000)` — with one simplification: the app converts observed person-quarters to person-years to match its data window; the demo assumes every member is enrolled for the full year, so **members = person-years** and the estimate is **annual**. Round each per-cancer value to **1 decimal** for display, as the app does (`ROUND(…, 1)`).

### 5.3 Worked example (use as a unit test)

10,000 members, national average preset, 50% female. Female 50–54 members = 10,000 × 8.9% × 0.5 = 445. Breast rate F 50–54 = 239.8412/100k → contribution 445 × 239.8412 / 100,000 = 1.067 expected cases from that one cell. Summing all cells: **total ≈ 35.4 expected cases**, top types Breast (F-driven), Prostate, Melanoma, Thyroid, Colorectal. A correct implementation must reproduce ≈35.4 ± 0.1 for these inputs.

### 5.4 Edge cases

- **0% or 100% female**: legitimate inputs (e.g., all-male workforce). Sex-specific cancers drop to 0.0 and their bars collapse — keep them in the chart at zero rather than removing rows, so the chart doesn't jump between layouts.
- **Small populations** (e.g., 250 members): totals well under 1 case are correct and interesting — display 1 decimal everywhere so "0.9 expected cases" reads properly. Never round expected values to integers.
- **Fractional display**: KPI total shows 1 decimal below 100, whole numbers (with thousands separators) at ≥ 100. Per-cancer tooltips and table always show 1 decimal.

---

## 6. Look and feel — matching the application

The prototype (`cancer-demo-prototype.html`) is the authoritative rendering; everything below is extracted verbatim from the app's `components/styles.css`, `chart-theme.js`, and the cancer page so a Vercel/v0 build can reproduce it without access to the app repo.

### 6.1 Fonts

| Role | Stack |
|---|---|
| Body / UI (`--font-sans`) | `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif` |
| Display: page title, KPI values (`--font-display`) | `Archivo, 'Helvetica Neue', Arial, sans-serif` |
| Mono (rarely needed) (`--font-mono`) | `'Space Mono', ui-monospace, SFMono-Regular, Consolas, monospace` |

Load Inter (400/500/600/700) and Archivo (700/800) from Google Fonts. Base font-size 14px, line-height 1.55, `-webkit-font-smoothing: antialiased`.

### 6.2 Design tokens (light theme — the website default)

```css
--bg:#ffffff; --surface:#ffffff; --surface2:#f7f8f9;
--border:#D8DBE0; --border2:#C4C8CF;
--text:#1B2A4A; --text2:#3E4452; --text3:#6B7077; --text4:#9CA0A8;
--accent:#D97706;                 /* focus rings, benchmark captions */
--cipher-navy-800:#1E3A5F;        /* PRIMARY chart color (bars) */
--cipher-navy-600:#3B6BA5; --cipher-navy-400:#5B8DB8;
--cipher-risk:#C0392B; --cipher-savings:#1E7A42; --cipher-target:#D97706;
--chart-grid:#E8EAED; --chart-muted:#9CA0A8; --benchmark-line:#9CA0A8;
--radius:6px;
--shadow-popover:0 12px 28px rgba(27,42,74,.14);
```

The app also ships a `cipherDark` theme; the demo ships light-only (token block for dark is in the app CSS if ever wanted).

### 6.3 Component specs

**Page container** — max-width 1010px, centered, padding `44px 56px 110px` (reduce on mobile).

**Page header** — a 3px solid `--text` top rule, 12px padding-top, 34px margin-bottom. Inside: a row of 10px navy dot (`background: #1E3A5F; border-radius: 50%`) + page title. Title: Archivo 24px / 700 / letter-spacing −0.01em / color `--text`. Subtitle (`page-sub`): 13px `--text3`, margin-top 6px.

**Section label** — 10px, weight 600, uppercase, letter-spacing 0.08em, color `--text3`, margin-bottom 10px. Used above the controls block and above the chart.

**Input fields** — label pattern: block `<span>` above the control, 11px, weight 500, uppercase, letter-spacing 0.05em, color `--text3`, margin-bottom 5px. Controls: `width:100%; border:1px solid var(--border2); border-radius:6px; background:var(--surface); color:var(--text); font:inherit; padding:7px 9px;`. Helper text below: 11px `--text3`. Focus: `outline:2px solid var(--accent); outline-offset:2px`. Controls sit in a responsive grid (`grid-template-columns: minmax(220px,1.4fr) minmax(140px,1fr) minmax(140px,1fr) …; gap:12px`).

**KPI cards** — no box, no shadow: `border-top:1px solid var(--text); padding:12px 0 0; background:transparent`. Label: same 10px uppercase style as kpi-label. Value: Archivo, 34px, weight 800, letter-spacing −0.025em, `tabular-nums`, margin-top 7px. Sub: 12px `--text3`, margin-top 7px. Cards in a grid, gap 34px.

**Chart region** — plain container, no card chrome, min-height ~300px in-app; the demo uses ~560px because it renders all 22 categories. Above it the section label; beneath the label an italic-free note in 12px `--text3` (class `analysis-tab-note`): the methodology one-liner.

**Note/disclaimer text** — 12px, `--text3`, line-height 1.5.

**Buttons (CTA)** — the app's primary button is understated: `border:1px solid var(--border2); border-radius:6px; background:var(--surface); padding:7px 14px; font:inherit; min-height:32px`. Hover: background `--surface2`, border `--text3`. A navy filled variant (`background:#1E3A5F; color:#fff; border-color:#1E3A5F`) is appropriate for the single marketing CTA.

### 6.4 Chart spec (Chart.js — same library and options as the app)

The app renders every chart with Chart.js and a shared themed-options helper. Reproduce exactly:

- **Type**: `bar` with `indexAxis: 'y'` (horizontal bars), `responsive: true`, `maintainAspectRatio: false`.
- **Data**: 22 categories sorted by expected count **descending**, with **Other/Rare forced to the last row** regardless of value (app behavior).
- **Bars**: `backgroundColor: '#1E3A5F'` (`--cipher-navy-800`), `borderRadius: 0` (the app uses square bar ends), single dataset.
- **Category (y) axis**: no grid lines; ticks 11px Inter, color `#9CA0A8`; `autoSkip: false` so all 22 labels render.
- **Value (x) axis**: `min: 0`; grid color `#E8EAED`; ticks 11px Inter `#9CA0A8`, callback `v => Number(v).toLocaleString()`.
- **Legend**: hidden (single series; the section label names it — matches app pages with one dataset).
- **Tooltip**: Inter for title and body; label callback: `` ctx => ` ${ctx.parsed.x.toLocaleString(undefined,{maximumFractionDigits:1})} expected cases` ``.
- **Updates**: on input change call `chart.data.datasets[0].data = …; chart.update()` — Chart.js animates bar-length transitions by default, which gives the demo its satisfying live feel. Do not re-instantiate the chart per keystroke.
- Canvas wrapped in a positioned container div; the container (not the canvas) gets the height.

### 6.5 Accessibility

- Chart container: `role="img"` with an `aria-label` naming the chart (app does this on every chart region).
- A **"View as table"** toggle beneath the chart renders the same numbers in the app's table style (11px uppercase `--text3` header row, 1px `--border` row rules, `tabular-nums` numeric cells, right-aligned numbers). This is the accessible/no-canvas fallback and also serves copy-paste.
- All inputs keyboard-operable with visible focus (the `--accent` outline).
- Color is never the only carrier of meaning (single-series chart; values in tooltips and table).

---

## 7. Page copy (proposed)

- **Title row**: navy dot + "Cancer" — subtitle: "Estimate the cancer burden hiding in your population — the same SEER-based analysis that runs in Cipher AutoKey."
- **Controls section label**: "YOUR POPULATION"
- **Chart section label**: "EXPECTED NEW CANCER CASES BY TYPE, PER YEAR"
- **Chart note**: "SEER age/sex-adjusted incidence applied to your population profile. Expected new cases per year — not prevalence."
- **KPIs**: "Expected new cases / year", "Expected cases per 1,000 members", "Largest expected type".
- **Disclaimer (bottom, 12px `--text3`)**: "Estimates apply published SEER incidence rates to an illustrative population profile. They are directional planning figures, not predictions for any specific group and not medical or actuarial advice. Industry profiles are illustrative composites modeled on BLS workforce age data."
- **CTA**: "In Cipher AutoKey, this chart shows your *observed* cases against these expected values — from your own claims, in minutes." Button: "See AutoKey in action".

---

## 8. Vercel integration notes

- **Simplest**: ship `cancer-demo-prototype.html` as a static file (e.g., `public/demo/cancer.html`) and embed via `<iframe>` on the marketing page (it is fully self-contained except two CDN requests: Google Fonts and Chart.js from cdnjs). Give the iframe a fixed height (~1150px desktop) or use a resize-observer postMessage if responsive height is needed.
- **Native (recommended for v0/Next.js)**: port to a client component. `cancer-demo-data.json` imports directly; the compute function is ~15 lines (§5.1); use `react-chartjs-2` or keep raw Chart.js in a `useEffect`. All styling in this guide is plain CSS — drop the token block into a CSS module or Tailwind theme. No server code, no API routes, no environment variables.
- Chart.js version: the app vendors Chart.js v4 (UMD). Pin `chart.js@4.x`.
- The reference JSON is public-classified data (see the app's reference-pack manifest: `"classification": "public"`) — safe to ship to browsers.
- Performance: full recompute is ~2,500 multiplications — no memoization needed. Debounce only to avoid chart-animation churn while typing.

---

## 9. Acceptance checklist

1. Defaults (10,000 members, national average, 50/50) render ≈ **35.4** expected cases; top bar is Breast.
2. Switching to *Public sector & retiree-heavy* raises the total to ≈ **55.9** with no other changes; *Technology* lowers it to ≈ **27.0**.
3. Setting 0% female zeroes Breast/Cervical/Ovarian/Uterine and doubles Prostate vs. the 50/50 view (≈ 9.4 expected at 10,000 members, national preset); 100% female zeroes Prostate/Testicular.
4. Member count scales all bars linearly (100,000 members = 10× the 10,000-member values).
5. Other/Rare is always the bottom bar; remaining bars are sorted descending.
6. Chart animates between states rather than redrawing; table view matches chart values to 1 decimal.
7. Visual diff against the AutoKey cancer page: same fonts, header rule, section-label treatment, KPI card style, bar color `#1E3A5F`, grid `#E8EAED`, tick styling.
