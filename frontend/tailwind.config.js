/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
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
        // Subtype colour palette
        subtype: {
          none:     "#22c55e",   // green  – No Cancer
          adeno:    "#3b82f6",   // blue   – Adenocarcinoma
          squamous: "#f59e0b",   // amber  – Squamous Cell
          sclc:     "#ef4444",   // red    – SCLC
          large:    "#8b5cf6",   // violet – Large Cell
          other:    "#64748b",   // slate  – other
        },
        // Risk level palette
        risk: {
          low:      "#22c55e",
          moderate: "#f59e0b",
          high:     "#ef4444",
          critical: "#7c3aed",
        },
        // Light-mode surface
        medical: {
          bg:     "#f0f9ff",
          card:   "#ffffff",
          border: "#e0f2fe",
          text:   "#0f172a",
          muted:  "#64748b",
        },
        // Dark-mode surface
        dark: {
          bg:     "#0d1117",
          card:   "#161b22",
          border: "#21262d",
          text:   "#f0f6fc",
          muted:  "#8b949e",
        },
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      animation: {
        "fade-in":    "fadeIn 0.45s ease-out",
        "slide-up":   "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "shimmer":    "shimmer 1.6s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: 0, transform: "translateY(8px)"  },
          "100%": { opacity: 1, transform: "translateY(0)"     },
        },
        slideUp: {
          "0%":   { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)"     },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
      },
      boxShadow: {
        medical: "0 4px 24px rgba(14, 165, 233, 0.12)",
        card:    "0 2px 12px rgba(0, 0, 0, 0.06)",
        glow:    "0 0 20px rgba(14, 165, 233, 0.25)",
        "dark-card": "0 2px 12px rgba(0, 0, 0, 0.4)",
      },
    },
  },
  plugins: [],
};
