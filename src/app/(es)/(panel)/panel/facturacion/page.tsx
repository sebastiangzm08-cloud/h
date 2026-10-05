/* ==========================================================================
   Facturación.

   El cobro que viene, cómo se paga y el historial. El cobro es manual por
   SINPE (decisión del negocio): acá se muestra, se paga por fuera y queda
   registrado.

   El historial es tabla en pantallas anchas y lista de tarjetas en celular:
   cuatro columnas no caben en 360 px sin barra de desplazamiento.
   ========================================================================== */
import { BotonCopiar } from "@/components/panel/configuracion/boton-copiar";
import { BTN_PRIMARIO } from "@/components/panel/configuracion/estilos";
import { EstadoVacio, FilaDato, Filas, Seccion } from "@/components/panel/configuracion/seccion";
import { Nota, PageHead, Pill, colones } from "@/components/panel/ui";
import { getFacturacion } from "@/lib/panel/datos";
import type { EstadoCobro } from "@/lib/panel/tipos";
import { site, waLink } from "@/config/site";

const ESTADO: Record<EstadoCobro, { texto: string; tono: "ok" | "warn" | "bad" }> = {
  pagado: { texto: "Pagado", tono: "ok" },
  pendiente: { texto: "Pendiente", tono: "warn" },
  vencido: { texto: "Vencido", tono: "bad" },
};

export default async function FacturacionPage() {
  const f = await getFacturacion();
  const pendiente = f.cobros.find((c) => c.estado !== "pagado");
  const sinpeSoloNumeros = site.pago.sinpeMovil.replace(/\s/g, "");

  return (
    <>
      <PageHead
        titulo="Facturación"
        sub={`Plan ${f.plan}`}
        descripcion="Tu mensualidad, el próximo cobro y lo que ya pagaste."
      />

      <section className="grid gap-[18px] lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <Seccion eyebrow="Ahora" titulo="Tu plan" descripcion="Lo que pagás cada mes.">
          <Filas>
            <FilaDato k="Plan">{f.plan}</FilaDato>
            <FilaDato k="Mensualidad" mono>
              {colones(f.mensualidad)}
            </FilaDato>
            <FilaDato k="Próximo cobro" mono>
              {f.proximoCobro}
            </FilaDato>
            <FilaDato k="Método" mono>
              {f.metodoPago}
            </FilaDato>
          </Filas>
          <Nota className="mt-4">Pagando por año te ahorrás 2 meses.</Nota>
        </Seccion>

        <Seccion
          eyebrow="Pago"
          titulo="Cómo pagar"
          descripcion={
            pendiente ? (
              <>
                Tenés {colones(pendiente.monto)} de {pendiente.periodo}{" "}
                <span className={pendiente.estado === "vencido" ? "font-medium text-bad" : "font-medium text-warn"}>
                  {pendiente.estado === "vencido" ? "vencido" : "sin pagar"}
                </span>
                .
              </>
            ) : (
              "Estás al día. Nada por pagar."
            )
          }
        >
          <div className="rounded-xl bg-surface-3 px-3.5 py-1">
            <div className="flex items-center justify-between gap-3 border-b border-line py-2">
              <div className="min-w-0">
                <p className="text-[11.5px] text-ink-mute">SINPE Móvil</p>
                <p className="font-mono text-[14px] text-ink">{site.pago.sinpeMovil}</p>
              </div>
              <BotonCopiar texto={sinpeSoloNumeros} etiqueta="Copiar el número de SINPE Móvil" />
            </div>
            <div className="py-2.5">
              <p className="text-[11.5px] text-ink-mute">A nombre de</p>
              <p className="text-[13px] text-ink-soft">{site.pago.sinpeNombre}</p>
            </div>
          </div>

          <a
            href={waLink("Hola, ya hice el pago de mi mensualidad. Adjunto el comprobante.")}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BTN_PRIMARIO} mt-4 w-full sm:w-auto`}
          >
            Enviar comprobante
          </a>
        </Seccion>
      </section>

      <Seccion
        eyebrow="Historial"
        titulo="Cobros"
        descripcion="Cada mensualidad y si ya la pagaste."
        sinRelleno
      >
        {f.cobros.length === 0 ? (
          <div className="px-4 sm:px-[18px]">
            <EstadoVacio icono="facturacion" titulo="Todavía no hay cobros">
              Cuando se genere tu primera mensualidad, aparece acá con su estado.
            </EstadoVacio>
          </div>
        ) : (
          <>
            {/* Celular: una tarjeta por cobro. */}
            <ul className="divide-y divide-line border-t border-line sm:hidden">
              {f.cobros.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-ink">{c.periodo}</p>
                    <p className="mt-0.5 font-mono text-[12px] text-ink-mute tabular-nums">{colones(c.monto)}</p>
                    {c.pagadoEn ? (
                      <p className="mt-0.5 text-[11.5px] text-ink-mute">Pagado el {c.pagadoEn}</p>
                    ) : null}
                  </div>
                  <Pill tono={ESTADO[c.estado].tono}>{ESTADO[c.estado].texto}</Pill>
                </li>
              ))}
            </ul>

            {/* Pantalla ancha: tabla. */}
            <table className="hidden w-full text-[12.5px] sm:table">
              <thead>
                <tr className="border-y border-line text-left font-mono text-[10px] tracking-wide text-ink-mute uppercase">
                  <th scope="col" className="py-2.5 pr-3 pl-[18px] font-medium">
                    Periodo
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    Monto
                  </th>
                  <th scope="col" className="px-3 py-2.5 font-medium">
                    Estado
                  </th>
                  <th scope="col" className="py-2.5 pr-[18px] pl-3 text-right font-medium">
                    Pagado
                  </th>
                </tr>
              </thead>
              <tbody>
                {f.cobros.map((c) => (
                  <tr key={c.id} className="border-b border-line last:border-0">
                    <td className="py-3 pr-3 pl-[18px] text-ink-soft">{c.periodo}</td>
                    <td className="px-3 py-3 font-mono text-ink-soft tabular-nums">{colones(c.monto)}</td>
                    <td className="px-3 py-3">
                      <Pill tono={ESTADO[c.estado].tono}>{ESTADO[c.estado].texto}</Pill>
                    </td>
                    <td className="py-3 pr-[18px] pl-3 text-right font-mono text-ink-mute">{c.pagadoEn ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Seccion>
    </>
  );
}
