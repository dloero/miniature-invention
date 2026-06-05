# RS Q8 Price Tracker

A mobile-installable PWA that tracks **Audi RS Q8** used-car pricing, charts the
history, and forecasts where it's headed — so you don't have to look it up every
few days.

This is **Plan A** (API-first + installable web app). Data comes from the
[Auto.dev Vehicle Listings API](https://www.auto.dev/listings) (1,000 free
calls/month). A scheduled GitHub Action snapshots the market into a
version-controlled JSON file; the app renders charts + a forecast from it. No
database, no servers.

## How it works

```
GitHub Action (cron, every 3 days)
   └─ scripts/ingest.mjs  → Auto.dev API → summarize listings → data/snapshots.json (committed)
                                                                      │
Next.js PWA (Vercel, static)  ──────────────────────────────────────┘
   └─ reads snapshots → charts history → OLS linear-trend 6-mo forecast
```

- **`data/snapshots.json`** — the whole price history, one row per run. Git is the database.
- **`lib/forecast.ts`** — the forecasting engine (linear trend + ~95% prediction band).
- **`scripts/ingest.mjs`** — pulls + summarizes Auto.dev listings (runs in CI).
- **`scripts/seed.mjs`** — generates realistic starter history so the app works before live data accrues.

## Run locally

```bash
npm install
npm run seed     # writes data/snapshots.json with realistic starter history
npm run dev      # http://localhost:3000
```

## Go live (free)

1. **Auto.dev key** — sign up at https://www.auto.dev, copy your API key.
2. **GitHub secret** — repo Settings → Secrets and variables → Actions → add
   `AUTO_DEV_API_KEY`.
3. **First real snapshot** — Actions tab → "Ingest RS Q8 pricing" → Run workflow.
   It appends today's snapshot to `data/snapshots.json` and commits it.
4. **Deploy** — import the repo on [Vercel](https://vercel.com), framework
   auto-detects Next.js. Every new snapshot commit triggers a redeploy.
5. **Install on your phone** — open the Vercel URL in Safari/Chrome → Share →
   *Add to Home Screen*. It launches full-screen like a native app.

> Note: the `ingest.mjs` response parsing is defensive but Auto.dev's exact
> field names may differ on your plan. If a run returns 0 prices, adjust
> `extractListings()` / `extractPrice()` in `scripts/ingest.mjs`.

## Upgrade path

- **Better forecasts** — swap the linear trend for Prophet or
  [Darts](https://github.com/unit8co/darts) (seasonality, changepoints) in a
  Python ingestion step; write `ForecastPoint`s into the JSON and the app
  renders them unchanged.
- **Richer data** — switch the ingest source to
  [MarketCheck](https://www.marketcheck.com/apis/cars/) for deeper history and
  market-days-supply signals.
- **Price-drop alerts** — add web-push (or email) when the median crosses your
  target.
- **Native app (Plan B)** — the data + forecast core ports directly into a
  React Native / Expo app with real push notifications and App Store delivery.

## Tech

Next.js 14 (App Router) · React · Recharts · TypeScript · GitHub Actions · Vercel.
