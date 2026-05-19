"use client";
import { useState } from "react";
import { PatientInput } from "@/types";
import { User, Calendar, ChevronDown } from "lucide-react";

interface Props {
  onSubmit: (data: PatientInput) => void;
  loading: boolean;
}

type BinaryField = keyof Omit<PatientInput, "patient_name" | "AGE" | "GENDER">;

const SYMPTOM_FIELDS: { key: BinaryField; label: string; description: string }[] = [
  { key: "SMOKING", label: "Smoking", description: "Current or heavy smoker" },
  { key: "YELLOW_FINGERS", label: "Yellow Fingers", description: "Yellowing of fingertips" },
  { key: "ANXIETY", label: "Anxiety", description: "Persistent anxiety symptoms" },
  { key: "PEER_PRESSURE", label: "Peer Pressure", description: "Influenced by peers to smoke" },
  { key: "CHRONIC_DISEASE", label: "Chronic Disease", description: "Pre-existing chronic condition" },
  { key: "FATIGUE", label: "Fatigue", description: "Persistent unexplained fatigue" },
  { key: "ALLERGY", label: "Allergy", description: "Known respiratory allergies" },
  { key: "WHEEZING", label: "Wheezing", description: "Wheezing or whistling breath" },
  { key: "ALCOHOL_CONSUMING", label: "Alcohol Consuming", description: "Regular alcohol consumption" },
  { key: "COUGHING", label: "Coughing", description: "Persistent chronic cough" },
  { key: "SHORTNESS_OF_BREATH", label: "Shortness of Breath", description: "Dyspnea at rest or exertion" },
  { key: "SWALLOWING_DIFFICULTY", label: "Swallowing Difficulty", description: "Dysphagia or difficulty swallowing" },
  { key: "CHEST_PAIN", label: "Chest Pain", description: "Chest tightness or pain" },
];

const DEFAULT: PatientInput = {
  patient_name: "",
  AGE: 45,
  GENDER: "M",
  SMOKING: 1,
  YELLOW_FINGERS: 1,
  ANXIETY: 1,
  PEER_PRESSURE: 1,
  CHRONIC_DISEASE: 1,
  FATIGUE: 1,
  ALLERGY: 1,
  WHEEZING: 1,
  ALCOHOL_CONSUMING: 1,
  COUGHING: 1,
  SHORTNESS_OF_BREATH: 1,
  SWALLOWING_DIFFICULTY: 1,
  CHEST_PAIN: 1,
};

export default function PredictionForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<PatientInput>(DEFAULT);

  const handleBinary = (key: BinaryField, val: 1 | 2) => {
    setForm((p) => ({ ...p, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient Info */}
      <div className="card p-6">
        <h3 className="font-display font-bold text-lg text-medical-text mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-500" />
          Patient Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-medical-text mb-1.5">
              Patient Name *
            </label>
            <input
              type="text"
              required
              value={form.patient_name}
              onChange={(e) => setForm((p) => ({ ...p, patient_name: e.target.value }))}
              placeholder="Full name"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-medical-text mb-1.5">
              <Calendar className="inline w-4 h-4 mr-1" />Age (years) *
            </label>
            <input
              type="number"
              required
              min={1} max={120}
              value={form.AGE}
              onChange={(e) => setForm((p) => ({ ...p, AGE: parseInt(e.target.value) }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-medical-text mb-1.5">Gender *</label>
            <div className="relative">
              <select
                value={form.GENDER}
                onChange={(e) => setForm((p) => ({ ...p, GENDER: e.target.value as "M" | "F" }))}
                className="input-field appearance-none"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-medical-muted pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Symptoms & Risk Factors */}
      <div className="card p-6">
        <h3 className="font-display font-bold text-lg text-medical-text mb-2">
          Symptoms & Risk Factors
        </h3>
        <p className="text-sm text-medical-muted mb-4">
          Toggle each factor as <strong>Yes</strong> (present) or <strong>No</strong> (absent).
          Values: 1 = No, 2 = Yes
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SYMPTOM_FIELDS.map(({ key, label, description }) => (
            <div key={key} className="border border-medical-border rounded-xl p-3 bg-slate-50/50">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-semibold text-medical-text">{label}</p>
                  <p className="text-xs text-medical-muted">{description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleBinary(key, 1)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all
                    ${form[key] === 1
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-white text-medical-muted border-medical-border hover:border-green-300"
                    }`}
                >
                  No (1)
                </button>
                <button
                  type="button"
                  onClick={() => handleBinary(key, 2)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all
                    ${form[key] === 2
                      ? "bg-red-500 text-white border-red-500"
                      : "bg-white text-medical-muted border-medical-border hover:border-red-300"
                    }`}
                >
                  Yes (2)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Analyzing with AI…
          </span>
        ) : (
          "Run Lung Cancer Risk Assessment"
        )}
      </button>

      <p className="text-xs text-center text-medical-muted">
        ⚠️ This tool is for clinical decision-support only and does not constitute a medical diagnosis.
      </p>
    </form>
  );
}
