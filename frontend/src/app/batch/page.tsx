"use client";
import { useState, useRef } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SubtypeBadge from "@/components/ui/SubtypeBadge";
import RiskBadge from "@/components/ui/RiskBadge";
import api from "@/lib/api";
import { BatchResponse, BatchResult, CancerSubtype, RiskLevel } from "@/types";
import toast from "react-hot-toast";
import {
  AlertTriangle, CheckCircle2, Download, FileSpreadsheet,
  Loader2, Upload, X,
} from "lucide-react";

const REQUIRED_COLS = [
  "patient_name","patient_age","patient_gender","smoking_history",
  "family_history","nodule_size_mm","tumor_location","tumor_stage",
  "EGFR_mutation_status","KRAS_mutation_status","ALK_fusion_status",
  "PD_L1_expression_level","tumor_mutational_burden",
];

export default function BatchPage() {
  const [file,      setFile]      = useState<File | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState<BatchResponse | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) { toast.error("Please select a file first"); return; }
    setLoading(true);
    setResult(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post<BatchResponse>("/batch-predict", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
      toast.success(`Processed ${data.processed} patients`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg ?? "Batch upload failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const res = await api.get("/download/batch-template", { responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url; a.download = "batch_template.csv"; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Download failed"); }
  };

  const exportResults = () => {
    if (!result) return;
    const rows = [
      Object.keys(result.results[0] ?? {}).join(","),
      ...result.results.map(r => Object.values(r).join(",")),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "batch_results.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ProtectedRoute>
      <div className="page-wrapper">
        <Navbar />
        <main className="content-area">

          <div className="mb-8">
            <h1 className="page-title">Batch Prediction</h1>
            <p className="text-medical-muted dark:text-dark-muted mt-1">
              Upload a CSV or Excel file to process multiple patients at once.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Upload panel */}
            <div className="lg:col-span-1 space-y-6">
              <div className="card p-6">
                <h2 className="section-title mb-4">Upload File</h2>

                {/* Dropzone */}
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                    ${file
                      ? "border-primary-400 bg-primary-50 dark:bg-primary-900/20"
                      : "border-medical-border dark:border-dark-border hover:border-primary-300 hover:bg-primary-50/50 dark:hover:bg-primary-900/10"
                    }`}
                >
                  <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
                    onChange={e => setFile(e.target.files?.[0] ?? null)} />
                  {file ? (
                    <div className="space-y-2">
                      <FileSpreadsheet className="w-10 h-10 text-primary-500 mx-auto" />
                      <p className="font-semibold text-medical-text dark:text-dark-text text-sm">{file.name}</p>
                      <p className="text-xs text-medical-muted dark:text-dark-muted">{(file.size / 1024).toFixed(1)} KB</p>
                      <button type="button" onClick={e => { e.stopPropagation(); setFile(null); setResult(null); }}
                        className="inline-flex items-center gap-1 text-xs text-red-500 hover:underline">
                        <X className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-10 h-10 text-medical-muted dark:text-dark-muted mx-auto" />
                      <p className="font-semibold text-medical-text dark:text-dark-text text-sm">Drop file here</p>
                      <p className="text-xs text-medical-muted dark:text-dark-muted">CSV or Excel · click to browse</p>
                    </div>
                  )}
                </div>

                <button onClick={handleSubmit} disabled={!file || loading}
                  className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                    : <><Upload className="w-4 h-4" /> Run Batch Prediction</>
                  }
                </button>

                <button onClick={downloadTemplate}
                  className="btn-secondary w-full mt-3 flex items-center justify-center gap-2 text-sm">
                  <Download className="w-4 h-4" /> Download CSV Template
                </button>
              </div>

              {/* Required columns */}
              <div className="card p-6">
                <h3 className="font-display font-bold text-medical-text dark:text-dark-text mb-3">Required Columns</h3>
                <div className="space-y-1.5">
                  {REQUIRED_COLS.map(col => (
                    <div key={col} className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      <code className="font-mono text-primary-600 dark:text-primary-400">{col}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Results panel */}
            <div className="lg:col-span-2">
              {result ? (
                <div className="card p-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="section-title">Batch Results</h2>
                      <p className="text-sm text-medical-muted dark:text-dark-muted mt-1">
                        {result.processed} processed · {result.total - result.processed} errors
                      </p>
                    </div>
                    <button onClick={exportResults}
                      className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
                      <Download className="w-4 h-4" /> Export CSV
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-dark-border/40 border-b border-medical-border dark:border-dark-border">
                        <tr className="text-left text-medical-muted dark:text-dark-muted">
                          <th className="px-4 py-3 font-semibold">#</th>
                          <th className="px-4 py-3 font-semibold">Patient</th>
                          <th className="px-4 py-3 font-semibold">Subtype</th>
                          <th className="px-4 py-3 font-semibold">Risk</th>
                          <th className="px-4 py-3 font-semibold">Confidence</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-medical-border dark:divide-dark-border">
                        {result.results.map((r: BatchResult, i) => (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-dark-border/30">
                            <td className="px-4 py-3 text-medical-muted dark:text-dark-muted">{i + 1}</td>
                            <td className="px-4 py-3 font-medium text-medical-text dark:text-dark-text">{r.patient_name}</td>
                            <td className="px-4 py-3">
                              {r.error
                                ? <span className="text-red-500 text-xs">Error</span>
                                : <SubtypeBadge subtype={r.subtype_prediction as CancerSubtype} />
                              }
                            </td>
                            <td className="px-4 py-3">
                              {!r.error && r.risk_level && <RiskBadge risk={r.risk_level as RiskLevel} />}
                            </td>
                            <td className="px-4 py-3 text-medical-text dark:text-dark-text">{r.confidence_score ?? "—"}</td>
                            <td className="px-4 py-3">
                              {r.error
                                ? <span className="flex items-center gap-1 text-red-500 text-xs"><AlertTriangle className="w-3 h-3" />{r.error.slice(0,40)}</span>
                                : <span className="flex items-center gap-1 text-green-600 text-xs"><CheckCircle2 className="w-3 h-3" />OK</span>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="card p-12 flex flex-col items-center justify-center text-center h-full min-h-64">
                  <FileSpreadsheet className="w-16 h-16 text-medical-muted dark:text-dark-muted mb-4 opacity-30" />
                  <p className="font-display font-bold text-medical-text dark:text-dark-text mb-2">No results yet</p>
                  <p className="text-sm text-medical-muted dark:text-dark-muted max-w-xs">
                    Upload a CSV or Excel file with the required columns and click Run Batch Prediction.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
