/* ==========================================================================
   Inicio del cliente.

   La métrica principal es GLOBAL a propósito: "acciones automatizadas",
   sumando todas sus automatizaciones. No puede ser "publicaciones", porque
   no todos contratan redes — la mayoría no.
   ========================================================================== */
import Link from "next/link";
import { GraficaUso } from "@/components/panel/grafica";
import {
  TarjetaContratada,
  TarjetaSumar,
} from "@/components/panel/tarjeta-automatizacion";
import { PrimerosPasos } from "@/components/panel/primeros-pasos";
import {
  Caja,
  CajaHead,
  Chip,
  Eyebrow,
  Medidor,
  Nota,
  PageHead,
  colones,
} from "@/components/panel/ui";
import {
  getActividad,
  getAsignaciones,
  getCliente,
  getFacturacion,
  getMedidores,
  getPendientes,
  getPerfil,
  getPrimerosPasos,
  getUsoDiario,
  getUsoHoyPorAutomatizacion,
} from "@/lib/panel/datos";

const GRAVEDAD = {
  urgente: "bg-bad",
  atencion: "bg-warn",
  info: "bg-ink-faint",
} as const;

export default async function InicioPanel() {
  const [
    perfil,
    cliente,
    asignaciones,
    uso,
    desglose,
    medidores,
    pendientes,
    actividad,
    facturacion,
    primerosPasos,
  ] = await Promise.all([
    getPerfil(),
    getCliente(),
    getAsignaciones(),
    getUsoDiario(),
    getUsoHoyPorAutomatizacion(),
    getMedidores(),
    getPendientes(),
    getActividad(4),
    getFacturacion(),
    getPrimerosPasos(),
  ]);

  const primerNombre = perfil.nombre.split(" ")[0];
  const totalHoy = desglose.reduce((suma, d) => suma + d.valor, 0);
  const fecha = new Date().toLocaleDateString("es-CR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      <PageHead titulo={`Hola, ${primerNombre}`} sub={fecha} />

      {primerosPasos && !primerosPasos.completo ? (
        <PrimerosPasos pasos={primerosPasos.pasos} nombre={primerNombre} />
      ) : null}

      <section className="grid gap-[18px] xl:grid-cols-[1.65fr_1fr]">
        <Caja>
          <CajaHead eyebrow="Actividad" titulo="Acciones automatizadas · últimos 14 días">
            <Link href="/panel/actividad" className="text-xs font-medium whitespace-nowrap text-ink-mute transition-colors hover:text-ink">
              Ver todo
            </Link>
          </CajaHead>

          <GraficaUso puntos={uso} etiquetaFinal={`hoy · ${totalHoy}`} />

          <div className="mt-3.5 flex flex-wrap gap-2 border-t border-line pt-3.5">
            {desglose.map((d) => (
              <Chip key={d.nombre}>
                {d.nombre} <b className="font-medium text-ink">{d.valor}</b>
              </Chip>
            ))}
            <Chip>
              Total hoy <b className="font-medium text-ink">{totalHoy}</b>
            </Chip>
          </div>

          <div className="mt-4 grid gap-4 border-t border-line pt-4 sm:grid-cols-3">
            {medidores.map((m) => (
              <Medidor key={m.etiqueta} {...m} />
            ))}
          </div>
        </Caja>

        <Caja>
          <CajaHead
            eyebrow="Pendientes"
            titulo={`Requieren tu atención · ${pendientes.length}`}
          >
            <Link href="/panel/pendientes" className="text-xs font-medium whitespace-nowrap text-ink-mute transition-colors hover:text-ink">
              Ver todo
            </Link>
          </CajaHead>

          <ul className="flex flex-col">
            {pendientes.map((p, i) => (
              <li
                key={p.id}
                className={
                  i === pendientes.length - 1
                    ? "flex items-start gap-2.5 py-2.5"
                    : "flex items-start gap-2.5 border-b border-line py-2.5"
                }
              >
                <span
                  className={`mt-1.5 h-[7px] w-[7px] flex-none rounded-full ${GRAVEDAD[p.gravedad]}`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-ink-soft">{p.titulo}</p>
                  <p className="mt-px text-[11.5px] text-ink-faint">{p.detalle}</p>
                </div>
                <Link
                  href={p.accion.href}
                  className="mt-px text-[11.5px] font-medium whitespace-nowrap text-ink-mute transition-colors hover:text-ink"
                >
                  {p.accion.texto}
                </Link>
              </li>
            ))}
          </ul>
        </Caja>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <Eyebrow>Tus automatizaciones</Eyebrow>
            <h2 className="mt-0.5 text-[14.5px] font-semibold tracking-tight text-ink">
              {asignaciones.length} contratadas
            </h2>
          </div>
          <Link href="/panel/automatizaciones" className="text-xs font-medium whitespace-nowrap text-ink-mute transition-colors hover:text-ink">
            Ver todas
          </Link>
        </div>
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {asignaciones.map((a) => (
            <TarjetaContratada key={a.id} asignacion={a} />
          ))}
          <TarjetaSumar />
        </div>
      </section>

      <section className="grid gap-[18px] lg:grid-cols-2">
        <Caja>
          <CajaHead eyebrow="Últimos movimientos" titulo="De todas tus automatizaciones" />
          <ul className="flex flex-col">
            {actividad.map((a) => (
              <li key={a.id} className="flex gap-3 py-2.5">
                <time className="w-[88px] flex-none pt-px font-mono text-[10.5px] text-ink-faint">
                  {a.cuando}
                </time>
                <span
                  className="mt-1.5 h-[7px] w-[7px] flex-none rounded-full bg-ink-soft ring-[3px] ring-white/6"
                  aria-hidden="true"
                />
                <p className="text-[12.5px] text-ink-soft">
                  <span className="font-medium">{a.automatizacion}</span> — {a.descripcion}
                </p>
              </li>
            ))}
          </ul>
        </Caja>

        <Caja>
          <CajaHead eyebrow="Tu cuenta" titulo="Plan y cobro">
            <Link href="/panel/facturacion" className="text-xs font-medium whitespace-nowrap text-ink-mute transition-colors hover:text-ink">
              Ver facturación
            </Link>
          </CajaHead>
          <dl className="text-[12.5px]">
            {[
              ["Plan", cliente.plan],
              ["Automatizaciones", `${asignaciones.length} activas`],
              ["Mensualidad", colones(facturacion.mensualidad)],
              ["Próximo cobro", facturacion.proximoCobro],
            ].map(([k, v], i, arr) => (
              <div
                key={k}
                className={
                  i === arr.length - 1
                    ? "flex justify-between gap-3 py-2.5"
                    : "flex justify-between gap-3 border-b border-line py-2.5"
                }
              >
                <dt className="text-ink-mute">{k}</dt>
                <dd className="text-right font-mono text-ink-soft">{v}</dd>
              </div>
            ))}
          </dl>
          <Nota className="mt-3.5">Pagando por año te ahorrás 2 meses.</Nota>
        </Caja>
      </section>

    </>
  );
}
