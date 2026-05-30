import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Stethoscope, Brain, Shield, Database, Code2, Dna } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="content-area max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-gradient-to-br from-primary-500 to-teal-500 mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="page-title">About PulmoScan AI</h1>
          <p className="text-lg text-medical-muted dark:text-dark-muted max-w-2xl mx-auto mt-2">
            A university capstone project delivering multi-class lung cancer subtype prediction
            and clinical decision support for healthcare professionals.
          </p>
        </div>

        <div className="space-y-6">
          {/* Tech stack */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Code2 className="w-6 h-6 text-primary-500" />
              <h2 className="section-title">Technology Stack</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: "Frontend",  items: ["Next.js 15", "TypeScript", "Tailwind CSS", "Recharts"] },
                { title: "Backend",   items: ["Python FastAPI", "MongoDB + Motor", "JWT Auth", "Scikit-learn"] },
                { title: "AI / ML",   items: ["Random Forest", "XGBoost", "LightGBM", "Google Gemini 2.5 Flash"] },
              ].map(({ title, items }) => (
                <div key={title} className="bg-slate-50 dark:bg-dark-border/40 rounded-xl p-4">
                  <p className="font-semibold text-primary-700 dark:text-primary-400 mb-2">{title}</p>
                  <ul className="space-y-1">
                    {items.map((item) => (
                      <li key={item} className="text-sm text-medical-muted dark:text-dark-muted">• {item}</li>
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
              <h2 className="section-title">Multi-class ML Pipeline</h2>
            </div>
            <ol className="space-y-2">
              {[
                "LungCanC2024_Dataset.csv loaded (289,010 clinical records)",
                "Duplicate removal, missing value imputation, outlier clamping",
                "12 clinical features selected (demographics, genomic markers, biomarkers)",
                "Categorical encoding: gender, smoking history, tumor location, tumor stage",
                "StandardScaler normalization applied across all features",
                "7 algorithms trained: Logistic Regression, Random Forest, Gradient Boosting, Decision Tree, XGBoost, LightGBM (SVM excluded for large dataset)",
                "Best model auto-selected by weighted F1-score; artifacts saved to ml_models/",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400
                                   flex items-center justify-center font-bold text-xs flex-shrink-0">{i+1}</span>
                  <span className="text-medical-text dark:text-dark-text">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Cancer subtypes */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Dna className="w-6 h-6 text-violet-500" />
              <h2 className="section-title">Predicted Cancer Subtypes</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "No Cancer",      color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800", text: "text-green-700 dark:text-green-400",
                  desc: "Benign assessment - monitoring and preventive care recommended." },
                { label: "Adenocarcinoma", color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",   text: "text-blue-700 dark:text-blue-400",
                  desc: "Most common NSCLC; EGFR/ALK-driven; targeted therapy available." },
                { label: "Squamous Cell",  color: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-400",
                  desc: "Central NSCLC; strongly linked to smoking; PD-L1 guides immunotherapy." },
                { label: "SCLC",           color: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",         text: "text-red-700 dark:text-red-400",
                  desc: "Small cell; rapidly progressive; combination chemotherapy required." },
              ].map(({ label, color, text, desc }) => (
                <div key={label} className={`rounded-xl p-4 border ${color}`}>
                  <p className={`font-semibold mb-1 ${text}`}>{label}</p>
                  <p className="text-xs text-medical-muted dark:text-dark-muted">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-primary-500" />
              <h2 className="section-title">Security & Architecture</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-medical-text dark:text-dark-text">
              {[
                ["Authentication", "JWT tokens with 24-hour expiry"],
                ["Passwords",      "bcrypt hashing, never stored plaintext"],
                ["Data Access",    "Doctor-scoped MongoDB queries"],
                ["Audit Trail",    "Every prediction logged to audit_logs"],
                ["CORS",           "Configurable allow-list per environment"],
                ["API Docs",       "OpenAPI at /docs (FastAPI auto-generated)"],
              ].map(([l, v]) => (
                <div key={l} className="flex gap-2 py-2 border-b border-medical-border dark:border-dark-border last:border-0">
                  <span className="text-medical-muted dark:text-dark-muted font-medium w-28 shrink-0">{l}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CHUB */}
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-cyan-500" />
              <h2 className="section-title">Clinical Context - CHUB Butare</h2>
            </div>
            <p className="text-sm text-medical-muted dark:text-dark-muted leading-relaxed">
              PulmoScan AI was designed as a capstone clinical decision support prototype for
              resource-conscious healthcare settings. CHUB (Centre Hospitalier Universitaire de Butare,
              Rwanda) confirmed 135 lung cancer cases between 2022-2025, with 2023 as the peak year
              (47 cases). The system helps clinicians prioritise specialist referrals and treatment
              planning using only clinically obtainable tabular data - no CT imaging pipeline required.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
