import React from "react";
import { TelemetryData } from "../lib/api-service";
import { Clock, Zap, AlertCircle, CheckCircle2 } from "lucide-react";

interface HistoryTableProps {
  data: TelemetryData[];
}

export function HistoryTable({ data }: HistoryTableProps) {
  return (
    <div className="w-full bg-card rounded-2xl border border-border overflow-hidden shadow-sm transition-colors">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Registro Temporal</th>
              <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Frequência</th>
              <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Estado Motor</th>
              <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Diagnóstico</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-foreground">
            {data.slice().reverse().map((item) => {
              const isMotorWorking = item.vibracao > 2 || item.status_motor === "LIGADO";
              
              return (
                <tr key={item.id} className="hover:bg-muted transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-xs font-bold">
                        {item.data_hora}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black">{item.vibracao} Hz</td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                      isMotorWorking 
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                        : "bg-zinc-400 dark:bg-zinc-700 text-white"
                    }`}>
                      <Zap className="w-3 h-3" />
                      {isMotorWorking ? "LIGADO" : "DESLIGADO"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {item.emergencia ? (
                      <div className="flex items-center gap-2 text-red-500 font-black">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest">Falha Crítica</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 font-black">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest">Normal</span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
