"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import { PatientRecord } from "@/types";
import {
  Search, Download, AlertTriangle, CheckCircle, Users,
  Filter, X, Eye, Calendar, User, Stethoscope, Brain,
} from "lucide-react";
import toast from "react-hot-toast";

const SYMPTOM_LABELS: Record<string, string> = {
  SMOKING: "Smoking", YELLOW_FINGERS: "Yellow Fingers", ANXIETY: "Anxiety",
  PEER_PRESSURE: "Peer Pressure", CHRONIC_DISEASE: "Chronic Disease",
  FATIGUE: "Fatigue", ALLERGY: "Allergy", WHEEZING: "Wheezing",
  ALCOHOL_CONSUMING: "Alcohol Consuming", COUGHING: "Coughing",
  SHORTNESS_OF_BREATH: "Shortness of Breath",
  SWALLOWING_DIFFICULTY: "Swallowing Difficulty", CHEST_PAIN: "Chest Pain",
};

function PatientDetailModal({ record, onClose }: { record: any; onClose: () => void }) {
  const isHigh = record.prediction === "HIGH RISK";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh]
                      overflow-y-auto animate-slide-up"
           onClick={(e) => e.stopPropagation()}>

        {/* Modal Header */}
        <div className={`p-6 rounded-t-2xl ${isHigh
          ? "bg-gradient-to-r from-red-500 to-red-700"
          : "bg-gradient-to-r from-green-500 to-teal-600"}`}>
          <div className="flex items-start justify-between">
            <div className="text-white">
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Patient Assessment</p>
              <h2 className="font-display text-2xl font-black mt-1">{record.patient_name}</h2>
              <div className="flex items-center gap-4 mt-2 text-white/80 text-sm">
                <span>Age {record.AGE}</span>
                <span>•</span>
                <span>{record.GENDER === "M" ? "Male" : "Female"}</span>
                <span>•</span>
                <span>{new Date(record.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center
                         hover:bg-white/30 transition-colors text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Risk Score */}
          <div className="flex items-center gap-4 mt-4">
            <div className="bg-white/20 rounded-xl px-4 py-2">
              <p className="text-white/70 text-xs">Risk Score</p>
              <p className="text-white font-display font-black text-2xl">
                {(record.risk_probability * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2">
              <p className="text-white/70 text-xs">Prediction</p>
              <p className="text-white font-bold text-sm">{record.prediction}</p>
            </div>
            {record.subtype && (
              <div className="bg-white/20 rounded-xl px-4 py-2">
                <p className="text-white/70 text-xs">Subtype</p>
                <p className="text-white font-bold text-sm">{record.subtype}</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Symptoms */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Stethoscope className="w-4 h-4 text-primary-500" />
              <h3 className="font-display font-bold text-medical-text">Symptoms & Risk Factors</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(SYMPTOM_LABELS).map(([key, label]) => {
                const present = record[key] === 2;
                return (
                  <div key={key}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border
                      ${present
                        ? "bg-red-50 border-red-200 text-red-700"
                        : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${present ? "bg-red-500" : "bg-slate-300"}`} />
                    {label}
                    <span className={`ml-auto font-bold ${present ? "text-red-600" : "text-slate-400"}`}>
                      {present ? "Yes" : "No"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendations */}
          {record.recommendations?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-teal-500" />
                <h3 className="font-display font-bold text-medical-text">Clinical Recommendations</h3>
              </div>
              <ul className="space-y-2">
                {record.recommendations.map((r: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold
                                      text-xs flex-shrink-0 mt-0.5
                                      ${isHigh ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                      {i + 1}
                    </span>
                    <span className="text-medical-text">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Explanation */}
          {record.gemini_explanation && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-indigo-500" />
                <h3 className="font-display font-bold text-medical-text">AI Clinical Explanation</h3>
              </div>
              <div className="bg-indigo-50 rounded-xl p-4 text-sm text-medical-text
                              leading-relaxed whitespace-pre-wrap border border-indigo-100">
                {record.gemini_explanation}
              </div>
            </div>
          )}

          {/* Footer info */}
          <div className="bg-slate-50 rounded-xl p-3 text-xs text-medical-muted
                          flex flex-wrap gap-3 border border-slate-200">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(record.created_at).toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {record.doctor_email}
            </span>
            <span>Model: {record.model_used}</span>
            <span>ID: {record.id?.slice(-8)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [selected, setSelected] = useState<any | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: "15",
        ...(search && { search }),
        ...(riskFilter && { risk_filter: riskFilter }),
      });
      const { data } = await api.get(`/patients?${params}`);
      setRecords(data.records);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, [page, search, riskFilter]);

  const downloadCSV = () =>
    api.get("/download/csv", { responseType: "blob" }).then(({ data }) => {
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url; a.download = "pulmoscan_records.csv"; a.click();
    });

  const downloadXLSX = () =>
    api.get("/download/excel", { responseType: "blob" }).then(({ data }) => {
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url; a.download = "pulmoscan_records.xlsx"; a.click();
    });

  const totalPages = Math.ceil(total / 15);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        {selected && <PatientDetailModal record={selected} onClose={() => setSelected(null)} />}

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-primary-500
                              flex items-center justify-center shadow-medical">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="section-title">Patient Records</h1>
                <p className="text-sm text-medical-muted">{total} total records — click any row to view details</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={downloadCSV}
                className="btn-outline flex items-center gap-1.5 py-2 px-4 text-sm">
                <Download className="w-4 h-4" /> CSV
              </button>
              <button onClick={downloadXLSX}
                className="btn-outline flex items-center gap-1.5 py-2 px-4 text-sm">
                <Download className="w-4 h-4" /> Excel
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-medical-muted" />
              <input
                type="text"
                placeholder="Search by patient name…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="input-field pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3.5 w-4 h-4 text-medical-muted" />
              <select
                value={riskFilter}
                onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
                className="input-field pl-10 pr-8 w-full sm:w-48"
              >
                <option value="">All Risk Levels</option>
                <option value="HIGH RISK">High Risk</option>
                <option value="LOW RISK">Low Risk</option>
              </select>
            </div>
          </div>

          {/* Summary badges */}
          <div className="flex gap-3 mb-4">
            <span className="risk-badge-high">
              <AlertTriangle className="w-3 h-3" />
              High Risk: {records.filter(r => r.prediction === "HIGH RISK").length}
            </span>
            <span className="risk-badge-low">
              <CheckCircle className="w-3 h-3" />
              Low Risk: {records.filter(r => r.prediction === "LOW RISK").length}
            </span>
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-medical-border">
                  <tr>
                    {["Patient", "Age", "Gender", "Prediction", "Risk %", "Subtype", "Date", ""].map((h) => (
                      <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold
                                             text-medical-muted uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-medical-border">
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="px-4 py-3.5">
                            <div className="skeleton h-4 rounded w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-20 text-center">
                        <div className="flex flex-col items-center gap-3 text-medical-muted">
                          <Users className="w-12 h-12 text-slate-300" />
                          <p className="font-medium">No records found</p>
                          <p className="text-sm">Start by running a prediction to see records here</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    records.map((r) => (
                      <tr key={r.id}
                        className="hover:bg-primary-50/40 transition-colors cursor-pointer group"
                        onClick={() => setSelected(r)}>
                        <td className="px-4 py-3.5 font-semibold text-medical-text group-hover:text-primary-700">
                          {r.patient_name}
                        </td>
                        <td className="px-4 py-3.5 text-medical-muted">{r.AGE}</td>
                        <td className="px-4 py-3.5 text-medical-muted">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                            ${r.GENDER === "M"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-pink-100 text-pink-700"}`}>
                            {r.GENDER === "M" ? "Male" : "Female"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={r.prediction === "HIGH RISK"
                            ? "risk-badge-high" : "risk-badge-low"}>
                            {r.prediction === "HIGH RISK"
                              ? <AlertTriangle className="w-3 h-3" />
                              : <CheckCircle className="w-3 h-3" />}
                            {r.prediction}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`font-mono font-bold text-sm
                            ${r.prediction === "HIGH RISK" ? "text-red-600" : "text-green-600"}`}>
                            {(r.risk_probability * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {r.subtype ? (
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700
                                             rounded-full text-xs font-medium">
                              {r.subtype}
                            </span>
                          ) : (
                            <span className="text-medical-muted text-xs">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-medical-muted">
                          {new Date(r.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="flex items-center gap-1 text-xs text-primary-500
                                           group-hover:text-primary-700 font-medium">
                            <Eye className="w-3.5 h-3.5" /> View
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-outline py-2 px-4 text-sm disabled:opacity-40">
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <span key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-2 text-medical-muted">…</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all
                        ${p === page
                          ? "bg-primary-600 text-white shadow-medical"
                          : "text-medical-muted hover:bg-slate-100"}`}>
                      {p}
                    </button>
                  </span>
                ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="btn-outline py-2 px-4 text-sm disabled:opacity-40">
                Next →
              </button>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
