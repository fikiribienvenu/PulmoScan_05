"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import { Statistics } from "@/types";
import Link from "next/link";
import {
  Activity, Users, AlertTriangle, CheckCircle2,
  FileSearch, Upload, BarChart3, ArrowRight, Hospital, TrendingUp,
} from "lucide-react";

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="card p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-display font-black text-medical-text">{value}</p>
        <p className="text-sm text-medical-muted">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { doctor } = useAuth();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/statistics")
      .then((r) => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const quickActions = [
    { href: "/predict", label: "New Prediction", icon: FileSearch, desc: "Assess single patient", color: "from-primary-500 to-primary-600" },
    { href: "/batch", label: "Batch Upload", icon: Upload, desc: "Process CSV/Excel file", color: "from-teal-500 to-teal-600" },
    { href: "/records", label: "Patient Records", icon: Users, desc: "View all predictions", color: "from-cyan-500 to-cyan-600" },
    { href: "/statistics", label: "Analytics", icon: BarChart3, desc: "Charts & insights", color: "from-indigo-500 to-indigo-600" },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome */}
          <div className="mb-8 animate-fade-in">
            <h1 className="font-display text-3xl font-black text-medical-text">
              Welcome, Dr. {doctor?.full_name} 👋
            </h1>
            <p className="text-medical-muted mt-1">{doctor?.specialty} • {doctor?.hospital || "PulmoScan AI Platform"}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card p-6 h-24 skeleton" />
              ))
            ) : stats ? (
              <>
                <StatCard label="Total Predictions" value={stats.total_predictions} icon={Activity} color="bg-gradient-to-br from-primary-400 to-primary-600" />
                <StatCard label="High Risk Cases" value={stats.high_risk_count} icon={AlertTriangle} color="bg-gradient-to-br from-red-400 to-red-600" />
                <StatCard label="Low Risk Cases" value={stats.low_risk_count} icon={CheckCircle2} color="bg-gradient-to-br from-green-400 to-green-600" />
                <StatCard label="My Assessments" value={stats.doctor_stats.total} icon={Users} color="bg-gradient-to-br from-teal-400 to-teal-600" />
              </>
            ) : null}
          </div>

          {/* CHUB Hospital Highlight */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 p-5 mb-8 shadow-medical">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Hospital className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-display font-bold">CHUB Butare Hospital Data</p>
                <p className="text-white/60 text-xs">Confirmed lung cancer cases 2022–2025</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Cases", value: "135", sub: "2022–2025", color: "from-blue-500/30 to-blue-600/30" },
                { label: "Peak Year", value: "2023", sub: "47 cases", color: "from-indigo-500/30 to-indigo-600/30" },
                { label: "Male Cases", value: "87", sub: "64% of total", color: "from-sky-500/30 to-sky-600/30" },
                { label: "Female Cases", value: "48", sub: "36% of total", color: "from-pink-500/30 to-pink-600/30" },
              ].map(({ label, value, sub, color }) => (
                <div key={label} className={`rounded-xl bg-gradient-to-br ${color} border border-white/10 p-3`}>
                  <p className="text-white font-display font-black text-2xl">{value}</p>
                  <p className="text-white/80 text-xs font-medium">{label}</p>
                  <p className="text-white/50 text-xs">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="section-title mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map(({ href, label, icon: Icon, desc, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="card p-6 hover:shadow-medical transition-all group flex flex-col gap-3"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color}
                                  flex items-center justify-center shadow-medical
                                  group-hover:shadow-glow transition-shadow`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="font-display font-bold text-medical-text">{label}</p>
                      <ArrowRight className="w-4 h-4 text-medical-muted group-hover:text-primary-500
                                            group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-sm text-medical-muted">{desc}</p>
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
