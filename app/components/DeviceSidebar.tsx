import React from "react";
import { Cpu, Radar, Zap } from "lucide-react";
import { Machine } from "../lib/api-service";

interface DeviceSidebarProps {
  selectedDeviceId: string;
  onSelectDevice: (id: string) => void;
  deviceStatuses: Record<string, boolean>;
  machines: Machine[];
}

export function DeviceSidebar({ selectedDeviceId, onSelectDevice, deviceStatuses, machines }: DeviceSidebarProps) {
  return (
    <aside className="w-20 md:w-64 bg-card border-r border-border flex flex-col z-20 transition-all duration-300">
      {/* Brand Logo Area */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-border bg-background transition-colors">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)] shrink-0">
          <Radar className="w-5 h-5 text-white" />
        </div>
        <span className="hidden md:block font-black text-sm tracking-tighter uppercase italic text-foreground">
          D.I.<span className="text-blue-500">V.I.</span>
        </span>
      </div>

      {/* Main Navigation Labels */}
      <div className="px-6 py-4 hidden md:block">
        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Ativos Industriais</h3>
      </div>

      {/* Device List */}
      <nav className="flex-1 overflow-y-auto px-3 md:px-4 py-2 space-y-1 custom-scrollbar">
        {machines.map((machine) => (
          <button
            key={machine.id}
            onClick={() => onSelectDevice(machine.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative ${
              selectedDeviceId === machine.id
                ? "bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
            }`}
          >
            <div className={`w-10 h-10 md:w-8 md:h-8 rounded-lg flex items-center justify-center transition-colors ${
              selectedDeviceId === machine.id 
                ? "bg-blue-600/20 text-blue-600 dark:text-blue-400" 
                : "bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground"
            }`}>
              <Cpu className="w-5 h-5 md:w-4 md:h-4" />
            </div>
            
            <div className="hidden md:flex flex-col items-start overflow-hidden text-left">
              <span className={`text-xs font-bold truncate w-full transition-colors ${
                selectedDeviceId === machine.id ? "text-foreground" : ""
              }`}>
                {machine.nome}
              </span>
              <div className="flex items-center gap-1.5 opacity-60">
                <span className="text-[9px] font-black uppercase tracking-wider">{machine.setor || "Geral"}</span>
                <span className="text-[8px]">•</span>
                <span className="text-[9px] font-medium truncate tracking-wider">{machine.id}</span>
              </div>
            </div>

            {/* Status Dot */}
            <div className="absolute top-3 right-3 md:relative md:top-0 md:right-0 md:ml-auto">
              <div className={`w-2 h-2 rounded-full transition-shadow ${
                deviceStatuses[machine.id] 
                  ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" 
                  : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
              }`} />
            </div>

            {/* Active Indicator Bar */}
            {selectedDeviceId === machine.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Profile Area */}
      <div className="p-4 border-t border-border mt-auto bg-background/50 transition-colors">
        <div className="hidden md:flex items-center gap-3 p-2 rounded-xl bg-card border border-border shadow-sm">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <Zap className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-foreground">OPERADOR MASTER</span>
            <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest leading-none">Sessão Ativa</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
