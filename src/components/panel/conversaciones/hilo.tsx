/* ==========================================================================
   El hilo de mensajes (componente de servidor).

   `flex-col-reverse` + arreglo invertido: el truco de siempre para que el
   hilo cargue YA pegado al último mensaje, sin JavaScript y sin el salto de
   "carga arriba y después baja" — como abrís un chat de WhatsApp de verdad.
   Mientras la persona no se haya subido a leer más arriba, un mensaje nuevo
   queda a la vista sin saltos (el scroll en 0 es el borde de abajo).

   Se separan los días ("Hoy", "Ayer", "Lun 5 oct") porque cada burbuja solo
   lleva la hora.
   ========================================================================== */
import { Icono } from "@/components/panel/iconos";
import { Vacio } from "@/components/panel/agente-ui";
import { hora, type MensajeAgente } from "@/lib/panel/agente";
import { etiquetaDia, nombreHerramienta } from "@/lib/panel/conversaciones";
import { pesoLegible } from "@/lib/panel/medios-reglas";
import { cn } from "@/lib/utils";

type Item =
  | { tipo: "dia"; clave: string; texto: string }
  | { tipo: "mensaje"; m: MensajeAgente };

export function Hilo({ mensajes }: { mensajes: MensajeAgente[] }) {
  const items: Item[] = [];
  let ultimoDia = "";
  for (const m of mensajes) {
    const dia = etiquetaDia(m.creadoEn);
    if (dia.clave !== ultimoDia) {
      items.push({ tipo: "dia", clave: dia.clave, texto: dia.texto });
      ultimoDia = dia.clave;
    }
    items.push({ tipo: "mensaje", m });
  }
  items.reverse();

  return (
    <div
      role="log"
      aria-label="Mensajes de la conversación"
      className="scroll-fino flex min-h-0 flex-1 flex-col-reverse gap-2.5 overflow-y-auto overscroll-contain px-3 py-4 sm:px-5 sm:py-6"
    >
      {items.length === 0 ? (
        <Vacio>Esta conversación todavía no tiene mensajes.</Vacio>
      ) : (
        items.map((it) =>
          it.tipo === "dia" ? (
            <p
              key={`d-${it.clave}`}
              className="self-center rounded-full bg-surface-3 px-3 py-1 font-mono text-[10.5px] tracking-[0.06em] text-ink-mute"
            >
              {it.texto}
            </p>
          ) : (
            <Mensaje key={it.m.id} m={it.m} />
          )
        )
      )}
    </div>
  );
}

const NOMBRE_ARCHIVO: Record<string, string> = {
  imagen: "Foto",
  video: "Video",
  sticker: "Sticker",
  documento: "Documento",
};

/**
 * Lo que va arriba del texto en una burbuja con archivo. Tocar la foto la
 * abre en grande en otra pestaña (la URL firmada dura una hora). Si el
 * archivo no se pudo guardar, queda la etiqueta y el porqué, nunca un hueco.
 */
function Archivo({ m }: { m: MensajeAgente }) {
  const url = m.archivo?.url ?? null;
  const nombre = NOMBRE_ARCHIVO[m.tipo] ?? "Archivo";

  if (!url) {
    return (
      <p className="mb-1 flex items-center gap-2 font-mono text-[11px] text-ink-mute">
        <Icono nombre={m.tipo === "documento" ? "documento" : "imagen"} className="h-3.5 w-3.5" />
        {nombre} · no disponible
      </p>
    );
  }

  if (m.tipo === "imagen") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="-mx-1.5 -mt-1 mb-1.5 block overflow-hidden rounded-xl bg-surface-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--panel-acento)] sm:w-[20rem]"
        aria-label="Abrir la foto en grande"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- URL firmada temporal del bucket privado */}
        <img
          src={url}
          alt={m.texto ? `Foto: ${m.texto}` : "Foto enviada por WhatsApp"}
          loading="lazy"
          decoding="async"
          className="block max-h-80 w-full object-cover"
        />
      </a>
    );
  }

  if (m.tipo === "video") {
    return (
      <video
        controls
        playsInline
        preload="metadata"
        src={url}
        className="-mx-1.5 -mt-1 mb-1.5 block max-h-80 w-[calc(100%+0.75rem)] max-w-none rounded-xl bg-black sm:w-[20rem]"
      />
    );
  }

  /* Documento: tarjeta con nombre y peso; se abre o descarga en otra pestaña. */
  const peso = m.archivo?.bytes ? pesoLegible(m.archivo.bytes) : null;
  const ext = m.archivo?.nombre?.match(/\.([a-z0-9]{1,5})$/i)?.[1]?.toUpperCase();
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="-mx-1 mb-1.5 flex min-h-11 items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 transition-colors hover:bg-surface-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--panel-acento)]"
    >
      <span className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-surface-3 text-ink-mute">
        <Icono nombre="documento" className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-ink">{m.archivo?.nombre || "Documento"}</span>
        <span className="block font-mono text-[10.5px] text-ink-mute">
          {[ext, peso].filter(Boolean).join(" · ") || "Abrir"}
        </span>
      </span>
    </a>
  );
}

/** Solo las herramientas que se conocen, con su nombre legible. */
function herramientasLegibles(m: MensajeAgente) {
  return m.herramientas.flatMap((h) => {
    const nombre = nombreHerramienta(h);
    return nombre ? [nombre.toLowerCase()] : [];
  });
}

function Mensaje({ m }: { m: MensajeAgente }) {
  /* Un hecho, no un mensaje: "Andrea tomó la conversación". Va centrado y sin
     burbuja para que no se confunda con algo que alguien escribió. */
  if (m.autor === "sistema") {
    return (
      <p className="flex items-center gap-2 self-center py-1 text-center font-mono text-[10.5px] leading-snug text-ink-mute">
        <span className="h-px w-4 flex-none bg-line sm:w-6" />
        <span className="min-w-0">{m.texto}</span>
        <span className="h-px w-4 flex-none bg-line sm:w-6" />
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
          La IA pidió ayuda
        </p>
        {/* El resumen viene en líneas etiquetadas (PIDE / ESTADO / BLOQUEO /
            SIGUIENTE). Si se juntan en un párrafo se pierde justo lo que hace
            que se lea de un vistazo. */}
        {m.texto.split("\n").map((linea, i) =>
          linea.trim() ? (
            <p key={i} className={cn("text-[13px] leading-snug text-ink-soft [overflow-wrap:anywhere]", i > 0 && "mt-1")}>
              {linea}
            </p>
          ) : null
        )}
      </div>
    );
  }

  const mio = m.autor === "agente" || m.autor === "humano";

  /* El sticker va suelto, sin burbuja, como en WhatsApp. */
  if (m.tipo === "sticker" && m.archivo?.url) {
    return (
      <div className={cn("flex flex-col gap-1", mio ? "items-end" : "items-start")}>
        {/* eslint-disable-next-line @next/next/no-img-element -- URL firmada temporal del bucket privado */}
        <img src={m.archivo.url} alt="Sticker" loading="lazy" decoding="async" className="h-32 w-32 object-contain" />
        <span className="font-mono text-[10px] text-ink-mute">{hora(m.creadoEn)}</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1", mio ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-[1.45] [overflow-wrap:anywhere] sm:max-w-[78%] sm:text-[13.5px]",
          mio
            ? "rounded-br-[5px] border border-ok/25 bg-ok/[0.13] text-ink-soft"
            : "rounded-bl-[5px] border border-line bg-surface-2 text-ink-soft"
        )}
      >
        {m.tipo === "audio" ? (
          <>
            <p className="flex items-center gap-2 font-mono text-[11px] text-ink-mute">
              <Icono nombre="actividad" className="h-3.5 w-3.5" />
              Nota de voz
            </p>
            {m.archivo?.url ? (
              <audio controls preload="none" src={m.archivo.url} className="mt-2 h-10 w-64 max-w-full" />
            ) : null}
            {m.transcripcion ? (
              <p className="mt-2 border-t border-dashed border-line-strong pt-2 text-[13px] text-ink-mute italic">
                «{m.transcripcion}»
              </p>
            ) : null}
          </>
        ) : (
          <>
            {m.tipo !== "texto" ? <Archivo m={m} /> : null}
            {m.texto.split("\n").map((linea, i) =>
              linea ? (
                <p key={i} className={i > 0 ? "mt-2" : ""}>
                  {linea}
                </p>
              ) : null
            )}
          </>
        )}
        <span className="mt-1.5 block font-mono text-[10px] text-ink-mute">
          {hora(m.creadoEn)}
          {m.autor === "humano" ? " · vos" : m.autor === "agente" ? " · IA" : ""}
        </span>
      </div>

      {herramientasLegibles(m).length > 0 ? (
        <p className="font-mono text-[10px] text-ink-mute">
          consultó <span className="text-ok">{herramientasLegibles(m).join(" · ")}</span>
        </p>
      ) : null}
    </div>
  );
}
