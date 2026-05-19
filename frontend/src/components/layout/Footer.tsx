import { Stethoscope, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-medical-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-primary-700">PulmoScan AI</span>
          </div>

          <p className="text-xs text-medical-muted text-center max-w-lg">
            ⚠️ This system is intended for educational and clinical decision-support purposes only.
            It does not constitute a formal medical diagnosis. Always consult a qualified healthcare professional.
          </p>

          <div className="flex items-center gap-1 text-xs text-medical-muted">
            <span>Built with</span>
            <Heart className="w-3 h-3 text-red-400 fill-current" />
            <span>for healthcare</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
