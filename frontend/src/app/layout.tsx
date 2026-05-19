import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PulmoScan AI – Lung Cancer Risk Prediction",
  description:
    "Clinical decision support system for lung cancer risk assessment. For educational purposes only.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} bg-medical-bg min-h-screen`}>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#fff",
                color: "#0f172a",
                border: "1px solid #e0f2fe",
                borderRadius: "12px",
                fontSize: "14px",
              },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
