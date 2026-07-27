# CIPHER KNOWLEDGE (public-safe)

<!-- This file is part of the chatbot's brain. Everything here is approved for
     public consumption. Source: cipherhealthanalytics.com + the public-safe
     digest of Cipher's overview deck (case study and competitor specifics
     deliberately excluded). Ben reviews and owns this file. -->

## What Cipher is
Cipher is a healthcare benefits intelligence platform for self-insured employers and the consultants, brokers, and TPAs who serve them. It turns medical and pharmacy claims into patient-level intelligence and decisions: benchmarked spend, forecasts, vendor validation, and recommended actions sized in dollars — packaged in a board-ready CFO Summary. It deploys inside the client's environment and reads claims where they already live. Tagline: "Turning claims data into decisions."

## The problem it addresses
- Employer-sponsored health plans cover roughly 150 million Americans and over $1.5 trillion in annual spend — America's largest segment of healthcare spending.
- Employer health costs have grown about 6% annually since 2022, outpacing both wages and inflation (Mercer CFO Survey 2025; BLS ECEC 2025). Benefits now approach 30% of total employee compensation.
- More than half of CFOs lack confidence in the ROI of their single largest spend category outside payroll.
- The tools behind that spend are broken in three ways: out-of-the-box analytics make fundamental errors; reports don't translate into actions that drive savings; and self-insured employers rarely control their own data, beholden to third-party warehouses.

## Where common analytics fail (general patterns, no vendors named)
- Cost understatement: generic tools can dramatically understate condition costs — e.g., reporting a cancer episode at a small fraction of its true annual cost because they miss high-cost components like immunotherapy (which alone often exceeds $30K per episode, administered every 3–6 weeks for a year or more).
- Benchmark bias: benchmark datasets often exclude claims that take more than ~3 months to adjudicate — silently dropping the highest-dollar claims and making benchmarks look artificially cheap.
- Stale benchmarks, symmetric data cleaning, and site-of-care confusion are classic methodological errors that flip conclusions about whether a vendor or program is saving money. Cipher's condition-specific methodology is built to prevent these failure modes.

## What the product does
Three product areas:
1. **Actionable Insights** — automated analysis of medical and pharmacy claims; patient-level insights on cost, treatment patterns, adherence, and switching behavior; cost and utilization monitoring that predicts problems and recommends solutions; predictive models customizing forecasts to the client's population; AI-powered dashboards for benefits leaders.
2. **Vendor Validation & Direction** — side-by-side vendor assessment before signing (a "mini-RFP" quantifying projected savings across competing vendors); patient tracking across utilization patterns and total cost of care per vendor; ROI reporting built on the client's own claims plus robust commercial benchmarks; predictive models identifying members for outreach.
3. **For Finance** — findings packaged into board-ready financial summaries, giving benefits leaders the numbers and narrative to make their case to the CFO.

Condition-specific analytics modules include: Cancer, Chronic Infusions, Musculoskeletal (MSK), Imaging, Rx / Pharmacy, Gene Therapy, GI & Weight Management, Maternity, and Preventative Care — plus vendor savings simulators (infusion, surgery), Target Lists, and the CFO Summary.

## The four decisions every output drives
Cipher isn't a dashboard; it's a decision engine. Every output drives one of four decisions:
1. **Navigate a member** — route a specific high-cost or high-risk member to the right care.
2. **Change the plan** — a plan-design change (e.g., prior-auth rules, a new vendor, a surgical center of excellence) that captures savings across the population.
3. **Evaluate a vendor** — quantify the savings a prospective or existing vendor will actually deliver.
4. **Update the forecast** — refresh next year's healthcare spend projection, grounded in current trends and decisions in motion.

## How it works (operating model)
- **Deploys inside your environment.** No data migration, no multi-month security review, no warehouse lock-in. Your data stays yours. The architecture: a Cipher desktop app runs inside the client environment reading local claims data; Cipher's cloud handles only user authentication and reference updates. Claims data never leaves the client's perimeter.
- **Condition-specific intelligence.** Purpose-built analytics for each clinical area — no generic risk scores, no blunt claims groupers.
- **Continuous, not cyclical.** Insights are generated automatically as new claims arrive; annual review cycles become real-time decision support.
- Built on an AI-enabled operating model: senior claims expertise amplified by automation, at a fraction of the cost of a traditional analytics team.
- Philosophy: "The model is a commodity. The rules are not." Most "AI for claims" products run a model directly on raw data — output that looks confident and is frequently wrong. Cipher encodes what a clinician, a pharmacist, and a healthcare economist would each do into rules the model can lean on. The healthcare domain rules are the moat; a bigger model doesn't catch up.

## Getting connected (data access)
Every client archetype converges on the same end state — data in your environment with Cipher running inside it:
1. You already own your data (direct feeds from TPA, carrier, or warehouse) — connect directly.
2. Vendor-held data — Cipher's forward-deployed engineer builds the feed.
3. Access blocked today — Cipher helps unlock it (employers won the right to their claims data under recent regulation), then builds the feed.

## Who it serves
- Self-insured (and level-funded) employers, where every claim dollar is the employer's dollar.
- Benefits consultants and brokers: Cipher deploys once inside the firm's environment and turns claims analysis from a cost center into a differentiator across the whole book of clients — analysis that survives CFO scrutiny, renewal exhibits that build themselves, one installation for every client.
- TPAs and broker channels: one Cipher installation scales across a partner's book; each employer client works with Cipher's analytics on their own plan through the partner's website.
- Cipher does not replace brokers or consultants — it makes their work sharper. Many advisors bring Cipher to their clients.

## Why now
- **Regulation:** The Consolidated Appropriations Act (2021) banned gag clauses — carriers can no longer block employers from their own claims and pricing data. Transparency in Coverage (2022) made every carrier-negotiated rate public. And 401(k)-style excessive-fee litigation is moving into health benefits, expanding fiduciary exposure for employers (2024–26 trend).
- **Technology:** AI turns senior claims expertise — previously scarce, manual, billed by the hour — into deployable software running in your environment at software scale.
- Employers hold both the data and the duty to act; AI supplies the expertise at software scale.

## Market view (how Cipher talks about the industry)
- The market has historically forced a choice between speed and accuracy: consultants are accurate but manual and slow; data warehouses are fast but generic. Cipher's goal is both — full automation with specialty-grade accuracy.
- The healthcare value equation V = P/Q has one impactable variable for employers: which patients get to the right care at the right moment. Networks and negotiated prices are largely commoditized across carriers; a small share of patients drives an outsized share of plan spend, and identifying and directing those patients credibly is the change that bends cost.

## Team
- **Ben Sanders — Co-Founder & CEO.** Healthcare executive with a track record of scaling businesses. Former SVP at Lantern Specialty Care on the CEO's leadership team, where he launched the cancer and infusion service lines and led the firm's analytics and data science organization. Before Lantern, Engagement Manager at McKinsey & Company. MBA (Finance), Kellogg; BS, Northwestern. Industry participation includes: author of Lantern's TrueRate Savings Methodology, CMS Digital Health CEO Roundtable panelist, advisor to the Advisory Board 2026 Infusion Report, AVBCC 2025 Summit panelist, PHTI Performance-Based Contracting advisory board, and speaker at the Mercer Actuarial Conference 2026.
- **Sarah Hewes, PhD — Co-Founder & Head of Engineering.** Healthcare strategy and data science leader with deep expertise in medical claims data, computational modeling, and applied AI. Former Director of Strategy & Research at Lantern Specialty Care, where she translated the firm's specialty-care bundling methodology into deployable client packages and built its first machine-learning models — including predictors of surgical need. Before Lantern, consultant at Boston Consulting Group. PhD in Bioengineering, Rice; BS, Johns Hopkins.

## Site, demo, and contact facts
- Website: cipherhealthanalytics.com. Interactive demo at /demo: enter a member population, industry age profile, and sex mix to see expected cancer cases (SEER-based, the same analysis that runs in Cipher) plus a screening-adequacy section using USPSTF eligibility windows and published under-65 commercial screening benchmarks (NCQA HEDIS, CDC NHIS/BRFSS).
- Book a 30-minute meeting: https://calendar.app.google/orMtDRpkcFJMM4xY7 (no obligation; bring your CFO or your toughest client).
- Support: support@cipherhealthanalytics.com · Security / vulnerability reports: security@cipherhealthanalytics.com · General: info@cipherhealthanalytics.com.
- Trust center documents (security overview, data-handling practices, SOC 2 status) can be requested from the Contact page.
- Compliance status: SOC 2 Type II is in progress. (Never describe SOC 2 as a "certification" or claim it is complete.)
- Cipher works where your data lives; there is no pricing published — pricing is discussed in a demo conversation.
