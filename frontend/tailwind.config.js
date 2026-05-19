/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#eff8ff",
          100: "#dbeffe",
          200: "#bfe3fd",
          300: "#93d1fc",
          400: "#60b7f8",
          500: "#3b9af3",
          600: "#2578e8",
          700: "#1d62d5",
          800: "#1e4fac",
          900: "#1e4488",
        },
        teal: {
          50:  "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
        cyan: {
          50:  "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
        medical: {
          bg: "#f0f9ff",
          card: "#ffffff",
          border: "#e0f2fe",
          text: "#0f172a",
          muted: "#64748b",
          high: "#ef4444",
          low: "#22c55e",
          warning: "#f59e0b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      boxShadow: {
        "medical": "0 4px 24px rgba(14, 165, 233, 0.12)",
        "card": "0 2px 12px rgba(0, 0, 0, 0.06)",
        "glow": "0 0 20px rgba(14, 165, 233, 0.25)",
      },
    },
  },
  plugins: [],
};
