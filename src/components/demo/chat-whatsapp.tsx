"use client";

/* ==========================================================================
   El chat de la demo: se ve como WhatsApp de verdad.

   A propósito usa colores LITERALES de WhatsApp (verde, gris carbón, azul
   de "leído") en vez de los tokens del sitio (`bg-surface`, `text-ink`...):
   esto no es una pantalla de Hoshizora, es una imitación fiel de una
   pantalla ajena a propósito, para que se sienta real.

   Es presentacional: el estado de la conversación vive en `DemoEstudio`
   (porque el panel de al lado se llena con lo mismo).

   Avatar: si al crear la demo se cargó `logoUrl` (la foto/logo REAL del
   negocio) se usa esa; si no, cae a la inicial. Nada de fingir una imagen
   que no tenemos.
   ========================================================================== */
import { useEffect, useRef, type RefObject } from "react";
import { cn } from "@/lib/utils";
import type { MensajeDemo } from "./estado";

function inicial(nombre: string) {
  return nombre.trim().charAt(0).toUpperCase() || "?";
}

/* Un color de fondo estable por negocio (mismo hash → mismo color siempre),
   para que el avatar no sea gris parejo en todas las demos. */
function colorAvatar(semilla: string) {
  const paleta = ["#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444", "#10b981", "#ec4899"];
  let h = 0;
  for (let i = 0; i < semilla.length; i++) h = (h * 31 + semilla.charCodeAt(i)) >>> 0;
  return paleta[h % paleta.length];
}

function IconoTilde({ doble }: { doble: boolean }) {
  return (
    <svg viewBox="0 0 16 11" width="15" height="11" fill="none" aria-hidden="true">
      <path
        d="M1 5.5 4.5 9 10 2"
        stroke={doble ? "#53bdeb" : "#8696a0"}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {doble ? (
        <path
          d="M5.5 5.5 9 9 14.5 2"
          stroke="#53bdeb"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  );
}

function BurbujaEscribiendo() {
  return (
    <div
      className="demo-burbuja flex w-fit items-center gap-1 rounded-2xl rounded-bl-sm bg-[#202c33] px-3.5 py-3"
      aria-hidden="true"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="demo-punto h-1.5 w-1.5 rounded-full bg-[#8696a0]"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

export function ChatWhatsapp({
  nombreNegocio,
  logoUrl,
  mensajes,
  escribiendo,
  aviso,
  agotado,
  valor,
  onValor,
  onEnviar,
  onReintentar,
  sugerencias,
  inputRef,
  ctaHref,
}: {
  nombreNegocio: string;
  logoUrl?: string | null;
  mensajes: MensajeDemo[];
  escribiendo: boolean;
  aviso: string | null;
  agotado: boolean;
  valor: string;
  onValor: (v: string) => void;
  onEnviar: (texto: string) => void;
  onReintentar: (id: string) => void;
  /** Frases de ejemplo para arrancar. Se muestran mientras no se haya escrito nada. */
  sugerencias: string[];
  inputRef: RefObject<HTMLInputElement | null>;
  ctaHref: string;
}) {
  const logRef = useRef<HTMLDivElement>(null);

  /* Se desplaza SOLO el chat (no la página, que es lo que haría scrollIntoView). */
  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top: el.scrollHeight, behavior: quieto ? "auto" : "smooth" });
  }, [mensajes, escribiendo, aviso]);

  const hayMensajePropio = mensajes.some((m) => m.autor === "prospecto");

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden bg-[#0b141a]",
        /* Celular: pantalla plana. Escritorio: el marco de un celular. */
        "max-xl:rounded-2xl max-xl:border max-xl:border-line-strong",
        "xl:rounded-[2.25rem] xl:border-[6px] xl:border-[#0a0a0a] xl:bg-black xl:shadow-[0_40px_100px_-24px_rgba(255,255,255,0.12)] xl:ring-1 xl:ring-white/10"
      )}
    >
      {/* cabecera */}
      <div className="flex flex-none items-center gap-3 bg-[#1f2c34] px-4 py-3">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="h-10 w-10 flex-none rounded-full object-cover" />
        ) : (
          <div
            aria-hidden="true"
            className="grid h-10 w-10 flex-none place-items-center rounded-full text-[14px] font-semibold text-white"
            style={{ background: colorAvatar(nombreNegocio) }}
          >
            {inicial(nombreNegocio)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] leading-tight font-medium text-white">{nombreNegocio}</p>
          <p className="text-[12px] text-[#8696a0]">{escribiendo ? "escribiendo…" : "en línea"}</p>
        </div>
      </div>

      {/* mensajes */}
      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label={`Conversación con ${nombreNegocio}`}
        className="scroll-wa flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto overscroll-contain px-3 py-3"
      >
        <p className="mx-auto mb-1 max-w-[88%] rounded-lg bg-[#182229] px-3 py-1.5 text-center text-[11.5px] leading-snug text-[#8696a0]">
          Conversación de demostración. Las respuestas las genera una inteligencia artificial.
        </p>

        {mensajes.map((m) => {
          const mio = m.autor === "prospecto";
          return (
            <div key={m.id} className={cn("flex flex-col", mio ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "demo-burbuja max-w-[82%] rounded-2xl px-3 py-2 text-[14px] leading-snug text-[#e9edef] xl:max-w-[78%] xl:text-[13.5px]",
                  mio ? "rounded-br-sm bg-[#005c4b]" : "rounded-bl-sm bg-[#202c33]",
                  m.fallo && "opacity-70"
                )}
              >
                <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{m.texto}</p>
                <span className="mt-1 flex items-center justify-end gap-1 text-[10.5px] text-[#8696a0]">
                  {m.hora}
                  {mio && !m.fallo ? <IconoTilde doble={Boolean(m.leido)} /> : null}
                </span>
              </div>
              {m.fallo && !agotado ? (
                <button
                  type="button"
                  onClick={() => onReintentar(m.id)}
                  disabled={escribiendo}
                  className="mt-0.5 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-[12.5px] font-medium text-[#e9c46a] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9c46a] disabled:opacity-50"
                >
                  No se envió · Reintentar
                </button>
              ) : null}
            </div>
          );
        })}
        {escribiendo ? <BurbujaEscribiendo /> : null}

        {aviso ? (
          <p
            role="alert"
            className="demo-burbuja mx-auto my-1.5 max-w-[92%] rounded-lg bg-[#2a2f32] px-3 py-2 text-center text-[12.5px] leading-snug text-[#e9c46a]"
          >
            {aviso}
          </p>
        ) : null}
      </div>

      {/* sugerencias: bajan la barrera de "qué le escribo" */}
      {!hayMensajePropio && !agotado && sugerencias.length > 0 ? (
        <div
          aria-label="Frases para empezar"
          className="demo-sin-barra flex flex-none gap-2 overflow-x-auto overscroll-x-contain bg-[#0b141a] px-3 pb-2"
        >
          {sugerencias.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onEnviar(s)}
              disabled={escribiendo}
              className="inline-flex min-h-11 flex-none items-center rounded-full border border-[#2a3942] bg-[#111b21] px-4 text-[13.5px] whitespace-nowrap text-[#d1d7db] transition-[background-color,transform] duration-150 hover:bg-[#1a262d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00a884] active:scale-[0.97] disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}

      {/* entrada */}
      {agotado ? (
        <div className="flex flex-none flex-col items-center gap-2 bg-[#1f2c34] px-4 py-3.5 text-center">
          <p className="text-[13px] leading-snug text-[#d1d7db]">Esta demo ya terminó. ¿Seguimos la conversación de verdad?</p>
          <a
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded-full bg-[#00a884] px-5 text-[13.5px] font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Escribirnos por WhatsApp
          </a>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onEnviar(valor);
          }}
          className="flex flex-none items-center gap-2 bg-[#1f2c34] px-3 py-2.5"
        >
          <label htmlFor="demo-mensaje" className="sr-only">
            Escriba un mensaje
          </label>
          <input
            ref={inputRef}
            id="demo-mensaje"
            value={valor}
            onChange={(e) => onValor(e.target.value)}
            maxLength={500}
            placeholder="Escriba un mensaje"
            /* Sin esto, Chrome y los gestores de contraseñas (LastPass,
               1Password, Bitwarden...) confunden este campo con un login y le
               pegan encima su icono de "rellenar". Estos atributos le avisan a
               cada uno que lo ignore. */
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="sentences"
            spellCheck={false}
            enterKeyHint="send"
            name="mensaje-demo-wa"
            data-lpignore="true"
            data-1p-ignore="true"
            data-bwignore="true"
            data-form-type="other"
            /* 16 px: por debajo, Safari en iPhone hace zoom al enfocar. */
            className="h-11 min-w-0 flex-1 rounded-full bg-[#2a3942] px-4 text-[16px] text-white placeholder:text-[#8696a0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00a884]/70"
          />
          <button
            type="submit"
            disabled={escribiendo || !valor.trim()}
            aria-label="Enviar"
            className="grid h-11 w-11 flex-none place-items-center rounded-full bg-[#00a884] text-white transition-[opacity,transform] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95 disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden="true">
              <path d="M3 20.5v-17L22 12 3 20.5Zm2-2.8L16.85 12 5 6.3v4.35L11 12l-6 1.35v4.35Z" />
            </svg>
          </button>
        </form>
      )}
    </div>
  );
}
