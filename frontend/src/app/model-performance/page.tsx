"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ConfidenceBar from "@/components/ui/ConfidenceBar";
import api from "@/lib/api";
import { ModelInfo } from "@/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { Award, BarChart3, Brain, Cpu, Dna } from "lucide-react";

export default function ModelPerformancePage() {
  const [info,    setInfo]    = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/model-metrics").then(r => setInfo(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <ProtectedRoute>
      <div className="page-wrapper"><Navbar />
        <main className="content-area space-y-6">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );

  const metrics    = info?.model_metrics     ?? {};
  const importance = info?.feature_importance ?? {};

  const barData = Object.entries(metrics).map(([name, m]) => ({
    name: name.length > 16 ? name.slice(0, 14) + "…" : name,
    Accuracy: +(m.accuracy * 100).toFixed(1),
    F1:       +(m.f1 * 100).toFixed(1),
    "ROC-AUC":+(m.roc_auc * 100).toFixed(1),
    Precision:+(m.precision * 100).toFixed(1),
    Recall:   +(m.recall * 100).toFixed(1),
  }));

  const importanceEntries = Object.entries(importance).slice(0, 12);
  const maxImp = Math.max(...importanceEntries.map(([, v]) => v), 0.001);

  return (
    <ProtectedRoute>
      <div className="page-wrapper">
        <Navbar />
        <main className="content-area space-y-6">

          <div className="mb-8">
            <h1 className="page-title">Model Performance</h1>
            <p className="text-medical-muted dark:text-dark-muted mt-1">
              Comparison of all trained ML algorithms and feature importance analysis.
            </p>
          </div>

          {/* Best model banner */}
          {info?.best_model && (
            <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-teal-600 p-6 text-white flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white/70 text-sm font-medium">Best Performing Model</p>
                <h2 className="text-2xl font-display font-black">{info.best_model}</h2>
                <p className="text-white/70 text-sm mt-1">
                  Dataset: {info.dataset_version} · {info.n_classes} classes · {info.feature_columns?.length} features
                </p>
              </div>
              {metrics[info.best_model] && (
                <div className="hidden sm:grid grid-cols-3 gap-4 text-center">
                  {[
                    ["Accuracy", (metrics[info.best_model].accuracy * 100).toFixed(1) + "%"],
                    ["F1 Score", (metrics[info.best_model].f1 * 100).toFixed(1) + "%"],
                    ["ROC-AUC",  (metrics[info.best_model].roc_auc * 100).toFixed(1) + "%"],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <div className="text-xl font-display font-black">{v}</div>
                      <div className="text-white/60 text-xs">{l}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Metrics comparison chart */}
          {barData.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <BarChart3 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <h2 className="section-title">Algorithm Comparison</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Legend />
                  <Bar dataKey="Accuracy"  fill="#3b82f6" radius={[4,4,0,0]} />
                  <Bar dataKey="F1"        fill="#14b8a6" radius={[4,4,0,0]} />
                  <Bar dataKey="ROC-AUC"   fill="#8b5cf6" radius={[4,4,0,0]} />
                  <Bar dataKey="Precision" fill="#f59e0b" radius={[4,4,0,0]} />
                  <Bar dataKey="Recall"    fill="#ef4444" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Metrics table */}
          {Object.keys(metrics).length > 0 && (
            <div className="card p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <Cpu className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <h2 className="section-title">Detailed Metrics Table</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-dark-border/40">
                    <tr className="text-left text-medical-muted dark:text-dark-muted border-b border-medical-border dark:border-dark-border">
                      <th className="px-4 py-3 font-semibold">Model</th>
                      <th className="px-4 py-3 font-semibold">Accuracy</th>
                      <th className="px-4 py-3 font-semibold">Precision</th>
                      <th className="px-4 py-3 font-semibold">Recall</th>
                      <th className="px-4 py-3 font-semibold">F1 Score</th>
                      <th className="px-4 py-3 font-semibold">ROC-AUC</th>
                      <th className="px-4 py-3 font-semibold">CV F1</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-medical-border dark:divide-dark-border">
                    {Object.entries(metrics)
                      .sort(([,a],[,b]) => b.f1 - a.f1)
                      .map(([name, m], idx) => (
                        <tr key={name} className={`hover:bg-slate-50 dark:hover:bg-dark-border/30 transition-colors ${idx === 0 ? "font-semibold" : ""}`}>
                          <td className="px-4 py-3 flex items-center gap-2 text-medical-text dark:text-dark-text">
                            {idx === 0 && <Award className="w-3.5 h-3.5 text-amber-500" />}
                            {name}
                          </td>
                          {[m.accuracy, m.precision, m.recall, m.f1, m.roc_auc, m.cv_f1 ?? 0].map((v, i) => (
                            <td key={i} className="px-4 py-3">
                              <span className={`font-mono ${v >= 0.9 ? "text-green-600 dark:text-green-400" : v >= 0.75 ? "text-primary-600 dark:text-primary-400" : "text-medical-muted dark:text-dark-muted"}`}>
                                {(v * 100).toFixed(1)}%
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Feature importance */}
          {importanceEntries.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <Dna className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <h2 className="section-title">Feature Importance</h2>
              </div>
              <div className="space-y-3">
                {importanceEntries.map(([feat, imp]) => (
                  <ConfidenceBar
                    key={feat}
                    value={imp / maxImp}
                    label={feat.replace(/_/g, " ")}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Class names */}
          {info?.class_names && info.class_names.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <Brain className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <h2 className="section-title">Prediction Classes</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {info.class_names.map((cls, i) => (
                  <span key={cls} className="px-3 py-1.5 rounded-xl text-sm font-semibold border"
                    style={{ borderColor: ["#22c55e","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#64748b"][i % 6] + "80",
                              color:      ["#22c55e","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#64748b"][i % 6],
                              background: ["#22c55e","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#64748b"][i % 6] + "15" }}>
                    {cls}
                  </span>
                ))}
              </div>
            </div>
          )}

        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
