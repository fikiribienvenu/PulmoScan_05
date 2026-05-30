import { Activity } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-dark-card border-t border-medical-border dark:border-dark-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-primary-700 dark:text-primary-400">PulmoScan AI</span>
            <span className="text-medical-muted dark:text-dark-muted text-xs">v2.0 · Multi-class Edition</span>
          </div>
          <p className="text-xs text-medical-muted dark:text-dark-muted text-center">
            For educational and clinical decision-support purposes only · Not a substitute for medical diagnosis
          </p>
        </div>
      </div>
    </footer>
  );
}
