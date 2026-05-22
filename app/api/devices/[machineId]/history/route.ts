import { NextResponse } from "next/server";

/**
 * URL do backend local (.NET/Java) vindo das variáveis de ambiente.
 */
const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:5000/api";

/**
 * Endpoint GET para buscar o histórico de telemetria de um dispositivo.
 * Encaminha a requisição para o backend local.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ machineId: string }> }
) {
  const { machineId } = await params;

  try {
    const res = await fetch(`${BACKEND_URL}/devices/${machineId}/history`, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Erro no Backend" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro no Proxy (Histórico):", error);
    return NextResponse.json({ error: "Não foi possível conectar ao backend" }, { status: 503 });
  }
}
