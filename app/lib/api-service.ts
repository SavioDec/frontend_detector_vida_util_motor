/**
 * Interface para o status do sistema retornado pelo backend.
 */
export interface BackendStatus {
  esp32_online: boolean;
  internet_online: boolean;
  fonte_dados_recomendada: "BACKEND" | "SQLITE";
  verificado_em: string;
}

/**
 * Interface para uma máquina cadastrada (Conforme Maquina.cs no Backend).
 */
export interface Machine {
  id: string;             // MAC Address ou ID único
  nome: string;           // Nome amigável
  setor?: string;         // Setor da máquina (ex: Usinagem, Embalagem)
  status: "ATIVA" | "INATIVA" | "EM_FALHA";
  data_cadastro: string;
}

/**
 * Interface para os dados de telemetria (Conforme TelemetryRecord.cs no Backend).
 */
export interface TelemetryData {
  id: string;
  id_maquina: string;      // ID da máquina associada
  vibracao: number;        // Valor da vibração
  emergencia: boolean;     // Indica se houve um erro crítico/emergência
  status_motor: string;    // Estado atual do motor
  modo_demonstracao: boolean;
  data_hora: string;       // Timestamp do backend
}

/**
 * URL base para o backend GatewayIndustria4.
 */
const API_BASE_URL = "/api/backend";

/**
 * Busca o status de conectividade do gateway.
 */
export async function fetchBackendStatus(): Promise<BackendStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/status`);
    if (!response.ok) throw new Error(`Erro ${response.status}`);
    return response.json();
  } catch (error) {
    console.error("fetchBackendStatus failed:", error);
    throw error;
  }
}

/**
 * Busca a lista de máquinas cadastradas.
 */
export async function fetchMachines(): Promise<Machine[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/maquinas`);
    if (!response.ok) throw new Error(`Erro ${response.status}`);
    return response.json();
  } catch (error) {
    console.error("fetchMachines failed:", error);
    throw error;
  }
}

/**
 * Atualiza os dados de uma máquina (Nome e Setor).
 */
export async function updateMachine(id: string, machine: Partial<Machine>): Promise<Machine> {
  const response = await fetch(`${API_BASE_URL}/maquinas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(machine)
  });
  
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.erro || "Erro ao atualizar máquina");
  return data;
}

/**
 * Busca a última telemetria de uma máquina.
 */
export async function fetchDeviceStatus(machineId: string): Promise<TelemetryData> {
  const response = await fetch(`${API_BASE_URL}/telemetria/${machineId}/ultima`);
  if (!response.ok) throw new Error(`Erro ${response.status}`);
  return response.json();
}

/**
 * Busca o histórico de telemetria de uma máquina.
 */
export async function fetchDeviceHistory(machineId: string, limite = 50): Promise<TelemetryData[]> {
  const response = await fetch(`${API_BASE_URL}/telemetria/${machineId}?limite=${limite}`);
  if (!response.ok) throw new Error(`Erro ${response.status}`);
  return response.json();
}

/**
 * Comandos do Motor
 */
export async function controlMotor(command: 'ligar' | 'desligar' | 'reset' | 'demonstrar'): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/motor/${command}`, {
    method: 'POST'
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.erro || `Falha no comando: ${command}`);
  return data;
}

/**
 * Cadastra uma nova máquina.
 */
export async function registerMachine(machine: Partial<Machine>): Promise<Machine> {
  const response = await fetch(`${API_BASE_URL}/maquinas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(machine)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.erros?.join(', ') || data.erro || "Erro no cadastro");
  return data;
}
