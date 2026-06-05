// A single point-in-time snapshot of the RS Q8 market, computed from
// whatever listings were pulled on `date`. One row per ingestion run.
export interface Snapshot {
  date: string; // ISO date, e.g. "2026-06-01"
  count: number; // number of listings in the sample
  median: number; // median asking price (USD)
  mean: number;
  min: number;
  max: number;
  p25: number;
  p75: number;
  source: string; // e.g. "auto.dev" or "seed"
}

// A forecasted future point with an uncertainty band.
export interface ForecastPoint {
  date: string;
  median: number; // point forecast
  lower: number; // lower bound of prediction interval
  upper: number; // upper bound of prediction interval
  forecast: true;
}

// Snapshot shaped for charting alongside forecast points.
export interface SeriesPoint {
  date: string;
  median?: number;
  lower?: number;
  upper?: number;
  forecast?: boolean;
}
