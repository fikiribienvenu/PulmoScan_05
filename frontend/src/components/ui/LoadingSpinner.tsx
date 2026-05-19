import { Stethoscope } from "lucide-react";

interface Props {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export default function LoadingSpinner({ message = "Analyzing…", size = "md" }: Props) {
  const sz = { sm: "w-8 h-8", md: "w-12 h-12", lg: "w-16 h-16" }[size];
  const icon = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" }[size];

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative">
        <div className={`${sz} rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500
                         flex items-center justify-center shadow-glow animate-pulse-slow`}>
          <Stethoscope className={`${icon} text-white`} />
        </div>
        <div className={`absolute -inset-1 rounded-2xl border-2 border-primary-300
                         animate-spin-slow opacity-60`} />
      </div>
      <div className="text-center">
        <p className="font-semibold text-primary-700">{message}</p>
        <p className="text-sm text-medical-muted mt-1">Please wait…</p>
      </div>
    </div>
  );
}
