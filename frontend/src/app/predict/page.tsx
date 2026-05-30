"use client";
import { useState } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SubtypeBadge from "@/components/ui/SubtypeBadge";
import RiskBadge from "@/components/ui/RiskBadge";
import ConfidenceBar from "@/components/ui/ConfidenceBar";
import api from "@/lib/api";
import { PatientInput, PredictionResult, RiskLevel } from "@/types";
import toast from "react-hot-toast";
import {
  Activity, AlertTriangle, Brain, ChevronRight,
  Dna, FlaskConical, Loader2, Microscope, User,
} from "lucide-react";

const DEFAULTS: PatientInput = {
  patient_name:            "",
  patient_age:             55,
  patient_gender:          "Male",
  smoking_history:         "Never",
  family_history:          0,
  nodule_size_mm:          8.0,
  tumor_location:          "Right Lung",
  tumor_stage:             "Stage II",
  EGFR_mutation_status:    0,
  KRAS_mutation_status:    0,
  ALK_fusion_status:       0,
  PD_L1_expression_level:  10,
  tumor_mutational_burden: 5,
};

function SectionHeader({
  icon: Icon, title, desc,
}: { icon: React.FC<{className?:string}>; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-medical-border dark:border-dark-border">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="font-display font-bold text-medical-text dark:text-dark-text">{title}</h3>
        <p className="text-xs text-medical-muted dark:text-dark-muted">{desc}</p>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="text-xs text-medical-muted dark:text-dark-muted mt-1">{hint}</p>}
    </div>
  );
}

function Toggle({ value, onChange }: { value: 0 | 1; onChange: (v: 0 | 1) => void }) {
  return (
    <div className="flex rounded-xl overflow-hidden border border-medical-border dark:border-dark-border">
      {([0, 1] as const).map(v => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`flex-1 py-2.5 text-sm font-medium transition-all
            ${value === v
              ? "bg-primary-600 text-white"
              : "bg-white dark:bg-dark-card text-medical-muted dark:text-dark-muted hover:bg-slate-50 dark:hover:bg-dark-border"
            }`}
        >
          {v === 0 ? "Negative" : "Positive"}
        </button>
      ))}
    </div>
  );
}

const GRADIENT: Record<string, string> = {
  "No Cancer":     "from-green-400 to-green-600",
  "Adenocarcinoma":"from-blue-500 to-primary-600",
  "Squamous Cell": "from-amber-500 to-orange-600",
  "SCLC":          "from-red-500 to-red-700",
  "Small Cell":    "from-red-500 to-red-700",
  "Large Cell":    "from-purple-500 to-purple-700",
};

export default function PredictPage() {
  const [form, setForm]       = useState<PatientInput>(DEFAULTS);
  const [result, setResult]   = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof PatientInput>(k: K, v: PatientInput[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_name.trim()) { toast.error("Please enter a patient name"); return; }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post<PredictionResult>("/predict", form);
      setResult(data);
      toast.success("Prediction complete");
      setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg ?? "Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const grad = result ? (GRADIENT[result.subtype_prediction] ?? "from-slate-500 to-slate-700") : "";

  return (
    <ProtectedRoute>
      <div className="page-wrapper">
        <Navbar />
        <main className="content-area">

          <div className="mb-8">
            <h1 className="page-title">Lung Cancer Subtype Prediction</h1>
            <p className="text-medical-muted dark:text-dark-muted mt-1">
              Enter clinical and genomic features to receive an ML-driven multi-class subtype assessment.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* ── Left: feature sections ── */}
            <div className="xl:col-span-2 space-y-6">

              {/* Demographics */}
              <div className="card p-6">
                <SectionHeader icon={User} title="Patient Demographics" desc="Identification and risk factors" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Patient Name *">
                    <input className="input-field" placeholder="Full name" value={form.patient_name}
                      onChange={e => set("patient_name", e.target.value)} required />
                  </Field>
                  <Field label="Age (years)">
                    <input className="input-field" type="number" min={1} max={120} value={form.patient_age}
                      onChange={e => set("patient_age", +e.target.value)} />
                  </Field>
                  <Field label="Gender">
                    <select className="input-field" value={form.patient_gender}
                      onChange={e => set("patient_gender", e.target.value as "Male"|"Female")}>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </Field>
                  <Field label="Smoking History">
                    <select className="input-field" value={form.smoking_history}
                      onChange={e => set("smoking_history", e.target.value as "Never"|"Former"|"Current")}>
                      <option>Never</option>
                      <option>Former</option>
                      <option>Current</option>
                    </select>
                  </Field>
                  <Field label="Family History of Cancer">
                    <Toggle value={form.family_history} onChange={v => set("family_history", v)} />
                  </Field>
                </div>
              </div>

              {/* Clinical assessment */}
              <div className="card p-6">
                <SectionHeader icon={Microscope} title="Clinical Assessment" desc="Imaging measurement and staging" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Nodule Size (mm)" hint="Largest diameter from radiology report">
                    <input className="input-field" type="number" step="0.1" min={0} max={100}
                      value={form.nodule_size_mm} onChange={e => set("nodule_size_mm", +e.target.value)} />
                  </Field>
                  <Field label="Tumour Location">
                    <select className="input-field" value={form.tumor_location}
                      onChange={e => set("tumor_location", e.target.value as PatientInput["tumor_location"])}>
                      <option>Right Lung</option>
                      <option>Left Lung</option>
                      <option>Bilateral</option>
                      <option>Central</option>
                      <option>Other</option>
                    </select>
                  </Field>
                  <Field label="Tumour Stage">
                    <select className="input-field" value={form.tumor_stage}
                      onChange={e => set("tumor_stage", e.target.value as PatientInput["tumor_stage"])}>
                      <option>Stage I</option>
                      <option>Stage II</option>
                      <option>Stage III</option>
                      <option>Stage IV</option>
                    </select>
                  </Field>
                </div>
              </div>

              {/* Genomic markers */}
              <div className="card p-6">
                <SectionHeader icon={Dna} title="Genomic Markers" desc="Molecular profiling results" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <Field label="EGFR Mutation">
                    <Toggle value={form.EGFR_mutation_status} onChange={v => set("EGFR_mutation_status", v)} />
                  </Field>
                  <Field label="KRAS Mutation">
                    <Toggle value={form.KRAS_mutation_status} onChange={v => set("KRAS_mutation_status", v)} />
                  </Field>
                  <Field label="ALK Fusion">
                    <Toggle value={form.ALK_fusion_status} onChange={v => set("ALK_fusion_status", v)} />
                  </Field>
                </div>
              </div>

              {/* Biomarkers */}
              <div className="card p-6">
                <SectionHeader icon={FlaskConical} title="Biomarkers" desc="Immunological and mutational burden" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="PD-L1 Expression (%)" hint="Tumour proportion score (0–100)">
                    <input className="input-field" type="number" step="0.1" min={0} max={100}
                      value={form.PD_L1_expression_level}
                      onChange={e => set("PD_L1_expression_level", +e.target.value)} />
                  </Field>
                  <Field label="Tumour Mutational Burden" hint="Mutations per megabase (mut/Mb)">
                    <input className="input-field" type="number" step="0.1" min={0}
                      value={form.tumor_mutational_burden}
                      onChange={e => set("tumor_mutational_burden", +e.target.value)} />
                  </Field>
                </div>
              </div>
            </div>

            {/* ── Right: summary + submit ── */}
            <div>
              <div className="card p-6 sticky top-24">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-medical-text dark:text-dark-text">ML Engine</p>
                    <p className="text-xs text-medical-muted dark:text-dark-muted">Multi-algorithm ensemble</p>
                  </div>
                </div>

                <div className="space-y-2 mb-6 p-4 rounded-xl bg-slate-50 dark:bg-dark-border/40 text-sm">
                  {[
                    ["Patient", form.patient_name || "—"],
                    ["Age",     `${form.patient_age} yrs`],
                    ["Gender",  form.patient_gender],
                    ["Smoking", form.smoking_history],
                    ["Stage",   form.tumor_stage],
                    ["EGFR",    form.EGFR_mutation_status ? "Positive" : "Negative"],
                    ["KRAS",    form.KRAS_mutation_status ? "Positive" : "Negative"],
                    ["ALK",     form.ALK_fusion_status    ? "Positive" : "Negative"],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between">
                      <span className="text-medical-muted dark:text-dark-muted">{l}</span>
                      <span className="font-medium text-medical-text dark:text-dark-text truncate ml-2">{v}</span>
                    </div>
                  ))}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing…</>
                    : <><Activity className="w-4 h-4" /> Run Prediction <ChevronRight className="w-4 h-4" /></>
                  }
                </button>
                <p className="text-center text-xs text-medical-muted dark:text-dark-muted mt-3">
                  Decision-support only — not a clinical diagnosis.
                </p>
              </div>
            </div>
          </form>

          {/* ── Results section ── */}
          {result && (
            <div id="results" className="mt-10 animate-fade-in space-y-6">
              <h2 className="section-title">Prediction Results</h2>

              {/* Hero card */}
              <div className={`rounded-2xl bg-gradient-to-br ${grad} p-6 sm:p-8 text-white shadow-medical`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="flex-1">
                    <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">Predicted Subtype</p>
                    <h2 className="text-3xl sm:text-4xl font-display font-black">{result.subtype_prediction}</h2>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-3 py-1 rounded-full bg-white/20 border border-white/30 text-xs font-semibold">
                        Risk: {result.risk_level}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/20 border border-white/30 text-xs font-semibold">
                        {result.model_used}
                      </span>
                    </div>
                  </div>
                  <div className="text-center shrink-0">
                    <div className="text-5xl font-display font-black">{Math.round(result.confidence_score * 100)}%</div>
                    <p className="text-white/70 text-sm mt-1">Confidence</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Class probabilities */}
                <div className="card p-6">
                  <h3 className="font-display font-bold text-medical-text dark:text-dark-text mb-4">Class Probabilities</h3>
                  <div className="space-y-4">
                    {Object.entries(result.class_probabilities)
                      .sort(([, a], [, b]) => b - a)
                      .map(([cls, prob]) => (
                        <div key={cls}>
                          <ConfidenceBar value={prob} label={cls} />
                        </div>
                      ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="card p-6">
                  <h3 className="font-display font-bold text-medical-text dark:text-dark-text mb-4">Clinical Recommendations</h3>
                  <ul className="space-y-2.5">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-medical-text dark:text-dark-text">
                        <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Gemini explanation */}
              {result.gemini_explanation && (
                <div className="card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-display font-bold text-medical-text dark:text-dark-text">
                      Gemini AI Clinical Interpretation
                    </h3>
                  </div>
                  <div className="whitespace-pre-line text-sm text-medical-text dark:text-dark-text leading-relaxed">
                    {result.gemini_explanation}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2.5 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <strong>Clinical Disclaimer:</strong> PulmoScan AI is a decision-support tool only.
                  All outputs must be reviewed by a qualified oncologist. Histopathological examination
                  remains the gold standard for lung cancer diagnosis.
                </p>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
