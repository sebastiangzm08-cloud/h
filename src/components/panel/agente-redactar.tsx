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

   Archivos (2026-10-17): el 📎 adjunta UNA foto, video o documento; el texto
   de la caja viaja como pie. Se valida tipo y peso acá mismo (los límites de
   WhatsApp) antes de subir nada, y el servidor lo vuelve a comprobar.
   ========================================================================== */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { ACEPTA_ARCHIVOS, pesoLegible, validarArchivo } from "@/lib/panel/medios-reglas";
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
  const [estadoPlantilla, enviarPlantilla, enviandoPlantilla] = useAccionAgente("enviarPlantillaSeguimiento");

  function alEnviarPlantilla(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (enviandoPlantilla) return;
    if (!window.confirm("Se manda la plantilla de seguimiento aprobada por Meta (cuesta unos ₡38). ¿Enviarla?")) return;
    enviarPlantilla(new FormData(e.currentTarget));
  }
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

  /* ---- Archivo adjunto ---- */
  const entradaArchivo = useRef<HTMLInputElement>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  /* Cambiar la `key` del <input type="file"> lo vacía (no se puede escribir su valor). */
  const [claveEntrada, setClaveEntrada] = useState(0);
  const [estadoArchivo, enviarArchivo, enviandoArchivo] = useAccionAgente("enviarArchivoManual");
  const [exitoArchivoVisto, setExitoArchivoVisto] = useState<unknown>(null);

  if (estadoArchivo?.ok && estadoArchivo !== exitoArchivoVisto) {
    setExitoArchivoVisto(estadoArchivo);
    setArchivo(null);
    setClaveEntrada((k) => k + 1);
    if (texto === enviado) setTexto("");
  }

  const vistaPrevia = useMemo(
    () => (archivo && archivo.type.startsWith("image/") ? URL.createObjectURL(archivo) : null),
    [archivo]
  );
  useEffect(() => () => (vistaPrevia ? URL.revokeObjectURL(vistaPrevia) : undefined), [vistaPrevia]);

  function alElegirArchivo(e: ChangeEvent<HTMLInputElement>) {
    const elegido = e.target.files?.[0];
    if (!elegido) return;
    const valido = validarArchivo(elegido);
    if (!valido.ok) {
      setErrorArchivo(valido.error);
      setArchivo(null);
      setClaveEntrada((k) => k + 1);
      return;
    }
    setErrorArchivo(null);
    setArchivo(elegido);
    campo.current?.focus({ preventScroll: true });
  }

  function quitarArchivo() {
    setArchivo(null);
    setErrorArchivo(null);
    setClaveEntrada((k) => k + 1);
  }

  const ocupado = enviando || enviandoArchivo;

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
    if (ocupado) return;
    if (archivo) {
      setEnviado(texto);
      enviarArchivo(new FormData(e.currentTarget));
      return;
    }
    if (!texto.trim()) return;
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

  /* "Dejar la IA activa": se recuerda en este navegador. Se lee en un efecto
     (no en el estado inicial) para no desajustar el HTML del servidor. */
  const [dejarIA, setDejarIA] = useState(false);
  useEffect(() => {
    try {
      setDejarIA(window.localStorage.getItem("hz-dejar-ia") === "1");
    } catch {
      /* sin almacenamiento: queda apagado */
    }
  }, []);
  function alCambiarDejarIA(e: ChangeEvent<HTMLInputElement>) {
    setDejarIA(e.target.checked);
    try {
      window.localStorage.setItem("hz-dejar-ia", e.target.checked ? "1" : "0");
    } catch {
      /* sin almacenamiento: vale solo para esta sesión */
    }
  }

  return (
    <div className="flex-none border-t border-line bg-surface pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <BarraAcciones conversacion={conversacion} datos={datos} ponerEnCaja={ponerEnCaja} />

      {fueraDeVentana ? (
        <div className="mx-3 mt-2 rounded-xl bg-warn/10 px-3.5 py-2.5 text-[12.5px] leading-snug text-warn sm:mx-5">
          <p>
            Pasaron más de 24 horas desde su último mensaje. WhatsApp puede rechazar lo que escribas hasta que la persona vuelva a escribir.
          </p>
          <form onSubmit={alEnviarPlantilla} className="mt-2 flex flex-wrap items-center gap-2">
            <input type="hidden" name="conversacionId" value={conversacion.id} />
            <CampoToken />
            <button
              type="submit"
              disabled={enviandoPlantilla}
              className="min-h-9 rounded-full border border-warn/50 px-3.5 text-[12.5px] font-medium text-warn transition-colors hover:bg-warn/10 active:scale-[0.98] disabled:opacity-50"
            >
              {enviandoPlantilla ? "Enviando…" : "Enviar plantilla de seguimiento"}
            </button>
            {estadoPlantilla?.ok ? <span className="text-ok">Plantilla enviada.</span> : null}
          </form>
        </div>
      ) : null}

      {[
        estadoEnvio && !estadoEnvio.ok ? estadoEnvio.error : null,
        estadoArchivo && !estadoArchivo.ok ? estadoArchivo.error : null,
        estadoPlantilla && !estadoPlantilla.ok ? estadoPlantilla.error : null,
        errorArchivo,
      ]
        .filter(Boolean)
        .map((error) => (
          <p key={error} role="alert" className="mx-3 mt-2 rounded-xl bg-bad/10 px-3.5 py-2.5 text-[12.5px] leading-snug text-bad sm:mx-5">
            {error}
          </p>
        ))}

      {archivo ? (
        <div className="mx-3 mt-2 flex items-center gap-3 rounded-2xl border border-line bg-surface-2 py-2 pr-1 pl-2 sm:mx-5">
          {vistaPrevia ? (
            // eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:) antes de subir
            <img src={vistaPrevia} alt="" className="h-12 w-12 flex-none rounded-lg object-cover" />
          ) : (
            <span className="grid h-12 w-12 flex-none place-items-center rounded-lg bg-surface-3 text-ink-mute">
              <IconoChat nombre={archivo.type.startsWith("video/") ? "video" : "documento"} className="h-5 w-5" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ink">{archivo.name}</p>
            <p className="font-mono text-[11px] text-ink-mute" aria-live="polite">
              {pesoLegible(archivo.size)} · {enviandoArchivo ? "Enviando…" : "El texto de abajo va como pie (opcional)"}
            </p>
          </div>
          <button
            type="button"
            onClick={quitarArchivo}
            disabled={enviandoArchivo}
            aria-label="Quitar el archivo"
            className="grid h-11 w-11 flex-none place-items-center rounded-full text-ink-mute transition-colors hover:bg-surface-3 hover:text-ink active:bg-surface-3 disabled:opacity-40"
          >
            <IconoChat nombre="cerrar" className="h-[18px] w-[18px]" />
          </button>
        </div>
      ) : null}

      <form onSubmit={alEnviar} className="flex items-end gap-2 px-3 pt-2 sm:px-5">
        <input type="hidden" name="conversacionId" value={conversacion.id} />
        <input type="hidden" name="mantenerIA" value={atiendeAgente && dejarIA ? "on" : ""} />
        <CampoToken />
        <input
          key={claveEntrada}
          ref={entradaArchivo}
          type="file"
          name="archivo"
          accept={ACEPTA_ARCHIVOS}
          onChange={alElegirArchivo}
          tabIndex={-1}
          aria-hidden="true"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => entradaArchivo.current?.click()}
          disabled={ocupado}
          aria-label="Adjuntar foto, video o documento"
          title="Adjuntar foto, video o documento"
          className="grid h-11 w-11 flex-none place-items-center rounded-full text-ink-mute transition-colors hover:bg-surface-2 hover:text-ink active:bg-surface-3 disabled:pointer-events-none disabled:opacity-40"
        >
          <IconoChat nombre="adjuntar" className="h-[20px] w-[20px]" />
        </button>
        <textarea
          ref={campo}
          name="texto"
          rows={1}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={alTeclear}
          autoComplete="off"
          placeholder={
            archivo
              ? "Agregá un mensaje (opcional)"
              : atiendeAgente
                ? dejarIA
                  ? "Respondé vos (la IA sigue activa)"
                  : "Respondé vos (pausa a la IA)"
                : "Escribí un mensaje…"
          }
          aria-label="Escribir mensaje"
          className="min-h-11 min-w-0 flex-1 resize-none rounded-[22px] border border-line-strong bg-surface-2 px-4 py-[10px] text-[16px] leading-snug text-ink outline-none transition-colors placeholder:text-ink-mute focus:border-[var(--panel-acento)]"
        />
        <button
          type="submit"
          disabled={(!texto.trim() && !archivo) || ocupado}
          aria-label={ocupado ? "Enviando…" : archivo ? "Enviar archivo" : "Enviar mensaje"}
          className="grid h-11 w-11 flex-none place-items-center rounded-full bg-[color-mix(in_srgb,var(--panel-acento)_82%,black)] text-white transition-[transform,opacity] active:scale-95 disabled:pointer-events-none disabled:opacity-40"
        >
          {ocupado ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <IconoChat nombre="enviar" className="h-[19px] w-[19px]" />
          )}
        </button>
      </form>

      {atiendeAgente ? (
        <div className="px-4 pt-2 sm:px-5">
          <label className="flex min-h-9 cursor-pointer items-center gap-2.5 text-[12.5px] text-ink-soft">
            <input
              type="checkbox"
              checked={dejarIA}
              onChange={alCambiarDejarIA}
              className="h-4 w-4 flex-none cursor-pointer accent-[var(--panel-acento)]"
            />
            <span>
              Dejar la IA activa
              <span className="hidden text-ink-mute sm:inline">
                {dejarIA
                  ? " — tu mensaje sale y la IA sigue contestando si la persona escribe."
                  : " — si no, al responder vos la IA se pausa hasta que se la devolvás."}
              </span>
            </span>
          </label>
        </div>
      ) : null}
    </div>
  );
}
