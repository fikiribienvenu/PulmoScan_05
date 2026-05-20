"use client";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import { Statistics } from "@/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import {
  BarChart3, Hospital, Users, TrendingUp, Activity,
  Award, AlertTriangle, CheckCircle2, Brain,
} from "lucide-react";

const MALE_COLOR   = "#2578e8";
const FEMALE_COLOR = "#ec4899";
const HIGH_COLOR   = "#ef4444";
const LOW_COLOR    = "#22c55e";

function StatCard({ label, value, sub, icon: Icon, gradient, textColor = "text-white" }: any) {
  return (
    <div className={`rounded-2xl p-5 ${gradient} shadow-medical text-white`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-display font-black">{value}</p>
          {sub && <p className="text-white/80 text-xs mt-1">{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-medical-border rounded-xl p-3 shadow-lg text-sm">
      <p className="font-bold text-medical-text mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

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
        <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );

  if (!stats) return null;

  const genderPieData = [
    { name: "Male", value: stats.chub_totals.male },
    { name: "Female", value: stats.chub_totals.female },
  ];
  const riskPieData = [
    { name: "High Risk", value: stats.high_risk_count },
    { name: "Low Risk", value: stats.low_risk_count },
  ];
  const modelData = Object.entries(stats.model_metrics).map(([name, m]) => ({
    name,
    Accuracy: +(m.accuracy * 100).toFixed(1),
    "ROC-AUC": +(m.roc_auc * 100).toFixed(1),
  }));

  const malePercent = Math.round((stats.chub_totals.male / stats.chub_totals.total) * 100);
  const femalePercent = 100 - malePercent;

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-primary-500
                            flex items-center justify-center shadow-medical">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="section-title">Analytics Dashboard</h1>
              <p className="text-sm text-medical-muted">
                CHUB Butare Hospital Data (2022–2025) &amp; AI Prediction Statistics
              </p>
            </div>
          </div>

          {/* ── CHUB Hospital Banner ────────────────────────────────────────── */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 p-5 mb-6
                          flex items-center gap-4 shadow-medical">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Hospital className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-display font-bold text-lg">
                Centre Hospitalier Universitaire de Butare (CHUB)
              </p>
              <p className="text-white/60 text-sm">
                Confirmed lung cancer positive cases — source data used to validate this AI system
              </p>
            </div>
          </div>

          {/* ── CHUB Summary Cards ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <StatCard
              label="Total Cases"
              value={stats.chub_totals.total}
              sub="2022 – 2025"
              icon={Activity}
              gradient="bg-gradient-to-br from-slate-700 to-slate-800"
            />
            <StatCard
              label="Peak Year"
              value={stats.chub_totals.peak_year}
              sub={`${stats.chub_totals.peak_cases} cases`}
              icon={TrendingUp}
              gradient="bg-gradient-to-br from-indigo-500 to-indigo-700"
            />
            <StatCard
              label="Male Cases"
              value={`${stats.chub_totals.male}`}
              sub={`${malePercent}% of total`}
              icon={Users}
              gradient="bg-gradient-to-br from-blue-500 to-blue-700"
            />
            <StatCard
              label="Female Cases"
              value={`${stats.chub_totals.female}`}
              sub={`${femalePercent}% of total`}
              icon={Users}
              gradient="bg-gradient-to-br from-pink-500 to-pink-700"
            />
            <StatCard
              label="AI Predictions"
              value={stats.total_predictions}
              sub="Total assessments run"
              icon={Brain}
              gradient="bg-gradient-to-br from-teal-500 to-primary-600"
            />
          </div>

          {/* ── Row 1: Yearly Trend + Gender by Year ───────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Yearly Cases Trend */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-primary-500" />
                <h3 className="font-display font-bold text-medical-text">Yearly Cases Trend</h3>
              </div>
              <p className="text-xs text-medical-muted mb-4">CHUB confirmed lung cancer cases per year</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={stats.yearly_cases} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="casesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2578e8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2578e8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="cases" name="Cases"
                    stroke="#2578e8" strokeWidth={2.5} fill="url(#casesGrad)"
                    dot={{ fill: "#2578e8", r: 5 }} activeDot={{ r: 7 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Gender by Year */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-pink-500" />
                <h3 className="font-display font-bold text-medical-text">Gender Distribution by Year</h3>
              </div>
              <p className="text-xs text-medical-muted mb-4">Male vs Female confirmed cases per year</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.yearly_gender} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="male" name="Male" fill={MALE_COLOR} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="female" name="Female" fill={FEMALE_COLOR} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Row 2: Pie charts ───────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Male vs Female Pie */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-500" />
                <h3 className="font-display font-bold text-medical-text">Overall Gender Breakdown</h3>
              </div>
              <p className="text-xs text-medical-muted mb-2">Total CHUB cases 2022–2025</p>

              {/* Visual gender bar */}
              <div className="flex rounded-full overflow-hidden h-4 mb-4">
                <div className="bg-blue-500 transition-all" style={{ width: `${malePercent}%` }} />
                <div className="bg-pink-500 transition-all" style={{ width: `${femalePercent}%` }} />
              </div>
              <div className="flex justify-between text-xs mb-4">
                <span className="text-blue-600 font-semibold">Male {malePercent}% ({stats.chub_totals.male})</span>
                <span className="text-pink-600 font-semibold">Female {femalePercent}% ({stats.chub_totals.female})</span>
              </div>

              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={genderPieData} cx="50%" cy="50%" outerRadius={70} innerRadius={35}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${isNaN(percent) ? "0" : (percent * 100).toFixed(0)}%`}
                    labelLine={false}>
                    <Cell fill={MALE_COLOR} />
                    <Cell fill={FEMALE_COLOR} />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-700 font-medium">
                  Males account for {malePercent}% of confirmed cases — consistent with
                  global lung cancer epidemiology where smoking prevalence is higher in males.
                </p>
              </div>
            </div>

            {/* AI Risk Distribution */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4 text-teal-500" />
                <h3 className="font-display font-bold text-medical-text">AI Risk Distribution</h3>
              </div>
              <p className="text-xs text-medical-muted mb-4">From {stats.total_predictions} AI predictions run</p>

              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={riskPieData} cx="50%" cy="50%" outerRadius={75} innerRadius={35}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${isNaN(percent) ? "0" : (percent * 100).toFixed(0)}%`}
                    labelLine={false}>
                    <Cell fill={HIGH_COLOR} />
                    <Cell fill={LOW_COLOR} />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-red-50 rounded-xl p-3 border border-red-100 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-xl font-display font-black text-red-600">{stats.high_risk_count}</p>
                    <p className="text-xs text-red-500">High Risk</p>
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-3 border border-green-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-xl font-display font-black text-green-600">{stats.low_risk_count}</p>
                    <p className="text-xs text-green-500">Low Risk</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── AI Platform Stats ───────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600
                              flex items-center justify-center shadow-medical flex-shrink-0">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-display font-black text-medical-text">{stats.total_predictions}</p>
                <p className="text-sm text-medical-muted">Total AI Assessments</p>
              </div>
            </div>
            <div className="card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600
                              flex items-center justify-center shadow-medical flex-shrink-0">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-display font-black text-medical-text">
                  {stats.subtype_breakdown.nsclc} / {stats.subtype_breakdown.sclc}
                </p>
                <p className="text-sm text-medical-muted">NSCLC / SCLC Detected</p>
              </div>
            </div>
            <div className="card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600
                              flex items-center justify-center shadow-medical flex-shrink-0">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-display font-black text-medical-text">97%</p>
                <p className="text-sm text-medical-muted">Best Model ROC-AUC</p>
              </div>
            </div>
          </div>

          {/* ── ML Model Comparison ─────────────────────────────────────────── */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-indigo-500" />
              <h3 className="font-display font-bold text-medical-text">ML Model Comparison</h3>
            </div>
            <p className="text-xs text-medical-muted mb-4">
              Accuracy &amp; ROC-AUC scores — Random Forest selected as best model
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={modelData} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 120 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                <XAxis type="number" domain={[70, 100]} tick={{ fontSize: 11 }} unit="%" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Accuracy" fill="#2578e8" radius={[0, 4, 4, 0]} />
                <Bar dataKey="ROC-AUC" fill="#14b8a6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
