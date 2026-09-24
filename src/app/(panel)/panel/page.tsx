/* ==========================================================================
   Inicio del cliente. (Rediseño Fase 1, 2026-09-23.)

   Se ARMA según lo que el cliente tiene contratado:
   - Con el Agente de WhatsApp: cifras de la semana, actividad de WhatsApp,
     conversaciones recientes, movimientos y próximas citas — todo real.
   - Con cualquier otra automatización (Redes, etc.): la gráfica de "acciones
     automatizadas", los medidores y los últimos movimientos de siempre.
   - Con las dos: las dos cosas.

   La métrica global de la gráfica genérica es "acciones automatizadas",
   sumando todas sus automatizaciones. No puede ser "publicaciones", porque
   no todos contratan redes — la mayoría no.

   Lo que el diseño de referencia mostraba y todavía NO existe (Ventas,
   Oportunidades, Recuperación de clientes) no aparece: ver la memoria
   `project-rediseno-dashboard`. Nada de números de relleno.
   ========================================================================== */
import Link from "next/link";
import { GraficaUso } from "@/components/panel/grafica";
import {
  ConversacionesRecientes,
  EncabezadoBloque,
  GraficaWhatsapp,
  Movimientos,
  ProximasCitas,
  SelectorRango,
  TarjetaKpi,
  pieDelta,
} from "@/components/panel/inicio";
import { Icono } from "@/components/panel/iconos";
import { PrimerosPasos } from "@/components/panel/primeros-pasos";
import { TarjetaContratada, TarjetaSumar } from "@/components/panel/tarjeta-automatizacion";
import { Caja, CajaHead, Chip, Medidor } from "@/components/panel/ui";
import {
  getCitas,
  getConversaciones,
  getKpisInicio,
  getMovimientosAgente,
  getActividadWhatsapp,
} from "@/lib/panel/agente";
import { leerConfigAgente } from "@/lib/panel/agente-config";
import {
  getActividad,
  getAsignaciones,
  getMedidores,
  getPendientes,
  getPerfil,
  getPrimerosPasos,
  getUsoDiario,
  getUsoHoyPorAutomatizacion,
} from "@/lib/panel/datos";
import { cn } from "@/lib/utils";

const GRAVEDAD = {
  urgente: "bg-bad",
  atencion: "bg-warn",
  info: "bg-ink-faint",
} as const;

const SLUG_AGENTE = "agente-whatsapp";

function mayuscula(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function InicioPanel({
  searchParams,
}: {
  searchParams: Promise<{ rango?: string }>;
}) {
  /* El admin no llega hasta acá: el layout de `(panel)` ya lo redirige
     a `/panel/admin` antes de que esta página renderice. */
  const { rango: rangoParam } = await searchParams;
  const rango: 7 | 14 | 30 = rangoParam === "14" ? 14 : rangoParam === "30" ? 30 : 7;

  const [perfil, asignaciones, pendientes, primerosPasos] = await Promise.all([
    getPerfil(),
    getAsignaciones(),
    getPendientes(),
    getPrimerosPasos(),
  ]);

  const agente = asignaciones.find((a) => a.automatizacion.slug === SLUG_AGENTE) ?? null;
  const hayOtras = asignaciones.some((a) => a.automatizacion.slug !== SLUG_AGENTE);
  const conGenerico = !agente || hayOtras;

  const [datosAgente, datosGenericos] = await Promise.all([
    agente
      ? Promise.all([
          getKpisInicio(),
          getActividadWhatsapp(rango),
          getConversaciones(),
          getMovimientosAgente(6),
          getCitas(),
        ])
      : null,
    Promise.all([getUsoDiario(), getUsoHoyPorAutomatizacion(), getMedidores(), getActividad(4)]),
  ]);

  const kpis = datosAgente?.[0] ?? null;
  const actividadWa = datosAgente?.[1] ?? null;
  const conversaciones = (datosAgente?.[2] ?? []).slice(0, 5);
  const movimientos = datosAgente?.[3] ?? [];
  const proximas = (datosAgente?.[4] ?? []).filter((c) => c.estado !== "cancelada").slice(0, 3);
  const [uso, desglose, medidores, actividad] = datosGenericos;
  const totalHoy = desglose.reduce((suma, d) => suma + d.valor, 0);

  const primerNombre = perfil.nombre.split(" ")[0];
  const fecha = mayuscula(
    new Date().toLocaleDateString("es-CR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "America/Costa_Rica",
    })
  );

  /* Lo que de verdad le pide algo a una persona. Los avisos "info" no. */
  const requierenAtencion = pendientes.filter((p) => p.gravedad !== "info");
  const atencion = requierenAtencion.length + (kpis?.esperando ?? 0);
  const activas = asignaciones.filter((a) => a.estado === "activa");
  const frase =
    atencion > 0
      ? `Tenés ${atencion} ${atencion === 1 ? "cosa que necesita" : "cosas que necesitan"} tu atención.`
      : activas.length > 0
        ? "Tu negocio está funcionando automáticamente."
        : "Tus automatizaciones están en pausa.";

  const agenteActivo = agente?.estado === "activa";
  const onboardingAgentePendiente = agente ? !leerConfigAgente(agente.config).onboardingCompleto : false;

  return (
    <>
      {/* ---------- Cabecera ---------- */}
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:items-stretch">
        <div className="flex min-w-0 flex-col justify-center gap-3">
          <div>
            <h1 className="text-[30px] leading-tight font-semibold tracking-[-0.03em] text-ink">
              Hola, {primerNombre}
            </h1>
            <p className="mt-1 text-[14.5px] text-ink-mute">{frase}</p>
            {!agente ? (
              <p className="mt-1 font-mono text-[11px] tracking-wide text-ink-faint">{fecha}</p>
            ) : null}
          </div>

          {asignaciones.length > 0 ? (
            <ul className="flex flex-wrap gap-2" aria-label="Estado de tus automatizaciones">
              {asignaciones.map((a) => {
                const activa = a.estado === "activa";
                return (
                  <li
                    key={a.id}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px]",
                      activa ? "border-ok/30 bg-ok/10 text-ok" : "border-line bg-surface-2 text-ink-faint"
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", activa ? "bg-ok" : "bg-ink-faint")} aria-hidden="true" />
                    {a.automatizacion.nombre} · {activa ? "en marcha" : "en pausa"}
                  </li>
                );
              })}
            </ul>
          ) : null}

          {agenteActivo ? (
            <p className="text-[12.5px] text-ink-faint">Atendiendo, respondiendo y agendando las 24 horas.</p>
          ) : null}
        </div>

        {agente && kpis ? (
          <div className="relative overflow-hidden rounded-2xl border border-line bg-surface-2 p-5">
            <div
              className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-[var(--panel-acento)]/15 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative flex items-start gap-3.5">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-[var(--panel-acento-fondo)] text-[color:var(--panel-acento-texto)] shadow-[inset_0_0_0_1px_var(--panel-acento-borde)]">
                <Icono nombre="automatizaciones" className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[10.5px] tracking-wide text-ink-faint uppercase">{fecha}</p>
                <p className="mt-1 text-[15px] font-semibold tracking-tight text-ink">Tu asistente de IA trabaja por vos</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-mute">
                  {kpis.respuestasAgente.actual + kpis.citasAgendadas.actual > 0 ? (
                    <>
                      En los últimos 7 días respondió{" "}
                      <b className="font-medium text-ink">{kpis.respuestasAgente.actual.toLocaleString("es-CR")}</b>{" "}
                      {kpis.respuestasAgente.actual === 1 ? "mensaje" : "mensajes"} y agendó{" "}
                      <b className="font-medium text-ink">{kpis.citasAgendadas.actual.toLocaleString("es-CR")}</b>{" "}
                      {kpis.citasAgendadas.actual === 1 ? "cita" : "citas"}.
                    </>
                  ) : (
                    "Todavía no hubo actividad esta semana. Cuando te escriban, tu agente responde solo."
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {primerosPasos && !primerosPasos.completo ? (
        <PrimerosPasos pasos={primerosPasos.pasos} nombre={primerNombre} />
      ) : null}

      {/* ---------- Avisos del Agente ---------- */}
      {agente && kpis && kpis.esperando > 0 ? (
        <Link
          href="/panel/agente/conversaciones"
          prefetch={false}
          className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-warn/40 bg-warn/10 px-4 py-3.5 transition-colors hover:bg-warn/15"
        >
          <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-warn/20 text-warn">
            <Icono nombre="mensajes" className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1 text-[13px] text-ink-soft">
            <b className="font-medium text-ink">
              {kpis.esperando} {kpis.esperando === 1 ? "conversación espera" : "conversaciones esperan"} a una persona.
            </b>{" "}
            Tu agente se frenó y necesita que le contestes vos.
          </span>
          <span className="text-[12.5px] font-medium text-warn">Atender ahora →</span>
        </Link>
      ) : null}

      {onboardingAgentePendiente ? (
        <Link
          href="/panel/agente/onboarding"
          prefetch={false}
          className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-line bg-surface-2 px-4 py-3.5 transition-colors hover:border-line-strong"
        >
          <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-[var(--panel-acento-fondo)] text-[color:var(--panel-acento-texto)]">
            <Icono nombre="negocio" className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1 text-[13px] text-ink-soft">
            <b className="font-medium text-ink">Contale a tu agente cómo es tu negocio.</b> Son 3 pasos cortos: servicios,
            horario y formas de pago.
          </span>
          <span className="text-[12.5px] font-medium text-[color:var(--panel-acento-texto)]">Completar →</span>
        </Link>
      ) : null}

      {/* ---------- Cifras ---------- */}
      {agente && kpis ? (
        <section aria-label="Resumen de la semana" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <TarjetaKpi
            icono="mensajes"
            etiqueta="Mensajes recibidos"
            valor={kpis.mensajesRecibidos.actual}
            pie={pieDelta(kpis.mensajesRecibidos.actual, kpis.mensajesRecibidos.anterior)}
            href="/panel/agente/conversaciones"
          />
          <TarjetaKpi
            icono="automatizaciones"
            etiqueta="Respuestas del agente"
            valor={kpis.respuestasAgente.actual}
            pie={pieDelta(kpis.respuestasAgente.actual, kpis.respuestasAgente.anterior)}
            href="/panel/agente/conversaciones"
          />
          <TarjetaKpi
            icono="calendario"
            etiqueta="Citas agendadas"
            valor={kpis.citasAgendadas.actual}
            pie={pieDelta(kpis.citasAgendadas.actual, kpis.citasAgendadas.anterior)}
            href="/panel/agente/citas"
          />
          <TarjetaKpi
            icono="clientes"
            etiqueta="Contactos nuevos"
            valor={kpis.contactosNuevos.actual}
            pie={pieDelta(kpis.contactosNuevos.actual, kpis.contactosNuevos.anterior)}
            href="/panel/agente/contactos"
          />
          <TarjetaKpi
            icono="pendientes"
            etiqueta="Esperan a una persona"
            valor={kpis.esperando}
            pie={
              kpis.esperando > 0
                ? { texto: "Necesitan tu respuesta", clase: "text-warn" }
                : { texto: "Todo al día", clase: "text-ok" }
            }
            href="/panel/agente/conversaciones"
            alerta={kpis.esperando > 0}
            className="col-span-2 sm:col-span-1"
          />
          <p className="col-span-2 text-[11px] text-ink-faint sm:hidden">
            Los porcentajes comparan con la semana anterior.
          </p>
        </section>
      ) : (
        <section aria-label="Resumen" className="grid gap-3 sm:grid-cols-3">
          <TarjetaKpi
            icono="actividad"
            etiqueta="Acciones hoy"
            valor={totalHoy}
            pie={{ texto: "De todas tus automatizaciones" }}
            href="/panel/actividad"
          />
          <TarjetaKpi
            icono="pendientes"
            etiqueta="Requieren tu atención"
            valor={requierenAtencion.length}
            pie={
              requierenAtencion.length > 0
                ? { texto: "Revisalos cuando puedas", clase: "text-warn" }
                : { texto: "Todo al día", clase: "text-ok" }
            }
            href="/panel/pendientes"
            alerta={requierenAtencion.length > 0}
          />
          <TarjetaKpi
            icono="automatizaciones"
            etiqueta="Automatizaciones activas"
            valor={activas.length}
            pie={{ texto: `${asignaciones.length} contratadas` }}
            href="/panel/automatizaciones"
          />
        </section>
      )}

      {/* ---------- Agente de WhatsApp ---------- */}
      {agente && actividadWa ? (
        <section className="grid gap-[18px] lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-[18px]">
            <Caja>
              <EncabezadoBloque titulo="Actividad de WhatsApp">
                <SelectorRango rango={rango} />
              </EncabezadoBloque>
              <GraficaWhatsapp datos={actividadWa} rango={rango} />
            </Caja>

            <Caja>
              <EncabezadoBloque titulo="Conversaciones recientes" enlace={{ href: "/panel/agente/conversaciones", texto: "Ver todas" }} />
              <ConversacionesRecientes items={conversaciones} />
            </Caja>
          </div>

          <div className="flex min-w-0 flex-col gap-[18px]">
            <Caja>
              <EncabezadoBloque titulo="Últimas actividades" enlace={{ href: "/panel/agente", texto: "Resumen del agente" }} />
              <Movimientos items={movimientos} />
            </Caja>

            <Caja>
              <EncabezadoBloque titulo="Próximas citas" enlace={{ href: "/panel/agente/citas", texto: "Ver agenda" }} />
              <ProximasCitas citas={proximas} />
            </Caja>
          </div>
        </section>
      ) : null}

      {/* ---------- Automatizaciones que no son el Agente ---------- */}
      {conGenerico ? (
        <section className="grid gap-[18px] xl:grid-cols-[1.65fr_1fr]">
          <Caja>
            <CajaHead eyebrow="Actividad" titulo="Acciones automatizadas · últimos 14 días">
              <Link
                href="/panel/actividad"
                className="-my-2 py-2 pl-2 text-xs font-medium whitespace-nowrap text-ink-mute transition-colors hover:text-ink"
              >
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

            {medidores.length > 0 ? (
              <div className="mt-4 grid gap-4 border-t border-line pt-4 sm:grid-cols-3">
                {medidores.map((m) => (
                  <Medidor key={m.etiqueta} {...m} />
                ))}
              </div>
            ) : null}
          </Caja>

          <Caja>
            <CajaHead eyebrow="Últimos movimientos" titulo="De tus otras automatizaciones" />
            {actividad.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-[12.5px] text-ink-faint">
                Todavía no hay movimientos.
              </p>
            ) : (
              <ul className="flex flex-col">
                {actividad.map((a) => (
                  <li key={a.id} className="flex gap-3 py-2.5">
                    <time className="w-[88px] flex-none pt-px font-mono text-[10.5px] text-ink-faint">{a.cuando}</time>
                    <span className="mt-1.5 h-[7px] w-[7px] flex-none rounded-full bg-ink-soft ring-[3px] ring-white/6" aria-hidden="true" />
                    <p className="text-[12.5px] text-ink-soft">
                      <span className="font-medium">{a.automatizacion}</span> — {a.descripcion}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Caja>
        </section>
      ) : null}

      {/* ---------- Pendientes ---------- */}
      {pendientes.length > 0 ? (
        <Caja>
          <CajaHead eyebrow="Pendientes" titulo={`Requieren tu atención · ${pendientes.length}`}>
            <Link
              href="/panel/pendientes"
              className="-my-2 py-2 pl-2 text-xs font-medium whitespace-nowrap text-ink-mute transition-colors hover:text-ink"
            >
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
                <span className={`mt-1.5 h-[7px] w-[7px] flex-none rounded-full ${GRAVEDAD[p.gravedad]}`} aria-hidden="true" />
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
      ) : null}

      {/* ---------- Tus automatizaciones ---------- */}
      <section>
        <EncabezadoBloque
          titulo={`Tus automatizaciones · ${asignaciones.length} contratada${asignaciones.length === 1 ? "" : "s"}`}
          enlace={{ href: "/panel/automatizaciones", texto: "Ver todas" }}
        />
        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {asignaciones.map((a) => (
            <TarjetaContratada key={a.id} asignacion={a} />
          ))}
          <TarjetaSumar />
        </div>
      </section>
    </>
  );
}
