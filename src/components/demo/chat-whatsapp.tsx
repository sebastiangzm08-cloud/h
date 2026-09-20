"use client";

/* ==========================================================================
   El simulador en sí: un chat que se ve como WhatsApp de verdad.

   A propósito usa colores LITERALES de WhatsApp (verde, gris carbón, azul
   de "leído") en vez de los tokens del sitio (`bg-surface`, `text-ink`...):
   esto no es una pantalla de Hoshizora, es una imitación fiel de una
   pantalla ajena a propósito, para que se sienta real. Todo lo demás
   alrededor (la página, el CTA) sí usa el sistema de diseño normal.

   Avatar: si al crear la demo se cargó `logoUrl` (la foto/logo REAL del
   negocio, ej. su foto de perfil de WhatsApp), se usa esa. Si no, cae a la
   inicial (pedido explícito, 2026-09-16: nada de fingir una imagen que no
   tenemos — pero una que sí tenemos, sí se muestra).
   ========================================================================== */
import { useEffect, useRef, useState } from "react";

type Turno = {
  id: string;
  autor: "prospecto" | "agente";
  texto: string;
  hora: string;
  leido?: boolean;
};

function horaAhora() {
  return new Date().toLocaleTimeString("es-CR", { hour: "numeric", minute: "2-digit" });
}

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

function BurbujaTyping() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-sm bg-[#202c33] px-3.5 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8696a0]"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}

export function ChatWhatsapp({
  slug,
  nombreNegocio,
  logoUrl,
}: {
  slug: string;
  nombreNegocio: string;
  logoUrl?: string | null;
}) {
  const [mensajes, setMensajes] = useState<Turno[]>([
    {
      id: "saludo",
      autor: "agente",
      texto: `¡Hola! Soy el asistente de ${nombreNegocio}. ¿En qué te puedo ayudar?`,
      hora: horaAhora(),
    },
  ]);
  const [valor, setValor] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [agotado, setAgotado] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensajes, escribiendo]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const texto = valor.trim();
    if (!texto || escribiendo || agotado) return;

    const propio: Turno = { id: crypto.randomUUID(), autor: "prospecto", texto, hora: horaAhora() };
    const historialPrevio = mensajes;
    setMensajes((m) => [...m, propio]);
    setValor("");
    setAviso(null);
    setEscribiendo(true);

    // "Leído" a los ~700ms — igual que WhatsApp real, no es instantáneo.
    setTimeout(() => {
      setMensajes((m) => m.map((x) => (x.id === propio.id ? { ...x, leido: true } : x)));
    }, 700);

    try {
      const res = await fetch(`/api/demo/${slug}/mensaje`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensaje: texto,
          historial: historialPrevio.map((m) => ({ autor: m.autor, texto: m.texto })),
        }),
      });
      const datos = await res.json();

      if (!datos.ok) {
        setAviso(datos.error || "No se pudo responder. Probá de nuevo.");
        if (res.status === 404 || /límite/i.test(datos.error ?? "")) setAgotado(true);
        return;
      }

      setMensajes((m) => [
        ...m,
        { id: crypto.randomUUID(), autor: "agente", texto: datos.respuesta, hora: horaAhora() },
      ]);
      if (typeof datos.mensajesRestantes === "number" && datos.mensajesRestantes <= 0) {
        setAgotado(true);
      }
    } catch {
      setAviso("No se pudo conectar. Probá de nuevo.");
    } finally {
      setEscribiendo(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[380px] overflow-hidden rounded-[2.25rem] border-[6px] border-[#0a0a0a] bg-black shadow-[0_40px_100px_-24px_rgba(124,92,255,0.35)] ring-1 ring-white/10">
      <div className="flex h-[640px] flex-col bg-[#0b141a]">
        {/* cabecera */}
        <div className="flex flex-none items-center gap-3 bg-[#1f2c34] px-4 py-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="h-9 w-9 flex-none rounded-full object-cover"
            />
          ) : (
            <div
              className="grid h-9 w-9 flex-none place-items-center rounded-full text-[13px] font-semibold text-white"
              style={{ background: colorAvatar(nombreNegocio) }}
            >
              {inicial(nombreNegocio)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-medium text-white">{nombreNegocio}</p>
            <p className="text-[12px] text-[#8696a0]">{escribiendo ? "escribiendo…" : "en línea"}</p>
          </div>
        </div>

        {/* mensajes */}
        <div className="scroll-wa flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-3">
          {mensajes.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.autor === "prospecto" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[78%] rounded-2xl px-3 py-2 text-[13.5px] leading-snug text-[#e9edef] ${
                  m.autor === "prospecto"
                    ? "rounded-br-sm bg-[#005c4b]"
                    : "rounded-bl-sm bg-[#202c33]"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.texto}</p>
                <span className="mt-1 flex items-center justify-end gap-1 text-[10.5px] text-[#8696a0]">
                  {m.hora}
                  {m.autor === "prospecto" ? <IconoTilde doble={Boolean(m.leido)} /> : null}
                </span>
              </div>
            </div>
          ))}
          {escribiendo ? <BurbujaTyping /> : null}
          {aviso ? (
            <p className="mx-auto my-1.5 max-w-[85%] rounded-lg bg-[#2a2f32] px-3 py-2 text-center text-[12px] text-[#e9c46a]">
              {aviso}
            </p>
          ) : null}
          <div ref={finRef} />
        </div>

        {/* entrada */}
        <form
          onSubmit={enviar}
          className="flex flex-none items-center gap-2 bg-[#1f2c34] px-3 py-2.5"
        >
          <input
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            disabled={agotado}
            placeholder={agotado ? "Esta demo ya terminó" : "Escribí un mensaje"}
            /* Sin esto, Chrome y los gestores de contraseñas (LastPass,
               1Password, Bitwarden...) confunden este campo con un login y le
               pegan encima su icono de "rellenar" — se ve como una manchita
               blanca sobre el input. Estos atributos le avisan a cada uno que
               lo ignore. */
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            name="mensaje-demo-wa"
            data-lpignore="true"
            data-1p-ignore="true"
            data-bwignore="true"
            data-form-type="other"
            className="h-10 flex-1 rounded-full bg-[#2a3942] px-4 text-[13.5px] text-white placeholder:text-[#8696a0] focus:outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={agotado || !valor.trim()}
            aria-label="Enviar"
            className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[#00a884] text-white transition-opacity disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M3 20.5v-17L22 12 3 20.5Zm2-2.8L16.85 12 5 6.3v4.35L11 12l-6 1.35v4.35Z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
