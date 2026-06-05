"use client";

import {
  Area,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import type { SeriesPoint } from "@/lib/types";

function fmtK(n: number) {
  return `$${Math.round(n / 1000)}k`;
}

function fmtDate(d: string) {
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export default function PriceChart({
  data,
  forecastStart,
}: {
  data: SeriesPoint[];
  forecastStart?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart
        data={data}
        margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
      >
        <CartesianGrid stroke="#2a2a36" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={fmtDate}
          stroke="#9a9aab"
          fontSize={11}
          minTickGap={24}
        />
        <YAxis
          tickFormatter={fmtK}
          stroke="#9a9aab"
          fontSize={11}
          width={44}
          domain={["auto", "auto"]}
        />
        <Tooltip
          contentStyle={{
            background: "#1d1d27",
            border: "1px solid #2a2a36",
            borderRadius: 12,
            color: "#f4f4f7",
            fontSize: 12,
          }}
          formatter={(v: number, name: string) => [
            typeof v === "number" ? `$${v.toLocaleString()}` : v,
            name,
          ]}
          labelFormatter={(l) => fmtDate(l as string)}
        />
        {/* Forecast uncertainty band */}
        <Area
          dataKey="upper"
          stroke="none"
          fill="#e10600"
          fillOpacity={0.08}
          isAnimationActive={false}
          connectNulls
          name="Upper"
        />
        <Area
          dataKey="lower"
          stroke="none"
          fill="#0b0b0f"
          fillOpacity={1}
          isAnimationActive={false}
          connectNulls
          name="Lower"
        />
        {forecastStart && (
          <ReferenceLine
            x={forecastStart}
            stroke="#9a9aab"
            strokeDasharray="4 4"
            label={{ value: "today", fill: "#9a9aab", fontSize: 10 }}
          />
        )}
        {/* Historical median */}
        <Line
          dataKey="median"
          stroke="#f4f4f7"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
          connectNulls
          name="Median price"
        />
        {/* Forecast center line */}
        <Line
          dataKey="forecastMedian"
          stroke="#e10600"
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={false}
          isAnimationActive={false}
          connectNulls
          name="Forecast"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
