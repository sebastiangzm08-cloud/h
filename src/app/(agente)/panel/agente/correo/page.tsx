import Link from "next/link";
import { Vacio, Tag, EstadoPill } from "@/components/panel/agente-ui";
import { RedactarCorreo } from "@/components/panel/agente-redactar-correo";
import { BotonCorreoNuevo } from "@/components/panel/agente-correo-nuevo";
import {
  getContactosCorreo,
  getConversacionesCorreo,
  getMensajesCorreo,
  hora,
  type ContactoCorreo,
  type ConversacionCorreo,
  type MensajeCorreo,
} from "@/lib/panel/agente";
import { cn } from "@/lib/utils";

/* ==========================================================================
   La bandeja de correo — calcada a "Conversaciones" de WhatsApp
   (`conversaciones/page.tsx`), mismo motivo para cada decisión: la
   conversación abierta va en la URL (`?c=<id>`), todo renderiza en el
   servidor. Más simple que WhatsApp porque el correo no tiene audios,
   herramientas ni "notas" del agente al dueño (`correo_mensajes.autor` no
   incluye "nota").
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

export default async function CorreoPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string; f?: string }>;
}) {
  const { c, f } = await searchParams;
  const filtro: Filtro = (FILTROS.find((x) => x.clave === f)?.clave ?? "todas") as Filtro;

  const [todas, contactos] = await Promise.all([getConversacionesCorreo(), getContactosCorreo()]);

  const lista = filtro === "todas" ? todas : todas.filter((x) => x.estado === filtro);
  const abierta = lista.find((x) => x.id === c) ?? lista[0] ?? null;
  const mensajes = abierta ? await getMensajesCorreo(abierta.id) : [];
  const contacto = abierta ? contactos.find((x) => x.id === abierta.contactoId) ?? null : null;

  /* El asunto del hilo es el del último mensaje — en la práctica no cambia
     dentro de una conversación (todo es "Re: lo mismo"), como en cualquier
     cliente de correo de verdad. */
  const asuntoHilo = mensajes[mensajes.length - 1]?.asunto || "(sin asunto)";
  const asuntoRespuesta = /^re:/i.test(asuntoHilo) ? asuntoHilo : `Re: ${asuntoHilo}`;

  const cuenta = (clave: Filtro) =>
    clave === "todas" ? todas.length : todas.filter((x) => x.estado === clave).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex-none border-b border-line bg-surface px-4 pt-3">
        <BotonCorreoNuevo />
      </div>

      <div className="flex flex-none flex-wrap items-center gap-2.5 border-b border-line bg-surface px-4 py-3">
        {FILTROS.map((x) => {
          const n = cuenta(x.clave);
          const activo = x.clave === filtro;
          return (
            <Link
              key={x.clave}
              href={`/panel/agente/correo?f=${x.clave}`}
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
      </div>

      <div className="grid min-h-0 flex-1 md:grid-cols-[300px_1fr] xl:grid-cols-[300px_1fr_290px]">
        {/* ---------- lista ---------- */}
        <div className="scroll-fino min-h-0 overflow-y-auto border-line max-md:border-b md:border-r">
          {lista.length === 0 ? (
            <Vacio>
              {todas.length === 0
                ? "Todavía no hay correos. En cuanto le escriban a la casilla conectada, aparecen acá."
                : "No hay conversaciones con ese filtro."}
            </Vacio>
          ) : (
            <ul>
              {lista.map((x, i) => (
                <li key={x.id} className="fila-entra" style={{ animationDelay: `${Math.min(i, 10) * 25}ms` }}>
                  <Link
                    href={`/panel/agente/correo?f=${filtro}&c=${x.id}`}
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
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden border-line xl:border-r">
          {!abierta ? (
            <Vacio>Elegí una conversación de la lista.</Vacio>
          ) : (
            <>
              <div className="flex flex-none items-center gap-3 border-b border-line px-5 py-3">
                <span className="grid h-8 w-8 flex-none place-items-center rounded-full border border-line-strong bg-surface-3 font-mono text-[11px] text-ink-mute">
                  {iniciales(abierta.nombre)}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-medium text-ink">{abierta.nombre}</h2>
                  <p className="font-mono text-[11px] text-ink-faint">
                    {abierta.correo} · Correo
                  </p>
                </div>
              </div>

              {/* El asunto va UNA vez arriba del todo, como en cualquier
                  cliente de correo — no se repite en cada mensaje. */}
              <div className="flex-none border-b border-line bg-surface px-5 py-2">
                <p className="truncate text-[12.5px] font-medium text-ink-soft">{asuntoHilo}</p>
              </div>

              <div className="scroll-fino flex min-h-0 flex-1 flex-col-reverse gap-3 overflow-y-auto px-5 py-5">
                {mensajes.length === 0 ? (
                  <Vacio>Esta conversación todavía no tiene mensajes.</Vacio>
                ) : (
                  [...mensajes].reverse().map((m) => <Mensaje key={m.id} m={m} contacto={contacto} />)
                )}
              </div>

              <RedactarCorreo conversacion={abierta} asunto={asuntoRespuesta} />
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
                  <p className="mt-0.5 font-mono text-xs text-ink-mute">{contacto.correo}</p>
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

function EtiquetaEstado({ estado }: { estado: ConversacionCorreo["estado"] }) {
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

/* Tarjeta al estilo de un correo de verdad: encabezado De/Para + fecha,
   cuerpo abajo — nunca una burbuja alineada a un lado, que es lo que hace
   que algo se sienta "como WhatsApp" en vez de "como un correo". */
function Mensaje({ m, contacto }: { m: MensajeCorreo; contacto: ContactoCorreo | null }) {
  if (m.autor === "sistema") {
    return (
      <p className="flex items-center gap-2 self-center py-1 text-center font-mono text-[10.5px] text-ink-faint">
        <span className="h-px w-6 bg-line" />
        {m.texto}
        <span className="h-px w-6 bg-line" />
      </p>
    );
  }

  const mio = m.autor === "agente" || m.autor === "humano";
  const nombreContacto = contacto?.nombre || "el contacto";
  const correoContacto = contacto?.correo || "";

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-[13px] leading-relaxed",
        mio ? "border-l-2 border-l-ok/50 border-line bg-surface-2" : "border-line bg-surface"
      )}
    >
      <div className="mb-2.5 flex items-baseline justify-between gap-3 border-b border-line/70 pb-2">
        <span className="min-w-0 truncate">
          <span className="font-medium text-ink">{mio ? "Ustedes" : nombreContacto}</span>
          {!mio && correoContacto ? (
            <span className="ml-1.5 font-mono text-[11px] text-ink-faint">&lt;{correoContacto}&gt;</span>
          ) : null}
        </span>
        <span className="flex-none font-mono text-[10px] text-ink-faint">
          {hora(m.creadoEn)}
          {m.autor === "humano" ? " · vos" : m.autor === "agente" ? " · el agente" : ""}
        </span>
      </div>
      <div className="text-ink-soft">
        {m.texto.split("\n").map((linea, i) =>
          linea ? <p key={i} className={i > 0 ? "mt-2" : ""}>{linea}</p> : null
        )}
      </div>
    </div>
  );
}
