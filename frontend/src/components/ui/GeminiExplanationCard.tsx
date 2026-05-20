import { Brain } from "lucide-react";

interface Props {
  explanation: string | null;
}

export default function GeminiExplanationCard({ explanation }: Props) {
  if (!explanation) return null;

  return (
    <div className="card p-6 border-l-4 border-l-teal-400 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-primary-500
                        flex items-center justify-center shadow-medical">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-display font-bold text-medical-text">AI Clinical Explanation</h3>
          <p className="text-xs text-medical-muted">Powered by Google Gemini</p>
        </div>
      </div>

      <div className="bg-teal-50 rounded-xl p-4 text-sm text-medical-text leading-relaxed whitespace-pre-wrap">
        {explanation}
      </div>


    </div>
  );
}
