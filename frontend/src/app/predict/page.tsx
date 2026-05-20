"use client";
import { useState } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PredictionForm from "@/components/forms/PredictionForm";
import RiskGauge from "@/components/ui/RiskGauge";
import GeminiExplanationCard from "@/components/ui/GeminiExplanationCard";
import RecommendationCard from "@/components/ui/RecommendationCard";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { PatientInput, PredictionResult } from "@/types";
import { FileSearch, Dna, Info, CheckCircle2 } from "lucide-react";

export default function PredictPage() {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: PatientInput) => {
    setLoading(true);
    setResult(null);
    try {
      const { data: res } = await api.post("/predict", data);
      setResult(res);
      toast.success("Prediction complete!");
      window.scrollTo({ top: document.getElementById("result-section")?.offsetTop ?? 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500
                              flex items-center justify-center shadow-medical">
                <FileSearch className="w-5 h-5 text-white" />
              </div>
              <h1 className="section-title">Lung Cancer Risk Assessment</h1>
            </div>
            <p className="text-medical-muted ml-13">
              Complete the clinical form below to receive an AI-powered risk prediction.
            </p>
          </div>

          <PredictionForm onSubmit={handleSubmit} loading={loading} />

          {/* Results Section */}
          {result && (
            <div id="result-section" className="mt-10 space-y-6 animate-slide-up">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-500" />
                <h2 className="section-title">Assessment Results</h2>
              </div>

              {/* Main result card */}
              <div className="card p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="flex flex-col items-center">
                    <RiskGauge
                      probability={result.risk_probability}
                      prediction={result.prediction}
                    />
                    <p className="text-medical-muted text-sm mt-3">
                      Model: <strong className="text-primary-600">{result.model_used}</strong>
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-medical-muted uppercase tracking-wider mb-1">Patient</p>
                      <p className="font-display font-bold text-xl text-medical-text">{result.patient_name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-xs text-medical-muted">Risk Score</p>
                        <p className="font-bold text-lg text-medical-text">
                          {(result.risk_probability * 100).toFixed(1)}%
                        </p>
                      </div>
                      {result.subtype && (
                        <div className="bg-primary-50 rounded-xl p-3">
                          <p className="text-xs text-medical-muted flex items-center gap-1">
                            <Dna className="w-3 h-3" /> Probable Subtype
                          </p>
                          <p className="font-bold text-lg text-primary-700">{result.subtype}</p>
                        </div>
                      )}
                    </div>

                    {result.subtype && (
                      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-700">{result.subtype_note}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecommendationCard
                  recommendations={result.recommendations}
                  prediction={result.prediction}
                />
                <GeminiExplanationCard explanation={result.gemini_explanation} />
              </div>

              <div className="card p-4 bg-slate-50 border border-slate-200 text-xs text-medical-muted">
                📋 Record ID: {result.prediction_id} •{" "}
                {new Date(result.created_at).toLocaleString()}
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
