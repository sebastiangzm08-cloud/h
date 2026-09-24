import Link from "next/link";
import { Vacio, Tag, EstadoPill } from "@/components/panel/agente-ui";
import { Icono } from "@/components/panel/iconos";
import { Redactar } from "@/components/panel/agente-redactar";
import {
  enModoEjemplo,
  getContactos,
  getConversaciones,
  getMensajes,
  hora,
  type ConversacionAgente,
  type MensajeAgente,
} from "@/lib/panel/agente";
import { cn } from "@/lib/utils";

/* ==========================================================================
   La bandeja.

   La conversación abierta va en la URL (`?c=<id>`) a propósito, no en estado
   de React: así el enlace "Atenderla" del Resumen puede abrir una concreta,
   se puede compartir, y el botón Atrás del navegador funciona. Todo esto
   renderiza en el servidor; no hace falta JavaScript para leer un hilo.
   ========================================================================== */

const FILTROS = [
  { clave: "todas", texto: "Todas" },
  { clave: "espera", texto: "Esperan a vos" },
  { clave: "agente", texto: "El agente" },
  { clave: "humano", texto: "Las tomaste vos" },
] as const;

type Filtro = (typeof FILTROS)[number]["clave"];

function iniciales(nombre: string) {
  const p = nombre.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase() || "··";
}

export default async function ConversacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string; f?: string }>;
}) {
  const { c, f } = await searchParams;
  const filtro: Filtro = (FILTROS.find((x) => x.clave === f)?.clave ?? "todas") as Filtro;

  const [todas, contactos, ejemplo] = await Promise.all([
    getConversaciones(),
    getContactos(),
    enModoEjemplo(),
  ]);

  const lista = filtro === "todas" ? todas : todas.filter((x) => x.estado === filtro);
  const abierta = lista.find((x) => x.id === c) ?? lista[0] ?? null;
  const mensajes = abierta ? await getMensajes(abierta.id) : [];
  const contacto = abierta ? contactos.find((x) => x.id === abierta.contactoId) ?? null : null;
  /* En celular no caben la lista y el hilo lado a lado — se muestra uno u
     otro. `abierta` siempre trae algo por defecto (para que el escritorio
     arranque con la primera conversación ya abierta), así que el toggle de
     celular se decide por si `c` vino explícito en la URL, no por `abierta`. */
  const conversacionElegida = Boolean(c);

  const cuenta = (clave: Filtro) =>
    clave === "todas" ? todas.length : todas.filter((x) => x.estado === clave).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex flex-none flex-wrap items-center gap-2.5 border-b border-line bg-surface px-4 py-3">
        {FILTROS.map((x) => {
          const n = cuenta(x.clave);
          const activo = x.clave === filtro;
          return (
            <Link
              key={x.clave}
              href={`/panel/agente/conversaciones?f=${x.clave}`}
              aria-current={activo ? "true" : undefined}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                activo
                  ? "border-ink bg-ink font-medium text-paper"
                  : "border-line bg-surface-2 text-ink-mute hover:border-line-strong hover:text-ink-soft"
              )}
            >
              {x.texto}
              <span className="ml-1.5 font-mono opacity-70 tabular-nums">{n}</span>
            </Link>
          );
        })}
        {ejemplo ? (
          <span className="ml-auto font-mono text-[11px] text-ink-faint">datos de ejemplo</span>
        ) : null}
      </div>

      {/* min-h-0 es lo que hace que esta fila SÍ pueda encogerse dentro del
          contenedor de arriba (ocupa el alto que deja la barra superior) — sin esto, cada columna crece con su contenido y
          termina estirando la página entera en vez de scrollear por dentro,
          como pasaba antes. */}
      <div className="grid min-h-0 flex-1 md:grid-cols-[300px_1fr] xl:grid-cols-[300px_1fr_290px]">
        {/* ---------- lista ---------- */}
        <div
          className={cn(
            "scroll-fino min-h-0 overflow-y-auto border-line max-md:border-b md:border-r",
            conversacionElegida && "max-md:hidden"
          )}
        >
          {lista.length === 0 ? (
            <Vacio>No hay conversaciones con ese filtro.</Vacio>
          ) : (
            <ul>
              {lista.map((x, i) => (
                <li key={x.id} className="fila-entra" style={{ animationDelay: `${Math.min(i, 10) * 25}ms` }}>
                  <Link
                    href={`/panel/agente/conversaciones?f=${filtro}&c=${x.id}`}
                    aria-current={abierta?.id === x.id ? "true" : undefined}
                    className={cn(
                      "flex items-start gap-3 border-b border-line px-4 py-3.5 transition-colors",
                      abierta?.id === x.id
                        ? "bg-surface-2 shadow-[inset_2px_0_0_var(--color-ink)]"
                        : "hover:bg-surface"
                    )}
                  >
                    <span className="grid h-8 w-8 flex-none place-items-center rounded-full border border-line-strong bg-surface-3 font-mono text-[11px] text-ink-mute">
                      {iniciales(x.nombre)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2">
                        <span className="truncate text-[13px] font-medium text-ink">
                          {x.nombre}
                        </span>
                        <span className="ml-auto flex-none font-mono text-[10px] text-ink-faint">
                          {hora(x.ultimoEn)}
                        </span>
                      </span>
                      <span className="mt-1 block truncate text-xs text-ink-mute">
                        {x.ultimoMensaje}
                      </span>
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        <EtiquetaEstado estado={x.estado} />
                        {x.etiquetas.slice(0, 1).map((e) => (
                          <Tag key={e}>{e}</Tag>
                        ))}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ---------- hilo ---------- */}
        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-col overflow-hidden border-line xl:border-r",
            !conversacionElegida && "max-md:hidden"
          )}
        >
          {!abierta ? (
            <Vacio>Elegí una conversación de la lista.</Vacio>
          ) : (
            <>
              <div className="flex flex-none items-center gap-3 border-b border-line px-5 py-3">
                <Link
                  href={`/panel/agente/conversaciones?f=${filtro}`}
                  className="-ml-1.5 flex-none rounded-lg p-1.5 text-ink-mute transition-colors hover:bg-surface-2 md:hidden"
                  aria-label="Volver a la lista"
                >
                  <Icono nombre="flecha" className="h-4 w-4 rotate-180" />
                </Link>
                <span className="grid h-8 w-8 flex-none place-items-center rounded-full border border-line-strong bg-surface-3 font-mono text-[11px] text-ink-mute">
                  {iniciales(abierta.nombre)}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-medium text-ink">{abierta.nombre}</h2>
                  <p className="font-mono text-[11px] text-ink-faint">
                    {abierta.telefono} · WhatsApp
                  </p>
                </div>
              </div>

              {/* flex-col-reverse + arreglo invertido: el truco de siempre
                  para que un hilo cargue YA scrolleado hasta el último
                  mensaje, sin JavaScript — como abrís un chat de WhatsApp de
                  verdad, nunca arriba del todo. */}
              <div className="scroll-fino flex min-h-0 flex-1 flex-col-reverse gap-2.5 overflow-y-auto px-5 py-6">
                {mensajes.length === 0 ? (
                  <Vacio>Esta conversación todavía no tiene mensajes.</Vacio>
                ) : (
                  [...mensajes].reverse().map((m) => <Mensaje key={m.id} m={m} />)
                )}
              </div>

              <Redactar conversacion={abierta} />
            </>
          )}
        </div>

        {/* ---------- ficha del contacto ---------- */}
        <div className="scroll-fino hidden min-h-0 overflow-y-auto xl:block">
          {contacto ? (
            <div className="px-4 py-5">
              <div className="flex flex-col items-center gap-2.5 border-b border-line pb-4 text-center">
                <span className="grid h-13 w-13 place-items-center rounded-full border border-line-strong bg-surface-3 font-mono text-base text-ink-mute">
                  {iniciales(contacto.nombre)}
                </span>
                <div>
                  <h3 className="text-sm font-medium text-ink">{contacto.nombre}</h3>
                  <p className="mt-0.5 font-mono text-xs text-ink-mute">{contacto.telefono}</p>
                </div>
                <EstadoContacto estado={contacto.estado} />
              </div>

              {contacto.etiquetas.length > 0 ? (
                <div className="border-b border-line py-4">
                  <p className="mb-2.5 font-mono text-[10px] tracking-[0.11em] text-ink-faint uppercase">
                    Etiquetas
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {contacto.etiquetas.map((e) => (
                      <Tag key={e}>{e}</Tag>
                    ))}
                  </div>
                </div>
              ) : null}

              {contacto.notas ? (
                <div className="py-4">
                  <p className="mb-2.5 font-mono text-[10px] tracking-[0.11em] text-ink-faint uppercase">
                    Notas
                  </p>
                  <p className="text-[12.5px] leading-relaxed text-ink-mute">{contacto.notas}</p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Piezas del hilo
   ------------------------------------------------------------------------- */

function EtiquetaEstado({ estado }: { estado: ConversacionAgente["estado"] }) {
  if (estado === "espera")
    return (
      <span className="rounded border border-warn/45 bg-warn/10 px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.04em] text-warn uppercase">
        Espera a vos
      </span>
    );
  if (estado === "humano")
    return (
      <span className="rounded border border-line-strong px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.04em] text-ink-soft uppercase">
        Lo tomaste vos
      </span>
    );
  return (
    <span className="rounded border border-ok/40 bg-ok/10 px-1.5 py-0.5 font-mono text-[9.5px] tracking-[0.04em] text-ok uppercase">
      El agente
    </span>
  );
}

function EstadoContacto({ estado }: { estado: string }) {
  const mapa: Record<string, { texto: string; tono: "agendado" | "cliente" | "perdido" | "neutro" }> = {
    nuevo: { texto: "Contacto nuevo", tono: "neutro" },
    pregunto_precio: { texto: "Preguntó precio", tono: "neutro" },
    agendado: { texto: "Cita agendada", tono: "agendado" },
    cliente: { texto: "Cliente", tono: "cliente" },
    perdido: { texto: "No volvió", tono: "perdido" },
  };
  const x = mapa[estado] ?? mapa.nuevo;
  return <EstadoPill tono={x.tono}>{x.texto}</EstadoPill>;
}

function Mensaje({ m }: { m: MensajeAgente }) {
  /* Un hecho, no un mensaje: "Andrea tomó la conversación". Va centrado y sin
     burbuja para que no se confunda con algo que alguien escribió. */
  if (m.autor === "sistema") {
    return (
      <p className="flex items-center gap-2 self-center py-1 text-center font-mono text-[10.5px] text-ink-faint">
        <span className="h-px w-6 bg-line" />
        {m.texto}
        <span className="h-px w-6 bg-line" />
      </p>
    );
  }

  /* Nota interna: el agente hablándole al dueño. El contacto NUNCA la ve, y
     por eso se dibuja distinto a todo lo demás. */
  if (m.autor === "nota") {
    return (
      <div className="self-stretch rounded-xl border border-warn/30 bg-warn/[0.07] px-3.5 py-3">
        <p className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] text-warn uppercase">
          <Icono nombre="pendientes" className="h-3 w-3" />
          El agente pidió ayuda
        </p>
        {/* El resumen viene en líneas etiquetadas (PIDE / ESTADO / BLOQUEO /
            SIGUIENTE). Si se juntan en un párrafo se pierde justo lo que hace
            que se lea de un vistazo. */}
        {m.texto.split("\n").map((linea, i) =>
          linea.trim() ? (
            <p key={i} className={cn("text-[12.5px] text-ink-soft", i > 0 && "mt-1")}>
              {linea}
            </p>
          ) : null
        )}
      </div>
    );
  }

  const mio = m.autor === "agente" || m.autor === "humano";

  return (
    <div className={cn("flex flex-col gap-1", mio ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-xl px-3 py-2.5 text-[13px] leading-snug",
          mio
            ? "rounded-br-[4px] border border-[#2c3b34] bg-[#1f2a25] text-ink-soft"
            : "rounded-bl-[4px] border border-line bg-surface-2"
        )}
      >
        {m.tipo === "audio" ? (
          <>
            <p className="flex items-center gap-2 font-mono text-[11px] text-ink-mute">
              <Icono nombre="actividad" className="h-3.5 w-3.5" />
              Nota de voz
            </p>
            {m.transcripcion ? (
              <p className="mt-2 border-t border-dashed border-line-strong pt-2 text-[12.5px] text-ink-mute italic">
                «{m.transcripcion}»
              </p>
            ) : null}
          </>
        ) : (
          m.texto.split("\n").map((linea, i) =>
            linea ? <p key={i} className={i > 0 ? "mt-2" : ""}>{linea}</p> : null
          )
        )}
        <span className="mt-1.5 block font-mono text-[10px] text-ink-faint">
          {hora(m.creadoEn)}
          {m.autor === "humano" ? " · vos" : ""}
        </span>
      </div>

      {m.herramientas.length > 0 ? (
        <p className="font-mono text-[10px] text-ink-faint">
          consultó <span className="text-ok">{m.herramientas.join(" · ")}</span>
        </p>
      ) : null}
    </div>
  );
}

