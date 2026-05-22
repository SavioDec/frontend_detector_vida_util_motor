/**
 * Interface que define a estrutura dos dados de telemetria recebidos do Backend.
 * O Backend é o responsável por decidir se o estado é crítico ou não.
 */
export interface TelemetryData {
  id: string;           // Identificador único (Backend)
  machineId: string;    // ID do dispositivo (Backend)
  vibration: number;    // Valor da vibração (Backend)
  isCritical: boolean;  // O Backend já envia se está crítico ou não (Frontend 'dumb')
  timestamp: string;    // O Backend já envia o horário formatado (Frontend 'dumb')
}

export const MACHINE_IDS = ["ESP32-UNIT-01", "ESP32-UNIT-02", "ESP32-UNIT-03"];

/**
 * Simula o comportamento do Backend: já envia os dados processados e formatados.
 */
export const generateMockHistory = (machineId: string, count: number = 20): TelemetryData[] => {
  const history: TelemetryData[] = [];
  
  for (let i = 0; i < count; i++) {
    const vibration = Math.floor(Math.random() * 100);
    const date = new Date();
    date.setMinutes(date.getMinutes() - (count - i));
    
    history.push({
      id: `id-${machineId}-${i}-${Date.now()}`,
      machineId,
      vibration,
      // O Backend decide o status:
      isCritical: vibration > 85, 
      // O Backend formata a data:
      timestamp: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    });
  }
  
  return history;
};

/**
 * Simula uma leitura atual processada pelo Backend.
 */
export const getCurrentStatus = (machineId: string): TelemetryData => {
  const vibration = Math.floor(Math.random() * 100);
  return {
    id: `id-${machineId}-${Date.now()}`,
    machineId,
    vibration,
    isCritical: vibration > 85,
    timestamp: new Date().toLocaleTimeString(),
  };
};
