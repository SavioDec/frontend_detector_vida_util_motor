"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * Componente de botão para alternar entre os temas Dark (escuro) e Light (claro).
 * Utiliza a biblioteca 'next-themes' para gerenciar a classe no elemento HTML.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  /**
   * Evita erros de hidratação (Next.js): o componente só renderiza ícones
   * após ser montado no cliente para garantir que o tema atual seja conhecido.
   */
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Enquanto não estiver montado, renderiza um espaço vazio para evitar flicker
  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg bg-muted hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200 group border border-border shadow-sm"
      aria-label="Alternar tema"
    >
      {/* Exibe o ícone de Sol se estiver no modo escuro, e Lua se estiver no claro */}
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-yellow-400 group-hover:text-yellow-500 transition-colors" />
      ) : (
        <Moon className="w-5 h-5 text-zinc-600 group-hover:text-zinc-900 transition-colors" />
      )}
    </button>
  );
}
