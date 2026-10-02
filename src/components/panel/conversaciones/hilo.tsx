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
  const archivo = m.tipo === "imagen" ? "Imagen" : m.tipo === "documento" ? "Documento" : null;

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
            {m.transcripcion ? (
              <p className="mt-2 border-t border-dashed border-line-strong pt-2 text-[13px] text-ink-mute italic">
                «{m.transcripcion}»
              </p>
            ) : null}
          </>
        ) : (
          <>
            {archivo ? (
              <p className="mb-1 flex items-center gap-2 font-mono text-[11px] text-ink-mute">
                <Icono nombre={m.tipo === "imagen" ? "imagen" : "documento"} className="h-3.5 w-3.5" />
                {archivo}
              </p>
            ) : null}
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
