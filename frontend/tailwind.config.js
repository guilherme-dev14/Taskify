/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6", // azul (CTA principal)
        secondary: "#f3f4f6", // cinza claro (fundos, cards)
        success: "#22c55e", // verde (sucesso)
        alert: "#facc15", // amarelo (aviso)
        danger: "#ef4444", // vermelho (erro)
        text: "#111827", // cinza muito escuro (texto)
        muted: "#6b7280", // cinza médio (texto secundário)
        background: "#f9fafb", // fundo claro
        // tons para dark mode (usados via classes utility)
        "background-dark": "#0b0f19",
        "text-dark": "#e5e7eb",
        "muted-dark": "#9ca3af",
        "card-dark": "#111827",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        soft: "0 8px 24px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};
