/* ==========================================================================
   Punto de entrada de las acciones genéricas del CLIENTE (soporte, etc.).
   Mismo patrón que `/api/admin/[nombre]` y `/api/agente/[nombre]`: lista
   explícita de acciones permitidas, nunca `import * as` — llamar a un nombre
   que no está acá da 404, nunca ejecuta código al azar. La sesión la valida
   cada acción con `exigirCliente()` (ver `panel-acciones.ts`).
   ========================================================================== */
import { NextResponse } from "next/server";
import { crearConsulta, type ResultadoPanel } from "@/lib/panel/panel-acciones";

type FnAccion = (
  prev: ResultadoPanel | null,
  form: FormData
) => Promise<ResultadoPanel>;

const ACCIONES: Record<string, FnAccion> = {
  crearConsulta,
};

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ nombre: string }> }
) {
  const { nombre } = await params;
  const fn = Object.hasOwn(ACCIONES, nombre) ? ACCIONES[nombre] : undefined;

  if (!fn) {
    return NextResponse.json({ ok: false, error: "Acción desconocida." }, { status: 404 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "No se pudo leer el formulario." }, { status: 400 });
  }

  const resultado = await fn(null, form);
  return NextResponse.json(resultado, { headers: { "cache-control": "no-store" } });
}
