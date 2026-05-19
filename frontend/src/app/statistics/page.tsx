"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import { Statistics } from "@/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { BarChart3 } from "lucide-react";

const COLORS = ["#2578e8", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function StatisticsPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/statistics").then((r) => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-6 h-64 skeleton" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );

  if (!stats) return null;

  const riskPieData = [
    { name: "High Risk", value: stats.high_risk_count },
    { name: "Low Risk", value: stats.low_risk_count },
  ];
  const genderPieData = [
    { name: "Male", value: stats.gender_breakdown.male },
    { name: "Female", value: stats.gender_breakdown.female },
  ];
  const modelData = Object.entries(stats.model_metrics).map(([name, m]) => ({
    name: name.replace(" ", "\n"),
    Accuracy: +(m.accuracy * 100).toFixed(1),
    "ROC-AUC": +(m.roc_auc * 100).toFixed(1),
  }));

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-primary-500
                            flex items-center justify-center shadow-medical">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="section-title">Analytics Dashboard</h1>
              <p className="text-sm text-medical-muted">Lung cancer case trends and model performance</p>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Predictions", value: stats.total_predictions, color: "text-primary-600" },
              { label: "High Risk", value: stats.high_risk_count, color: "text-red-600" },
              { label: "Low Risk", value: stats.low_risk_count, color: "text-green-600" },
              { label: "NSCLC / SCLC", value: `${stats.subtype_breakdown.nsclc} / ${stats.subtype_breakdown.sclc}`, color: "text-teal-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="card p-4 text-center">
                <p className={`text-2xl font-display font-black ${color}`}>{value}</p>
                <p className="text-xs text-medical-muted mt-1">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Yearly trend */}
            <div className="card p-6">
              <h3 className="font-display font-bold text-medical-text mb-4">Yearly Case Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={stats.yearly_cases}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="cases" stroke="#2578e8" strokeWidth={2}
                    dot={{ fill: "#2578e8", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Yearly bar */}
            <div className="card p-6">
              <h3 className="font-display font-bold text-medical-text mb-4">Cases by Year (Bar)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.yearly_cases}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="cases" radius={[6, 6, 0, 0]}>
                    {stats.yearly_cases.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Risk pie */}
            <div className="card p-6">
              <h3 className="font-display font-bold text-medical-text mb-4">Risk Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={riskPieData} cx="50%" cy="50%" outerRadius={80}
                    dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    <Cell fill="#ef4444" />
                    <Cell fill="#22c55e" />
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Gender pie */}
            <div className="card p-6">
              <h3 className="font-display font-bold text-medical-text mb-4">Gender Breakdown</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={genderPieData} cx="50%" cy="50%" outerRadius={80}
                    dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    <Cell fill="#2578e8" />
                    <Cell fill="#ec4899" />
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Model comparison */}
          <div className="card p-6">
            <h3 className="font-display font-bold text-medical-text mb-4">
              ML Model Comparison (Accuracy & ROC-AUC %)
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={modelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                <XAxis type="number" domain={[70, 100]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Accuracy" fill="#2578e8" radius={[0, 4, 4, 0]} />
                <Bar dataKey="ROC-AUC" fill="#14b8a6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-medical-muted mt-2 text-center">
              * Best model automatically selected based on highest ROC-AUC score
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
