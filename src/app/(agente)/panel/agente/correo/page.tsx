import Link from "next/link";
import { BotonCorreoNuevo } from "@/components/panel/agente-correo-nuevo";
import { RedactarCorreo } from "@/components/panel/agente-redactar-correo";
import { Avatar } from "@/components/panel/clientes/piezas";
import {
  EstadoConversacionCorreo,
  FichaContacto,
  ItemConversacion,
  MensajeTarjeta,
} from "@/components/panel/correo/piezas";
import { Icono } from "@/components/panel/iconos";
import { getContactosCorreo, getConversacionesCorreo, getMensajesCorreo } from "@/lib/panel/agente";
import { relativa } from "@/lib/panel/agente-formato";
import { cn } from "@/lib/utils";

/* ==========================================================================
   Correo — la bandeja del agente. Fase 4a del rediseño.

   La conversación abierta va en la URL (`?c=<id>`) y todo se dibuja en el
   servidor, igual que Conversaciones. Más simple que WhatsApp: el correo no
   tiene audios, herramientas ni "notas" del agente al dueño.

   CELULAR (menos de `md`): una cosa a la vez. Sin `?c=` se ve la bandeja
   (con filtros y "Redactar nuevo"); con `?c=` se ve SOLO el hilo, con una
   flecha para volver. Antes las dos columnas se apilaban dentro de una
   altura fija y quedaban cortadas. En escritorio se ven juntas, y la ficha
   del contacto aparece desde `xl`.
   ========================================================================== */

const FILTROS = [
  { clave: "todas", texto: "Todas" },
  { clave: "espera", texto: "Esperan a vos" },
  { clave: "agente", texto: "El agente" },
  { clave: "humano", texto: "Las tomaste vos" },
] as const;

type Filtro = (typeof FILTROS)[number]["clave"];

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

  /* En celular, "hay hilo" solo si la persona eligió uno: sin `?c=` se queda
     en la bandeja aunque en escritorio se abra el primero solo. */
  const hayHilo = Boolean(c) && abierta !== null;

  /* El asunto del hilo es el del último mensaje — en la práctica no cambia
     dentro de una conversación (todo es "Re: lo mismo"), como en cualquier
     cliente de correo de verdad. */
  const asuntoHilo = mensajes[mensajes.length - 1]?.asunto || "(sin asunto)";
  const asuntoRespuesta = /^re:/i.test(asuntoHilo) ? asuntoHilo : `Re: ${asuntoHilo}`;

  const cuenta = (clave: Filtro) =>
    clave === "todas" ? todas.length : todas.filter((x) => x.estado === clave).length;
  const esperan = cuenta("espera");

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* ---------- Barra de arriba: título, filtros y "Redactar nuevo" ---------- */}
      <div className={cn("flex-none border-b border-line px-4 py-3.5 sm:px-[26px]", hayHilo && "max-md:hidden")}>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="min-w-0 flex-1 xl:flex-none">
            <h1 className="text-[24px] leading-tight font-semibold tracking-[-0.03em] text-ink sm:text-[26px]">
              Correo
            </h1>
            <p className="mt-0.5 text-[12.5px] leading-snug text-ink-faint">
              {todas.length === 0
                ? "Sin conversaciones todavía"
                : `${todas.length} ${todas.length === 1 ? "conversación" : "conversaciones"}${
                    esperan > 0 ? ` · ${esperan} ${esperan === 1 ? "espera" : "esperan"} a vos` : ""
                  }`}
            </p>
          </div>

          <nav
            aria-label="Filtrar conversaciones"
            className="scroll-fino order-3 -mx-4 flex w-[calc(100%+2rem)] gap-2 overflow-x-auto px-4 pb-0.5 sm:-mx-[26px] sm:w-[calc(100%+52px)] sm:px-[26px] xl:order-2 xl:mx-0 xl:w-auto xl:flex-1 xl:flex-wrap xl:overflow-visible xl:px-0 xl:pb-0"
          >
            {FILTROS.map((x) => {
              const n = cuenta(x.clave);
              const activo = x.clave === filtro;
              return (
                <Link
                  key={x.clave}
                  href={`/panel/agente/correo?f=${x.clave}`}
                  prefetch={false}
                  aria-current={activo ? "true" : undefined}
                  className={cn(
                    "inline-flex h-11 flex-none items-center gap-2 rounded-full border px-4 text-[13px] whitespace-nowrap transition-colors md:h-9 md:px-3.5",
                    activo
                      ? "border-[var(--panel-acento-borde)] bg-[var(--panel-acento-fondo)] font-medium text-[color:var(--panel-acento-texto)]"
                      : "border-line bg-surface-2 text-ink-mute hover:border-line-strong hover:text-ink"
                  )}
                >
                  {x.texto}
                  <span className="font-mono text-[11px] tabular-nums opacity-70">{n}</span>
                </Link>
              );
            })}
          </nav>

          <BotonCorreoNuevo className="order-2 xl:order-3" />
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] md:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_290px]">
        {/* ---------- bandeja ---------- */}
        <div
          className={cn(
            "scroll-fino min-h-0 overflow-y-auto border-line pb-[env(safe-area-inset-bottom)] md:border-r",
            hayHilo && "max-md:hidden"
          )}
        >
          {lista.length === 0 ? (
            <p className="px-5 py-12 text-center text-[13px] leading-relaxed text-ink-faint">
              {todas.length === 0
                ? "Todavía no hay correos. En cuanto le escriban a la casilla conectada, aparecen acá."
                : "No hay conversaciones con ese filtro."}
            </p>
          ) : (
            <ul>
              {lista.map((x, i) => (
                <ItemConversacion
                  key={x.id}
                  conversacion={x}
                  activa={abierta?.id === x.id}
                  filtro={filtro}
                  indice={i}
                />
              ))}
            </ul>
          )}
        </div>

        {/* ---------- hilo ---------- */}
        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-col overflow-hidden border-line xl:border-r",
            !hayHilo && "max-md:hidden"
          )}
        >
          {!abierta ? (
            <p className="px-5 py-12 text-center text-[13px] text-ink-faint">Elegí una conversación de la lista.</p>
          ) : (
            <>
              <div className="flex flex-none items-center gap-2.5 border-b border-line py-2.5 pr-4 pl-2 md:gap-3 md:py-3 md:pl-5">
                <Link
                  href={`/panel/agente/correo?f=${filtro}`}
                  prefetch={false}
                  aria-label="Volver a la bandeja"
                  className="grid h-11 w-11 flex-none place-items-center rounded-xl text-ink-mute transition-colors hover:bg-surface-3 hover:text-ink md:hidden"
                >
                  <Icono nombre="flecha" className="h-[18px] w-[18px] rotate-180" />
                </Link>
                <Avatar nombre={abierta.nombre} />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[14px] font-medium text-ink">{abierta.nombre}</h2>
                  <p className="truncate font-mono text-[11px] text-ink-faint">{abierta.correo}</p>
                </div>
                <span className="flex-none max-sm:hidden">
                  <EstadoConversacionCorreo estado={abierta.estado} />
                </span>
              </div>

              {/* El asunto va UNA vez arriba del todo, como en cualquier
                  cliente de correo — no se repite en cada mensaje. */}
              <div className="flex flex-none items-center gap-2 border-b border-line bg-surface px-4 py-2 md:px-5">
                <span className="flex-none font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase">
                  Asunto
                </span>
                <p className="min-w-0 truncate text-[12.5px] font-medium text-ink-soft">{asuntoHilo}</p>
              </div>

              <div className="scroll-fino flex min-h-0 flex-1 flex-col-reverse gap-3 overflow-y-auto px-4 py-4 md:px-5 md:py-5">
                {mensajes.length === 0 ? (
                  <p className="px-4 py-10 text-center text-[13px] text-ink-faint">
                    Esta conversación todavía no tiene mensajes.
                  </p>
                ) : (
                  [...mensajes].reverse().map((m) => <MensajeTarjeta key={m.id} m={m} contacto={contacto} />)
                )}
              </div>

              <RedactarCorreo
                conversacion={abierta}
                asunto={asuntoRespuesta}
                tomadaHace={relativa(abierta.ultimoEn)}
              />
            </>
          )}
        </div>

        {/* ---------- ficha del contacto ---------- */}
        <div className="scroll-fino hidden min-h-0 overflow-y-auto xl:block">
          {contacto ? <FichaContacto contacto={contacto} /> : null}
        </div>
      </div>
    </div>
  );
}
