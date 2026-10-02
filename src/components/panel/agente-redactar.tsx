"use client";

/* ==========================================================================
   La caja de responder de "Conversaciones" — de verdad, ya conectada.
   Tomar el control / devolvérselo al agente vive en el encabezado del chat
   (`agente-control-chat.tsx`).

   Fase 3 (2026-09-30), celular primero:
   - Es un <textarea> que crece solo (hasta ~6 líneas): las acciones rápidas
     le ponen mensajes de varias líneas (horarios, lista de precios) y se
     tienen que poder leer y editar completos.
   - Encima van las acciones rápidas (`acciones-rapidas.tsx`), en una fila
     con desplazamiento horizontal. Ellas llaman a `ponerEnCaja`.
   - Fuente de 16 px en celular (si no, iOS hace zoom al tocar el campo),
     botón de enviar de 44 px y `env(safe-area-inset-bottom)` abajo.
   - Enter envía en computadora; en celular Enter es salto de línea (no hay
     tecla Shift cómoda), y se envía con el botón.
   - El texto SOLO se borra cuando el envío salió bien: antes se borraba al
     tocar "Enviar" y, si fallaba, se perdía lo escrito.
   ========================================================================== */
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { CampoToken } from "@/components/panel/campo-token";
import { useAccionAgente } from "@/components/panel/usar-accion-agente";
import { BarraAcciones } from "@/components/panel/conversaciones/acciones-rapidas";
import { IconoChat } from "@/components/panel/conversaciones/iconos-chat";
import type { ConversacionAgente } from "@/lib/panel/agente";
import type { DatosAcciones } from "@/lib/panel/conversaciones";

const ALTO_MAXIMO = 144;

export function Redactar({
  conversacion,
  datos,
  fueraDeVentana,
}: {
  conversacion: ConversacionAgente;
  datos: DatosAcciones;
  /** Pasaron más de 24 h desde el último mensaje de la persona. */
  fueraDeVentana: boolean;
}) {
  const campo = useRef<HTMLTextAreaElement>(null);
  const [texto, setTexto] = useState("");
  const [estadoEnvio, enviar, enviando] = useAccionAgente("enviarMensajeManual");
  const [exitoVisto, setExitoVisto] = useState<unknown>(null);
  /* El texto que se mandó: si mientras se enviaba la persona siguió
     escribiendo, no se le borra lo nuevo. */
  const [enviado, setEnviado] = useState<string | null>(null);

  /* Cuando el envío sale bien se limpia la caja. Se hace comparando el
     resultado en el render (patrón de React para "derivar estado") y no en
     un efecto, para no pintar un cuadro con el texto viejo. */
  if (estadoEnvio?.ok && estadoEnvio !== exitoVisto) {
    setExitoVisto(estadoEnvio);
    if (texto === enviado) setTexto("");
  }

  /* Altura automática: crece con el contenido hasta el tope y ahí scrollea. */
  useLayoutEffect(() => {
    const el = campo.current;
    if (!el) return;
    el.style.height = "auto";
    /* scrollHeight no cuenta los bordes: sin sumarlos aparece una barra de
       scroll de 2 px aunque el texto quepa. */
    const bordes = el.offsetHeight - el.clientHeight;
    el.style.height = `${Math.min(el.scrollHeight + bordes, ALTO_MAXIMO)}px`;
    el.style.overflowY = el.scrollHeight + bordes > ALTO_MAXIMO ? "auto" : "hidden";
  }, [texto]);

  /* Para las acciones rápidas. Si ya había algo escrito se agrega debajo
     (nunca se pisa un borrador). El foco vuelve a la caja DESPUÉS de que la
     hoja termina de cerrarse (190 ms): si no, el navegador le devuelve el
     foco al botón que la abrió. */
  const ponerEnCaja = useCallback((nuevo: string) => {
    setTexto((previo) => (previo.trim() ? `${previo.replace(/\s+$/, "")}\n\n${nuevo}` : nuevo));
    window.setTimeout(() => {
      const el = campo.current;
      if (!el) return;
      el.focus({ preventScroll: true });
      const fin = el.value.length;
      el.setSelectionRange(fin, fin);
      el.scrollTop = el.scrollHeight;
      el.classList.remove("caja-destello");
      void el.offsetWidth;
      el.classList.add("caja-destello");
    }, 260);
  }, []);

  function alEnviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!texto.trim() || enviando) return;
    setEnviado(texto);
    enviar(new FormData(e.currentTarget));
  }

  function alTeclear(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    e.preventDefault();
    e.currentTarget.form?.requestSubmit();
  }

  const atiendeAgente = conversacion.estado === "agente";

  return (
    <div className="flex-none border-t border-line bg-surface pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <BarraAcciones conversacion={conversacion} datos={datos} ponerEnCaja={ponerEnCaja} />

      {fueraDeVentana ? (
        <p className="mx-3 mt-2 rounded-xl bg-warn/10 px-3.5 py-2.5 text-[12.5px] leading-snug text-warn sm:mx-5">
          Pasaron más de 24 horas desde su último mensaje. WhatsApp puede rechazar lo que escribas hasta que la persona vuelva a escribir.
        </p>
      ) : null}

      {estadoEnvio && !estadoEnvio.ok ? (
        <p role="alert" className="mx-3 mt-2 rounded-xl bg-bad/10 px-3.5 py-2.5 text-[12.5px] leading-snug text-bad sm:mx-5">
          {estadoEnvio.error}
        </p>
      ) : null}

      <form onSubmit={alEnviar} className="flex items-end gap-2 px-3 pt-2 sm:px-5">
        <input type="hidden" name="conversacionId" value={conversacion.id} />
        <CampoToken />
        <textarea
          ref={campo}
          name="texto"
          rows={1}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={alTeclear}
          autoComplete="off"
          placeholder={atiendeAgente ? "Respondé vos (pausa a la IA)" : "Escribí un mensaje…"}
          aria-label="Escribir mensaje"
          className="min-h-11 min-w-0 flex-1 resize-none rounded-[22px] border border-line-strong bg-surface-2 px-4 py-[10px] text-[16px] leading-snug text-ink outline-none transition-colors placeholder:text-ink-mute focus:border-[var(--panel-acento)]"
        />
        <button
          type="submit"
          disabled={!texto.trim() || enviando}
          aria-label={enviando ? "Enviando…" : "Enviar mensaje"}
          className="grid h-11 w-11 flex-none place-items-center rounded-full bg-[color-mix(in_srgb,var(--panel-acento)_82%,black)] text-white transition-[transform,opacity] active:scale-95 disabled:pointer-events-none disabled:opacity-40"
        >
          {enviando ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <IconoChat nombre="enviar" className="h-[19px] w-[19px]" />
          )}
        </button>
      </form>

      {atiendeAgente ? (
        <p className="hidden px-5 pt-2 text-[11.5px] text-ink-mute sm:block">
          Si respondés vos, la IA deja de contestar en este chat hasta que se la devolvás.
        </p>
      ) : null}
    </div>
  );
}
