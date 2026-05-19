import Link from "next/link";
import {
  Stethoscope, Brain, Shield, BarChart3,
  ArrowRight, CheckCircle, Activity, Users,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Prediction",
    desc: "5 ML algorithms trained on real clinical data with automatic best-model selection.",
    color: "from-primary-400 to-primary-600",
  },
  {
    icon: Stethoscope,
    title: "Clinical Decision Support",
    desc: "Gemini AI generates patient-friendly explanations and actionable recommendations.",
    color: "from-teal-400 to-teal-600",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    desc: "JWT authentication, role-based access, and encrypted data storage.",
    color: "from-cyan-400 to-cyan-600",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Trend charts, subtype breakdowns, and model performance comparisons.",
    color: "from-indigo-400 to-indigo-600",
  },
];

const stats = [
  { label: "Predictions Run", value: "135+" },
  { label: "ML Models Compared", value: "5" },
  { label: "Risk Factors Analyzed", value: "15" },
  { label: "Years of Case Data", value: "4" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-teal-50 py-20 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full
                          bg-gradient-to-br from-primary-200/40 to-teal-200/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full
                          bg-gradient-to-tr from-cyan-200/30 to-primary-200/30 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                          bg-primary-100 border border-primary-200 text-primary-700
                          text-sm font-medium mb-6 animate-fade-in">
            <Activity className="w-4 h-4" />
            Clinical Decision Support System
          </div>

          <h1 className="font-display text-5xl sm:text-6xl font-black text-medical-text
                         leading-tight mb-6 animate-slide-up">
            Lung Cancer Risk
            <span className="bg-gradient-to-r from-primary-600 to-teal-500
                             bg-clip-text text-transparent"> Prediction AI</span>
          </h1>

          <p className="text-lg text-medical-muted max-w-2xl mx-auto mb-10 animate-fade-in">
            PulmoScan AI empowers clinicians with machine learning–driven risk assessments,
            Gemini AI explanations, and batch patient analysis in a secure hospital-grade platform.
          </p>

          <div className="flex flex-wrap justify-center gap-4 animate-fade-in">
            <Link href="/auth/register" className="btn-primary flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/about" className="btn-outline flex items-center gap-2">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 bg-white border-y border-medical-border">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-display font-black text-primary-600 mb-1">{value}</div>
              <div className="text-sm text-medical-muted">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">Platform Features</h2>
            <p className="text-medical-muted max-w-xl mx-auto">
              Everything a clinical team needs for AI-assisted lung cancer risk screening.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card p-6 hover:shadow-medical transition-shadow group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color}
                                flex items-center justify-center mb-4 shadow-medical
                                group-hover:shadow-glow transition-shadow`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display font-bold text-medical-text mb-2">{title}</h3>
                <p className="text-sm text-medical-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary-50 to-teal-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Enter Patient Data", desc: "Input clinical risk factors and demographics." },
              { step: "02", title: "ML Analyzes", desc: "Best-in-class model scores lung cancer risk probability." },
              { step: "03", title: "AI Explains", desc: "Gemini AI generates clinical interpretation and advice." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="card-glass p-6 text-center relative overflow-hidden">
                <div className="text-6xl font-black text-primary-100 absolute -top-2 -left-2">
                  {step}
                </div>
                <div className="relative">
                  <h3 className="font-display font-bold text-medical-text mb-2">{title}</h3>
                  <p className="text-sm text-medical-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-4 bg-amber-50 border-y border-amber-200">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-amber-800 font-medium">
            ⚠️ <strong>Educational & Clinical Decision-Support Tool Only.</strong>{" "}
            PulmoScan AI is not a substitute for professional medical advice, diagnosis, or treatment.
            All predictions should be reviewed by a qualified healthcare professional.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
