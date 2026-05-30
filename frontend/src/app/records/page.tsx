"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SubtypeBadge from "@/components/ui/SubtypeBadge";
import RiskBadge from "@/components/ui/RiskBadge";
import ConfidenceBar from "@/components/ui/ConfidenceBar";
import api from "@/lib/api";
import { PaginatedRecords, PatientRecord, CancerSubtype, RiskLevel } from "@/types";
import { ChevronLeft, ChevronRight, Download, Eye, Search, SlidersHorizontal, X } from "lucide-react";
import toast from "react-hot-toast";

const SUBTYPES = ["", "No Cancer", "Adenocarcinoma", "Squamous Cell", "SCLC", "Large Cell"];
const RISKS    = ["", "Low", "Moderate", "High", "Critical"];
const LIMIT    = 20;

export default function RecordsPage() {
  const [data,          setData]          = useState<PaginatedRecords | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [page,          setPage]          = useState(1);
  const [search,        setSearch]        = useState("");
  const [subFilter,     setSubFilter]     = useState("");
  const [riskFilter,    setRiskFilter]    = useState("");
  const [selected,      setSelected]      = useState<PatientRecord | null>(null);
  const [downloading,   setDownloading]   = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        ...(search    && { search }),
        ...(subFilter && { subtype_filter: subFilter }),
        ...(riskFilter && { risk_filter: riskFilter }),
      });
      const { data: res } = await api.get<PaginatedRecords>(`/patients?${params}`);
      setData(res);
    } catch { toast.error("Failed to load records"); }
    finally  { setLoading(false); }
  }, [page, search, subFilter, riskFilter]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;

  const downloadCSV = async () => {
    setDownloading(true);
    try {
      const res = await api.get("/download/csv", { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a   = document.createElement("a");
      a.href = url; a.download = "pulmoscan_records.csv"; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Download failed"); }
    finally { setDownloading(false); }
  };

  const downloadExcel = async () => {
    setDownloading(true);
    try {
      const res = await api.get("/download/excel", { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a   = document.createElement("a");
      a.href = url; a.download = "pulmoscan_records.xlsx"; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Download failed"); }
    finally { setDownloading(false); }
  };

  return (
    <ProtectedRoute>
      <div className="page-wrapper">
        <Navbar />
        <main className="content-area">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="page-title">Patient Records</h1>
              <p className="text-medical-muted dark:text-dark-muted mt-1">
                {data?.total ?? "—"} total predictions
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={downloadCSV}   disabled={downloading} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
                <Download className="w-4 h-4" /> CSV
              </button>
              <button onClick={downloadExcel} disabled={downloading} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
                <Download className="w-4 h-4" /> Excel
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-medical-muted dark:text-dark-muted" />
              <input
                className="input-field pl-10 py-2.5 text-sm"
                placeholder="Search patient name…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-medical-muted dark:text-dark-muted shrink-0" />
              <select className="input-field py-2.5 text-sm w-44"
                value={subFilter} onChange={e => { setSubFilter(e.target.value); setPage(1); }}>
                <option value="">All subtypes</option>
                {SUBTYPES.filter(Boolean).map(s => <option key={s}>{s}</option>)}
              </select>
              <select className="input-field py-2.5 text-sm w-36"
                value={riskFilter} onChange={e => { setRiskFilter(e.target.value); setPage(1); }}>
                <option value="">All risks</option>
                {RISKS.filter(Boolean).map(r => <option key={r}>{r}</option>)}
              </select>
              {(search || subFilter || riskFilter) && (
                <button onClick={() => { setSearch(""); setSubFilter(""); setRiskFilter(""); setPage(1); }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-medical-border dark:border-dark-border hover:bg-red-50 dark:hover:bg-red-900/20 text-medical-muted dark:text-dark-muted hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="card overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-dark-border/40 border-b border-medical-border dark:border-dark-border">
                  <tr className="text-left text-medical-muted dark:text-dark-muted">
                    <th className="px-4 py-3 font-semibold">Patient</th>
                    <th className="px-4 py-3 font-semibold">Subtype</th>
                    <th className="px-4 py-3 font-semibold">Risk</th>
                    <th className="px-4 py-3 font-semibold">Confidence</th>
                    <th className="px-4 py-3 font-semibold">Stage</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-medical-border dark:divide-dark-border">
                  {loading
                    ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="skeleton h-6 w-full" /></td></tr>
                    ))
                    : data?.records.length === 0
                      ? <tr><td colSpan={7} className="px-4 py-12 text-center text-medical-muted dark:text-dark-muted">No records found.</td></tr>
                      : data?.records.map(r => (
                        <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-dark-border/30 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-medical-text dark:text-dark-text">{r.patient_name}</p>
                            <p className="text-xs text-medical-muted dark:text-dark-muted">{r.patient_gender}, {r.patient_age} yrs</p>
                          </td>
                          <td className="px-4 py-3"><SubtypeBadge subtype={r.subtype_prediction as CancerSubtype} /></td>
                          <td className="px-4 py-3"><RiskBadge risk={r.risk_level as RiskLevel} /></td>
                          <td className="px-4 py-3 w-32"><ConfidenceBar value={r.confidence_score} height="h-1.5" /></td>
                          <td className="px-4 py-3 text-medical-muted dark:text-dark-muted">{r.tumor_stage ?? "—"}</td>
                          <td className="px-4 py-3 text-medical-muted dark:text-dark-muted whitespace-nowrap">
                            {new Date(r.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => setSelected(r)}
                              className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400 hover:underline text-xs font-semibold">
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-medical-muted dark:text-dark-muted">
                Page {page} of {totalPages} · {data?.total} records
              </p>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="btn-secondary px-3 py-2 text-sm flex items-center gap-1 disabled:opacity-40">
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                  className="btn-secondary px-3 py-2 text-sm flex items-center gap-1 disabled:opacity-40">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>

      {/* Patient detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-0">
            <div className="flex items-center justify-between p-6 border-b border-medical-border dark:border-dark-border">
              <div>
                <h2 className="font-display font-bold text-xl text-medical-text dark:text-dark-text">{selected.patient_name}</h2>
                <p className="text-sm text-medical-muted dark:text-dark-muted">{selected.patient_gender}, {selected.patient_age} yrs · {selected.smoking_history} smoker</p>
              </div>
              <button onClick={() => setSelected(null)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-medical-border dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-border">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Result banner */}
              <div className="rounded-xl bg-gradient-to-r from-primary-50 to-teal-50 dark:from-primary-900/20 dark:to-teal-900/20 border border-primary-100 dark:border-primary-800 p-4 flex items-center justify-between gap-4">
                <div>
                  <SubtypeBadge subtype={selected.subtype_prediction as CancerSubtype} className="mb-2" />
                  <RiskBadge risk={selected.risk_level as RiskLevel} />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-display font-black text-primary-700 dark:text-primary-400">
                    {Math.round(selected.confidence_score * 100)}%
                  </div>
                  <p className="text-xs text-medical-muted dark:text-dark-muted">confidence</p>
                </div>
              </div>

              {/* Clinical data */}
              <div>
                <h3 className="font-bold text-medical-text dark:text-dark-text mb-3">Clinical Data</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    ["Tumour Stage",    selected.tumor_stage      ?? "—"],
                    ["Location",        selected.tumor_location   ?? "—"],
                    ["Nodule Size",     selected.nodule_size_mm != null ? `${selected.nodule_size_mm} mm` : "—"],
                    ["EGFR",           selected.EGFR_mutation_status ? "Positive" : "Negative"],
                    ["KRAS",           selected.KRAS_mutation_status ? "Positive" : "Negative"],
                    ["ALK",            selected.ALK_fusion_status    ? "Positive" : "Negative"],
                    ["PD-L1",          selected.PD_L1_expression_level != null ? `${selected.PD_L1_expression_level}%` : "—"],
                    ["TMB",            selected.tumor_mutational_burden != null ? `${selected.tumor_mutational_burden} mut/Mb` : "—"],
                    ["Family History", selected.family_history ? "Yes" : "No"],
                    ["Model Used",     selected.model_used ?? "—"],
                    ["Date",           new Date(selected.created_at).toLocaleString()],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between py-1 border-b border-medical-border dark:border-dark-border last:border-0">
                      <span className="text-medical-muted dark:text-dark-muted">{l}</span>
                      <span className="font-medium text-medical-text dark:text-dark-text">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Class probs */}
              {selected.class_probabilities && (
                <div>
                  <h3 className="font-bold text-medical-text dark:text-dark-text mb-3">Class Probabilities</h3>
                  <div className="space-y-3">
                    {Object.entries(selected.class_probabilities)
                      .sort(([,a],[,b]) => b - a)
                      .map(([cls, prob]) => <ConfidenceBar key={cls} value={prob} label={cls} />)}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {selected.recommendations?.length > 0 && (
                <div>
                  <h3 className="font-bold text-medical-text dark:text-dark-text mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {selected.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-medical-text dark:text-dark-text">
                        <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gemini */}
              {selected.gemini_explanation && (
                <div>
                  <h3 className="font-bold text-medical-text dark:text-dark-text mb-3">AI Clinical Interpretation</h3>
                  <p className="text-sm text-medical-text dark:text-dark-text whitespace-pre-line leading-relaxed">
                    {selected.gemini_explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
