"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Stethoscope, User, Mail, Lock, Building2, GraduationCap } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: "", email: "", password: "",
    specialty: "Pulmonologist", hospital: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      toast.success("Account created! Please sign in.");
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-teal-50
                    flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-gradient-to-br from-primary-500 to-teal-500 shadow-glow mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-black text-medical-text">Create Account</h1>
          <p className="text-medical-muted mt-1">Join PulmoScan AI – Doctor Portal</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: "full_name", label: "Full Name", type: "text", icon: User, placeholder: "Dr. John Smith" },
              { name: "email", label: "Email", type: "email", icon: Mail, placeholder: "doctor@hospital.com" },
              { name: "password", label: "Password (min. 8 chars)", type: "password", icon: Lock, placeholder: "••••••••" },
              { name: "hospital", label: "Hospital / Institution", type: "text", icon: Building2, placeholder: "General Hospital" },
            ].map(({ name, label, type, icon: Icon, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-medical-text mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-3.5 w-4 h-4 text-medical-muted" />
                  <input
                    type={type}
                    name={name}
                    required
                    value={(form as any)[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="input-field pl-10"
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-medical-text mb-1.5">
                <GraduationCap className="inline w-4 h-4 mr-1" />Specialty
              </label>
              <select
                name="specialty"
                value={form.specialty}
                onChange={handleChange}
                className="input-field"
              >
                {["Pulmonologist","Oncologist","Radiologist","General Practitioner","Thoracic Surgeon","Internal Medicine"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : "Create Doctor Account"}
            </button>
          </form>

          <p className="text-center text-sm text-medical-muted mt-5">
            Already registered?{" "}
            <Link href="/auth/login" className="text-primary-600 font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
