import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Stethoscope, Brain, Shield, Database, Code2, AlertCircle } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-gradient-to-br from-primary-500 to-teal-500 shadow-glow mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-4xl font-black text-medical-text mb-3">
            About PulmoScan AI
          </h1>
          <p className="text-lg text-medical-muted max-w-2xl mx-auto">
            A university capstone project delivering AI-assisted lung cancer risk prediction
            and clinical decision support for healthcare professionals.
          </p>
        </div>

        <div className="space-y-6">
          {/* Tech stack */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Code2 className="w-6 h-6 text-primary-500" />
              <h2 className="font-display font-bold text-xl text-medical-text">Technology Stack</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: "Frontend", items: ["Next.js 15", "TypeScript", "Tailwind CSS", "Recharts"] },
                { title: "Backend", items: ["Python FastAPI", "MongoDB + Motor", "JWT Auth", "Scikit-learn"] },
                { title: "AI / ML", items: ["Random Forest", "Gradient Boosting", "SVM + LR + DT", "Google Gemini API"] },
              ].map(({ title, items }) => (
                <div key={title} className="bg-slate-50 rounded-xl p-4">
                  <p className="font-semibold text-primary-700 mb-2">{title}</p>
                  <ul className="space-y-1">
                    {items.map((item) => (
                      <li key={item} className="text-sm text-medical-muted">• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* ML pipeline */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-teal-500" />
              <h2 className="font-display font-bold text-xl text-medical-text">ML Pipeline</h2>
            </div>
            <ol className="space-y-2">
              {[
                "Real lung cancer survey dataset (Kaggle) loaded and cleaned",
                "Duplicate removal, missing value imputation, outlier handling",
                "Feature encoding: gender label encoding, binary feature normalization",
                "StandardScaler normalization across all 15 clinical features",
                "5 algorithms trained: Logistic Regression, Random Forest, Gradient Boosting, SVM, Decision Tree",
                "Evaluated on Accuracy, Precision, Recall, F1-score, ROC-AUC",
                "Best model auto-selected by ROC-AUC, saved as best_model.pkl",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700
                                   flex items-center justify-center font-bold text-xs flex-shrink-0">{i+1}</span>
                  <span className="text-medical-text">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Subtype logic */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Database className="w-6 h-6 text-cyan-500" />
              <h2 className="font-display font-bold text-xl text-medical-text">Subtype Heuristic</h2>
            </div>
            <p className="text-sm text-medical-muted mb-3">
              When prediction is HIGH RISK, a heuristic rule estimates probable lung cancer subtype:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <p className="font-semibold text-red-700 mb-1">SCLC</p>
                <p className="text-xs text-red-600">
                  Heavy smoking (2) + Chest pain (2) + Shortness of breath (2) → Small Cell Lung Cancer suspected
                </p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <p className="font-semibold text-orange-700 mb-1">NSCLC</p>
                <p className="text-xs text-orange-600">
                  All other HIGH RISK cases → Non-Small Cell Lung Cancer (most common type)
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="card p-6 bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-display font-bold text-amber-800 mb-2">Medical Disclaimer</h2>
                <p className="text-sm text-amber-700 leading-relaxed">
                  PulmoScan AI is a <strong>university capstone project</strong> developed for educational
                  and clinical decision-support purposes only. It does <strong>not</strong> constitute a
                  formal medical diagnosis. All predictions and AI-generated explanations must be reviewed
                  by a qualified and licensed healthcare professional before any clinical action is taken.
                  The subtype classification is heuristic-based and has not been clinically validated.
                  Histopathological examination remains the gold standard for lung cancer diagnosis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
