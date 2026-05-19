"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import { PatientRecord } from "@/types";
import { Search, Download, AlertTriangle, CheckCircle, Users, Filter } from "lucide-react";
import toast from "react-hot-toast";

export default function RecordsPage() {
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("");

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

  const downloadCSV = () => api.get("/download/csv", { responseType: "blob" }).then(({ data }) => {
    const url = URL.createObjectURL(data);
    const a = document.createElement("a"); a.href = url; a.download = "pulmoscan_records.csv"; a.click();
  });

  const downloadXLSX = () => api.get("/download/excel", { responseType: "blob" }).then(({ data }) => {
    const url = URL.createObjectURL(data);
    const a = document.createElement("a"); a.href = url; a.download = "pulmoscan_records.xlsx"; a.click();
  });

  const totalPages = Math.ceil(total / 15);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-primary-500
                              flex items-center justify-center shadow-medical">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="section-title">Patient Records</h1>
                <p className="text-sm text-medical-muted">{total} total records</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={downloadCSV} className="btn-outline flex items-center gap-1.5 py-2 text-sm">
                <Download className="w-4 h-4" /> CSV
              </button>
              <button onClick={downloadXLSX} className="btn-outline flex items-center gap-1.5 py-2 text-sm">
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
                className="input-field pl-10 pr-8 w-full sm:w-auto"
              >
                <option value="">All Risk Levels</option>
                <option value="HIGH RISK">High Risk</option>
                <option value="LOW RISK">Low Risk</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-medical-border">
                  <tr>
                    {["Patient","Age","Gender","Prediction","Risk %","Subtype","Model","Date"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-medical-muted uppercase tracking-wide">
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
                          <td key={j} className="px-4 py-3">
                            <div className="skeleton h-4 rounded w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-16 text-center text-medical-muted">
                        No records found. Start by running a prediction.
                      </td>
                    </tr>
                  ) : (
                    records.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-medical-text">{r.patient_name}</td>
                        <td className="px-4 py-3 text-medical-muted">{r.AGE}</td>
                        <td className="px-4 py-3 text-medical-muted">{r.GENDER === "M" ? "Male" : "Female"}</td>
                        <td className="px-4 py-3">
                          <span className={r.prediction === "HIGH RISK" ? "risk-badge-high" : "risk-badge-low"}>
                            {r.prediction === "HIGH RISK"
                              ? <AlertTriangle className="w-3 h-3" />
                              : <CheckCircle className="w-3 h-3" />}
                            {r.prediction}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono">{(r.risk_probability * 100).toFixed(1)}%</td>
                        <td className="px-4 py-3 text-medical-muted">{r.subtype || "N/A"}</td>
                        <td className="px-4 py-3 text-xs text-medical-muted">{r.model_used}</td>
                        <td className="px-4 py-3 text-xs text-medical-muted">
                          {new Date(r.created_at).toLocaleDateString()}
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
            <div className="flex justify-center gap-2 mt-6">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-outline py-2 px-4 text-sm disabled:opacity-50">← Prev</button>
              <span className="px-4 py-2 text-sm text-medical-muted">
                Page {page} of {totalPages}
              </span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="btn-outline py-2 px-4 text-sm disabled:opacity-50">Next →</button>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
