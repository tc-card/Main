export const CONFIG = {
  maxFileSize: 5 * 1024 * 1024,
  allowedTypes: ["image/jpeg", "image/png", "gif"],
  googleScriptUrl: "YOUR_GOOGLE_APPS_SCRIPT_URL",
};

export const stylePresets = {
  // Dark Professional Colors
  minimal: {
    background: "#18181b",
  },
  black: {
    background: "#09090b",
  },
  navy: {
    background: "#020617",
  },
  forest: {
    background: "#022c22",
  },
  wine: {
    background: "#450a0a",
  },

  // Bright Professional Colors
  brightCorporateBlue: {
    background: "#0ea5e9", // Sky blue
  },
  brightSunset: {
    background: "#f97316", // Warm orange
  },
  brightTeal: {
    background: "#14b8a6", // Fresh teal
  },
  brightViolet: {
    background: "#8b5cf6", // Soft purple
  },

  // Professional Gradients
  corporateGradient: {
    background:
      "linear-gradient(145deg, rgb(9, 9, 11), rgb(24, 24, 27), rgb(9, 9, 11))",
  },
  oceanGradient: {
    background:
      "linear-gradient(145deg, rgb(2, 6, 23), rgb(15, 23, 42), rgb(2, 6, 23))",
  },
  forestGradient: {
    background:
      "linear-gradient(145deg, rgb(2, 44, 34), rgb(6, 78, 59), rgb(2, 44, 34))",
  },
  burgundyGradient: {
    background:
      "linear-gradient(145deg, rgb(69, 10, 10), rgb(127, 29, 29), rgb(69, 10, 10))",
  },
};
