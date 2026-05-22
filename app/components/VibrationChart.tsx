"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { TelemetryData } from "../lib/api-service";

interface VibrationChartProps {
  data: TelemetryData[];
}

/**
 * Tenta converter qualquer formato de data para um objeto Date válido.
 */
function safeParseDate(dateStr: any): Date {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;

  try {
    const parts = String(dateStr).split(/[/\s:]/);
    if (parts.length >= 6) {
      d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]), Number(parts[3]), Number(parts[4]), Number(parts[5]));
      if (!isNaN(d.getTime())) return d;
    }
  } catch (e) {}

  return new Date();
}

export function VibrationChart({ data }: VibrationChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data
      .map(item => {
        const dateObj = safeParseDate(item.data_hora);
        return {
          ...item,
          timestamp: dateObj.getTime(),
          // Incluímos MILISSEGUNDOS no rótulo para evitar chaves duplicadas no Eixo X
          // Já que o polling agora é de 500ms
          displayTime: dateObj.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            fractionalSecondDigits: 1, // Adiciona .1, .2...
            hour12: false 
          })
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [data]);

  const peakValue = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.max(...chartData.map(d => Number(d.vibracao) || 0));
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center text-muted-foreground bg-muted/5 rounded-xl border border-dashed border-border m-4">
        Aguardando telemetria...
      </div>
    );
  }

  return (
    <div className="w-full h-[350px] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 30, right: 40, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
          
          <XAxis 
            dataKey="displayTime" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 9, fill: "var(--muted-foreground)", fontWeight: "bold" }}
            minTickGap={50}
          />
          
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontWeight: "bold" }}
            domain={[0, (dataMax: number) => Math.max(dataMax + 20, 100)]}
          />
          
          <Tooltip 
            isAnimationActive={false}
            contentStyle={{ 
              backgroundColor: "var(--card)", 
              border: "1px solid var(--border)", 
              borderRadius: "12px",
              color: "var(--foreground)",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
            }}
            labelStyle={{ color: "var(--muted-foreground)", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", marginBottom: "4px" }}
            itemStyle={{ color: "#3b82f6", fontSize: "12px", fontWeight: "bold" }}
            formatter={(value: any) => [`${value} Hz`, "Vibração Atual"]}
          />
          
          {/* Linha de Pico em Vermelho - Sempre no topo dos dados visíveis */}
          {peakValue > 0 && (
            <ReferenceLine 
              y={peakValue} 
              stroke="#ef4444" 
              strokeDasharray="5 5" 
              strokeWidth={2}
              label={{ 
                position: 'top', 
                value: `PICO MÁXIMO: ${peakValue} Hz`, 
                fill: '#ef4444', 
                fontSize: 10, 
                fontWeight: '900',
                backgroundColor: 'var(--background)'
              }} 
            />
          )}
          
          <Area 
            type="monotone" 
            dataKey="vibracao" 
            stroke="#3b82f6" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorVib)" 
            isAnimationActive={false}
            activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
