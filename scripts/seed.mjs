// Generates a realistic historical snapshot series so the app charts and
// forecasts something meaningful before the live Auto.dev feed has built up
// history. Anchored to observed market data (mid-2026: ~241 listings,
// ~$95.5k median, +12.3% YoY per CarGurus aggregate).
//
// Run with: npm run seed   (safe to re-run; overwrites data/snapshots.json)
import fs from "node:fs";
import path from "node:path";

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
const snapshots = [];

// 25 monthly points, 2024-06 through 2026-06.
const start = new Date(Date.UTC(2024, 5, 1));
const months = 25;

// Median trends from ~$82.0k up to ~$95.5k (≈+16% over 2yr, +12.3% in the
// final year) with mild monthly noise.
const startMedian = 82000;
const endMedian = 95500;

for (let i = 0; i < months; i++) {
  const d = new Date(Date.UTC(2024, 5 + i, 1));
  const frac = i / (months - 1);
  // Slight upward curve, faster in the last year.
  const trend = startMedian + (endMedian - startMedian) * Math.pow(frac, 1.15);
  const noise = (rand() - 0.5) * 2600;
  const median = Math.round(trend + noise);

  // Spread around the median (RS Q8 ranges widely by year/trim/mileage).
  const p25 = Math.round(median * (0.82 + (rand() - 0.5) * 0.02));
  const p75 = Math.round(median * (1.18 + (rand() - 0.5) * 0.02));
  const min = Math.round(median * (0.62 + (rand() - 0.5) * 0.03));
  const max = Math.round(median * (1.7 + (rand() - 0.5) * 0.08));
  const mean = Math.round((p25 + median + p75) / 3 + (rand() - 0.5) * 1500);
  const count = Math.round(210 + (rand() - 0.5) * 70);

  snapshots.push({
    date: d.toISOString().slice(0, 10),
    count,
    median,
    mean,
    min,
    max,
    p25,
    p75,
    source: "seed",
  });
}

const outDir = path.join(process.cwd(), "data");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "snapshots.json"),
  JSON.stringify(snapshots, null, 2) + "\n"
);
console.log(`Wrote ${snapshots.length} seed snapshots to data/snapshots.json`);
