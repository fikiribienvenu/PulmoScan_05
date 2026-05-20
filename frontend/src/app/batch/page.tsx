"use client";
import { useState, useRef } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { BatchResult } from "@/types";
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Download, FileDown } from "lucide-react";

export default function BatchPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [total, setTotal] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Please select a file first");
    const form = new FormData();
    form.append("file", file);
    setLoading(true);
    try {
      const { data } = await api.post("/batch-predict", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResults(data.results);
      setTotal(data.total);
      toast.success(`Processed ${data.total} patients successfully!`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Batch processing failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const header = Object.keys(results[0] || {}).join(",");
    const rows = results.map((r) => Object.values(r).map(String).join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "batch_results.csv"; a.click();
  };

  const downloadTemplate = () => {
    const headers = "patient_name,AGE,GENDER,SMOKING,YELLOW_FINGERS,ANXIETY,PEER_PRESSURE,CHRONIC_DISEASE,FATIGUE,ALLERGY,WHEEZING,ALCOHOL_CONSUMING,COUGHING,SHORTNESS_OF_BREATH,SWALLOWING_DIFFICULTY,CHEST_PAIN";
    const sample1 = "John Doe,55,M,2,1,1,1,2,2,1,2,1,2,2,1,2";
    const sample2 = "Jane Smith,42,F,1,1,2,1,1,2,2,1,1,2,1,1,1";
    const sample3 = "Robert Brown,63,M,2,2,1,2,1,1,1,1,2,1,2,2,2";
    const csv = [headers, sample1, sample2, sample3].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "pulmoscan_batch_template.csv"; a.click();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-primary-500
                            flex items-center justify-center shadow-medical">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="section-title">Batch Prediction</h1>
              <p className="text-medical-muted text-sm">Upload CSV or Excel file with multiple patients</p>
            </div>
          </div>

          {/* Template note */}
          <div className="card p-4 mb-6 bg-primary-50 border border-primary-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-primary-700 font-semibold mb-1">Required CSV columns:</p>
                <p className="text-xs text-primary-600 font-mono leading-relaxed">
                  patient_name, AGE, GENDER, SMOKING, YELLOW_FINGERS, ANXIETY, PEER_PRESSURE,
                  CHRONIC_DISEASE, FATIGUE, ALLERGY, WHEEZING, ALCOHOL_CONSUMING, COUGHING,
                  SHORTNESS_OF_BREATH, SWALLOWING_DIFFICULTY, CHEST_PAIN
                </p>
                <p className="text-xs text-primary-500 mt-1">
                  Binary fields: 1 = No, 2 = Yes &nbsp;|&nbsp; GENDER: M or F
                </p>
              </div>
              <button onClick={downloadTemplate}
                className="flex items-center gap-1.5 bg-primary-600 text-white text-xs
                           font-semibold px-3 py-2 rounded-lg hover:bg-primary-700
                           transition-colors flex-shrink-0">
                <FileDown className="w-3.5 h-3.5" />
                Template
              </button>
            </div>
          </div>

          {/* Drop zone */}
          <div
            className="border-2 border-dashed border-primary-200 rounded-2xl p-12 text-center
                       hover:border-primary-400 hover:bg-primary-50/50 transition-all cursor-pointer
                       bg-white"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <FileSpreadsheet className="w-12 h-12 text-primary-300 mx-auto mb-4" />
            {file ? (
              <div>
                <p className="font-semibold text-primary-700">{file.name}</p>
                <p className="text-sm text-medical-muted">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-medical-text mb-1">Drop CSV or Excel file here</p>
                <p className="text-sm text-medical-muted">or click to browse</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="btn-primary flex-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Processing {file?.name}…
                </span>
              ) : "Run Batch Prediction"}
            </button>
            {results.length > 0 && (
              <button onClick={downloadCSV} className="btn-outline flex items-center gap-2">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            )}
          </div>

          {/* Results table */}
          {results.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title">Results ({total} patients)</h2>
              </div>
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-medical-border">
                      <tr>
                        {["Patient Name","Age","Gender","Prediction","Risk %","Subtype"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-semibold text-medical-muted text-xs uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-medical-border">
                      {results.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-medium text-medical-text">{r.patient_name}</td>
                          <td className="px-4 py-3 text-medical-muted">{r.AGE || "—"}</td>
                          <td className="px-4 py-3 text-medical-muted">{r.GENDER || "—"}</td>
                          <td className="px-4 py-3">
                            {r.error ? (
                              <span className="text-red-500 text-xs">Error: {r.error}</span>
                            ) : (
                              <span className={r.prediction === "HIGH RISK" ? "risk-badge-high" : "risk-badge-low"}>
                                {r.prediction === "HIGH RISK" ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                                {r.prediction}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-medical-text">{r.risk_probability}</td>
                          <td className="px-4 py-3 text-medical-muted">{r.subtype}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
