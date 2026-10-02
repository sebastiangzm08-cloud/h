"use client";

/* ==========================================================================
   4. Recuperación — versión 1, SIN envío automático.

   Fuera de la ventana de 24 h, WhatsApp solo deja escribirle a alguien con
   una plantilla aprobada por Meta (y cada una se cobra). Eso todavía no está
   construido ni verificado, así que acá no se manda nada solo: se le deja a
   la persona un mensaje listo, editable, y dos botones — copiarlo o abrir su
   propio WhatsApp con el texto ya escrito (enlace wa.me). El que le da
   "enviar" es el dueño, desde su teléfono.

   La pantalla lo dice a la vista (no en letra chica) y no muestra ninguna
   cifra de costo: la tarifa de Costa Rica no está verificada.

   Recibe todo ya calculado desde el servidor (incluida la antigüedad en
   texto) para no depender de la hora del navegador al hidratar.
   ========================================================================== */
import Link from "next/link";
import { useState } from "react";
import { Caja, CajaHead } from "@/components/panel/ui";
import { waLinkCliente, cn } from "@/lib/utils";
import {
  Calculo,
  EstadoVacio,
  IconoChevron,
  IconoCopiar,
  IconoExterno,
  IconoInfo,
  NoDisponible,
  entero,
  iniciales,
} from "./comunes";

export type Recuperable = {
  contactoId: string;
  conversacionId: string;
  nombre: string;
  telefono: string;
  /** "hace 3 días", calculado en el servidor. */
  antiguedad: string;
  servicio: string | null;
  estado: string;
  /** El mensaje sugerido: nombre, negocio, servicio y trato del agente. */
  mensaje: string;
};

const PAGINA = 8;

/** ¿El número sirve para wa.me? 8 dígitos = local de Costa Rica; si no, tiene que traer código de país. */
function numeroValido(telefono: string) {
  const d = telefono.replace(/\D/g, "");
  return d.length === 8 || (d.length >= 10 && d.length <= 15);
}

function formatearTelefono(telefono: string) {
  const d = telefono.replace(/\D/g, "");
  if (d.length === 8) return `+506 ${d.slice(0, 4)}-${d.slice(4)}`;
  if (d.length === 11 && d.startsWith("506")) return `+506 ${d.slice(3, 7)}-${d.slice(7)}`;
  return telefono || "Sin número";
}

async function copiarAlPortapapeles(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    /* Sin permiso o sin https: se prueba el método viejo. */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = texto;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

type Aviso = { id: string; tipo: "copiado" | "error" };

/** El cuadro de texto crece con el mensaje: que nunca quede una línea cortada. */
function ajustarAlto(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight + 2}px`;
}

export function RecuperacionClientes({
  contactos,
  recientes,
  total,
}: {
  /** `null` = no se pudo leer. */
  contactos: Recuperable[] | null;
  /** Oportunidades con menos de 24 h: todavía no se pueden recuperar. */
  recientes: number;
  /** Cuántas recuperables hay en total (la lista puede venir cortada). */
  total: number;
}) {
  const [abierto, setAbierto] = useState<string | null>(contactos?.[0]?.contactoId ?? null);
  const [ediciones, setEdiciones] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [visibles, setVisibles] = useState(PAGINA);

  if (contactos === null) {
    return (
      <Caja>
        <CajaHead eyebrow="Recuperación" titulo="Escribile a quien se quedó sin cita" />
        <NoDisponible que="los contactos para recuperar" />
      </Caja>
    );
  }

  const textoDe = (c: Recuperable) => ediciones[c.contactoId] ?? c.mensaje;

  const copiar = async (c: Recuperable) => {
    const ok = await copiarAlPortapapeles(textoDe(c));
    setAviso({ id: c.contactoId, tipo: ok ? "copiado" : "error" });
    /* Si el navegador no dejó copiar, el texto queda seleccionado para que
       baste con "copiar" del menú o del teclado. */
    if (!ok) {
      const campo = document.getElementById(`msg-${c.contactoId}`);
      if (campo instanceof HTMLTextAreaElement) {
        campo.focus();
        campo.select();
      }
    }
  };

  return (
    <Caja>
      <CajaHead eyebrow="Recuperación" titulo="Escribile a quien se quedó sin cita">
        {contactos.length > 0 ? (
          <span className="flex-none rounded-full bg-[var(--panel-acento-fondo)] px-2.5 py-1 font-mono text-[11px] whitespace-nowrap text-[color:var(--panel-acento-texto)] tabular-nums">
            {entero(contactos.length)} {contactos.length === 1 ? "persona" : "personas"}
          </span>
        ) : null}
      </CajaHead>

      <p className="-mt-2 mb-3.5 max-w-[68ch] text-[12.5px] leading-relaxed text-ink-mute">
        Personas que preguntaron el precio, no tienen cita y llevan más de 24 horas sin movimiento en la conversación. Te dejamos un mensaje
        listo: editalo, copialo o abrilo en tu WhatsApp y mandáselo vos.
      </p>

      <div
        role="note"
        className="mb-4 flex items-start gap-2.5 rounded-xl bg-surface-3 px-4 py-3 text-[13px] leading-snug text-ink-soft"
      >
        <IconoInfo className="mt-0.5 h-4 w-4 flex-none text-ink-mute" />
        <p className="min-w-0">
          El envío automático con plantilla de Meta todavía no está disponible. Por ahora el mensaje lo enviás vos, desde
          tu propio WhatsApp.
        </p>
      </div>

      {contactos.length === 0 ? (
        <EstadoVacio titulo={recientes > 0 ? "Todavía no hay a quién escribirle" : "No hay contactos para recuperar"}>
          {recientes > 0
            ? `${entero(recientes)} ${recientes === 1 ? "persona preguntó" : "personas preguntaron"} el precio hace menos de 24 horas y la conversación sigue reciente (con el agente o con vos). Si pasa un día sin movimiento, aparece${recientes === 1 ? "" : "n"} acá.`
            : "Nadie preguntó el precio y se quedó sin cita en los últimos 60 días."}
        </EstadoVacio>
      ) : (
        <>
          <ul className="flex flex-col gap-2.5">
            {contactos.slice(0, visibles).map((c) => {
              const estaAbierto = abierto === c.contactoId;
              const texto = textoDe(c);
              const editado = ediciones[c.contactoId] !== undefined && ediciones[c.contactoId] !== c.mensaje;
              const valido = numeroValido(c.telefono);
              const vacio = texto.trim() === "";
              const idCuerpo = `recuperar-${c.contactoId}`;
              const miAviso = aviso?.id === c.contactoId ? aviso.tipo : null;

              return (
                <li key={c.contactoId} className="overflow-hidden rounded-xl border border-line bg-surface">
                  <button
                    type="button"
                    onClick={() => setAbierto(estaAbierto ? null : c.contactoId)}
                    aria-expanded={estaAbierto}
                    aria-controls={idCuerpo}
                    className="flex min-h-[60px] w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-surface-2"
                  >
                    <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-surface-3 text-[12px] font-semibold text-ink-soft">
                      {iniciales(c.nombre)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-medium text-ink">{c.nombre}</span>
                      <span className="block truncate text-[12px] text-ink-mute">
                        {c.antiguedad} · {c.servicio ? `preguntó por ${c.servicio}` : "preguntó el precio"}
                      </span>
                    </span>
                    <IconoChevron
                      className={cn("h-4 w-4 flex-none text-ink-faint transition-transform duration-150", estaAbierto && "rotate-180")}
                    />
                  </button>

                  {estaAbierto ? (
                    <div id={idCuerpo} className="border-t border-line px-3.5 pt-3 pb-3.5">
                      <label htmlFor={`msg-${c.contactoId}`} className="mb-1.5 block text-[12px] font-medium text-ink-mute">
                        Mensaje para {c.nombre} <span className="font-normal text-ink-faint">(podés editarlo)</span>
                      </label>
                      <textarea
                        id={`msg-${c.contactoId}`}
                        value={texto}
                        onChange={(e) => {
                          setEdiciones((prev) => ({ ...prev, [c.contactoId]: e.target.value }));
                          setAviso(null);
                          ajustarAlto(e.target);
                        }}
                        rows={7}
                        ref={ajustarAlto}
                        className="block w-full resize-y rounded-xl border border-line-strong bg-surface-2 px-3.5 py-3 text-[16px] leading-relaxed text-ink transition-colors outline-none focus-visible:border-[var(--panel-acento)] focus-visible:ring-2 focus-visible:ring-[var(--panel-acento)]/30"
                      />

                      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => copiar(c)}
                          disabled={vacio}
                          className="flex min-h-11 flex-none items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface-2 px-4 text-[13.5px] font-medium text-ink transition-[background-color,transform] hover:bg-surface-3 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <IconoCopiar className="h-4 w-4" />
                          Copiar mensaje
                        </button>

                        {valido && !vacio ? (
                          <a
                            href={waLinkCliente(c.telefono, texto)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex min-h-11 flex-none items-center justify-center gap-2 rounded-xl bg-[color-mix(in_srgb,var(--panel-acento)_86%,black)] px-4 text-[13.5px] font-medium text-white transition-[background-color,transform] hover:bg-[color-mix(in_srgb,var(--panel-acento)_74%,black)] active:scale-[0.99]"
                          >
                            Abrir en WhatsApp
                            <IconoExterno className="h-4 w-4" />
                          </a>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="flex min-h-11 flex-none cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-surface-3 px-4 text-[13.5px] font-medium text-ink-faint"
                          >
                            Abrir en WhatsApp
                          </button>
                        )}
                      </div>

                      <p
                        role="status"
                        aria-live="polite"
                        className={cn("mt-2 min-h-[18px] text-[12px] leading-snug", miAviso === "error" ? "text-warn" : "text-ok")}
                      >
                        {miAviso === "copiado"
                          ? "Mensaje copiado. Pegalo en el chat de WhatsApp."
                          : miAviso === "error"
                            ? "No se pudo copiar solo: seleccioná el texto y copialo a mano."
                            : ""}
                      </p>

                      {!valido ? (
                        <p className="mt-1 text-[12px] leading-snug text-warn">
                          El número de esta persona ({formatearTelefono(c.telefono)}) no parece completo, así que no se
                          puede abrir el chat. Podés copiar el mensaje y buscarla vos.
                        </p>
                      ) : (
                        <p className="mt-1 font-mono text-[11px] text-ink-faint">{formatearTelefono(c.telefono)}</p>
                      )}

                      <div className="mt-1 flex flex-wrap items-center gap-x-4">
                        {editado ? (
                          <button
                            type="button"
                            onClick={() => {
                              setEdiciones((prev) => {
                                const siguiente = { ...prev };
                                delete siguiente[c.contactoId];
                                return siguiente;
                              });
                              setAviso(null);
                            }}
                            className="min-h-11 text-[12px] font-medium text-ink-mute transition-colors hover:text-ink"
                          >
                            Volver al mensaje sugerido
                          </button>
                        ) : null}
                        <Link
                          href={`/panel/agente/conversaciones?c=${c.conversacionId}`}
                          prefetch={false}
                          className="inline-flex min-h-11 items-center gap-1 text-[12px] font-medium text-[color:var(--panel-acento-texto)] transition-opacity hover:opacity-80"
                        >
                          Ver la conversación
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {total > contactos.length ? (
            <p className="mt-3 text-[11.5px] text-ink-mute">
              Se muestran las {entero(contactos.length)} más recientes de {entero(total)}.
            </p>
          ) : null}
          {contactos.length > visibles ? (
            <button
              type="button"
              onClick={() => setVisibles((v) => v + PAGINA)}
              className="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl border border-line text-[12.5px] font-medium text-ink-mute transition-colors hover:border-line-strong hover:text-ink"
            >
              Ver {entero(Math.min(PAGINA, contactos.length - visibles))} más
            </button>
          ) : null}
        </>
      )}

      <Calculo>
        <p>
          <b className="font-medium text-ink-mute">A quién aparece acá:</b> a las personas de «Oportunidades» que llevan
          más de 24 horas sin actividad en la conversación.
        </p>
        <p>
          <b className="font-medium text-ink-mute">El mensaje</b> sale con el nombre de la persona, el nombre de tu
          negocio, el servicio que mencionó (si lo nombró) y el trato (vos o usted) que tiene configurado tu agente. Es
          solo una sugerencia: editalo como quieras.
        </p>
        <p>
          <b className="font-medium text-ink-mute">Por qué lo mandás vos:</b> WhatsApp solo deja escribirle a alguien desde
          el número del agente, con una plantilla aprobada por Meta, cuando pasaron más de 24 horas desde el último mensaje
          de la persona; eso todavía no está disponible. Acá solo aparecen conversaciones sin ningún movimiento hace más
          de 24 horas (de quien sea), así que esa ventana seguro ya cerró. «Abrir en WhatsApp» abre un chat desde tu propio
          WhatsApp, con el texto ya escrito.
        </p>
        <p>Todavía no queda registro de a quién ya le escribiste: llevá la cuenta para no escribirle dos veces.</p>
      </Calculo>
    </Caja>
  );
}
