/* ==========================================================================
   Vista general del Agente de WhatsApp (Fase 2 del rediseño, 2026-09-27).

   Decisión de Sebastian: "vista general + flujo". Las pantallas del agente
   ya viven en la barra (Conversaciones, Agenda, Conocimiento…), así que acá
   NO se duplican: cifras del mes, cómo trabaja (solo pasos que el agente de
   verdad hace, sin nombres de proveedores) y accesos directos.
   ========================================================================== */
import Link from "next/link";
import { Icono, type NombreIcono } from "@/components/panel/iconos";
import { InterruptorAgente } from "@/components/panel/interruptor-agente";
import { Caja, CajaHead } from "@/components/panel/ui";
import type { CifrasAgenteMes } from "@/lib/panel/agente";

const numero = (n: number) => n.toLocaleString("es-CR");

const PASOS: { icono: NombreIcono; titulo: string; detalle: string }[] = [
  { icono: "mensajes", titulo: "Tu cliente escribe", detalle: "Por WhatsApp, a cualquier hora. También con notas de voz." },
  { icono: "buscar", titulo: "Entiende qué necesita", detalle: "Lee el mensaje y lo que ya se habló en la conversación." },
  { icono: "documento", titulo: "Revisa lo que sabe", detalle: "Tus servicios, precios, horario y reglas de Conocimiento." },
  { icono: "calendario", titulo: "Responde o agenda", detalle: "Contesta con tus datos y agenda solo en horarios libres." },
  { icono: "campana", titulo: "Te avisa si hace falta", detalle: "Urgencias, quejas o lo que no sabe pasan a una persona." },
];

const ACCESOS: { href: string; icono: NombreIcono; titulo: string; detalle: string }[] = [
  { href: "/panel/agente/conversaciones", icono: "mensajes", titulo: "Conversaciones", detalle: "Cada chat en vivo" },
  { href: "/panel/agente/citas", icono: "calendario", titulo: "Agenda", detalle: "Citas y recordatorios" },
  { href: "/panel/agente/contactos", icono: "clientes", titulo: "Clientes", detalle: "Quién te escribió" },
  { href: "/panel/agente/que-sabe", icono: "documento", titulo: "Conocimiento", detalle: "Servicios, precios y reglas" },
  { href: "/panel/agente/correcciones", icono: "pendientes", titulo: "Lo que no supo", detalle: "Contestalo una vez" },
  { href: "/panel/agente/como-responde", icono: "ajustes", titulo: "Configuración", detalle: "Tono, trato y agenda" },
  { href: "/panel/agente/uso", icono: "actividad", titulo: "Uso y límites", detalle: "Respuestas del mes" },
  { href: "/panel/agente/conexion", icono: "conexiones", titulo: "Conexión de WhatsApp", detalle: "Estado del número" },
];

export function VistaAgente({
  activo,
  suspendido,
  cifras,
}: {
  activo: boolean;
  suspendido: boolean;
  cifras: CifrasAgenteMes;
}) {
  const datos = [
    { valor: cifras.conversaciones, etiqueta: "conversaciones", href: "/panel/agente/conversaciones" },
    { valor: cifras.respuestas, etiqueta: "respuestas del agente", href: "/panel/agente/uso" },
    { valor: cifras.citas, etiqueta: "citas agendadas", href: "/panel/agente/citas" },
    { valor: cifras.esperando, etiqueta: "esperan a una persona", href: "/panel/agente/conversaciones?f=espera", alerta: cifras.esperando > 0 },
  ];

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface-2 px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-surface-3 text-ink-soft">
            <Icono nombre="mensajes" className="h-[18px] w-[18px]" />
          </span>
          <p className="min-w-0 text-[13px] leading-snug text-ink-mute">
            {suspendido
              ? "Tu servicio está suspendido. Escribinos para reactivarlo."
              : activo
                ? "Atiende, responde y agenda por vos, las 24 horas."
                : "En pausa: no contesta. Los mensajes llegan a Conversaciones para que los contestés vos."}
          </p>
        </div>
        <InterruptorAgente activo={activo} suspendido={suspendido} />
      </div>

      <Caja>
        <CajaHead eyebrow="Este mes" titulo="Cómo va" />
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
          {datos.map((d) => (
            <Link key={d.etiqueta} href={d.href} className="group bg-surface-2 px-4 py-3.5 transition-colors hover:bg-surface-3">
              <dt className="sr-only">{d.etiqueta}</dt>
              <dd className={d.alerta ? "font-mono text-[22px] font-semibold text-warn tabular-nums" : "font-mono text-[22px] font-semibold text-ink tabular-nums"}>
                {numero(d.valor)}
              </dd>
              <dd className="mt-0.5 text-[12px] leading-snug text-ink-faint group-hover:text-ink-mute">{d.etiqueta}</dd>
            </Link>
          ))}
        </dl>
      </Caja>

      <Caja>
        <CajaHead eyebrow="Así trabaja" titulo="Qué pasa con cada mensaje" />
        <ol className="grid gap-3 md:grid-cols-5 md:gap-2">
          {PASOS.map((p, i) => (
            <li key={p.titulo} className="relative flex gap-3 md:flex-col md:items-center md:text-center">
              <span className="relative z-10 grid h-11 w-11 flex-none place-items-center rounded-xl border border-line-strong bg-surface-3 text-ink-soft">
                <Icono nombre={p.icono} className="h-[18px] w-[18px]" />
              </span>
              {i < PASOS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute top-11 left-[21px] h-[calc(100%-32px)] w-px bg-line-strong md:top-[21px] md:left-[calc(50%+26px)] md:h-px md:w-[calc(100%-52px)]"
                />
              ) : null}
              <div className="min-w-0 pb-1 md:px-1">
                <p className="text-[13px] font-medium text-ink">{p.titulo}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-ink-faint">{p.detalle}</p>
              </div>
            </li>
          ))}
        </ol>
      </Caja>

      <section aria-label="Accesos directos">
        <h2 className="mb-3 font-mono text-[11px] tracking-[0.12em] text-ink-faint uppercase">Ir a</h2>
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {ACCESOS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex min-h-[64px] items-center gap-3 rounded-xl border border-line bg-surface-2 px-3.5 py-3 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-line-strong"
            >
              <Icono nombre={a.icono} className="h-4 w-4 flex-none text-ink-mute" />
              <span className="min-w-0">
                <span className="block text-[13px] leading-snug font-medium text-ink">{a.titulo}</span>
                <span className="block text-[11.5px] leading-snug text-ink-faint">{a.detalle}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
