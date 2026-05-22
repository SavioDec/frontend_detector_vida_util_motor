"use client";

import React, { useState } from "react";
import { Machine, updateMachine } from "../lib/api-service";
import { Save, Tag, MapPin, AlertCircle, CheckCircle2 } from "lucide-react";

interface MachineSettingsProps {
  machine: Machine;
  onUpdate: () => void;
}

export function MachineSettings({ machine, onUpdate }: MachineSettingsProps) {
  const [nome, setNome] = useState(machine.nome);
  const [setor, setSetor] = useState(machine.setor || "Geral");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await updateMachine(machine.id, { nome, setor });
      setMessage({ type: 'success', text: 'Configurações atualizadas com sucesso!' });
      onUpdate(); // Recarregar lista de máquinas no parent
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao salvar alterações.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl transition-colors">
        <div className="p-8 border-b border-border bg-muted/30">
          <h3 className="text-xl font-bold flex items-center gap-3 text-foreground">
            <Tag className="w-5 h-5 text-blue-500" />
            Configuração do Ativo
          </h3>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Identificador: {machine.id}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-card">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
              <Tag className="w-3 h-3" /> Nome da Máquina
            </label>
            <input 
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-foreground placeholder:text-muted-foreground/50"
              placeholder="Ex: Bomba Centrífuga 01"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
              <MapPin className="w-3 h-3" /> Setor / Localização
            </label>
            <input 
              type="text"
              value={setor}
              onChange={(e) => setSetor(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-foreground placeholder:text-muted-foreground/50"
              placeholder="Ex: Pavilhão A - Usinagem"
            />
          </div>

          {message && (
            <div className={`p-4 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-wider border ${
              message.type === 'success' 
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20" 
                : "bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20"
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black uppercase tracking-[0.2em] text-xs py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
            </button>
          </div>
        </form>
      </div>
      
      <div className="mt-8 p-6 border border-amber-500/20 bg-amber-500/5 rounded-2xl flex items-start gap-4">
        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500">Atenção Crítica</h4>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">As alterações feitas aqui serão sincronizadas com o banco local e posteriormente com o Cloud Firestore. Certifique-se de que o nome identifica corretamente o ativo físico.</p>
        </div>
      </div>
    </div>
  );
}
