"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import {
  Activity, BarChart3, Dna, FileSearch, Home,
  LogOut, Menu, Moon, Settings, Sun, Upload, Users, X,
} from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/dashboard",         label: "Dashboard", icon: Home      },
  { href: "/predict",           label: "Predict",   icon: FileSearch },
  { href: "/batch",             label: "Batch",     icon: Upload    },
  { href: "/records",           label: "Records",   icon: Users     },
  { href: "/statistics",        label: "Analytics", icon: BarChart3 },
  { href: "/model-performance", label: "Model",     icon: Dna       },
  { href: "/settings",          label: "Settings",  icon: Settings  },
];

export default function Navbar() {
  const { doctor, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname  = usePathname();
  const [open, setOpen] = useState(false);

  const active = (href: string) => pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-medical-border dark:border-dark-border bg-white/90 dark:bg-dark-card/90 backdrop-blur-md shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center shadow-medical">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-black text-xl text-medical-text dark:text-dark-text">
            PulmoScan <span className="text-primary-600">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        {isAuthenticated && (
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${active(href)
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                    : "text-medical-muted dark:text-dark-muted hover:bg-slate-50 dark:hover:bg-dark-border hover:text-medical-text dark:hover:text-dark-text"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-medical-border dark:border-dark-border bg-white dark:bg-dark-card hover:bg-slate-50 dark:hover:bg-dark-border transition-colors"
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark"
              ? <Sun  className="w-4 h-4 text-amber-400" />
              : <Moon className="w-4 h-4 text-slate-500" />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Doctor chip */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-teal-400 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{doctor?.full_name?.charAt(0)}</span>
                </div>
                <span className="text-sm font-semibold text-primary-700 dark:text-primary-400 max-w-[100px] truncate">
                  Dr. {doctor?.full_name?.split(" ")[0]}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="hidden sm:flex w-9 h-9 rounded-lg items-center justify-center border border-medical-border dark:border-dark-border bg-white dark:bg-dark-card hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 transition-colors group"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-medical-muted dark:text-dark-muted group-hover:text-red-500 transition-colors" />
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setOpen(!open)}
                className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center border border-medical-border dark:border-dark-border"
              >
                {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login"    className="btn-outline  py-2 px-4 text-sm">Login</Link>
              <Link href="/auth/register" className="btn-primary py-2 px-4 text-sm">Register</Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && isAuthenticated && (
        <div className="lg:hidden border-t border-medical-border dark:border-dark-border bg-white dark:bg-dark-card px-4 pb-4 pt-2 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                ${active(href)
                  ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                  : "text-medical-muted dark:text-dark-muted hover:bg-slate-50 dark:hover:bg-dark-border"
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          <button
            onClick={logout}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      )}
    </header>
  );
}
