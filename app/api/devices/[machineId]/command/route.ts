import { NextResponse } from "next/server";

/**
 * URL do backend local (.NET/Java) vindo das variáveis de ambiente.
 */
const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:5000/api";

/**
 * Endpoint POST para enviar comandos a um dispositivo.
 * O comando é recebido pelo Next.js e encaminhado para o servidor .NET/Java.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ machineId: string }> }
) {
  const { machineId } = await params;
  
  try {
    // Lê o corpo da requisição JSON (ex: { command: "RESET", value: 1 })
    const body = await request.json();

    // Repassa o comando para o backend local
    const res = await fetch(`${BACKEND_URL}/devices/${machineId}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Erro no Proxy (Comando):", error);
    return NextResponse.json({ error: "Não foi possível conectar ao backend" }, { status: 503 });
  }
}
