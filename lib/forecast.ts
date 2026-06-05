import type { Snapshot, ForecastPoint } from "./types";

// Forecasting engine for the RS Q8 median price.
//
// v1 uses ordinary-least-squares linear regression on the median price vs a
// time index (months since first snapshot), then projects forward. The
// prediction interval widens with horizon using the residual standard error.
//
// This is deliberately simple and dependency-free so it runs anywhere. When
// you have 18-24+ monthly points and want seasonality, swap this for Prophet
// or Darts in the ingestion step and write the forecast into the JSON — the
// app just renders whatever ForecastPoints it's given. See README "Upgrade path".

function monthsBetween(a: Date, b: Date): number {
  return (
    (b.getFullYear() - a.getFullYear()) * 12 +
    (b.getMonth() - a.getMonth()) +
    (b.getDate() - a.getDate()) / 30
  );
}

function addMonths(d: Date, months: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + months);
  return r;
}

export function forecastMedian(
  snapshots: Snapshot[],
  horizonMonths = 6
): ForecastPoint[] {
  const pts = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
  if (pts.length < 3) return [];

  const t0 = new Date(pts[0].date);
  const xs = pts.map((s) => monthsBetween(t0, new Date(s.date)));
  const ys = pts.map((s) => s.median);
  const n = xs.length;

  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;

  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < n; i++) {
    sxx += (xs[i] - meanX) ** 2;
    sxy += (xs[i] - meanX) * (ys[i] - meanY);
  }
  const slope = sxx === 0 ? 0 : sxy / sxx;
  const intercept = meanY - slope * meanX;

  // Residual standard error.
  let sse = 0;
  for (let i = 0; i < n; i++) {
    const yhat = intercept + slope * xs[i];
    sse += (ys[i] - yhat) ** 2;
  }
  const dof = Math.max(1, n - 2);
  const se = Math.sqrt(sse / dof);

  const lastDate = new Date(pts[pts.length - 1].date);
  const lastX = xs[xs.length - 1];

  const out: ForecastPoint[] = [];
  for (let m = 1; m <= horizonMonths; m++) {
    const x = lastX + m;
    const yhat = intercept + slope * x;
    // Prediction interval grows with distance from the data + sample mean.
    const widen =
      se *
      Math.sqrt(1 + 1 / n + (x - meanX) ** 2 / (sxx || 1)) *
      // ~95% band; t-multiplier approximated as 2.
      2;
    out.push({
      date: addMonths(lastDate, m).toISOString().slice(0, 10),
      median: Math.round(yhat),
      lower: Math.round(yhat - widen),
      upper: Math.round(yhat + widen),
      forecast: true,
    });
  }
  return out;
}

// Headline trend stats for the dashboard.
export function trendStats(snapshots: Snapshot[]) {
  const pts = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
  const latest = pts[pts.length - 1];
  const prev = pts[pts.length - 2];

  // Year-over-year: find the snapshot closest to ~12 months before latest.
  const latestDate = new Date(latest.date);
  const target = new Date(latestDate);
  target.setFullYear(target.getFullYear() - 1);
  let yoyRef = pts[0];
  let best = Infinity;
  for (const s of pts) {
    const d = Math.abs(new Date(s.date).getTime() - target.getTime());
    if (d < best) {
      best = d;
      yoyRef = s;
    }
  }

  const pct = (from: number, to: number) =>
    from ? ((to - from) / from) * 100 : 0;

  return {
    latest,
    momPct: prev ? pct(prev.median, latest.median) : 0,
    yoyPct: yoyRef ? pct(yoyRef.median, latest.median) : 0,
  };
}
