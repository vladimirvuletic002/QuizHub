import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// tacke: [{ score, max, whenUtc, attemptId }]
export default function ProgressChart({ points, height = 160 }) {
  const data = useMemo(() => {
    return (points || []).map((p) => {
      const score = p.score ?? p.Score ?? 0;
      const max = p.max ?? p.maxScore ?? p.MaxScore ?? 0;
      const when = p.whenUtc ?? p.WhenUtc;
      const ts = when ? new Date(when).getTime() : Date.now();
      const percentage = max > 0 ? Math.round((score / max) * 100) : 0;
      return {
        time: ts,            
        score,
        max,
        percentage,
        attemptId: p.attemptId ?? p.AttemptId,
        whenIso: when,
      };
    });
  }, [points]);

  const CustomTooltip = ({ active, label, payload }) => {
    if (!active || !payload || payload.length === 0) return null;
    const row = payload[0]?.payload;
    const dt = label ? new Date(label).toLocaleString() : "";
    return (
      <div className="adp-tip">
        <div style={{ fontSize: 12, opacity: 0.8 }}>{dt}</div>
        <div style={{ marginTop: 4 }}>
          <strong>{row.score} / {row.max}</strong> ({row.percentage}%)
        </div>
      </div>
    );
  };

  if (!data.length) return null;

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 12, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(t) => new Date(t).toLocaleDateString()}
            fontSize={12}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            width={40}
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="percentage"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}