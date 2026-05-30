"use client";

interface Props {
  value: number;      // 0–1
  label?: string;
  showPercent?: boolean;
  height?: string;
}

function colorFor(v: number) {
  if (v >= 0.8) return "from-green-400 to-green-500";
  if (v >= 0.6) return "from-blue-400 to-primary-500";
  if (v >= 0.4) return "from-amber-400 to-amber-500";
  return "from-red-400 to-red-500";
}

export default function ConfidenceBar({ value, label, showPercent = true, height = "h-2.5" }: Props) {
  const pct = Math.round(value * 100);
  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-medical-muted dark:text-dark-muted">{label}</span>}
          {showPercent && <span className="text-xs font-semibold text-medical-text dark:text-dark-text">{pct}%</span>}
        </div>
      )}
      <div className={`w-full ${height} rounded-full bg-slate-100 dark:bg-dark-border overflow-hidden`}>
        <div
          className={`${height} rounded-full bg-gradient-to-r ${colorFor(value)} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
