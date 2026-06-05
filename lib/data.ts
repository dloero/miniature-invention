import fs from "node:fs";
import path from "node:path";
import type { Snapshot } from "./types";

const DATA_FILE = path.join(process.cwd(), "data", "snapshots.json");

// Server-side read of the committed snapshot history. The app is statically
// generated, so this runs at build time on Vercel and re-runs whenever the
// ingestion workflow commits a new snapshot.
export function loadSnapshots(): Snapshot[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Snapshot[];
    return parsed.sort((a, b) => a.date.localeCompare(b.date));
  } catch {
    return [];
  }
}
