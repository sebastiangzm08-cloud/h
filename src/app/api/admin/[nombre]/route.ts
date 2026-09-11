/* ==========================================================================
   Punto de entrada de TODAS las acciones del admin.

   Un solo dispatcher en vez de una carpeta por acción: la lista de acciones
   permitidas está EXPLÍCITA acá abajo (no `import * as`), así que llamar a
   `/api/admin/cualquierCosa` con un nombre que no está en el mapa da 404 —
   nunca ejecuta código al azar.

   El negocio (qué hace cada acción, `exigirAdmin`, etc.) sigue en
   `admin-acciones.ts`, intacto. Esto es sólo el cableado HTTP.
   ========================================================================== */
import { NextResponse } from "next/server";
import {
  cambiarCorreoAcceso,
  cambiarPrecioAsignacion,
  cerrarConsulta,
  crearCobro,
  crearCuentaCliente,
  editarCliente,
  eliminarCliente,
  generarCobrosDelMes,
  marcarCobroPagado,
  reactivarCliente,
  resetearClaveCliente,
  responderConsultaAdmin,
  suspenderCliente,
  asignarAutomatizacion,
  type ResultadoAccion,
} from "@/lib/panel/admin-acciones";

type FnAccion = (
  prev: ResultadoAccion | null,
  form: FormData
) => Promise<ResultadoAccion>;

const ACCIONES: Record<string, FnAccion> = {
  crearCuentaCliente,
  asignarAutomatizacion,
  suspenderCliente,
  reactivarCliente,
  marcarCobroPagado,
  cambiarPrecioAsignacion,
  crearCobro,
  generarCobrosDelMes,
  responderConsultaAdmin,
  cerrarConsulta,
  resetearClaveCliente,
  cambiarCorreoAcceso,
  editarCliente,
  eliminarCliente,
};

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ nombre: string }> }
) {
  const { nombre } = await params;
  const fn = ACCIONES[nombre];

  if (!fn) {
    return NextResponse.json(
      { ok: false, error: "Acción desconocida." },
      { status: 404 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "No se pudo leer el formulario." },
      { status: 400 }
    );
  }

  const resultado = await fn(null, form);
  return NextResponse.json(resultado, {
    headers: { "cache-control": "no-store" },
  });
}
