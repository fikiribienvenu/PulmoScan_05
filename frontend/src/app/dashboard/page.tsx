"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SubtypeBadge from "@/components/ui/SubtypeBadge";
import RiskBadge from "@/components/ui/RiskBadge";
import ConfidenceBar from "@/components/ui/ConfidenceBar";
import api from "@/lib/api";
import { Statistics, RiskLevel, CancerSubtype } from "@/types";
import {
  Activity, AlertTriangle, ArrowRight, BarChart3,
  Dna, FileSearch, Hospital, TrendingUp, Upload, Users,
} from "lucide-react";

function KpiCard({ label, value, sub, icon: Icon, gradient }: {
  label: string; value: string | number; sub?: string;
  icon: React.FC<{ className?: string }>; gradient: string;
}) {
  return (
    <div className="card p-6 flex items-start gap-4 animate-fade-in">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-display font-black text-medical-text dark:text-dark-text">{value}</p>
        <p className="text-sm font-semibold text-medical-muted dark:text-dark-muted">{label}</p>
        {sub && <p className="text-xs text-medical-muted dark:text-dark-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const QUICK = [
  { href: "/predict",           label: "New Prediction",  icon: FileSearch, desc: "Assess single patient",   gradient: "from-primary-500 to-primary-600" },
  { href: "/batch",             label: "Batch Upload",    icon: Upload,     desc: "Process CSV / Excel file", gradient: "from-teal-500 to-teal-600" },
  { href: "/records",           label: "Patient Records", icon: Users,      desc: "View all predictions",     gradient: "from-cyan-500 to-cyan-600" },
  { href: "/model-performance", label: "Model Analytics", icon: Dna,        desc: "ML performance charts",    gradient: "from-indigo-500 to-indigo-600" },
];

export default function DashboardPage() {
  const { doctor } = useAuth();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/statistics").then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const total   = stats?.total_predictions ?? 0;
  const recent  = stats?.doctor_stats?.recent ?? [];
  const subtypes = stats?.subtype_distribution ?? [];

  return (
    <ProtectedRoute>
      <div className="page-wrapper">
        <Navbar />
        <main className="content-area">

          {/* Welcome */}
          <div className="mb-8 animate-fade-in">
            <h1 className="page-title">
              Welcome back, Dr. {doctor?.full_name?.split(" ")[0]} 👋
            </h1>
            <p className="text-medical-muted dark:text-dark-muted mt-1">
              {doctor?.specialty} · {doctor?.hospital || "PulmoScan AI Platform"}
            </p>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24" />)
            ) : (
              <>
                <KpiCard label="Total Predictions"  value={total}                                          sub="All doctors"   icon={Activity}      gradient="from-primary-400 to-primary-600" />
                <KpiCard label="My Assessments"     value={stats?.doctor_stats?.total ?? 0}               sub="Your records"  icon={Users}          gradient="from-teal-400   to-teal-600"   />
                <KpiCard label="Unique Subtypes"    value={subtypes.filter(s => s.count > 0).length}      sub="Detected"      icon={Dna}            gradient="from-indigo-400 to-indigo-600" />
                <KpiCard label="Platform Activity"  value={`${((stats?.doctor_stats?.total ?? 0) / Math.max(total, 1) * 100).toFixed(0)}%`} sub="Your share" icon={TrendingUp} gradient="from-cyan-400 to-cyan-600"    />
              </>
            )}
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* Subtype distribution */}
            <div className="lg:col-span-2 card p-6">
              <h2 className="section-title mb-4">Subtype Distribution</h2>
              {loading ? (
                <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-8" />)}</div>
              ) : subtypes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-medical-muted dark:text-dark-muted">
                  <Dna className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-sm">No predictions yet. Run your first assessment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subtypes.map(s => (
                    <div key={s.subtype}>
                      <div className="flex items-center justify-between mb-1">
                        <SubtypeBadge subtype={s.subtype as CancerSubtype} />
                        <span className="text-sm font-semibold text-medical-text dark:text-dark-text">{s.count} ({s.percentage}%)</span>
                      </div>
                      <ConfidenceBar value={s.percentage / 100} showPercent={false} height="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CHUB data */}
            <div className="card p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Hospital className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-display font-bold text-sm">CHUB Butare</p>
                  <p className="text-white/50 text-xs">Confirmed cases 2022–2025</p>
                </div>
              </div>
              {[
                { label: "Total Cases", value: "135", sub: "2022–2025" },
                { label: "Peak Year",   value: "2023", sub: "47 cases"  },
                { label: "Male Cases",  value: "87",   sub: "64%"       },
                { label: "Female Cases",value: "48",   sub: "36%"       },
              ].map(({ label, value, sub }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                  <span className="text-white/70 text-sm">{label}</span>
                  <div className="text-right">
                    <span className="text-white font-bold text-sm">{value}</span>
                    <span className="text-white/40 text-xs ml-1">({sub})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent predictions */}
          {recent.length > 0 && (
            <div className="card p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title">Recent Predictions</h2>
                <Link href="/records" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-medical-border dark:border-dark-border text-left text-medical-muted dark:text-dark-muted">
                      <th className="pb-3 font-semibold">Patient</th>
                      <th className="pb-3 font-semibold">Subtype</th>
                      <th className="pb-3 font-semibold">Risk</th>
                      <th className="pb-3 font-semibold">Confidence</th>
                      <th className="pb-3 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-medical-border dark:divide-dark-border">
                    {recent.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-dark-border/40 transition-colors">
                        <td className="py-3 font-medium text-medical-text dark:text-dark-text">{r.patient_name}</td>
                        <td className="py-3"><SubtypeBadge subtype={r.subtype_prediction} /></td>
                        <td className="py-3"><RiskBadge risk={r.risk_level as RiskLevel} /></td>
                        <td className="py-3 w-32"><ConfidenceBar value={r.confidence_score} height="h-1.5" /></td>
                        <td className="py-3 text-medical-muted dark:text-dark-muted">{new Date(r.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div>
            <h2 className="section-title mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {QUICK.map(({ href, label, icon: Icon, desc, gradient }) => (
                <Link key={href} href={href} className="card p-6 hover:shadow-medical dark:hover:shadow-none transition-all group flex flex-col gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="font-display font-bold text-medical-text dark:text-dark-text">{label}</p>
                      <ArrowRight className="w-4 h-4 text-medical-muted dark:text-dark-muted group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-sm text-medical-muted dark:text-dark-muted mt-0.5">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
