// Pulls current Audi RS Q8 listings from the Auto.dev Vehicle Listings API,
// summarizes them into one Snapshot, and appends it to data/snapshots.json.
//
// Runs in GitHub Actions on a schedule (see .github/workflows/ingest.yml),
// NOT in the app. Requires the AUTO_DEV_API_KEY secret.
//
//   AUTO_DEV_API_KEY=sk_... npm run ingest
//
// Auto.dev free tier = 1,000 calls/month. Docs: https://docs.auto.dev
//
// The response shape is handled defensively: we look for an array of records
// under common keys and read price from common fields. If Auto.dev changes
// field names, adjust extractListings()/extractPrice() below.
import fs from "node:fs";
import path from "node:path";

// Inlined here (rather than importing lib/stats.ts) so this runs under plain
// Node with no TypeScript loader. Keep in sync with lib/stats.ts.
function quantile(sortedAsc, q) {
  if (sortedAsc.length === 0) return 0;
  if (sortedAsc.length === 1) return sortedAsc[0];
  const pos = (sortedAsc.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const next = sortedAsc[base + 1] ?? sortedAsc[base];
  return sortedAsc[base] + rest * (next - sortedAsc[base]);
}

function summarizePrices(prices) {
  const clean = prices
    .filter((p) => Number.isFinite(p) && p > 0)
    .sort((a, b) => a - b);
  const count = clean.length;
  const mean = count ? clean.reduce((a, b) => a + b, 0) / count : 0;
  return {
    count,
    mean: Math.round(mean),
    median: Math.round(quantile(clean, 0.5)),
    min: count ? clean[0] : 0,
    max: count ? clean[count - 1] : 0,
    p25: Math.round(quantile(clean, 0.25)),
    p75: Math.round(quantile(clean, 0.75)),
  };
}

const API_KEY = process.env.AUTO_DEV_API_KEY;
const MAKE = process.env.RSQ8_MAKE || "Audi";
const MODEL = process.env.RSQ8_MODEL || "RS Q8";
const DATA_FILE = path.join(process.cwd(), "data", "snapshots.json");

function extractListings(json) {
  if (Array.isArray(json)) return json;
  for (const key of ["records", "listings", "results", "data", "hits"]) {
    if (Array.isArray(json?.[key])) return json[key];
  }
  return [];
}

function extractPrice(listing) {
  for (const key of ["price", "priceUnformatted", "listPrice", "msrp"]) {
    const v = listing?.[key];
    const n = typeof v === "string" ? Number(v.replace(/[^0-9.]/g, "")) : v;
    if (Number.isFinite(n) && n > 0) return n;
  }
  return NaN;
}

async function fetchAllListings() {
  if (!API_KEY) {
    throw new Error(
      "AUTO_DEV_API_KEY is not set. Add it as a GitHub Actions secret."
    );
  }
  const prices = [];
  let page = 1;
  const maxPages = 20; // safety cap; RS Q8 inventory is a few hundred listings
  while (page <= maxPages) {
    const url = new URL("https://auto.dev/api/listings");
    url.searchParams.set("make", MAKE);
    url.searchParams.set("model", MODEL);
    url.searchParams.set("page", String(page));
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    if (!res.ok) {
      throw new Error(`Auto.dev returned ${res.status}: ${await res.text()}`);
    }
    const json = await res.json();
    const listings = extractListings(json);
    if (listings.length === 0) break;
    for (const l of listings) {
      const p = extractPrice(l);
      if (Number.isFinite(p)) prices.push(p);
    }
    const totalPages = json?.totalPages ?? json?.pageCount ?? null;
    if (totalPages && page >= totalPages) break;
    page += 1;
  }
  return prices;
}

async function main() {
  const prices = await fetchAllListings();
  if (prices.length === 0) {
    console.error("No listings/prices returned; not writing a snapshot.");
    process.exit(1);
  }
  const summary = summarizePrices(prices);
  const snapshot = {
    date: new Date().toISOString().slice(0, 10),
    ...summary,
    source: "auto.dev",
  };

  let existing = [];
  try {
    existing = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    existing = [];
  }
  // Replace any existing snapshot for today, then append.
  existing = existing.filter((s) => s.date !== snapshot.date);
  existing.push(snapshot);
  existing.sort((a, b) => a.date.localeCompare(b.date));

  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(existing, null, 2) + "\n");
  console.log(
    `Snapshot ${snapshot.date}: ${summary.count} listings, median ${summary.median}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
