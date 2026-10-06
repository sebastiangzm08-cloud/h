"use client";

/* ==========================================================================
   Conversaciones, versión demostración.

   Misma estructura que la pantalla real del panel (filtros, lista, hilo con
   "consultó precios · agenda", nota "La IA pidió ayuda", ficha con
   "Herramientas en uso"), pero SIN sesión ni base de datos: se dibuja con
   lo que la persona escribió en el chat de al lado. Hasta que escriba, no hay
   conversación: no se inventa ningún paciente.

   Ancho: el panel se mide a sí mismo (container queries), no la pantalla.
   Ancho → lista | hilo. Angosto → la lista y, al tocar, el hilo con "Chats"
   para volver.
   ========================================================================== */
import { useEffect, useRef, useState } from "react";
import { Icono } from "@/components/panel/iconos";
import { Pildora } from "@/components/panel/clientes/piezas";
import { NOMBRE_HERRAMIENTA, type Herramienta } from "@/lib/demo/tipos";
import { cn } from "@/lib/utils";
import { resumirConversacion, type CitaFila, type MensajeDemo } from "./estado";
import { BotonPanel, Rotulo, VacioPanel } from "./piezas";

const NOMBRE_CONTACTO = "Usted (prueba)";

type Filtro = "todas" | "agente" | "humano" | "espera";
const FILTROS: { clave: Filtro; texto: string }[] = [
  { clave: "todas", texto: "Todas" },
  { clave: "agente", texto: "IA" },
  { clave: "humano", texto: "Humanos" },
  { clave: "espera", texto: "Pendientes" },
];

function EtiquetaEstado({ estado }: { estado: "agente" | "espera" }) {
  return estado === "espera" ? (
    <span className="rounded border border-warn/45 bg-warn/10 px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.04em] text-warn uppercase">
      Pendiente
    </span>
  ) : (
    <span className="rounded border border-ok/40 bg-ok/10 px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.04em] text-ok uppercase">
      IA
    </span>
  );
}

function Avatar({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid flex-none place-items-center rounded-full border border-line-strong bg-surface-3 font-mono text-[12px] text-ink-mute",
        className
      )}
    >
      U
    </span>
  );
}

function Burbuja({ m }: { m: MensajeDemo }) {
  const mio = m.autor === "agente";
  const herramientas = (m.herramientas ?? []).map((h) => NOMBRE_HERRAMIENTA[h].toLowerCase());
  return (
    <div className={cn("demo-burbuja flex flex-col gap-1", mio ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[90%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-[1.45] [overflow-wrap:anywhere] @[620px]:max-w-[82%] @[620px]:text-[13.5px]",
          mio
            ? "rounded-br-[5px] border border-ok/25 bg-ok/[0.13] text-ink-soft"
            : "rounded-bl-[5px] border border-line bg-surface-2 text-ink-soft"
        )}
      >
        {m.texto.split("\n").map((linea, i) =>
          linea ? (
            <p key={i} className={i > 0 ? "mt-2" : ""}>
              {linea}
            </p>
          ) : null
        )}
        <span className="mt-1.5 block font-mono text-[10px] text-ink-mute">
          {m.hora}
          {mio ? " · IA" : ""}
        </span>
      </div>
      {herramientas.length > 0 ? (
        <p className="font-mono text-[10px] text-ink-mute">
          consultó <span className="text-ok">{herramientas.join(" · ")}</span>
        </p>
      ) : null}
    </div>
  );
}

export function VistaConversaciones({
  mensajes,
  citas,
  onIrAlChat,
}: {
  mensajes: MensajeDemo[];
  citas: CitaFila[];
  onIrAlChat: (texto?: string) => void;
}) {
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [abierta, setAbierta] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const conv = resumirConversacion(mensajes, citas);
  const cuentas: Record<Filtro, number> = {
    todas: conv ? 1 : 0,
    agente: conv?.estado === "agente" ? 1 : 0,
    humano: 0,
    espera: conv?.estado === "espera" ? 1 : 0,
  };
  const visible = conv && (filtro === "todas" || filtro === conv.estado);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [conv?.hilo.length, abierta]);

  if (!conv) {
    return (
      <div className="flex h-full min-h-0 flex-col justify-center overflow-y-auto">
        <VacioPanel
          icono="mensajes"
          titulo="Todavía no escribió nadie"
          accion={<BotonPanel onClick={() => onIrAlChat()}>Escribirle al agente</BotonPanel>}
        >
          Escriba un mensaje en el chat y la conversación aparece aquí al instante, tal como le
          aparecería a su equipo cuando un cliente le escribe.
        </VacioPanel>
      </div>
    );
  }

  const primeraEscalada = conv.hilo.find((m) => m.escalada);

  return (
    <div className="@container flex h-full min-h-0 flex-col">
      <nav
        aria-label="Filtrar conversaciones"
        className={cn("flex-none border-b border-line bg-surface", abierta && "@max-[619px]:hidden")}
      >
        <div className="demo-sin-barra flex gap-2 overflow-x-auto overscroll-x-contain px-3 py-2">
          {FILTROS.map((f) => {
            const activo = f.clave === filtro;
            return (
              <button
                key={f.clave}
                type="button"
                onClick={() => setFiltro(f.clave)}
                aria-pressed={activo}
                className={cn(
                  "inline-flex h-11 flex-none items-center gap-1.5 rounded-full border px-3.5 text-[13px] whitespace-nowrap transition-[background-color,border-color,color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97] @[620px]:h-9",
                  activo
                    ? "border-[var(--panel-acento-borde)] bg-[var(--panel-acento-fondo)] font-medium text-[color:var(--panel-acento-texto)]"
                    : "border-line bg-surface-2 text-ink-mute hover:border-line-strong hover:text-ink-soft"
                )}
              >
                {f.texto}
                <span
                  key={cuentas[f.clave]}
                  className={cn(
                    "demo-pop rounded-full px-1.5 font-mono text-[11px] tabular-nums",
                    activo ? "bg-[var(--panel-acento-fondo)]" : "bg-surface-3 text-ink-mute",
                    f.clave === "espera" && cuentas.espera > 0 && !activo && "bg-warn/15 text-warn"
                  )}
                >
                  {cuentas[f.clave]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] @[620px]:grid-cols-[272px_minmax(0,1fr)]">
        {/* lista */}
        <div
          className={cn(
            "scroll-fino min-h-0 overflow-y-auto overscroll-contain border-line @[620px]:border-r",
            abierta && "@max-[619px]:hidden"
          )}
        >
          {visible ? (
            <button
              type="button"
              onClick={() => setAbierta(true)}
              aria-current="true"
              className="flex min-h-[76px] w-full items-start gap-3 border-b border-line bg-[var(--panel-acento-fondo)] px-4 py-3.5 text-left shadow-[inset_2px_0_0_var(--panel-acento)] transition-colors focus-visible:-outline-offset-2 focus-visible:outline-2 active:bg-surface-3"
            >
              <Avatar className="h-10 w-10" />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className="truncate text-[14px] font-medium text-ink">{NOMBRE_CONTACTO}</span>
                  <span className="ml-auto flex-none font-mono text-[10.5px] text-ink-mute">{conv.ultimo.hora}</span>
                </span>
                <span className="mt-0.5 block truncate text-[13px] text-ink-mute">{conv.ultimo.texto}</span>
                <span className="mt-2 flex flex-wrap items-center gap-1.5">
                  <EtiquetaEstado estado={conv.estado} />
                  {conv.conCita ? (
                    <span className="rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.04em] text-ink-faint uppercase">
                      Cita agendada
                    </span>
                  ) : null}
                </span>
              </span>
            </button>
          ) : (
            <p className="px-4 py-10 text-center text-[13px] text-ink-faint">
              No hay conversaciones con ese filtro.
            </p>
          )}
        </div>

        {/* hilo */}
        <section
          aria-label="Conversación abierta"
          className={cn("flex min-h-0 flex-col", !abierta && "@max-[619px]:hidden", !visible && "@[620px]:hidden")}
        >
          <div className="flex flex-none flex-wrap items-center gap-x-1 border-b border-line bg-surface px-1.5 py-1.5 @[620px]:px-4">
            <button
              type="button"
              onClick={() => setAbierta(false)}
              aria-label="Volver a la lista de conversaciones"
              className="inline-flex h-11 flex-none items-center gap-0.5 rounded-xl pr-3 pl-1.5 text-ink-soft transition-colors hover:bg-surface-2 focus-visible:outline-2 active:bg-surface-3 @[620px]:hidden"
            >
              <Icono nombre="flecha" className="h-[18px] w-[18px] rotate-180" />
              <span className="text-[13.5px] font-medium">Chats</span>
            </button>
            <div className="flex min-w-0 flex-1 items-center gap-3 px-2 py-1">
              <Avatar className="h-10 w-10 max-sm:hidden" />
              <div className="min-w-0">
                <p className="truncate text-[14.5px] leading-tight font-medium text-ink">{NOMBRE_CONTACTO}</p>
                <p className="mt-0.5 truncate font-mono text-[11px] text-ink-mute">WhatsApp · demostración</p>
              </div>
            </div>
            <span key={conv.estado} className="demo-pop flex-none pr-2 @max-[619px]:w-full @max-[619px]:px-3 @max-[619px]:pb-1.5">
              <Pildora tono={conv.estado === "espera" ? "warn" : "ok"}>
                {conv.estado === "espera" ? "Espera a una persona" : "IA atendiendo"}
              </Pildora>
            </span>
          </div>

          {/* Herramientas en uso (la ficha del contacto en el panel real) */}
          <div className="flex-none border-b border-line bg-surface px-4 py-2.5">
            <Rotulo>Herramientas en uso</Rotulo>
            {Object.keys(conv.herramientas).length > 0 ? (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {(Object.entries(conv.herramientas) as [Herramienta, number][])
                  .sort((a, b) => b[1] - a[1])
                  .map(([h, veces]) => (
                    <span
                      key={`${h}-${veces}`}
                      className="demo-pop inline-flex items-center gap-1.5 rounded-full border border-ok/30 bg-ok/10 px-2.5 py-1 text-[12px] text-ok"
                    >
                      {NOMBRE_HERRAMIENTA[h]}
                      <span className="font-mono text-[11px] opacity-75">×{veces}</span>
                    </span>
                  ))}
              </div>
            ) : (
              <p className="mt-1 text-[12px] text-ink-mute">Todavía no consultó nada para contestar.</p>
            )}
          </div>

          <div
            ref={logRef}
            role="log"
            aria-label="Mensajes de la conversación"
            aria-live="off"
            className="scroll-fino flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-contain px-3 py-4 @[620px]:px-5"
          >
            <p className="self-center rounded-full bg-surface-3 px-3 py-1 font-mono text-[10.5px] tracking-[0.06em] text-ink-mute">
              Hoy
            </p>
            {conv.hilo.map((m) => (
              <div key={m.id} className="flex flex-col gap-2.5">
                <Burbuja m={m} />
                {m.escalada ? (
                  <>
                    <div className="demo-burbuja self-stretch rounded-xl border border-warn/30 bg-warn/[0.07] px-3.5 py-3">
                      <p className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] text-warn uppercase">
                        <Icono nombre="pendientes" className="h-3 w-3" />
                        La IA pidió ayuda
                      </p>
                      <p className="text-[13px] leading-snug text-ink-soft [overflow-wrap:anywhere]">
                        <span className="font-mono text-[10.5px] text-ink-mute">MOTIVO · </span>
                        {m.escalada.motivo}
                      </p>
                    </div>
                    {m === primeraEscalada ? (
                      <p className="flex items-center gap-2 self-center py-0.5 text-center font-mono text-[10.5px] leading-snug text-ink-mute">
                        <span className="h-px w-4 flex-none bg-line" />
                        <span className="min-w-0">La conversación quedó en «Espera a una persona»</span>
                        <span className="h-px w-4 flex-none bg-line" />
                      </p>
                    ) : null}
                  </>
                ) : null}
              </div>
            ))}
          </div>

          <p className="flex-none border-t border-line bg-surface px-4 py-2.5 text-[12px] leading-snug text-ink-mute">
            En su panel real usted también puede contestar desde aquí y pausar a la IA cuando quiera.
          </p>
        </section>
      </div>
    </div>
  );
}
