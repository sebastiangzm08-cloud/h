/* ==========================================================================
   Ficha de un cliente para el admin: todo de un vistazo — automatizaciones,
   cobros, conexiones, actividad — y los botones para suspender/reactivar el
   servicio y registrar pagos. (Rediseño 2026-09-30: cifras arriba, cobros
   como tarjetas en celular, acciones como botones.)
   ========================================================================== */
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Caja, CajaHead, Pill, colones } from "@/components/panel/ui";
import { Icono } from "@/components/panel/iconos";
import {
  Avatar,
  BTN_SECUNDARIO,
  Cifras,
  ESTADO_CLIENTE,
  FilaDato,
  Aviso,
  Seccion,
  TarjetaCifra,
  Vacio,
  VolverA,
  nombreServicio,
} from "@/components/admin/admin-ui";
import { getFichaCliente } from "@/lib/panel/admin";
import { relativa } from "@/lib/panel/agente-formato";
import { cn, waLinkCliente } from "@/lib/utils";
import {
  AccesoCliente,
  ConectarCorreo,
  ConectarWhatsapp,
  EliminarCliente,
  AgregarCobro,
  BotonPago,
  BotonServicio,
  EditarDatosCliente,
  FormaAgendaAdmin,
  PrecioAsignacion,
  ReenviarPlantillaRecordatorio,
} from "./acciones-cliente";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const f = await getFichaCliente(id);
  return { title: f ? `${f.nombreNegocio} · Admin Hoshizora` : "Cliente · Admin" };
}

const ESTADO_COBRO: Record<string, { texto: string; tono: "ok" | "warn" | "bad" }> = {
  pagado: { texto: "Pagado", tono: "ok" },
  pendiente: { texto: "Pendiente", tono: "warn" },
  vencido: { texto: "Vencido", tono: "bad" },
};

/** Cómo se muestra el estado de una conexión (el texto viene de la base). */
function estadoConexion(estado: string): { texto: string; tono: "ok" | "warn" | "bad" | "idle" } {
  switch (estado) {
    case "conectada":
      return { texto: "Conectada", tono: "ok" };
    case "vencida":
      return { texto: "Vencida", tono: "bad" };
    case "error":
      return { texto: "Con error", tono: "bad" };
    case "sin_conectar":
      return { texto: "Sin conectar", tono: "idle" };
    default:
      return { texto: estado.replace(/_/g, " "), tono: "warn" };
  }
}

const PUNTO_RESULTADO: Record<string, string> = {
  ok: "bg-ok",
  atencion: "bg-warn",
  aviso: "bg-warn",
  error: "bg-bad",
};

/** Un paso de la puesta en marcha: marca verde si está hecho. */
function Paso({ hecho, texto }: { hecho: boolean; texto: string }) {
  return (
    <li className="flex items-center gap-3 text-[13px]">
      <span
        className={cn(
          "grid h-6 w-6 flex-none place-items-center rounded-full",
          hecho ? "bg-ok/15 text-ok" : "bg-warn/15 text-warn"
        )}
        aria-hidden="true"
      >
        {hecho ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <path d="m5 12 5 5 9-9" />
          </svg>
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
        )}
      </span>
      <span className={hecho ? "text-ink-soft" : "text-ink-mute"}>{texto}</span>
      <span className="sr-only">{hecho ? "(hecho)" : "(pendiente)"}</span>
    </li>
  );
}

export default async function FichaClientePage({ params }: Props) {
  const { id } = await params;
  const f = await getFichaCliente(id);
  if (!f) notFound();

  const suspendido = f.estado === "pausado" || f.estado === "moroso";
  const activas = f.automatizaciones.filter((a) => a.estado === "activa");
  const ingreso = activas.reduce((s, a) => s + a.precioMensual, 0);
  const cobroPendiente = f.cobros.find((c) => c.estado !== "pagado");
  const pagados = f.cobros.filter((c) => c.estado === "pagado").length;
  const tieneRedes = f.automatizaciones.some((a) => a.slug === "redes-sociales" && a.estado === "activa");
  const pasosRedes = f.onboarding.total > 0;

  /* La puesta en marcha se cuenta por Redes (perfil, Buffer, contenido). Si
     solo tiene el Agente, se cuenta su onboarding; si no tiene ninguna de
     las dos, no aplica. */
  const puesta = pasosRedes
    ? {
        valor: f.onboarding.completo ? "Lista" : `${f.onboarding.hechos} de ${f.onboarding.total}`,
        pie: f.onboarding.completo ? "Perfil, Buffer y contenido listos" : "Faltan pasos de Redes sociales",
        tono: f.onboarding.completo ? ("ok" as const) : ("warn" as const),
      }
    : f.onboardingAgente !== null
      ? {
          valor: f.onboardingAgente ? "Lista" : "Pendiente",
          pie: "Onboarding del Agente de WhatsApp",
          tono: f.onboardingAgente ? ("ok" as const) : ("warn" as const),
        }
      : { valor: "No aplica", pie: "Sin automatizaciones que lo pidan", tono: "normal" as const };

  const estado = ESTADO_CLIENTE[f.estado];

  return (
    <>
      <VolverA href="/panel/admin/clientes">Clientes</VolverA>

      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3.5">
        <div className="flex min-w-0 flex-1 basis-[280px] items-center gap-3.5">
          <Avatar nombre={f.nombreNegocio} className="h-12 w-12 text-[14px]" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h1 className="text-[22px] leading-tight font-semibold tracking-[-0.02em] break-words text-ink">
                {f.nombreNegocio}
              </h1>
              <Pill tono={estado?.tono ?? "idle"}>{estado?.texto ?? f.estado}</Pill>
            </div>
            <p className="mt-0.5 text-[12.5px] text-ink-faint">
              {f.rubro ? `${f.rubro} · ` : ""}Plan {f.plan} · Cliente desde {f.desde}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {f.whatsapp ? (
            <a
              href={waLinkCliente(f.whatsapp, `Hola ${f.personaContacto || ""}, te escribo de Hoshizora.`)}
              target="_blank"
              rel="noopener noreferrer"
              className={BTN_SECUNDARIO}
            >
              <Icono nombre="mensajes" className="h-4 w-4" />
              Escribir por WhatsApp
            </a>
          ) : null}
          <Link href={`/panel/admin/asignar?cliente=${f.id}`} prefetch={false} className={BTN_SECUNDARIO}>
            <Icono nombre="asignar" className="h-4 w-4" />
            Asignar automatización
          </Link>
        </div>
      </div>

      {suspendido ? (
        <Aviso tono="bad" titulo={f.estado === "moroso" ? "Cliente moroso: servicio pausado" : "Servicio suspendido"}>
          {f.estado === "moroso"
            ? "Tiene un cobro vencido y sus automatizaciones están pausadas: no se publica ni se contesta nada. Al registrar el pago, y si no le queda nada pendiente, el servicio se reactiva solo."
            : "No se publica ni se contesta nada hasta reactivarlo desde «Estado del servicio»."}
        </Aviso>
      ) : null}

      <Cifras columnas={4} etiqueta="Resumen del cliente">
        <TarjetaCifra
          icono="costos"
          etiqueta="Ingreso mensual"
          valor={colones(ingreso)}
          pie={`${activas.length} de ${f.automatizaciones.length} automatizaciones activas`}
        />
        <TarjetaCifra
          icono="automatizaciones"
          etiqueta="Automatizaciones"
          valor={activas.length}
          pie={
            f.automatizaciones.length === 0
              ? "Ninguna asignada"
              : f.automatizaciones.length === activas.length
                ? "Todas activas"
                : `${f.automatizaciones.length - activas.length} en pausa`
          }
        />
        <TarjetaCifra
          icono="facturacion"
          etiqueta="Cobro pendiente"
          valor={cobroPendiente ? colones(cobroPendiente.monto) : "Al día"}
          pie={
            cobroPendiente
              ? `${cobroPendiente.periodo} · ${ESTADO_COBRO[cobroPendiente.estado]?.texto.toLowerCase() ?? cobroPendiente.estado}`
              : pagados > 0
                ? `${pagados} ${pagados === 1 ? "cobro pagado" : "cobros pagados"}`
                : "Sin cobros todavía"
          }
          tono={cobroPendiente ? (cobroPendiente.estado === "vencido" ? "bad" : "warn") : "normal"}
        />
        <TarjetaCifra
          icono="negocio"
          etiqueta="Puesta en marcha"
          valor={puesta.valor}
          pie={puesta.pie}
          tono={puesta.tono}
        />
      </Cifras>

      <section className="grid gap-[18px] lg:grid-cols-2">
        <Caja>
          <CajaHead eyebrow="Contacto" titulo="Datos" />
          <dl>
            <FilaDato k="Persona">{f.personaContacto || "—"}</FilaDato>
            <FilaDato k="Correo de acceso">{f.correo}</FilaDato>
            <FilaDato k="WhatsApp">{f.whatsapp || "—"}</FilaDato>
            <FilaDato k="Rubro">{f.rubro || "—"}</FilaDato>
            <FilaDato k="Plan">{f.plan}</FilaDato>
            {/* Cada fila de onboarding solo aparece si el cliente tiene esa
                automatización: mostrar "Sin llenar" del formulario de Redes
                a alguien que solo tiene el Agente (o al revés) sería la misma
                clase de bug que ya se corrigió en "Tu negocio" del cliente. */}
            {tieneRedes ? (
              <FilaDato k="Formulario de Redes">
                <span className={f.onboarding.completo ? "text-ok" : "text-warn"}>
                  {f.onboarding.completo ? "Completo" : "Sin llenar"}
                </span>
              </FilaDato>
            ) : null}
            {f.onboardingAgente !== null ? (
              <FilaDato k="Onboarding del Agente">
                <span className={f.onboardingAgente ? "text-ok" : "text-warn"}>
                  {f.onboardingAgente ? "Completo" : "Sin llenar"}
                </span>
              </FilaDato>
            ) : null}
          </dl>
          <div className="mt-4 flex flex-wrap items-start gap-2 border-t border-line pt-4">
            <EditarDatosCliente
              clienteId={f.id}
              datos={{
                nombreNegocio: f.nombreNegocio,
                personaContacto: f.personaContacto,
                whatsapp: f.whatsapp,
                rubro: f.rubro,
                plan: f.plan,
              }}
            />
            <AccesoCliente clienteId={f.id} correoActual={f.correo} />
          </div>
        </Caja>

        <Caja>
          <CajaHead eyebrow="Servicio" titulo="Estado y acciones" />
          <p className="mb-4 text-[13px] leading-snug text-ink-mute">
            {suspendido
              ? "Reactivá para que vuelva a publicar y a contestar."
              : f.estado === "prueba"
                ? "En prueba: no entra en la facturación automática hasta que lo actives."
                : cobroPendiente
                  ? `Tiene ${colones(cobroPendiente.monto)} de ${cobroPendiente.periodo} sin pagar.`
                  : "Al día. Todo corriendo."}
          </p>
          <BotonServicio clienteId={f.id} estadoCliente={f.estado} />
        </Caja>
      </section>

      {pasosRedes ? (
        <Seccion
          titulo="Puesta en marcha"
          sub={f.onboarding.completo ? "lista" : `${f.onboarding.hechos} de ${f.onboarding.total}`}
        >
          <Caja>
            <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8">
              <Paso hecho={f.onboarding.perfil} texto="Perfil del negocio" />
              <Paso hecho={f.onboarding.buffer} texto="Buffer conectado" />
              <Paso hecho={f.onboarding.contenido} texto="Subió contenido" />
            </ul>
          </Caja>
        </Seccion>
      ) : null}

      <Seccion
        titulo="Automatizaciones"
        sub={String(f.automatizaciones.length)}
        accion={
          f.automatizaciones.length > 0 ? (
            <Link
              href={`/panel/admin/asignar?cliente=${f.id}`}
              prefetch={false}
              className="-my-3 inline-flex min-h-11 items-center gap-1 py-3 pl-2 text-xs font-medium whitespace-nowrap text-[color:var(--panel-acento-texto)] transition-opacity hover:opacity-80"
            >
              Asignar otra
              <Icono nombre="flecha" className="h-3 w-3" />
            </Link>
          ) : undefined
        }
      >
        {f.automatizaciones.length === 0 ? (
          <Vacio
            icono="automatizaciones"
            titulo="Sin automatizaciones"
            accion={
              <Link href={`/panel/admin/asignar?cliente=${f.id}`} prefetch={false} className={BTN_SECUNDARIO}>
                Asignar una
              </Link>
            }
          >
            Todavía no tiene nada contratado: no ve ninguna automatización en su panel.
          </Vacio>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {f.automatizaciones.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-line bg-surface-2 px-4 py-2.5"
              >
                <span className="min-w-0 flex-1 basis-[180px] text-[13.5px] font-medium text-ink">{a.nombre}</span>
                <Pill tono={a.estado === "activa" ? "ok" : "idle"}>
                  {a.estado === "activa" ? "Activa" : "Pausada"}
                </Pill>
                <PrecioAsignacion clienteId={f.id} asignacionId={a.id} precio={a.precioMensual} />
              </li>
            ))}
          </ul>
        )}
      </Seccion>

      <Seccion titulo="Cobros" sub={f.cobros.length > 0 ? String(f.cobros.length) : undefined}>
        <Caja>
          <CajaHead eyebrow="Nuevo" titulo="Agregar el cobro de un mes" />
          <p className="mb-3.5 text-[12.5px] leading-snug text-ink-faint">
            El monto arranca con la suma de las automatizaciones activas ({colones(ingreso)}). Bajalo o
            ajustalo si ese mes hay promo.
          </p>
          <AgregarCobro clienteId={f.id} montoSugerido={ingreso} />
        </Caja>

        {f.cobros.length === 0 ? (
          <Vacio icono="facturacion" titulo="Sin cobros registrados">
            Cuando agregues el primero, o generes los del mes desde Pagos, aparece acá.
          </Vacio>
        ) : (
          <div className="md:overflow-hidden md:rounded-2xl md:border md:border-line md:bg-surface-2">
            <div className="hidden grid-cols-[minmax(0,1fr)_120px_120px_170px] items-center gap-4 border-b border-line bg-surface-3/40 px-5 py-2.5 md:grid">
              <span className="font-mono text-[10.5px] tracking-[0.12em] text-ink-faint uppercase">Periodo</span>
              <span className="font-mono text-[10.5px] tracking-[0.12em] text-ink-faint uppercase">Monto</span>
              <span className="font-mono text-[10.5px] tracking-[0.12em] text-ink-faint uppercase">Estado</span>
              <span className="sr-only">Acción</span>
            </div>
            <ul className="flex flex-col gap-2.5 md:gap-0">
              {f.cobros.map((c) => {
                const e = ESTADO_COBRO[c.estado];
                return (
                  <li
                    key={c.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2.5 rounded-2xl border border-line bg-surface-2 p-4 md:grid-cols-[minmax(0,1fr)_120px_120px_170px] md:rounded-none md:border-0 md:border-b md:px-5 md:py-3 md:last:border-b-0"
                  >
                    <div className="col-start-1 row-start-1 min-w-0 md:col-start-auto md:row-start-auto">
                      <p className="text-[13.5px] font-medium text-ink">{c.periodo}</p>
                      <p className="text-[11.5px] text-ink-faint">Creado el {c.creadoEn}</p>
                    </div>
                    <p className="col-start-1 row-start-2 font-mono text-[13px] text-ink-soft tabular-nums md:col-start-auto md:row-start-auto">
                      {colones(c.monto)}
                    </p>
                    <div className="col-start-2 row-start-1 justify-self-end md:col-start-auto md:row-start-auto md:justify-self-start">
                      <Pill tono={e?.tono ?? "warn"}>{e?.texto ?? c.estado}</Pill>
                    </div>
                    <div className="col-start-2 row-start-2 justify-self-end md:col-start-auto md:row-start-auto">
                      {c.estado !== "pagado" ? (
                        <BotonPago clienteId={f.id} cobroId={c.id} />
                      ) : (
                        <span className="text-[12px] text-ink-faint">Sin acción</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </Seccion>

      <section className="grid gap-[18px] lg:grid-cols-2">
        <Caja>
          <CajaHead eyebrow="Conexiones" titulo={f.conexiones.length === 0 ? "Ninguna todavía" : `${f.conexiones.length} registradas`} />
          {f.conexiones.length === 0 ? (
            <p className="mb-4 rounded-xl border border-dashed border-line px-4 py-5 text-center text-[12.5px] text-ink-faint">
              Todavía no conectó nada. Podés dejarle WhatsApp o el correo listos desde acá.
            </p>
          ) : (
            <ul className="mb-4 flex flex-col">
              {f.conexiones.map((x, i) => {
                const e = estadoConexion(x.estado);
                return (
                  <li
                    key={x.servicio}
                    className={cn("flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2.5", i > 0 && "border-t border-line")}
                  >
                    <span className="min-w-0">
                      <span className="block text-[13px] font-medium text-ink">{nombreServicio(x.servicio)}</span>
                      {x.referencia ? (
                        <span className="block truncate font-mono text-[11px] text-ink-faint">{x.referencia}</span>
                      ) : null}
                    </span>
                    <Pill tono={e.tono}>{e.texto}</Pill>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="flex flex-wrap items-start gap-2 border-t border-line pt-4">
            <ConectarWhatsapp clienteId={f.id} />
            {f.asignacionAgenteId ? <ReenviarPlantillaRecordatorio clienteId={f.id} /> : null}
            <ConectarCorreo clienteId={f.id} />
            {f.asignacionAgenteId ? (
              <FormaAgendaAdmin clienteId={f.id} agenda={f.agendaAgente} horario={f.horario} />
            ) : null}
          </div>
        </Caja>

        <Caja>
          <CajaHead eyebrow="Actividad" titulo="Últimos movimientos" />
          {f.actividad.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line px-4 py-5 text-center text-[12.5px] text-ink-faint">
              Sin actividad todavía. Cuando sus automatizaciones hagan algo, lo ves acá.
            </p>
          ) : (
            <ul className="flex flex-col">
              {f.actividad.map((x, i) => (
                <li key={x.id} className={cn("flex items-start gap-3 py-2.5", i > 0 && "border-t border-line")}>
                  <span
                    className={cn("mt-[7px] h-[7px] w-[7px] flex-none rounded-full", PUNTO_RESULTADO[x.resultado] ?? "bg-ink-faint")}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 text-[12.5px] leading-snug text-ink-soft">{x.descripcion}</span>
                  <time dateTime={x.cuandoIso} className="flex-none pt-px font-mono text-[10.5px] whitespace-nowrap text-ink-faint">
                    {relativa(x.cuandoIso)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </Caja>
      </section>

      <Seccion titulo="Zona de peligro">
        <Caja className="border-bad/25">
          <p className="mb-3.5 text-[13px] leading-snug text-ink-mute">
            Eliminar borra al cliente y todo lo suyo para siempre. Si solo querés que deje de publicar, usá
            «Suspender servicio» en «Estado y acciones».
          </p>
          <EliminarCliente clienteId={f.id} nombreNegocio={f.nombreNegocio} />
        </Caja>
      </Seccion>
    </>
  );
}
