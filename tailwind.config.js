/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        // Primary Colors - Blue Gray (#3d5a80)
        primary: {
          50: "#f0f4f8",
          100: "#d9e2ec",
          200: "#bcccdc",
          300: "#9fb3c8",
          400: "#829ab1",
          500: "#3d5a80", // Main Primary Color
          600: "#365070",
          700: "#2f4660",
          800: "#293241", // Dark variation
          900: "#1e2a35",
        },
        // Secondary Colors - Coral (#ee6c4d)
        secondary: {
          50: "#fef7f4",
          100: "#fdeee7",
          200: "#fbd9c9",
          300: "#f8c4ab",
          400: "#f5af8d",
          500: "#ee6c4d", // Main Secondary Color
          600: "#d65a3f",
          700: "#be4831",
          800: "#a63623",
          900: "#8e2415",
        },
        // Accent Colors - Light Blue (#98c1d9)
        accent: {
          50: "#f0f4f8",
          100: "#d9e2ec",
          200: "#bcccdc",
          300: "#9fb3c8",
          400: "#829ab1",
          500: "#98c1d9", // Main Accent Color
          600: "#7aa8c7",
          700: "#5c8fb5",
          800: "#3d5a80",
          900: "#293241",
        },
        // Neutral Colors
        neutral: {
          50: "#e0fbfc", // Light cyan
          100: "#f5f5f5",
          200: "#eeeeee",
          300: "#e0e0e0",
          400: "#bdbdbd",
          500: "#9e9e9e",
          600: "#757575",
          700: "#616161",
          800: "#424242",
          900: "#293241", // Dark gray
        },
        // Semantic Colors
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        error: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
        info: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        arabic: ["NeoSansArabic", "Arial", "sans-serif"],
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #3d5a80 0%, #293241 100%)",
        "gradient-secondary":
          "linear-gradient(135deg, #ee6c4d 0%, #98c1d9 100%)",
        "gradient-primary-secondary":
          "linear-gradient(135deg, #3d5a80 0%, #ee6c4d 100%)",
        "gradient-secondary-primary":
          "linear-gradient(135deg, #ee6c4d 0%, #3d5a80 100%)",
      },
      boxShadow: {
        primary: "0 4px 14px 0 rgba(61, 90, 128, 0.15)",
        secondary: "0 4px 14px 0 rgba(238, 108, 77, 0.15)",
        "primary-lg":
          "0 10px 25px -3px rgba(61, 90, 128, 0.1), 0 4px 6px -2px rgba(61, 90, 128, 0.05)",
        "secondary-lg":
          "0 10px 25px -3px rgba(238, 108, 77, 0.1), 0 4px 6px -2px rgba(238, 108, 77, 0.05)",
      },
    },
  },
  plugins: [],
};
