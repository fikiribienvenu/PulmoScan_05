"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Activity, LayoutDashboard, FileSearch, Upload,
  BarChart3, Users, LogOut, Menu, X, Stethoscope,
} from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/predict", label: "Predict", icon: FileSearch },
  { href: "/batch", label: "Batch Upload", icon: Upload },
  { href: "/records", label: "Records", icon: Users },
  { href: "/statistics", label: "Statistics", icon: BarChart3 },
  { href: "/about", label: "About", icon: Activity },
];

export default function Navbar() {
  const { doctor, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-medical-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500
                            flex items-center justify-center shadow-medical group-hover:shadow-glow
                            transition-all duration-200">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-primary-700">PulmoScan</span>
              <span className="text-teal-500 font-bold text-lg ml-0.5">AI</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                              transition-all duration-150
                              ${pathname === href
                                ? "bg-primary-50 text-primary-700"
                                : "text-medical-muted hover:text-primary-600 hover:bg-slate-50"
                              }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-medical-text">Dr. {doctor?.full_name}</span>
                  <span className="text-xs text-medical-muted">{doctor?.specialty}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-teal-400
                                flex items-center justify-center text-white font-bold text-sm">
                  {doctor?.full_name?.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm
                             text-red-500 hover:bg-red-50 transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="btn-outline py-2 px-4 text-sm">Login</Link>
                <Link href="/auth/register" className="btn-primary py-2 px-4 text-sm">Register</Link>
              </div>
            )}

            {/* Mobile menu button */}
            {isAuthenticated && (
              <button
                className="md:hidden p-2 rounded-lg hover:bg-slate-100"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && isAuthenticated && (
        <div className="md:hidden bg-white border-t border-medical-border px-4 py-3 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium
                          ${pathname === href
                            ? "bg-primary-50 text-primary-700"
                            : "text-medical-muted hover:text-primary-600"
                          }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
