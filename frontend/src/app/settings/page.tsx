"use client";
import { useState } from "react";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Bell, Info, Moon, Shield, Sun, User } from "lucide-react";

function Section({ icon: Icon, title, children }: { icon: React.FC<{className?:string}>; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-medical-border dark:border-dark-border">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h2 className="section-title">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { doctor }              = useAuth();
  const { theme, toggleTheme }  = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [autoSave,      setAutoSave]      = useState(true);

  return (
    <ProtectedRoute>
      <div className="page-wrapper">
        <Navbar />
        <main className="content-area max-w-3xl">

          <div className="mb-8">
            <h1 className="page-title">Settings</h1>
            <p className="text-medical-muted dark:text-dark-muted mt-1">
              Manage your account preferences and system configuration.
            </p>
          </div>

          <div className="space-y-6">

            {/* Profile */}
            <Section icon={User} title="Profile">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-teal-400 flex items-center justify-center text-white text-2xl font-display font-black shrink-0">
                  {doctor?.full_name?.charAt(0) ?? "D"}
                </div>
                <div>
                  <p className="font-display font-bold text-xl text-medical-text dark:text-dark-text">Dr. {doctor?.full_name}</p>
                  <p className="text-medical-muted dark:text-dark-muted text-sm">{doctor?.email}</p>
                  <p className="text-medical-muted dark:text-dark-muted text-sm">{doctor?.specialty} · {doctor?.hospital || "PulmoScan AI"}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-border/40">
                  <p className="text-medical-muted dark:text-dark-muted mb-1">Full Name</p>
                  <p className="font-semibold text-medical-text dark:text-dark-text">{doctor?.full_name ?? "—"}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-border/40">
                  <p className="text-medical-muted dark:text-dark-muted mb-1">Email</p>
                  <p className="font-semibold text-medical-text dark:text-dark-text">{doctor?.email ?? "—"}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-border/40">
                  <p className="text-medical-muted dark:text-dark-muted mb-1">Specialty</p>
                  <p className="font-semibold text-medical-text dark:text-dark-text">{doctor?.specialty ?? "—"}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-border/40">
                  <p className="text-medical-muted dark:text-dark-muted mb-1">Hospital</p>
                  <p className="font-semibold text-medical-text dark:text-dark-text">{doctor?.hospital || "PulmoScan AI"}</p>
                </div>
              </div>
            </Section>

            {/* Appearance */}
            <Section icon={theme === "dark" ? Moon : Sun} title="Appearance">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold text-medical-text dark:text-dark-text">Dark Mode</p>
                  <p className="text-sm text-medical-muted dark:text-dark-muted">Switch between light and dark interface</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative w-12 h-6 rounded-full transition-colors ${theme === "dark" ? "bg-primary-600" : "bg-slate-200"}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${theme === "dark" ? "translate-x-6" : ""}`} />
                </button>
              </div>
              <p className="text-xs text-medical-muted dark:text-dark-muted">
                Current theme: <strong>{theme === "dark" ? "Dark" : "Light"}</strong>. Preference is saved in browser storage.
              </p>
            </Section>

            {/* Notifications */}
            <Section icon={Bell} title="Notifications">
              {[
                { label: "Prediction Notifications", desc: "Show toast notifications after each prediction", val: notifications, set: setNotifications },
                { label: "Auto-save Results",        desc: "Automatically save all predictions to database",  val: autoSave,      set: setAutoSave },
              ].map(({ label, desc, val, set }) => (
                <div key={label} className="flex items-center justify-between py-3 border-b border-medical-border dark:border-dark-border last:border-0">
                  <div>
                    <p className="font-semibold text-medical-text dark:text-dark-text">{label}</p>
                    <p className="text-sm text-medical-muted dark:text-dark-muted">{desc}</p>
                  </div>
                  <button
                    onClick={() => set(!val)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${val ? "bg-primary-600" : "bg-slate-200"}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${val ? "translate-x-6" : ""}`} />
                  </button>
                </div>
              ))}
            </Section>

            {/* Security */}
            <Section icon={Shield} title="Security & Privacy">
              <div className="space-y-3 text-sm text-medical-text dark:text-dark-text">
                {[
                  ["Authentication", "JWT tokens · 24-hour expiry"],
                  ["Password",       "bcrypt hashed · never stored in plain text"],
                  ["Data",           "Patient records stored in MongoDB with doctor-scoped access"],
                  ["Transport",      "HTTPS recommended in production"],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between py-2 border-b border-medical-border dark:border-dark-border last:border-0">
                    <span className="text-medical-muted dark:text-dark-muted font-medium">{l}</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* System info */}
            <Section icon={Info} title="System Information">
              <div className="space-y-3 text-sm">
                {[
                  ["System",           "PulmoScan AI v2.0"],
                  ["ML Mode",          "Multi-class subtype prediction"],
                  ["Dataset",          "LungCanC2024_Dataset"],
                  ["Backend",          "FastAPI + Python"],
                  ["Frontend",         "Next.js 15 + TypeScript"],
                  ["Database",         "MongoDB"],
                  ["AI Explanation",   "Google Gemini 2.5 Flash"],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between py-2 border-b border-medical-border dark:border-dark-border last:border-0 text-medical-text dark:text-dark-text">
                    <span className="text-medical-muted dark:text-dark-muted">{l}</span>
                    <span className="font-semibold">{v}</span>
                  </div>
                ))}
              </div>
            </Section>

          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
