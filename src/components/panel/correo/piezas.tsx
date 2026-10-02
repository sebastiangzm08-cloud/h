/* ==========================================================================
   Piezas de la pantalla de Correo (Fase 4a del rediseño). Componentes de
   servidor, sin estado: la conversación abierta va en la URL (`?c=<id>`) y
   todo se dibuja en el primer render.

   REGLA DE DISEÑO (Sebastian, 2026-09-13): correo NUNCA se dibuja como chat.
   Cada mensaje es una tarjeta de ancho completo con De/fecha arriba y el
   cuerpo abajo, nunca una burbuja alineada a un lado. La bandeja (lista) sí
   se parece al resto del panel.
   ========================================================================== */
import Link from "next/link";
import { claveDia } from "@/components/panel/agenda/armar";
import { Avatar, Etiqueta, Pildora, PildoraCliente } from "@/components/panel/clientes/piezas";
import type { ContactoCorreo, ConversacionCorreo, MensajeCorreo } from "@/lib/panel/agente";
import { fechaCorta, hora, relativa } from "@/lib/panel/agente-formato";
import { cn } from "@/lib/utils";

/** En la bandeja: la hora si fue hoy, "ayer" / "hace 3 días" si es más viejo. */
export function cuandoLista(iso: string) {
  return claveDia(iso) === claveDia(Date.now()) ? hora(iso) : relativa(iso);
}

/** En el hilo: la hora si fue hoy; si no, el día también ("Mié 23 · 2:10 p.m."). */
export function cuandoMensaje(iso: string) {
  return claveDia(iso) === claveDia(Date.now()) ? hora(iso) : fechaCorta(iso);
}

export function EstadoConversacionCorreo({ estado }: { estado: ConversacionCorreo["estado"] }) {
  if (estado === "espera") return <Pildora tono="warn">Espera a vos</Pildora>;
  if (estado === "humano") return <Pildora tono="ok">Lo tomaste vos</Pildora>;
  return <Pildora tono="acento">El agente</Pildora>;
}

/* -------------------------------------------------------------------------
   Bandeja
   ------------------------------------------------------------------------- */

export function ItemConversacion({
  conversacion: x,
  activa,
  filtro,
  indice,
}: {
  conversacion: ConversacionCorreo;
  activa: boolean;
  filtro: string;
  indice: number;
}) {
  return (
    <li className="fila-entra" style={{ animationDelay: `${Math.min(indice, 10) * 25}ms` }}>
      <Link
        href={`/panel/agente/correo?f=${filtro}&c=${x.id}`}
        prefetch={false}
        aria-current={activa ? "true" : undefined}
        className={cn(
          "flex min-h-[76px] items-start gap-3 border-b border-line px-4 py-3.5 transition-colors",
          activa ? "bg-surface-2 shadow-[inset_2px_0_0_var(--panel-acento)]" : "hover:bg-surface-2/60"
        )}
      >
        <Avatar nombre={x.nombre} />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span className="truncate text-[13.5px] font-medium text-ink">{x.nombre}</span>
            <span className="ml-auto flex-none font-mono text-[10.5px] text-ink-faint">
              {cuandoLista(x.ultimoEn)}
            </span>
          </span>
          <span className="mt-0.5 block truncate text-[12.5px] text-ink-mute">{x.ultimoMensaje || "—"}</span>
          <span className="mt-2 flex flex-wrap items-center gap-1.5">
            <EstadoConversacionCorreo estado={x.estado} />
            {x.etiquetas.slice(0, 1).map((e) => (
              <Etiqueta key={e}>{e}</Etiqueta>
            ))}
          </span>
        </span>
      </Link>
    </li>
  );
}

/* -------------------------------------------------------------------------
   Hilo
   ------------------------------------------------------------------------- */

/** Tarjeta al estilo de un correo de verdad: encabezado De + fecha, cuerpo
    abajo. La barra izquierda dice quién la mandó: violeta el agente, verde
    una persona (vos); sin barra, lo que escribió el contacto. */
export function MensajeTarjeta({ m, contacto }: { m: MensajeCorreo; contacto: ContactoCorreo | null }) {
  if (m.autor === "sistema") {
    return (
      <p className="flex items-center gap-2 self-center py-1 text-center font-mono text-[10.5px] text-ink-faint">
        <span className="h-px w-6 bg-line" aria-hidden="true" />
        {m.texto}
        <span className="h-px w-6 bg-line" aria-hidden="true" />
      </p>
    );
  }

  const mio = m.autor === "agente" || m.autor === "humano";
  const nombreContacto = contacto?.nombre || "el contacto";
  const correoContacto = contacto?.correo || "";

  return (
    <article
      className={cn(
        "flex-none rounded-xl border px-4 py-3 text-[13.5px] leading-relaxed",
        mio ? "border-line bg-surface-2" : "border-line bg-surface",
        m.autor === "agente" && "border-l-2 border-l-[var(--panel-acento)]",
        m.autor === "humano" && "border-l-2 border-l-ok/70"
      )}
    >
      <header className="mb-2.5 flex items-baseline justify-between gap-3 border-b border-line/70 pb-2">
        <span className="min-w-0 truncate">
          <span className="font-medium text-ink">{mio ? "Ustedes" : nombreContacto}</span>
          {!mio && correoContacto ? (
            <span className="ml-1.5 font-mono text-[11px] text-ink-faint max-sm:hidden">
              &lt;{correoContacto}&gt;
            </span>
          ) : null}
        </span>
        <span className="flex-none font-mono text-[10.5px] text-ink-faint">
          {cuandoMensaje(m.creadoEn)}
          {m.autor === "humano" ? " · vos" : m.autor === "agente" ? " · el agente" : ""}
        </span>
      </header>
      <div className="text-ink-soft [overflow-wrap:anywhere]">
        {m.texto.split("\n").map((linea, i) =>
          linea ? (
            <p key={i} className={i > 0 ? "mt-2" : ""}>
              {linea}
            </p>
          ) : null
        )}
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------
   Ficha del contacto (solo en pantallas muy anchas)
   ------------------------------------------------------------------------- */

export function FichaContacto({ contacto }: { contacto: ContactoCorreo }) {
  return (
    <div className="px-4 py-5">
      <div className="flex flex-col items-center gap-2.5 border-b border-line pb-4 text-center">
        <Avatar nombre={contacto.nombre || contacto.correo} className="h-14 w-14 text-base" />
        <div className="min-w-0 max-w-full">
          <h3 className="truncate text-sm font-medium text-ink">{contacto.nombre || "Sin nombre"}</h3>
          <p className="mt-0.5 font-mono text-xs break-all text-ink-mute">{contacto.correo}</p>
        </div>
        <PildoraCliente estado={contacto.estado} />
      </div>

      {contacto.etiquetas.length > 0 ? (
        <div className="border-b border-line py-4">
          <p className="mb-2.5 font-mono text-[10px] tracking-[0.11em] text-ink-faint uppercase">Etiquetas</p>
          <div className="flex flex-wrap gap-1.5">
            {contacto.etiquetas.map((e) => (
              <Etiqueta key={e}>{e}</Etiqueta>
            ))}
          </div>
        </div>
      ) : null}

      {contacto.notas ? (
        <div className="py-4">
          <p className="mb-2.5 font-mono text-[10px] tracking-[0.11em] text-ink-faint uppercase">Notas</p>
          <p className="text-[12.5px] leading-relaxed text-ink-mute [overflow-wrap:anywhere]">{contacto.notas}</p>
        </div>
      ) : null}
    </div>
  );
}
