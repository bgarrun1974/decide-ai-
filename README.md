README.md (copy–paste)
# Decide.AI — Decision Engine for Expensive Purchases

Decide.AI helps people make **better, faster decisions** for high-cost purchases  
(e.g. phones, laptops, cars) by combining:

- simple human preferences
- transparent weighting
- explainable rankings

This repo contains the **Phones (US-only) MVP**.

---

## 🚀 Quick Start (StackBlitz / Local)

### Option A — StackBlitz (recommended for demo)
1. Go to https://stackblitz.com
2. Click **“Import from GitHub”**
3. Paste this repo URL
4. StackBlitz will auto-install dependencies and run `npm run dev`

### Option B — Local
```bash
npm install
npm run dev


App runs at:
http://localhost:3000

🧱 Tech Stack

Next.js (App Router)

TypeScript

Tailwind CSS

No backend (yet)

No external APIs (deterministic client-side scoring)

📁 Repo Structure (Important)
decide-ai/
├─ app/
│  └─ page.tsx               # Main page (Electronics → Phones)
│
├─ components/
│  ├─ layout/
│  │  ├─ TopNav.tsx          # Logo + top category tabs
│  │  ├─ SubCategoryNav.tsx  # Phones / Laptops / TVs tabs
│  │  └─ ThreeColumnLayout.tsx # 24% / 38% / 38% layout
│  │
│  ├─ basics/                # Left column (preferences)
│  ├─ dials/                 # Center column (weights)
│  └─ phones/                # Right column (ranked phones)
│
├─ data/
│  └─ phones.us.json         # US-only phone database + prices
│
├─ lib/
│  ├─ scoring.ts             # Deterministic scoring engine
│  └─ presets.ts             # Default presets (Teen, Power, Value)
│
├─ public/
├─ README.md
└─ package.json


⚠️ Some folders may be present but partially implemented.
This is intentional — the structure is locked early to avoid refactors later.

🧠 How the App Works (High Level)

Left column — Basics

OS (iOS / All / Android)

Condition (New / All / Used)

Budget range

Screen size

Primary use (icons)

Longevity

Brand exclusion

Center column — Weights

10 top-level categories

Re-ordered dynamically by importance

Collapsed by default

Top 5 highlighted, bottom 5 muted

Right column — Results

Ranked phones

Match %

2–3 reasons explaining the rank

All scoring is client-side, transparent, and explainable.

📊 Phone Data

Market: US only

Prices: realistic street prices (new + used median)

Trait scores: normalized 0–100 (relative, not raw specs)

Data lives in:

/data/phones.us.json

⚠️ Known Gaps / TODOs

 Complete Basics UI components

 Wire presets → dials

 Persist user preferences (localStorage)

 Add laptops as second category

 Add experts / annotations (later)

These are expected at this stage.

🧪 Demo Notes

This repo is optimized for:

fast iteration

StackBlitz demos

investor walkthroughs

Not production-hardened yet

📌 Philosophy

Decide.AI is decision support, not advice or brokerage.
No transactions, no financial handling, no dark patterns.

📬 Contact / Notes

This project is under active development.
Structure-first approach — UI and data evolve on top of it.
