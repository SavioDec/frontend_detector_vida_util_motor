import { NextResponse } from "next/server";

/**
 * URL do seu backend local (.NET ou Java).
 * Configurada via variável de ambiente no arquivo .env.local.
 */
const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:5000/api";

/**
 * Endpoint GET para buscar o status em tempo real de um dispositivo.
 * Atua como um proxy para evitar problemas de CORS no navegador.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ machineId: string }> }
) {
  const { machineId } = await params;

  try {
    // Encaminha a requisição para o backend .NET/Java
    const res = await fetch(`${BACKEND_URL}/devices/${machineId}/status`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 } // Desabilita cache para garantir dados em tempo real
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Erro no Backend" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro no Proxy (Status):", error);
    return NextResponse.json({ error: "Não foi possível conectar ao backend" }, { status: 503 });
  }
}
