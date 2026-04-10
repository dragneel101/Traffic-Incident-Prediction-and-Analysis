module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#111827",
          raised: "#1F2937",
          overlay: "#374151",
        },
        accent: {
          blue: "#3B82F6",
          "blue-dark": "#1E40AF",
          amber: "#F59E0B",
          emerald: "#10B981",
        },
      },
      backgroundImage: {
        "app-bg": "linear-gradient(135deg, #0A0F1E 0%, #0F172A 50%, #0A0F1E 100%)",
        "card-glass": "linear-gradient(135deg, rgba(31,41,55,0.8) 0%, rgba(17,24,39,0.9) 100%)",
        "hero-gradient": "linear-gradient(135deg, #0A0F1E 0%, #0D1B3E 40%, #0F2A5A 70%, #0A0F1E 100%)",
        "btn-primary": "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)",
        "btn-amber": "linear-gradient(135deg, #D97706 0%, #F59E0B 100%)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
      boxShadow: {
        "glow-blue": "0 0 20px rgba(59,130,246,0.3), 0 0 40px rgba(59,130,246,0.1)",
        "glow-amber": "0 0 20px rgba(245,158,11,0.3)",
        "card": "0 4px 6px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)",
        "card-hover": "0 10px 25px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
