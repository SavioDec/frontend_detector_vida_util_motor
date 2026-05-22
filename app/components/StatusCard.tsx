import React from "react";
import { LucideIcon } from "lucide-react";

interface StatusCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  isAlert?: boolean;
}

export function StatusCard({ title, value, icon: Icon, description, isAlert }: StatusCardProps) {
  return (
    <div className={`p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
      isAlert 
        ? "bg-red-500/5 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]" 
        : "bg-card border-border hover:border-muted-foreground/30 shadow-sm"
    }`}>
      {/* Background Decorative Icon - Adaptável ao Tema */}
      <Icon className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.05] dark:opacity-[0.03] transition-transform duration-500 group-hover:scale-110 ${
        isAlert ? "text-red-500" : "text-foreground"
      }`} />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">{title}</h3>
        <div className={`p-2 rounded-lg transition-colors ${
          isAlert 
            ? "bg-red-500/10 text-red-500" 
            : "bg-muted text-foreground"
        }`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-1 relative z-10">
        <p className={`text-3xl font-black tracking-tighter transition-colors ${
          isAlert ? "text-red-600 dark:text-red-500" : "text-foreground"
        }`}>
          {value}
        </p>
        {description && (
          <div className="flex items-center gap-2">
            {isAlert && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
            <p className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${
              isAlert ? "text-red-600/80 dark:text-red-400/80" : "text-muted-foreground"
            }`}>
              {description}
            </p>
          </div>
        )}
      </div>

      {/* Progress Bar (Bottom) */}
      {!isAlert && (
        <div className="absolute bottom-0 left-0 h-0.5 bg-blue-600/20 w-full overflow-hidden">
          <div className="h-full bg-blue-600 w-2/3 shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
        </div>
      )}
    </div>
  );
}
