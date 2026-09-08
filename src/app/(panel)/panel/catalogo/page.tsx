/* ==========================================================================
   Catálogo: la vitrina. Todo lo que Hoshizora ofrece, con lo que el cliente
   ya tiene marcado.

   Corto y verdadero a propósito: tres automatizaciones, no nueve. El agente
   de WhatsApp es todo en uno (atiende, vende y agenda). Lo que se construye
   a pedido lo dice, y dice cuánto tarda — nunca se finge que está listo.
   ========================================================================== */
import Link from "next/link";
import { Icono, type NombreIcono } from "@/components/panel/iconos";
import { Caja, PageHead, Pill, precioMensualTexto } from "@/components/panel/ui";
import { getCatalogo } from "@/lib/panel/datos";
import { nombrePlan, nombreProceso } from "@/lib/panel/tipos";

const ICONOS: Record<string, NombreIcono> = {
  "redes-sociales": "imagen",
  "agente-whatsapp": "mensajes",
  "prospeccion-clientes": "actividad",
};

export default async function CatalogoPage() {
  const catalogo = await getCatalogo();

  return (
    <>
      <PageHead
        titulo="Catálogo"
        sub={`${catalogo.length} automatizaciones`}
        descripcion="Cada plan habilita una automatización. Se suman a tu cuenta cuando querás."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {catalogo.map(({ automatizacion: a, contratada }) => (
          <Caja key={a.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-surface-3 text-ink-soft shadow-[inset_0_0_0_1px_rgba(255,255,255,0.11)]">
                <Icono
                  nombre={ICONOS[a.slug] ?? "automatizaciones"}
                  className="h-[18px] w-[18px]"
                />
              </span>
              {contratada ? (
                <Pill tono="ok">Ya la tenés</Pill>
              ) : a.estado === "a_pedido" ? (
                <Pill tono="warn">A pedido</Pill>
              ) : (
                <Pill tono="ok">Disponible</Pill>
              )}
            </div>

            <div>
              <h2 className="text-[15px] font-semibold tracking-tight text-ink">
                {a.nombre}
              </h2>
              <p className="mt-0.5 font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">
                {nombreProceso[a.proceso]}
              </p>
            </div>

            <p className="text-[13px] leading-relaxed text-ink-faint">
              {a.descripcion}
            </p>

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3">
              <span className="text-[12.5px] text-ink-soft">
                Plan {nombrePlan[a.planMinimo]} ·{" "}
                <span className="font-mono">{precioMensualTexto(a.precioMensual)}</span>
              </span>
              {!contratada && a.estado === "a_pedido" ? (
                <span className="inline-flex items-center gap-1.5 text-[11.5px] text-warn">
                  <Icono nombre="calendario" className="h-3 w-3" />
                  {a.plazo}
                </span>
              ) : null}
            </div>

            <Link
              href={`/panel/automatizaciones/${a.slug}`}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-ink px-5 text-[13px] font-medium text-paper transition-colors hover:bg-ink-soft"
            >
              {contratada ? "Abrir" : "Ver detalle"}
              <Icono nombre="flecha" className="h-3.5 w-3.5" />
            </Link>
          </Caja>
        ))}
      </div>
    </>
  );
}
