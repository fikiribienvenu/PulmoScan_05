import { Brain, AlertCircle } from "lucide-react";

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

      <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          AI-generated explanations are for educational and clinical decision-support purposes only.
          They do not constitute a medical diagnosis.
        </p>
      </div>
    </div>
  );
}
