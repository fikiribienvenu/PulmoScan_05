"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SubtypeBadge from "@/components/ui/SubtypeBadge";
import api from "@/lib/api";
import { Statistics, CancerSubtype } from "@/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { BarChart3, Hospital, TrendingUp, Users } from "lucide-react";

const COLORS = ["#22c55e","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#64748b","#06b6d4"];

const RADIAN = Math.PI / 180;
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number;
}) => {
  const r  = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x  = cx + r * Math.cos(-midAngle * RADIAN);
  const y  = cy + r * Math.sin(-midAngle * RADIAN);
  return percent > 0.05
    ? <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>{`${(percent * 100).toFixed(0)}%`}</text>
    : null;
};

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.FC<{className?:string}>; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <h2 className="section-title">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function StatisticsPage() {
  const [stats, setStats]   = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/statistics").then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const subDist    = stats?.subtype_distribution ?? [];
  const riskDist   = stats?.risk_distribution   ?? {};
  const yearlyCases = stats?.yearly_cases       ?? [];
  const yearlyGender = stats?.yearly_gender     ?? [];
  const modelMetrics = stats?.model_metrics     ?? {};

  const riskChartData = Object.entries(riskDist).map(([name, value]) => ({ name, value }));
  const modelChartData = Object.entries(modelMetrics).map(([name, m]) => ({
    name: name.length > 16 ? name.slice(0, 14) + "…" : name,
    Accuracy: +(m.accuracy * 100).toFixed(1),
    F1:       +(m.f1 * 100).toFixed(1),
    "ROC-AUC":+(m.roc_auc * 100).toFixed(1),
  }));

  const genderCombined = yearlyGender.map(g => ({ year: g.year, Male: g.male, Female: g.female }));

  if (loading) return (
    <ProtectedRoute>
      <div className="page-wrapper"><Navbar />
        <main className="content-area">
          <div className="mb-8"><div className="skeleton h-10 w-64 mb-2" /><div className="skeleton h-5 w-48" /></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-72 rounded-2xl" />)}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );

  return (
    <ProtectedRoute>
      <div className="page-wrapper">
        <Navbar />
        <main className="content-area">

          <div className="mb-8">
            <h1 className="page-title">Analytics Dashboard</h1>
            <p className="text-medical-muted dark:text-dark-muted mt-1">
              Platform-wide prediction analytics and model performance overview.
            </p>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Predictions", value: stats?.total_predictions ?? 0,      color: "bg-primary-500" },
              { label: "Cancer Subtypes",   value: subDist.filter(s => s.count > 0).length, color: "bg-teal-500"  },
              { label: "Male Patients",     value: stats?.gender_breakdown?.male ?? 0,  color: "bg-blue-500"  },
              { label: "Female Patients",   value: stats?.gender_breakdown?.female ?? 0,color: "bg-pink-500"  },
            ].map(({ label, value, color }) => (
              <div key={label} className="card p-5 animate-fade-in">
                <div className={`w-2 h-8 rounded-full ${color} mb-3`} />
                <p className="text-2xl font-display font-black text-medical-text dark:text-dark-text">{value}</p>
                <p className="text-sm text-medical-muted dark:text-dark-muted">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Subtype pie */}
            <SectionCard title="Subtype Distribution" icon={BarChart3}>
              {subDist.length === 0
                ? <div className="h-64 flex items-center justify-center text-medical-muted dark:text-dark-muted text-sm">No data yet</div>
                : (
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="w-full sm:w-56 h-56">
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie data={subDist} dataKey="count" nameKey="subtype"
                            cx="50%" cy="50%" outerRadius={100} labelLine={false} label={renderLabel}>
                            {subDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v: number) => [`${v} cases`]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-2">
                      {subDist.map((s, i) => (
                        <div key={s.subtype} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                            <SubtypeBadge subtype={s.subtype as CancerSubtype} />
                          </div>
                          <span className="font-semibold text-medical-text dark:text-dark-text">{s.count} ({s.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
            </SectionCard>

            {/* Risk distribution */}
            <SectionCard title="Risk Level Distribution" icon={TrendingUp}>
              {riskChartData.length === 0
                ? <div className="h-64 flex items-center justify-center text-medical-muted dark:text-dark-muted text-sm">No data yet</div>
                : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={riskChartData} barSize={40}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" name="Cases" radius={[6,6,0,0]}>
                        {riskChartData.map((entry, i) => {
                          const c = { Low:"#22c55e", Moderate:"#f59e0b", High:"#ef4444", Critical:"#7c3aed" }[entry.name] ?? "#64748b";
                          return <Cell key={i} fill={c} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )
              }
            </SectionCard>

            {/* Yearly cases */}
            <SectionCard title="Yearly Case Trend (CHUB)" icon={TrendingUp}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={yearlyCases}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="cases" name="Cases" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </SectionCard>

            {/* Gender by year */}
            <SectionCard title="Gender Breakdown by Year" icon={Users}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={genderCombined} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Male"   fill="#3b82f6" radius={[4,4,0,0]} />
                  <Bar dataKey="Female" fill="#ec4899" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>
          </div>

          {/* Model comparison */}
          {modelChartData.length > 0 && (
            <SectionCard title="Model Performance Comparison" icon={BarChart3}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={modelChartData} barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Legend />
                  <Bar dataKey="Accuracy" fill="#3b82f6" radius={[4,4,0,0]} />
                  <Bar dataKey="F1"       fill="#14b8a6" radius={[4,4,0,0]} />
                  <Bar dataKey="ROC-AUC"  fill="#8b5cf6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>
          )}

          {/* CHUB summary */}
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Hospital className="w-5 h-5 text-white/60" />
              <h2 className="font-display font-bold">CHUB Butare Hospital – Confirmed Cases Summary</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Cases", value: stats?.chub_totals?.total ?? 135, sub: "2022–2025" },
                { label: "Peak Year",   value: stats?.chub_totals?.peak_year ?? 2023, sub: `${stats?.chub_totals?.peak_cases ?? 47} cases` },
                { label: "Male",        value: stats?.chub_totals?.male ?? 87, sub: "64% of total" },
                { label: "Female",      value: stats?.chub_totals?.female ?? 48, sub: "36% of total" },
              ].map(({ label, value, sub }) => (
                <div key={label} className="rounded-xl bg-white/10 border border-white/10 p-4">
                  <p className="text-2xl font-display font-black">{value}</p>
                  <p className="text-white/70 text-sm">{label}</p>
                  <p className="text-white/40 text-xs">{sub}</p>
                </div>
              ))}
            </div>
          </div>

        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
