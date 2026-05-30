// PulmoScan AI v2 – TypeScript Type Definitions
// Multi-class lung cancer subtype prediction system

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface Doctor {
  doctor_id: string;
  full_name: string;
  email: string;
  specialty?: string;
  hospital?: string;
}

export interface AuthState {
  doctor: Doctor | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ── Patient Input (12 clinical features) ──────────────────────────────────────

export interface PatientInput {
  patient_name: string;
  patient_age: number;
  patient_gender: "Male" | "Female";
  smoking_history: "Never" | "Former" | "Current";
  family_history: 0 | 1;
  nodule_size_mm: number;
  tumor_location: "Right Lung" | "Left Lung" | "Bilateral" | "Central" | "Other";
  tumor_stage: "Stage I" | "Stage II" | "Stage III" | "Stage IV";
  EGFR_mutation_status: 0 | 1;
  KRAS_mutation_status: 0 | 1;
  ALK_fusion_status: 0 | 1;
  PD_L1_expression_level: number;
  tumor_mutational_burden: number;
}

// ── Prediction Response ───────────────────────────────────────────────────────

export type CancerSubtype =
  | "No Cancer"
  | "Adenocarcinoma"
  | "Squamous Cell"
  | "SCLC"
  | "Large Cell"
  | "Cancer"
  | string;

export type RiskLevel = "Low" | "Moderate" | "High" | "Critical";

export interface PredictionResult {
  patient_name: string;
  subtype_prediction: CancerSubtype;
  confidence_score: number;
  class_probabilities: Record<string, number>;
  risk_level: RiskLevel;
  model_used: string;
  dataset_version: string;
  recommendations: string[];
  gemini_explanation: string | null;
  prediction_id: string;
  created_at: string;
}

// ── Patient Records ───────────────────────────────────────────────────────────

export interface PatientRecord extends PredictionResult {
  id: string;
  patient_age: number;
  patient_gender: string;
  smoking_history: string;
  tumor_stage: string;
  tumor_location: string;
  EGFR_mutation_status: number;
  KRAS_mutation_status: number;
  ALK_fusion_status: number;
  PD_L1_expression_level: number;
  tumor_mutational_burden: number;
  nodule_size_mm: number;
  family_history: number;
  doctor_email: string;
  batch_upload?: boolean;
}

export interface PaginatedRecords {
  total: number;
  page: number;
  limit: number;
  records: PatientRecord[];
}

// ── Statistics ────────────────────────────────────────────────────────────────

export interface SubtypeStat {
  subtype: CancerSubtype;
  count: number;
  percentage: number;
}

export interface YearlyStats {
  year: number;
  cases: number;
}

export interface YearlyGenderStats {
  year: number;
  male: number;
  female: number;
}

export interface ModelMetric {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  roc_auc: number;
  cv_f1?: number;
}

export interface Statistics {
  total_predictions: number;
  subtype_distribution: SubtypeStat[];
  risk_distribution: Record<string, number>;
  gender_breakdown: { male: number; female: number };
  yearly_cases: YearlyStats[];
  yearly_gender: YearlyGenderStats[];
  chub_totals: {
    total: number;
    male: number;
    female: number;
    peak_year: number;
    peak_cases: number;
  };
  model_metrics: Record<string, ModelMetric>;
  best_model: string;
  class_names: CancerSubtype[];
  doctor_stats: {
    total: number;
    subtype_breakdown: Record<string, number>;
    recent: RecentPrediction[];
  };
}

export interface RecentPrediction {
  id: string;
  patient_name: string;
  subtype_prediction: CancerSubtype;
  risk_level: RiskLevel;
  confidence_score: number;
  created_at: string;
}

// ── Model Performance ─────────────────────────────────────────────────────────

export interface ModelInfo {
  best_model: string;
  dataset_version: string;
  class_names: CancerSubtype[];
  n_classes: number;
  feature_columns: string[];
  feature_importance: Record<string, number>;
  model_metrics: Record<string, ModelMetric>;
  confusion_matrices?: Record<string, number[][]>;
}

// ── Batch Upload ──────────────────────────────────────────────────────────────

export interface BatchResult {
  patient_name: string;
  patient_age?: number;
  patient_gender?: string;
  subtype_prediction?: CancerSubtype;
  confidence_score?: string;
  risk_level?: RiskLevel;
  prediction_id?: string;
  error?: string;
}

export interface BatchResponse {
  total: number;
  processed: number;
  results: BatchResult[];
}

// ── Audit Log ─────────────────────────────────────────────────────────────────

export interface AuditEntry {
  id: string;
  action: string;
  doctor_email: string;
  detail: string;
  created_at: string;
}
