"use client";
import { CancerSubtype } from "@/types";

const MAP: Record<string, string> = {
  "No Cancer":     "badge-none",
  "Adenocarcinoma":"badge-adeno",
  "Squamous Cell": "badge-squamous",
  "SCLC":          "badge-sclc",
  "Small Cell":    "badge-sclc",
  "Large Cell":    "badge-large",
};

const DOT: Record<string, string> = {
  "No Cancer":     "bg-green-500",
  "Adenocarcinoma":"bg-blue-500",
  "Squamous Cell": "bg-amber-500",
  "SCLC":          "bg-red-500",
  "Small Cell":    "bg-red-500",
  "Large Cell":    "bg-purple-500",
};

interface Props { subtype: CancerSubtype; className?: string }

export default function SubtypeBadge({ subtype, className = "" }: Props) {
  const cls = MAP[subtype] ?? "badge-squamous";
  const dot = DOT[subtype] ?? "bg-slate-400";
  return (
    <span className={`${cls} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {subtype}
    </span>
  );
}
