import { loadSnapshots } from "@/lib/data";
import { forecastMedian, trendStats } from "@/lib/forecast";
import { formatUSD } from "@/lib/stats";
import PriceChart from "./PriceChart";

export const dynamic = "force-static";

export default function Home() {
  const snapshots = loadSnapshots();

  if (snapshots.length === 0) {
    return (
      <main className="wrap">
        <p>No data yet. Run `npm run seed` or the ingestion workflow.</p>
      </main>
    );
  }

  const { latest, momPct, yoyPct } = trendStats(snapshots);
  const forecast = forecastMedian(snapshots, 6);
  const horizon = forecast[forecast.length - 1];

  // Merge history + forecast into one series for the chart.
  const history = snapshots.map((s) => ({
    date: s.date,
    median: s.median,
  }));

  // Seed the forecast line/band at the last history point so they connect.
  const junction = {
    date: latest.date,
    forecastMedian: latest.median,
    lower: latest.median,
    upper: latest.median,
  };
  const future = forecast.map((f) => ({
    date: f.date,
    forecastMedian: f.median,
    lower: f.lower,
    upper: f.upper,
  }));

  const series = [...history, junction, ...future];

  const deltaClass = (n: number) => (n >= 0 ? "up" : "down");
  const sign = (n: number) => (n >= 0 ? "+" : "");

  const projDelta = horizon
    ? ((horizon.median - latest.median) / latest.median) * 100
    : 0;

  return (
    <main className="wrap">
      <div className="header">
        <span className="dot" />
        <div>
          <h1>Audi RS&nbsp;Q8 — Price Tracker</h1>
          <div className="sub">
            {snapshots.length} snapshots · latest {latest.date} ·{" "}
            {latest.count} listings ({latest.source})
          </div>
        </div>
      </div>

      <div className="cards">
        <div className="card">
          <div className="label">Median asking</div>
          <div className="value">{formatUSD(latest.median)}</div>
          <div className={`delta ${deltaClass(momPct)}`}>
            {sign(momPct)}
            {momPct.toFixed(1)}% MoM
          </div>
        </div>
        <div className="card">
          <div className="label">Year over year</div>
          <div className="value">
            {sign(yoyPct)}
            {yoyPct.toFixed(1)}%
          </div>
          <div className="delta">vs ~12 mo ago</div>
        </div>
        <div className="card">
          <div className="label">Range now</div>
          <div className="value" style={{ fontSize: 18 }}>
            {formatUSD(latest.min)} – {formatUSD(latest.max)}
          </div>
          <div className="delta">
            IQR {formatUSD(latest.p25)} – {formatUSD(latest.p75)}
          </div>
        </div>
        <div className="card">
          <div className="label">6-mo forecast</div>
          <div className="value">
            {horizon ? formatUSD(horizon.median) : "—"}
          </div>
          <div className={`delta ${deltaClass(projDelta)}`}>
            {sign(projDelta)}
            {projDelta.toFixed(1)}% projected
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>Median price &amp; 6-month forecast</h2>
        <p className="hint">
          White = observed median. Red dashed = linear-trend forecast with ~95%
          band.
        </p>
        <PriceChart data={series} forecastStart={latest.date} />
      </div>

      <div className="footer">
        Data via Auto.dev listings · forecast = OLS linear trend (v1).
        <br />
        Add to Home Screen to use it like an app. Refreshes when the ingestion
        workflow commits a new snapshot.
      </div>
    </main>
  );
}
