const palette = {
  // High-contrast surface system
  base: "#FFFFFF",
  baseAlt: "#F5F7FF",
  card: "#FFFFFF",
  border: "rgba(71, 85, 246, 0.22)",

  // Brand accents
  primary: "#4755F6",
  primarySoft: "#93A2FF",
  primaryDark: "#2330C6",

  accent: "#00E0FF",
  accentSoft: "#A77BFF",

  glass06: "rgba(255, 255, 255, 0.72)",
  glass12: "rgba(255, 255, 255, 0.35)",

  text: "#0B1225",
  textSoft: "#394562",
  textMuted: "#6B7280",

  white: "#FFFFFF",
};

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: palette.primary,
          soft: palette.primarySoft,
          dark: palette.primaryDark,
        },
        accent: {
          DEFAULT: palette.accent,
          cyan: palette.accent,
          purple: palette.accentSoft,
        },
        brintelli: {
          base: palette.base,
          baseAlt: palette.baseAlt,
          card: palette.card,
          border: palette.border,
          primary: palette.primary,
          primarySoft: palette.primarySoft,
          primaryDark: palette.primaryDark,
          accent: palette.accent,
          accentSoft: palette.accentSoft,
          glass06: palette.glass06,
          glass12: palette.glass12,
          text: palette.text,
          textSoft: palette.textSoft,
          textMuted: palette.textMuted,
        },
        surface: {
          base: palette.base,
          card: palette.card,
          glass: palette.glass06,
          subtle: palette.glass12,
        },
        text: {
          DEFAULT: palette.text,
          soft: palette.textSoft,
          muted: palette.textMuted,
        },
        border: palette.border,
        white: palette.white,
        overlay: "rgba(17, 25, 40, 0.45)",
      },

      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          '"Inter"',
          '"SF Pro Display"',
          'system-ui',
          'sans-serif',
        ],
      },

      boxShadow: {
        card: "0px 18px 42px -20px rgba(15, 23, 42, 0.18)",
        soft: "0 26px 48px -24px rgba(18, 24, 45, 0.18)",
        glow: "0px 0px 36px rgba(71, 85, 246, 0.30)",
        glass: "0 22px 50px -30px rgba(15, 23, 42, 0.28)",
      },

      backdropBlur: {
        xs: "4px",
        glass: "18px",
      },

      backgroundImage: {
        "gradient-cta": `linear-gradient(135deg, ${palette.primaryDark}, ${palette.primary}, ${palette.accent})`,
        "gradient-heading": `linear-gradient(135deg, ${palette.primary}, ${palette.primarySoft}, ${palette.accent})`,
        "gradient-progress": `linear-gradient(90deg, ${palette.primary}, ${palette.accent}, ${palette.accentSoft})`,
        "grid-brintelli": `linear-gradient(to right, rgba(71,85,246,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(71,85,246,0.08) 1px, transparent 1px)`
      },

      animation: {
        shimmer: "shimmer 2s linear infinite",
        float: "float 6s ease-in-out infinite",
        progress: "progress 3s ease infinite",
      },

      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        progress: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
      },

      transitionDuration: {
        "120": "120ms",
        "160": "160ms",
        "220": "220ms",
      },

      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        snappy: "cubic-bezier(0.2, 0.9, 0.3, 1.1)",
      },
    },
  },
  plugins: [],
};
