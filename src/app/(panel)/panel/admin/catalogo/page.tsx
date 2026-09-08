/* ==========================================================================
   Catálogo maestro. La versión completa del catálogo: acá SÍ se ve el nivel
   interno N1–N4, la carga y el estado (publicada / a pedido / borrador).

   El cliente ve el plan; vos ves el nivel. "Growth" le dice algo al cliente;
   "N3" te dice a vos cuánto cuesta construirla.
   ========================================================================== */
import { Caja, Eyebrow, PageHead, Pill, precioMensualTexto } from "@/components/panel/ui";
import { getCatalogoBase } from "@/lib/panel/datos";
import { nombrePlan, nombreProceso } from "@/lib/panel/tipos";

const ESTADO: Record<string, { texto: string; tono: "ok" | "warn" | "idle" }> = {
  publicada: { texto: "Publicada", tono: "ok" },
  a_pedido: { texto: "A pedido", tono: "warn" },
  borrador: { texto: "Borrador", tono: "idle" },
};

export default async function CatalogoMaestro() {
  const catalogo = await getCatalogoBase();

  return (
    <>
      <PageHead
        titulo="Catálogo maestro"
        sub={`${catalogo.length} automatizaciones`}
        descripcion="Tu producto, con los datos internos que el cliente no ve."
      />

      <div className="flex flex-col gap-2.5">
        {catalogo.map((a) => (
          <Caja key={a.id} className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="min-w-[200px] flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] font-semibold text-ink">{a.nombre}</h2>
                <Pill tono={ESTADO[a.estado].tono}>{ESTADO[a.estado].texto}</Pill>
              </div>
              <p className="mt-0.5 font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">
                {a.slug}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px]">
              <div>
                <Eyebrow>Proceso</Eyebrow>
                <span className="mt-0.5 block text-ink-soft">
                  {nombreProceso[a.proceso]}
                </span>
              </div>
              <div>
                <Eyebrow>Plan</Eyebrow>
                <span className="mt-0.5 block text-ink-soft">
                  {nombrePlan[a.planMinimo]}
                </span>
              </div>
              <div>
                <Eyebrow>Nivel</Eyebrow>
                <span className="mt-0.5 block font-mono text-ink-soft">{a.nivel}</span>
              </div>
              <div>
                <Eyebrow>Carga</Eyebrow>
                <span className="mt-0.5 block text-ink-soft capitalize">{a.carga}</span>
              </div>
              <div>
                <Eyebrow>Precio</Eyebrow>
                <span className="mt-0.5 block font-mono text-ink-soft">
                  {precioMensualTexto(a.precioMensual)}
                </span>
              </div>
              {a.plazo ? (
                <div>
                  <Eyebrow>Plazo</Eyebrow>
                  <span className="mt-0.5 block text-warn">{a.plazo}</span>
                </div>
              ) : null}
            </div>
          </Caja>
        ))}
      </div>

      <p className="text-[11.5px] text-ink-faint">
        El catálogo vive hoy en{" "}
        <code className="rounded bg-surface-3 px-1.5 py-px font-mono text-[10.5px]">
          src/lib/panel/datos.ts
        </code>
        . Para asignarlo a clientes hay que sembrarlo también en la tabla{" "}
        <code className="rounded bg-surface-3 px-1.5 py-px font-mono text-[10.5px]">
          catalogo_automatizaciones
        </code>
        .
      </p>
    </>
  );
}
