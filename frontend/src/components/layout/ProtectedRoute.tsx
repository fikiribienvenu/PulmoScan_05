"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Stethoscope } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-medical-bg">
        <div className="flex flex-col items-center gap-4 animate-pulse-slow">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500
                          flex items-center justify-center shadow-glow">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <p className="text-medical-muted font-medium">Verifying credentials…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
