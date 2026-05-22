"use client";

import React, { useMemo } from "react";
import { 
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, 
  Line, ComposedChart, PieChart, Pie, AreaChart, Area, Legend
} from "recharts";
import { TelemetryData } from "../lib/api-service";
import { 
  TrendingUp, AlertTriangle, Activity, Zap, 
  ShieldCheck, BarChart3
} from "lucide-react";

interface MonthlyAnalyticsProps {
  data: TelemetryData[];
}

/**
 * Tenta converter qualquer formato de data para um objeto Date válido.
 * Copiado da VibrationChart para consistência.
 */
function safeParseDate(dateStr: any): Date {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;

  // Tenta tratar formato brasileiro: "21/05/2026 21:00:00" -> "2026-05-21T21:00:00"
  try {
    const parts = String(dateStr).split(/[/\s:]/);
    if (parts.length >= 3) {
      // [DD, MM, YYYY, ...]
      d = new Date(
        Number(parts[2]), 
        Number(parts[1]) - 1, 
        Number(parts[0]), 
        Number(parts[3] || 0), 
        Number(parts[4] || 0), 
        Number(parts[5] || 0)
      );
      if (!isNaN(d.getTime())) return d;
    }
  } catch (e) {}

  return new Date();
}

export function MonthlyAnalytics({ data }: MonthlyAnalyticsProps) {
  const stats = useMemo(() => {
    if (data.length === 0) return null;

    const dailyGroups: Record<string, number[]> = {};
    const vibrationBuckets: Record<string, number> = { "0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81+": 0 };
    let totalVibration = 0;
    let maxVibration = 0;
    let emergencyCount = 0;
    let motorOnCount = 0;
    let motorOffCount = 0;

    data.forEach(item => {
      const date = safeParseDate(item.data_hora);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const dayKey = `${day}/${month}`;
      
      if (!dailyGroups[dayKey]) dailyGroups[dayKey] = [];
      dailyGroups[dayKey].push(item.vibracao);

      totalVibration += item.vibracao;
      if (item.vibracao > maxVibration) maxVibration = item.vibracao;
      if (item.emergencia) emergencyCount++;
      
      if (item.vibracao > 2 || item.status_motor === "LIGADO") {
        motorOnCount++;
      } else {
        motorOffCount++;
      }

      if (item.vibracao <= 20) vibrationBuckets["0-20"]++;
      else if (item.vibracao <= 40) vibrationBuckets["21-40"]++;
      else if (item.vibracao <= 60) vibrationBuckets["41-60"]++;
      else if (item.vibracao <= 80) vibrationBuckets["61-80"]++;
      else vibrationBuckets["81+"]++;
    });

    const dailyData = Object.keys(dailyGroups).map(day => {
      const values = dailyGroups[day];
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return { day, avg: parseFloat(avg.toFixed(2)), max: Math.max(...values) };
    });

    const motorData = [
      { name: "Ligado (Em Carga)", value: motorOnCount, color: "#10b981" },
      { name: "Desligado (Ocioso)", value: motorOffCount, color: "#94a3b8" }
    ];

    const distributionData = Object.keys(vibrationBuckets).map(key => ({ range: key, count: vibrationBuckets[key] }));
    const reliability = Math.max(0, 100 - (emergencyCount / data.length) * 100).toFixed(1);

    return {
      avgVibration: (totalVibration / data.length).toFixed(2),
      maxVibration,
      emergencyCount,
      reliability,
      dailyData,
      motorData,
      distributionData,
      totalSamples: data.length
    };
  }, [data]);

  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Média Vibracional" value={`${stats.avgVibration} Hz`} subValue="Média Mensal" icon={TrendingUp} color="text-blue-500" bg="bg-blue-500/10" />
        <MetricCard title="Pico Registrado" value={`${stats.maxVibration} Hz`} subValue="Stress Máximo" icon={Activity} color="text-amber-500" bg="bg-amber-500/10" />
        <MetricCard title="Saúde do Ativo" value={`${stats.reliability}%`} subValue="Diagnóstico" icon={ShieldCheck} color="text-emerald-500" bg="bg-emerald-500/10" />
        <MetricCard title="Alertas Críticos" value={stats.emergencyCount} subValue="Ocorrências" icon={AlertTriangle} color="text-red-500" bg="bg-red-500/10" />
      </div>

      <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground mb-8 text-center lg:text-left">Tendência Diária de Vibração</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={stats.dailyData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
              <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--foreground)" }} />
              <Bar dataKey="avg" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={25} />
              <Line type="monotone" dataKey="max" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-emerald-500/10 rounded-lg"><Zap className="w-4 h-4 text-emerald-500" /></div>
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Utilização Real</h3>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.motorData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                  {stats.motorData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--foreground)" }} />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm transition-colors">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-500/10 rounded-lg"><BarChart3 className="w-4 h-4 text-blue-500" /></div>
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Amplitude de Vibração</h3>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.distributionData}>
                <defs>
                  <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <YAxis hide />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--foreground)" }} />
                <Area type="step" dataKey="count" stroke="#3b82f6" fill="url(#colorDist)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subValue, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-card border border-border p-6 rounded-3xl shadow-sm transition-all hover:border-zinc-400 dark:hover:border-zinc-600">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl ${bg} ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{subValue}</span>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground mb-1">{title}</p>
        <p className={`text-2xl font-black text-foreground tracking-tighter`}>{value}</p>
      </div>
    </div>
  );
}
