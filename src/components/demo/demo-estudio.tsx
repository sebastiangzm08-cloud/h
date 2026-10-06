"use client";

/* ==========================================================================
   La demo completa: chat de WhatsApp + panel en vivo.

   FLUJO DE DATOS
   1. La persona escribe en el chat → `enviar()` manda el mensaje y el
      historial a `/api/demo/[slug]/mensaje` (una llamada al modelo).
   2. La API devuelve el texto y, de ESE turno: si el caso pasa a una persona
      (con motivo), si hay una cita (servicio y horario como los dijo la
      persona) y las herramientas consultadas (deducidas de la respuesta).
   3. Todo se guarda acá, en memoria de la página. El panel (Conversaciones,
      Agenda, Resultados) es una vista de ese mismo estado: no hay nada que
      inventar ni nada que se guarde de verdad.

   Escritorio (≥1280 px): chat a la izquierda, panel a la derecha.
   Celular y tablet: un selector fijo "Chat | Panel" con un indicador cuando
   el panel tiene novedades.
   ========================================================================== */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { CitaDemo, RespuestaDemo } from "@/lib/demo/tipos";
import { cn } from "@/lib/utils";
import { ChatWhatsapp } from "./chat-whatsapp";
import {
  calcularMetricas,
  horaAhora,
  ID_SALUDO,
  resumirConversacion,
  SIN_NOVEDADES,
  type CitaFila,
  type MensajeDemo,
  type Novedades,
  type SubVista,
} from "./estado";
import { PanelDemo } from "./panel-demo";
import { PuntoNovedad } from "./piezas";

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const MQ_ANCHO = "(min-width: 1280px)";
function suscribirAncho(cb: () => void) {
  const mq = window.matchMedia(MQ_ANCHO);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const hoyEsAncho = () => window.matchMedia(MQ_ANCHO).matches;

function igual(a: string, b: string) {
  const n = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  return n(a) === n(b);
}

/** Una cita nueva del modelo se une a la lista: la propuesta pendiente se convierte en confirmada, nunca se duplica. */
function aplicarCita(prev: CitaFila[], c: CitaDemo, hora: string): { lista: CitaFila[]; cambio: boolean } {
  const pend = prev.findIndex((x) => x.estado === "propuesta");
  if (c.estado === "confirmada") {
    if (prev.some((x) => x.estado === "confirmada" && igual(x.horario, c.horario) && igual(x.servicio, c.servicio))) {
      return { lista: prev, cambio: false };
    }
    const fila: CitaFila = { id: uid(), estado: "confirmada", servicio: c.servicio, horario: c.horario, hora };
    if (pend >= 0) return { lista: prev.map((x, i) => (i === pend ? { ...fila, id: x.id } : x)), cambio: true };
    return { lista: [...prev, fila], cambio: true };
  }
  if (pend >= 0) {
    const x = prev[pend];
    const servicio = c.servicio || x.servicio;
    const horario = c.horario || x.horario;
    if (servicio === x.servicio && horario === x.horario) return { lista: prev, cambio: false };
    return { lista: prev.map((y, i) => (i === pend ? { ...y, servicio, horario } : y)), cambio: true };
  }
  return {
    lista: [...prev, { id: uid(), estado: "propuesta", servicio: c.servicio, horario: c.horario, hora }],
    cambio: true,
  };
}

export function DemoEstudio({
  slug,
  nombreNegocio,
  trato,
  logoUrl,
  restantesIniciales,
  tope,
  sugerencias,
  ctaHref,
}: {
  slug: string;
  nombreNegocio: string;
  trato: "usted" | "vos";
  logoUrl: string | null;
  restantesIniciales: number;
  tope: number;
  sugerencias: string[];
  ctaHref: string;
}) {
  const [mensajes, setMensajes] = useState<MensajeDemo[]>([
    {
      id: ID_SALUDO,
      autor: "agente",
      texto: `¡Hola! Soy el asistente de ${nombreNegocio}. ¿En qué ${trato === "vos" ? "te" : "le"} puedo ayudar?`,
      hora: horaAhora(),
    },
  ]);
  const [citas, setCitas] = useState<CitaFila[]>([]);
  const [valor, setValor] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [restantes, setRestantes] = useState(restantesIniciales);
  const [agotado, setAgotado] = useState(restantesIniciales <= 0);
  const [anuncio, setAnuncio] = useState("");

  const [vista, setVista] = useState<"chat" | "panel">("chat");
  const [subvista, setSubvista] = useState<SubVista>("conversaciones");
  /* Novedades = eventos que llegaron menos los que ya se vieron. Se actualizan
     solo desde manejadores de eventos (nunca desde un efecto). */
  const [total, setTotal] = useState<Novedades>(SIN_NOVEDADES);
  const [vistos, setVistos] = useState<Novedades>(SIN_NOVEDADES);
  const esAncho = useSyncExternalStore(suscribirAncho, hoyEsAncho, () => false);
  const inputRef = useRef<HTMLInputElement>(null);

  const panelVisible = esAncho || vista === "panel";

  /* Lo que se está viendo, para saber si una novedad ya la vio la persona. */
  const visibleRef = useRef({ panelVisible, subvista });
  useEffect(() => {
    visibleRef.current = { panelVisible, subvista };
  }, [panelVisible, subvista]);

  const novedades: Novedades = {
    conversaciones: panelVisible && subvista === "conversaciones" ? 0 : total.conversaciones - vistos.conversaciones,
    agenda: panelVisible && subvista === "agenda" ? 0 : total.agenda - vistos.agenda,
    resultados: panelVisible && subvista === "resultados" ? 0 : total.resultados - vistos.resultados,
  };

  function marcar(sub: SubVista) {
    setTotal((n) => ({ ...n, [sub]: n[sub] + 1 }));
    const v = visibleRef.current;
    if (v.panelVisible && v.subvista === sub) setVistos((n) => ({ ...n, [sub]: n[sub] + 1 }));
  }

  function abrirSubvista(sub: SubVista) {
    setSubvista(sub);
    setVistos((n) => ({ ...n, [sub]: total[sub] }));
  }

  function abrirVista(v: "chat" | "panel") {
    setVista(v);
    if (v === "panel") setVistos((n) => ({ ...n, [subvista]: total[subvista] }));
  }

  const metricas = useMemo(() => calcularMetricas(mensajes, citas), [mensajes, citas]);
  const conv = useMemo(() => resumirConversacion(mensajes, citas), [mensajes, citas]);
  const pendientes = conv?.estado === "espera" ? 1 : 0;

  function irAlChat(texto?: string) {
    if (texto) setValor(texto);
    setVista("chat");
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function marcarFallo(id: string) {
    setMensajes((ms) => ms.map((m) => (m.id === id ? { ...m, fallo: true } : m)));
  }

  async function enviar(texto: string, reintentoId?: string) {
    const limpio = texto.trim();
    if (!limpio || escribiendo || agotado) return;

    const id = reintentoId ?? uid();
    const historial = mensajes.filter((m) => !m.fallo && m.id !== id);
    if (reintentoId) {
      setMensajes((ms) => ms.map((m) => (m.id === id ? { ...m, fallo: false } : m)));
    } else {
      setMensajes((ms) => [...ms, { id, autor: "prospecto", texto: limpio, hora: horaAhora() }]);
      setValor("");
    }
    setAviso(null);
    setEscribiendo(true);

    // "Leído" a los ~700ms — igual que WhatsApp real, no es instantáneo.
    setTimeout(() => {
      setMensajes((ms) => ms.map((m) => (m.id === id ? { ...m, leido: true } : m)));
    }, 700);

    const t0 = performance.now();
    try {
      const res = await fetch(`/api/demo/${slug}/mensaje`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensaje: limpio,
          historial: historial.map((m) => ({ autor: m.autor, texto: m.texto })),
        }),
      });
      const datos = (await res.json()) as RespuestaDemo;
      const ms = Math.round(performance.now() - t0);

      if (!datos.ok) {
        marcarFallo(id);
        setAviso(datos.error || "No se pudo responder. Pruebe de nuevo.");
        if (datos.codigo === "limite" || datos.codigo === "no_disponible" || res.status === 404) {
          setAgotado(true);
          if (datos.codigo === "limite") setRestantes(0);
        }
        return;
      }

      const hora = horaAhora();
      setMensajes((m) => [
        ...m,
        {
          id: uid(),
          autor: "agente",
          texto: datos.respuesta,
          hora,
          herramientas: datos.herramientas,
          escalada: datos.escalada ?? undefined,
          ms,
        },
      ]);
      setRestantes(datos.mensajesRestantes);
      if (datos.mensajesRestantes <= 0) setAgotado(true);

      marcar("conversaciones");
      marcar("resultados");
      let citaNueva = false;
      if (datos.cita) {
        const r = aplicarCita(citas, datos.cita, hora);
        citaNueva = r.cambio;
        if (r.cambio) {
          setCitas(r.lista);
          marcar("agenda");
        }
      }

      const partes = ["Panel actualizado."];
      partes.push(datos.escalada ? "La conversación espera a una persona." : "La IA sigue atendiendo.");
      if (datos.herramientas.length) partes.push(`Herramientas en uso: ${datos.herramientas.join(", ")}.`);
      if (citaNueva) partes.push("Hay una cita nueva en la agenda.");
      setAnuncio(partes.join(" "));
    } catch {
      marcarFallo(id);
      setAviso("No se pudo conectar. Revise su conexión y pruebe de nuevo.");
    } finally {
      setEscribiendo(false);
    }
  }

  function reintentar(id: string) {
    const m = mensajes.find((x) => x.id === id);
    if (m) void enviar(m.texto, id);
  }

  const totalNovedades = novedades.conversaciones + novedades.agenda;

  return (
    <div className="xl:grid xl:grid-cols-[380px_minmax(0,1fr)] xl:items-start xl:gap-10">
      <p className="sr-only" aria-live="polite">
        {anuncio}
      </p>

      {/* Selector fijo Chat | Panel (celular y tablet) */}
      <div className="sticky top-16 z-30 -mx-5 border-b border-line bg-paper/90 px-5 py-2.5 backdrop-blur-md sm:-mx-8 sm:px-8 xl:hidden">
        <div
          role="tablist"
          aria-label="Chat o panel"
          className="mx-auto flex max-w-[640px] gap-1 rounded-full border border-line-strong bg-surface p-1"
        >
          {(
            [
              { clave: "chat", texto: "Chat" },
              { clave: "panel", texto: "Panel" },
            ] as const
          ).map((t) => {
            const activa = vista === t.clave;
            const novedad = t.clave === "panel" && !activa && totalNovedades > 0;
            return (
              <button
                key={t.clave}
                type="button"
                role="tab"
                id={`demo-vista-${t.clave}`}
                aria-selected={activa}
                aria-controls={`demo-pane-${t.clave}`}
                onClick={() => abrirVista(t.clave)}
                className={cn(
                  "relative flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-[14px] font-medium transition-[background-color,color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento active:scale-[0.98]",
                  activa ? "bg-ink text-paper" : "text-ink-mute hover:text-ink"
                )}
              >
                {t.texto}
                {novedad ? (
                  <>
                    <PuntoNovedad />
                    <span
                      key={totalNovedades}
                      className="demo-pop grid h-5 min-w-5 place-items-center rounded-full bg-acento px-1.5 font-mono text-[11px] leading-none text-white"
                    >
                      {totalNovedades > 9 ? "9+" : totalNovedades}
                    </span>
                    <span className="sr-only">{totalNovedades} novedades</span>
                  </>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div
        id="demo-pane-chat"
        role="tabpanel"
        aria-labelledby="demo-vista-chat"
        className={cn(
          "mx-auto mt-3 h-[clamp(480px,calc(100svh-9rem),760px)] w-full max-w-[640px] xl:mt-0 xl:h-[640px] xl:max-w-none",
          vista === "panel" && "max-xl:hidden"
        )}
      >
        <ChatWhatsapp
          nombreNegocio={nombreNegocio}
          logoUrl={logoUrl}
          mensajes={mensajes}
          escribiendo={escribiendo}
          aviso={aviso}
          agotado={agotado}
          valor={valor}
          onValor={setValor}
          onEnviar={(t) => void enviar(t)}
          onReintentar={reintentar}
          sugerencias={sugerencias}
          inputRef={inputRef}
          ctaHref={ctaHref}
        />
      </div>

      <div
        id="demo-pane-panel"
        role="tabpanel"
        aria-labelledby="demo-vista-panel"
        className={cn(
          "mx-auto mt-3 h-[clamp(480px,calc(100svh-9rem),760px)] w-full max-w-[640px] xl:mt-0 xl:h-[640px] xl:max-w-none",
          vista === "chat" && "max-xl:hidden"
        )}
      >
        <PanelDemo
          subvista={subvista}
          onSubvista={abrirSubvista}
          novedades={novedades}
          pendientes={pendientes}
          mensajes={mensajes}
          citas={citas}
          metricas={metricas}
          restantes={restantes}
          tope={tope}
          onIrAlChat={irAlChat}
        />
      </div>
    </div>
  );
}
