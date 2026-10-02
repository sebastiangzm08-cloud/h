/* ==========================================================================
   Catálogo maestro. La versión completa del catálogo: acá SÍ se ve el nivel
   interno N1–N4, la carga y el estado (publicada / a pedido / borrador).

   El cliente ve el plan; vos ves el nivel. "Growth" le dice algo al cliente;
   "N3" te dice a vos cuánto cuesta construirla.

   Todo sale de `getCatalogoBase()`: descripción, límites por defecto y
   conexiones que pide cada automatización incluidos.
   ========================================================================== */
import { Icono, type NombreIcono } from "@/components/panel/iconos";
import { Caja, Chip, Pill, precioMensualTexto } from "@/components/panel/ui";
import { AdminHead, Aviso, Cifras, Dato, TarjetaCifra, nombreServicio } from "@/components/admin/admin-ui";
import { getCatalogoBase } from "@/lib/panel/datos";
import { nombrePlan, nombreProceso } from "@/lib/panel/tipos";

const ESTADO: Record<string, { texto: string; tono: "ok" | "warn" | "idle" }> = {
  publicada: { texto: "Publicada", tono: "ok" },
  a_pedido: { texto: "A pedido", tono: "warn" },
  borrador: { texto: "Borrador", tono: "idle" },
};

const ICONO: Record<string, NombreIcono> = {
  "redes-sociales": "imagen",
  "agente-whatsapp": "mensajes",
  "prospeccion-clientes": "buscar",
};

/** Los límites vienen con nombre de código; así se leen. */
const LIMITE: Record<string, string> = {
  publicacionesDia: "publicaciones al día",
  publicacionesMes: "publicaciones al mes",
  fotosMejoradasMes: "fotos mejoradas al mes",
  mensajesMes: "mensajes al mes",
};

function nombreLimite(clave: string) {
  return LIMITE[clave] ?? clave.replace(/([A-Z])/g, " $1").toLowerCase();
}

export default async function CatalogoMaestro() {
  const catalogo = await getCatalogoBase();
  const publicadas = catalogo.filter((a) => a.estado === "publicada").length;
  const aPedido = catalogo.filter((a) => a.estado === "a_pedido").length;
  const sinPrecio = catalogo.filter((a) => a.precioMensual == null).length;

  return (
    <>
      <AdminHead
        titulo="Catálogo maestro"
        sub={`${catalogo.length} automatizaciones`}
        descripcion="Tu producto, con los datos internos que el cliente no ve."
      />

      <Cifras columnas={4} etiqueta="Resumen del catálogo">
        <TarjetaCifra icono="catalogo" etiqueta="En el catálogo" valor={catalogo.length} pie="Sin contar borradores" />
        <TarjetaCifra icono="automatizaciones" etiqueta="Publicadas" valor={publicadas} pie="Se activan solas" />
        <TarjetaCifra icono="calendario" etiqueta="A pedido" valor={aPedido} pie="Se arman para cada cliente" />
        <TarjetaCifra
          icono="costos"
          etiqueta="Se cotizan"
          valor={sinPrecio}
          pie={sinPrecio > 0 ? "Sin precio de lista" : "Todas con precio de lista"}
        />
      </Cifras>

      <ul className="flex flex-col gap-3.5">
        {catalogo.map((a) => {
          const limites = Object.entries(a.limitesSugeridos);
          return (
            <li key={a.id}>
              <Caja className="flex flex-col gap-4">
                <div className="flex items-start gap-3.5">
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-[var(--panel-acento-fondo)] text-[color:var(--panel-acento-texto)]">
                    <Icono nombre={ICONO[a.slug] ?? "automatizaciones"} className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                      <h2 className="text-[14.5px] font-semibold tracking-tight text-ink">{a.nombre}</h2>
                      <Pill tono={ESTADO[a.estado].tono}>{ESTADO[a.estado].texto}</Pill>
                    </div>
                    <p className="mt-0.5 font-mono text-[10.5px] tracking-[0.1em] text-ink-faint uppercase">{a.slug}</p>
                    <p className="mt-2 max-w-[78ch] text-[12.5px] leading-relaxed text-ink-mute">{a.descripcion}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 border-t border-line pt-4 sm:grid-cols-3 lg:grid-cols-6">
                  <Dato etiqueta="Proceso">{nombreProceso[a.proceso]}</Dato>
                  <Dato etiqueta="Plan">{nombrePlan[a.planMinimo]}</Dato>
                  <Dato etiqueta="Nivel interno">
                    <span className="font-mono">{a.nivel}</span>
                  </Dato>
                  <Dato etiqueta="Carga">
                    <span className="capitalize">{a.carga}</span>
                  </Dato>
                  <Dato etiqueta="Precio">
                    <span className="font-mono">{precioMensualTexto(a.precioMensual)}</span>
                  </Dato>
                  <Dato etiqueta="Plazo">
                    {a.plazo ? <span className="text-warn">{a.plazo}</span> : <span className="text-ink-faint">—</span>}
                  </Dato>
                </div>

                {limites.length > 0 || a.conexionesRequeridas.length > 0 ? (
                  <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:gap-8">
                    {limites.length > 0 ? (
                      <div className="min-w-0">
                        <span className="font-mono text-[10px] tracking-[0.12em] text-ink-faint uppercase">
                          Límites por defecto
                        </span>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {limites.map(([clave, valor]) => (
                            <Chip key={clave}>
                              <b className="font-medium text-ink">{valor.toLocaleString("es-CR")}</b> {nombreLimite(clave)}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {a.conexionesRequeridas.length > 0 ? (
                      <div className="min-w-0">
                        <span className="font-mono text-[10px] tracking-[0.12em] text-ink-faint uppercase">
                          Pide conectar
                        </span>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {a.conexionesRequeridas.map((c) => (
                            <Chip key={c}>{nombreServicio(c)}</Chip>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </Caja>
            </li>
          );
        })}
      </ul>

      <Aviso>
        El catálogo vive hoy en{" "}
        <code className="rounded bg-surface-3 px-1.5 py-px font-mono text-[11px]">src/lib/panel/datos.ts</code>. Para
        asignarlo a clientes hay que sembrarlo también en la tabla{" "}
        <code className="rounded bg-surface-3 px-1.5 py-px font-mono text-[11px]">catalogo_automatizaciones</code>.
      </Aviso>
    </>
  );
}
