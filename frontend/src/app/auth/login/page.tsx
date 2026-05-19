"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Stethoscope, Eye, EyeOff, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.access_token, {
        doctor_id: data.doctor_id,
        full_name: data.full_name,
        email: data.email,
      });
      toast.success(`Welcome back, Dr. ${data.full_name}!`);
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-teal-50
                    flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-gradient-to-br from-primary-500 to-teal-500 shadow-glow mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-black text-medical-text">PulmoScan AI</h1>
          <p className="text-medical-muted mt-1">Doctor Portal Login</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2 className="font-display text-xl font-bold text-medical-text mb-6">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-medical-text mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-medical-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-medical-text mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-medical-muted" />
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-3.5 text-medical-muted hover:text-primary-500"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-medical-muted mt-6">
            No account?{" "}
            <Link href="/auth/register" className="text-primary-600 font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-medical-muted mt-6 px-4">
          For authorized healthcare personnel only. All activity is logged.
        </p>
      </div>
    </div>
  );
}
