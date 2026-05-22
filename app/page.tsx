"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Cpu, Activity, AlertTriangle, ShieldCheck, RefreshCw, 
  Power, PowerOff, RotateCcw, Play, Zap, History, 
  LayoutDashboard, Settings, Info, Bell, Database,
  Calendar, Filter
} from "lucide-react";
import { StatusCard } from "./components/StatusCard";
import { VibrationChart } from "./components/VibrationChart";
import { HistoryTable } from "./components/HistoryTable";
import { DeviceSidebar } from "./components/DeviceSidebar";
import { ThemeToggle } from "./components/ThemeToggle";
import { MonthlyAnalytics } from "./components/MonthlyAnalytics";
import { MachineSettings } from "./components/MachineSettings";
import { 
  fetchDeviceStatus, 
  fetchDeviceHistory, 
  fetchBackendStatus, 
  fetchMachines, 
  controlMotor,
  BackendStatus,
  Machine,
  TelemetryData
} from "./lib/api-service";
import { fetchFilteredHistory } from "./lib/firebase-config";

type DeviceData = {
  current: TelemetryData | null;
  history: TelemetryData[];
  monthlyHistory: TelemetryData[];
};

type Tab = "live" | "history" | "config";

export default function DashboardPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);
  const [devices, setDevices] = useState<Record<string, DeviceData>>({});
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<Tab>("live");
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncingHistory, setIsSyncingHistory] = useState(false);

  // Filtros de Histórico (Usando strings para os inputs de data para evitar flicker/timezone shift)
  const [startDateStr, setStartDateStr] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDateStr, setEndDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [recordLimit, setRecordLimit] = useState(100);
  
  const statusPollRef = useRef<NodeJS.Timeout | null>(null);
  const historyPollRef = useRef<NodeJS.Timeout | null>(null);

  // Limpa o "resquício" visual ao trocar de máquina
  useEffect(() => {
    if (selectedDeviceId) {
      setDevices(prev => {
        if (!prev[selectedDeviceId]) {
          return { ...prev, [selectedDeviceId]: { current: null, history: [], monthlyHistory: [] } };
        }
        return prev;
      });
    }
  }, [selectedDeviceId]);

  const fetchBaseInfo = useCallback(async () => {
    try {
      const [status, machinesList] = await Promise.all([
        fetchBackendStatus(),
        fetchMachines()
      ]);
      setBackendStatus(status);
      setMachines(machinesList);
      if (machinesList.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(machinesList[0].id);
      }
      setError(null);
    } catch (err: any) {
      setError(`Gateway Desconectado: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDeviceId]);

  const syncHistory = useCallback(async (machineId: string, force = false) => {
    if (!machineId || (isSyncingHistory && !force)) return;
    if (!force && devices[machineId]?.monthlyHistory?.length > 0) return;

    setIsSyncingHistory(true);
    try {
      // Converte as strings de data para objetos Date do JS (meia-noite local)
      const start = new Date(startDateStr + 'T00:00:00');
      const end = new Date(endDateStr + 'T23:59:59');

      const filteredData = await fetchFilteredHistory(machineId, start, end, recordLimit);
      setDevices(prev => ({
        ...prev,
        [machineId]: { 
          ...(prev[machineId] || { current: null, history: [] }), 
          monthlyHistory: filteredData 
        }
      }));
    } catch (e: any) {
      console.error("Firebase History Error:", e);
    } finally {
      setIsSyncingHistory(false);
    }
  }, [isSyncingHistory, startDateStr, endDateStr, recordLimit, devices]);

  const fetchInstantStatus = useCallback(async (machineId: string) => {
    if (!machineId || activeTab !== "live") return;
    try {
      const current = await fetchDeviceStatus(machineId);
      setDevices(prev => {
        const oldData = prev[machineId] || { history: [], monthlyHistory: [] };
        return {
          ...prev,
          [machineId]: { ...oldData, current }
        };
      });
    } catch (e) {}
  }, [activeTab]);

  const fetchRecentHistory = useCallback(async (machineId: string) => {
    if (!machineId || activeTab !== "live") return;
    try {
      const history = await fetchDeviceHistory(machineId);
      setDevices(prev => {
        const oldData = prev[machineId] || { current: null, monthlyHistory: [] };
        return {
          ...prev,
          [machineId]: { ...oldData, history }
        };
      });
    } catch (e) {}
  }, [activeTab]);

  useEffect(() => {
    setMounted(true);
    fetchBaseInfo();
    const interval = setInterval(fetchBaseInfo, 20000);
    return () => clearInterval(interval);
  }, [fetchBaseInfo]);

  useEffect(() => {
    if (!selectedDeviceId) return;

    if (activeTab === "live") {
      fetchInstantStatus(selectedDeviceId);
      statusPollRef.current = setInterval(() => fetchInstantStatus(selectedDeviceId), 500);

      fetchRecentHistory(selectedDeviceId);
      historyPollRef.current = setInterval(() => fetchRecentHistory(selectedDeviceId), 3000);
    } else if (activeTab === "history") {
      syncHistory(selectedDeviceId);
    }

    return () => {
      if (statusPollRef.current) clearInterval(statusPollRef.current);
      if (historyPollRef.current) clearInterval(historyPollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeviceId, activeTab, fetchInstantStatus, fetchRecentHistory]);

  const handleMotorCommand = async (command: 'ligar' | 'desligar' | 'reset' | 'demonstrar') => {
    try {
      await controlMotor(command);
    } catch (err: any) {
      alert(`Falha operacional: ${err.message}`);
    }
  };

  if (!mounted) return <div className="min-h-screen bg-background" />;

  const selectedDevice = selectedDeviceId ? devices[selectedDeviceId] : null;
  const selectedMachine = machines.find(m => m.id === selectedDeviceId);
  const isCritical = selectedDevice?.current?.emergencia || selectedMachine?.status === "EM_FALHA";
  const isRealTime = backendStatus?.fonte_dados_recomendada === "BACKEND";

  const setFilterLast7Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    setStartDateStr(start.toISOString().split('T')[0]);
    setEndDateStr(end.toISOString().split('T')[0]);
  };

  const setFilterThisMonth = () => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    setStartDateStr(start.toISOString().split('T')[0]);
    setEndDateStr(end.toISOString().split('T')[0]);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans transition-colors duration-300">
      <DeviceSidebar 
        selectedDeviceId={selectedDeviceId}
        onSelectDevice={setSelectedDeviceId}
        deviceStatuses={Object.fromEntries(machines.map(m => [m.id, devices[m.id]?.current?.emergencia || m.status === "EM_FALHA"]))}
        machines={machines}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/50 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground leading-tight">
                  {selectedMachine?.nome || "Linha de Produção"}
                </h1>
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest opacity-80">
                  Setor: {selectedMachine?.setor || "Não Definido"}
                </span>
              </div>
              <div className={`w-2 h-2 rounded-full mt-[-10px] ${error ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"}`} />
            </div>
            <div className="h-4 w-px bg-border mx-2" />
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-blue-500/30 text-blue-500 dark:text-blue-400 bg-blue-500/5 uppercase">
                Link: Local Gateway
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${backendStatus?.esp32_online ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5" : "border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/5"}`}>
                ESP32: {backendStatus?.esp32_online ? "CONECTADO" : "DESCONECTADO"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-muted rounded-full transition-colors relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {isCritical && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />}
            </button>
            <ThemeToggle />
            <div className="h-8 w-px bg-border" />
            <button onClick={fetchBaseInfo} className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              SYNC
            </button>
          </div>
        </header>

        <div className="flex items-center px-8 border-b border-border bg-card shrink-0">
          <nav className="flex gap-8">
            <TabButton active={activeTab === "live"} icon={LayoutDashboard} label="Monitoramento" onClick={() => setActiveTab("live")} />
            <TabButton active={activeTab === "history"} icon={History} label="Histórico" onClick={() => setActiveTab("history")} />
            <TabButton active={activeTab === "config"} icon={Settings} label="Configurações" onClick={() => setActiveTab("config")} />
          </nav>
        </div>

        <main className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar text-foreground">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-4 duration-300">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-xs font-bold uppercase tracking-wider">{error}</p>
            </div>
          )}

          {activeTab === "live" ? (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatusCard title="Ativo / Setor" value={selectedMachine?.nome || "---"} icon={Cpu} description={`SETOR: ${selectedMachine?.setor || "GERAL"}`} />
                  <StatusCard title="Vibração" value={`${selectedDevice?.current?.vibracao || 0} Hz`} icon={Activity} isAlert={isCritical} description={selectedDevice?.current?.emergencia ? "LIMITE EXCEDIDO" : "NORMAL"} />
                  <StatusCard title="Motor" value={selectedDevice?.current?.status_motor?.toUpperCase() || "---"} icon={Zap} isAlert={selectedDevice?.current?.status_motor === "FALHA"} description={selectedDevice?.current?.modo_demonstracao ? "MODO DEMO" : "OPERANDO"} />
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between shadow-sm text-foreground">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Painel de Comando</h3>
                    <div className={`px-2 py-0.5 rounded text-[9px] font-black ${isRealTime ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500" : "bg-amber-500/10 text-amber-600 dark:text-amber-500"}`}>
                      {isRealTime ? "ATIVO" : "BLOQUEADO"}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <ControlButton icon={Power} label="Ligar" variant="success" disabled={!isRealTime} onClick={() => handleMotorCommand('ligar')} />
                    <ControlButton icon={PowerOff} label="Desligar" variant="danger" disabled={!isRealTime} onClick={() => handleMotorCommand('desligar')} />
                    <ControlButton icon={RotateCcw} label="Reset" variant="secondary" disabled={!isRealTime} onClick={() => handleMotorCommand('reset')} />
                    <ControlButton icon={Play} label="Demo" variant="primary" disabled={!isRealTime} onClick={() => handleMotorCommand('demonstrar')} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-border flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Análise de Oscilação</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-[10px] text-muted-foreground font-bold">FREQUÊNCIA LIVE</span>
                    </div>
                  </div>
                  <VibrationChart data={selectedDevice?.history || []} />
                </div>
              </div>
            </div>
          ) : activeTab === "history" ? (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Consulta de Histórico</h2>
                    <p className="text-sm text-muted-foreground">Filtre registros por período e volume de dados</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-xl border border-border">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <input 
                        type="date" 
                        value={startDateStr} 
                        onChange={(e) => setStartDateStr(e.target.value)}
                        className="bg-transparent text-xs font-bold focus:outline-none text-foreground"
                      />
                      <span className="text-muted-foreground text-xs">até</span>
                      <input 
                        type="date" 
                        value={endDateStr} 
                        onChange={(e) => setEndDateStr(e.target.value)}
                        className="bg-transparent text-xs font-bold focus:outline-none text-foreground"
                      />
                    </div>

                    <select 
                      value={recordLimit} 
                      onChange={(e) => setRecordLimit(Number(e.target.value))}
                      className="bg-muted border border-border px-3 py-2 rounded-xl text-xs font-bold focus:outline-none text-foreground"
                    >
                      <option value={25}>25 registros</option>
                      <option value={50}>50 registros</option>
                      <option value={100}>100 registros</option>
                    </select>

                    <button 
                      onClick={() => syncHistory(selectedDeviceId, true)} 
                      disabled={isSyncingHistory} 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                    >
                      <Filter className={`w-3.5 h-3.5 ${isSyncingHistory ? "animate-spin" : ""}`} /> 
                      {isSyncingHistory ? "BUSCANDO..." : "APLICAR FILTRO"}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 text-foreground">
                  <button onClick={setFilterLast7Days} className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">Últimos 7 dias</button>
                  <button onClick={setFilterThisMonth} className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">Este mês</button>
                </div>
              </div>

              <MonthlyAnalytics data={selectedDevice?.monthlyHistory || []} />
              
              <div className="pt-8 border-t border-border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Registros Detalhados</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-muted-foreground">Total: {selectedDevice?.monthlyHistory?.length || 0} registros</span>
                  </div>
                </div>
                <HistoryTable data={selectedDevice?.monthlyHistory || []} />
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Configurações do Ativo</h2>
                  <p className="text-sm text-muted-foreground">Gerenciamento de metadados e localização da unidade</p>
                </div>
              </div>
              {selectedMachine ? (
                <MachineSettings machine={selectedMachine} onUpdate={fetchBaseInfo} />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Cpu className="w-10 h-10 opacity-20 mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest">Selecione uma máquina para configurar</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function TabButton({ active, icon: Icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`h-14 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all relative ${active ? "text-blue-500 border-b-2 border-blue-500" : "text-muted-foreground hover:text-foreground"}`}>
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function ControlButton({ icon: Icon, label, variant, disabled, onClick }: { icon: any, label: string, variant: 'success' | 'danger' | 'primary' | 'secondary', disabled: boolean, onClick: () => void }) {
  const styles = {
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600",
    danger: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-500 hover:bg-red-500 hover:text-white dark:hover:bg-red-600",
    primary: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-500 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600",
    secondary: "bg-muted border-border text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-foreground"
  };
  return (
    <button disabled={disabled} onClick={onClick} className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all gap-2 group disabled:opacity-30 disabled:pointer-events-none shadow-sm ${styles[variant]}`}>
      <Icon className="w-6 h-6 transition-transform group-hover:scale-110" />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}
