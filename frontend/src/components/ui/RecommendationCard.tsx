import { CheckCircle2, AlertTriangle } from "lucide-react";

interface Props {
  recommendations: string[];
  prediction: "HIGH RISK" | "LOW RISK";
}

export default function RecommendationCard({ recommendations, prediction }: Props) {
  const isHighRisk = prediction === "HIGH RISK";
  const Icon = isHighRisk ? AlertTriangle : CheckCircle2;
  const color = isHighRisk ? "text-red-500" : "text-green-500";
  const bg = isHighRisk ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200";

  return (
    <div className={`card p-6 border ${bg} animate-fade-in`}>
      <div className="flex items-center gap-3 mb-4">
        <Icon className={`w-6 h-6 ${color}`} />
        <h3 className="font-display font-bold text-medical-text">
          Clinical Recommendations
        </h3>
      </div>
      <ul className="space-y-2">
        {recommendations.map((rec, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center
                            flex-shrink-0 mt-0.5 ${isHighRisk ? "bg-red-100" : "bg-green-100"}`}>
              <span className={`text-xs font-bold ${color}`}>{i + 1}</span>
            </div>
            <span className="text-medical-text">{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
