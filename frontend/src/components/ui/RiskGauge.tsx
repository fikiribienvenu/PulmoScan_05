"use client";
import { useEffect, useState } from "react";

interface Props {
  probability: number; // 0 to 1
  prediction: "HIGH RISK" | "LOW RISK";
}

export default function RiskGauge({ probability, prediction }: Props) {
  const [animated, setAnimated] = useState(0);
  const pct = Math.round(probability * 100);
  const isHigh = prediction === "HIGH RISK";

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(pct), 200);
    return () => clearTimeout(timer);
  }, [pct]);

  // SVG arc parameters
  const r = 70;
  const cx = 90;
  const cy = 90;
  const startAngle = -180;
  const endAngle = 0;
  const circumference = Math.PI * r; // half circle

  const toRad = (d: number) => (d * Math.PI) / 180;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animated / 100) * circumference;

  const color = isHigh ? "#ef4444" : "#22c55e";
  const bgColor = isHigh ? "#fee2e2" : "#dcfce7";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width="180" height="100" viewBox="0 0 180 100">
          {/* Background arc */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Colored arc */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
          />
          {/* Center text */}
          <text x={cx} y={cy - 8} textAnchor="middle" fontSize="24" fontWeight="800" fill={color}>
            {animated}%
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fill="#64748b">
            Risk Score
          </text>
        </svg>
      </div>

      <div
        className="px-5 py-2 rounded-full font-bold text-sm tracking-wide border-2"
        style={{ backgroundColor: bgColor, color, borderColor: color }}
      >
        {prediction}
      </div>
    </div>
  );
}
