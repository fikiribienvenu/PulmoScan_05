// PulmoScan AI – TypeScript Type Definitions

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

export interface PatientInput {
  patient_name: string;
  AGE: number;
  GENDER: "M" | "F";
  SMOKING: 1 | 2;
  YELLOW_FINGERS: 1 | 2;
  ANXIETY: 1 | 2;
  PEER_PRESSURE: 1 | 2;
  CHRONIC_DISEASE: 1 | 2;
  FATIGUE: 1 | 2;
  ALLERGY: 1 | 2;
  WHEEZING: 1 | 2;
  ALCOHOL_CONSUMING: 1 | 2;
  COUGHING: 1 | 2;
  SHORTNESS_OF_BREATH: 1 | 2;
  SWALLOWING_DIFFICULTY: 1 | 2;
  CHEST_PAIN: 1 | 2;
}

export interface PredictionResult {
  patient_name: string;
  prediction: "HIGH RISK" | "LOW RISK";
  risk_probability: number;
  subtype: "NSCLC" | "SCLC" | null;
  subtype_note: string;
  model_used: string;
  recommendations: string[];
  gemini_explanation: string | null;
  disclaimer: string;
  prediction_id: string;
  created_at: string;
}

export interface PatientRecord extends PredictionResult {
  id: string;
  AGE: number;
  GENDER: string;
  SMOKING: number;
  doctor_email: string;
}

export interface PaginatedRecords {
  total: number;
  page: number;
  limit: number;
  records: PatientRecord[];
}

export interface YearlyStats {
  year: number;
  cases: number;
}

export interface Statistics {
  total_predictions: number;
  high_risk_count: number;
  low_risk_count: number;
  yearly_cases: YearlyStats[];
  gender_breakdown: { male: number; female: number };
  subtype_breakdown: { nsclc: number; sclc: number };
  model_metrics: Record<string, { accuracy: number; roc_auc: number }>;
  doctor_stats: { total: number; high_risk: number; low_risk: number };
}

export interface BatchResult {
  patient_name: string;
  AGE?: number;
  GENDER?: string;
  prediction: string;
  risk_probability: string;
  subtype: string;
  prediction_id?: string;
  error?: string;
}
