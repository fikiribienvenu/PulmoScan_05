"use client";
import { RiskLevel } from "@/types";
import { AlertCircle, AlertTriangle, CheckCircle2, Zap } from "lucide-react";

const CFG: Record<RiskLevel, { cls: string; Icon: React.FC<{ className?: string }>; label: string }> = {
  Low:      { cls: "badge-low",      Icon: CheckCircle2,  label: "Low Risk"      },
  Moderate: { cls: "badge-moderate", Icon: AlertCircle,   label: "Moderate Risk" },
  High:     { cls: "badge-high",     Icon: AlertTriangle, label: "High Risk"     },
  Critical: { cls: "badge-critical", Icon: Zap,           label: "Critical"      },
};

interface Props { risk: RiskLevel; showLabel?: boolean; className?: string }

export default function RiskBadge({ risk, showLabel = true, className = "" }: Props) {
  const { cls, Icon, label } = CFG[risk] ?? CFG.Moderate;
  return (
    <span className={`${cls} ${className}`}>
      <Icon className="w-3 h-3" />
      {showLabel && label}
    </span>
  );
}
