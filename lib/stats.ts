// Small, dependency-free statistics helpers used by both the ingestion
// script (to summarize raw listings) and the app.

export function quantile(sortedAsc: number[], q: number): number {
  if (sortedAsc.length === 0) return 0;
  if (sortedAsc.length === 1) return sortedAsc[0];
  const pos = (sortedAsc.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const next = sortedAsc[base + 1] ?? sortedAsc[base];
  return sortedAsc[base] + rest * (next - sortedAsc[base]);
}

export function summarizePrices(prices: number[]) {
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

export function formatUSD(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
