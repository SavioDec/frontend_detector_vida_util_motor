import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, orderBy, limit, onSnapshot, getDocs, QuerySnapshot, DocumentData, Timestamp } from "firebase/firestore";
import { TelemetryData } from "./api-service";

/**
 * Configuração do Firebase extraída do projeto 'app-vibracao'.
 */
const firebaseConfig = {
  projectId: "app-vibracao",
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * Helper para obter o valor da data para exibição sem nanosegundos.
 * Mantém o horário bruto do banco.
 */
function parseFirebaseDate(data: any): string {
  if (!data) return "";
  
  let d: Date;

  // Se for um Timestamp do Firebase
  if (typeof data.toDate === 'function') {
    d = data.toDate();
  } else if (data.seconds !== undefined) {
    d = new Date(data.seconds * 1000);
  } else {
    d = new Date(data);
  }

  if (isNaN(d.getTime())) return String(data);

  // Formata manualmente para remover nanosegundos e manter precisão de segundos
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Busca histórico filtrado com suporte a intervalo de datas e paginação.
 */
export async function fetchFilteredHistory(
  machineId: string, 
  startDate: Date, 
  endDate: Date, 
  recordLimit: number = 500
): Promise<TelemetryData[]> {
  
  const q = query(
    collection(db, "telemetria"),
    where("id_maquina", "==", machineId),
    where("data_hora", ">=", startDate),
    where("data_hora", "<=", endDate),
    orderBy("data_hora", "desc"),
    limit(recordLimit)
  );

  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const docData = doc.data();
      return {
        id: doc.id,
        id_maquina: docData.id_maquina,
        vibracao: docData.vibracao,
        emergencia: docData.emergencia,
        status_motor: docData.status_motor,
        modo_demonstracao: docData.modo_demonstracao,
        data_hora: parseFirebaseDate(docData.data_hora)
      } as TelemetryData;
    }).sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime());
  } catch (error) {
    console.error("Erro ao buscar histórico filtrado:", error);
    return [];
  }
}

/**
 * Escuta em tempo real a telemetria do Firebase para uma máquina específica.
 */
export function subscribeToTelemetry(machineId: string, callback: (data: TelemetryData[]) => void) {
  const q = query(
    collection(db, "telemetria"),
    where("id_maquina", "==", machineId),
    orderBy("data_hora", "desc"),
    limit(50)
  );

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const data = snapshot.docs.map(doc => {
      const docData = doc.data();
      return {
        id: doc.id,
        id_maquina: docData.id_maquina,
        vibracao: docData.vibracao,
        emergencia: docData.emergencia,
        status_motor: docData.status_motor,
        modo_demonstracao: docData.modo_demonstracao,
        data_hora: parseFirebaseDate(docData.data_hora)
      } as TelemetryData;
    });
    callback(data);
  }, (error) => {
    console.error("Erro no Firestore Snapshot:", error);
  });
}

export async function fetchMonthlyHistory(machineId: string): Promise<TelemetryData[]> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return fetchFilteredHistory(machineId, start, now, 100);
}
