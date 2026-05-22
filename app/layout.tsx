import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";

/**
 * Configuração das fontes Geist (Sans e Mono) nativas do Next.js.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Metadados globais da aplicação (Título e Descrição).
 */
export const metadata: Metadata = {
  title: "ESP32 Industrial Dashboard",
  description: "Sistema de monitoramento de vibração para múltiplos dispositivos ESP32",
};

/**
 * Layout raiz da aplicação.
 * Envolve toda a aplicação com o ThemeProvider para suporte a Dark/Light mode.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning // Necessário para o next-themes funcionar sem avisos de hidratação
    >
      <body className="min-h-full flex flex-col">
        {/* Provedor de temas que controla a classe 'dark' no HTML */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
