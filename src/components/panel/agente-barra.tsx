"use client";

/* ==========================================================================
   Barra del entorno del Agente de WhatsApp.

   POR QUÉ TIENE BARRA PROPIA Y NO PESTAÑAS (decidido con Sebastián):
   el resto de las automatizaciones caben en 3-4 pestañas porque se configuran
   y ya. Esta se OPERA todos los días — se leen conversaciones, se contesta, se
   revisan citas. Eso es una aplicación, no una ficha, y por eso al entrar se
   reemplaza la barra del panel por esta.

   El camino de vuelta ("Automatizaciones", arriba del todo) es obligatorio:
   sin él, el cliente entra y no encuentra cómo salir.
   ========================================================================== */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icono, type NombreIcono } from "@/components/panel/iconos";
import { TemaSelector } from "@/components/panel/tema-selector";
import { LinkReiniciarTour, TourGuiado, type PasoTour } from "@/components/panel/tour";
import { cn } from "@/lib/utils";

const PASOS_TOUR: PasoTour[] = [
  {
    selector: '[data-tour="resumen"]',
    titulo: "Resumen",
    texto: "De un vistazo: cuántas conversaciones entraron hoy, cuántas citas agendó solo, y quién necesita que le contestés vos.",
  },
  {
    selector: '[data-tour="conversaciones"]',
    titulo: "Conversaciones",
    texto: "Todo lo que tu agente habla con tus clientes por WhatsApp. Si algo necesita una persona, aparece primero acá.",
  },
  {
    selector: '[data-tour="correo"]',
    titulo: "Correo",
    texto: "Si conectás tu correo, el mismo agente contesta ahí también — mismo tono, mismos datos.",
  },
  {
    selector: '[data-tour="contactos"]',
    titulo: "Contactos",
    texto: "Cada persona que te escribió, con su historial y sus citas — para agendar a mano un walk-in o una llamada también.",
  },
  {
    selector: '[data-tour="citas"]',
    titulo: "Citas",
    texto: "La agenda que tu agente arma solo, comprobando cupo real antes de confirmar.",
  },
  {
    selector: '[data-tour="como-responde"]',
    titulo: "Cómo responde",
    texto: "La personalidad de tu agente: de vos o de usted, qué tan formal, y cuándo tiene que frenar y llamarte a vos.",
  },
  {
    selector: '[data-tour="que-sabe"]',
    titulo: "Qué sabe",
    texto: "Precios, servicios y datos de tu negocio. Si algo no está acá, tu agente nunca lo inventa — pregunta.",
  },
  {
    selector: '[data-tour="correcciones"]',
    titulo: "Correcciones",
    texto: "Cuando el agente no supo algo, queda anotado acá. Se lo enseñás una vez y no lo vuelve a preguntar.",
  },
  {
    selector: '[data-tour="conexion"]',
    titulo: "Conexión",
    texto: "El estado real de tu número de WhatsApp — acá te enterás primero si el token venció, antes que un cliente.",
  },
  {
    selector: '[data-tour="uso"]',
    titulo: "Uso y límites",
    texto: "Cuánto llevás consumido este mes de tu plan. Listo — eso es todo el recorrido.",
  },
];

type Item = {
  href: string;
  texto: string;
  icono: NombreIcono;
  /** Número real. `0` no pinta nada: una pastilla en cero es ruido. */
  cuenta?: number;
  /** Ámbar en vez de gris: esto le toca a una persona. */
  alerta?: boolean;
  /** Con qué lo encuentra el recorrido guiado (ver `tour.tsx`). */
  tour: string;
};

type Grupo = { titulo: string; items: Item[] };

export function AgenteBarra({
  telefono,
  activo,
  esperando,
  esperandoCorreo,
  contactos,
  citas,
  correcciones,
}: {
  telefono: string;
  activo: boolean;
  esperando: number;
  esperandoCorreo: number;
  contactos: number;
  citas: number;
  correcciones: number;
}) {
  const pathname = usePathname();
  /* Antes, en celular, la barra entera se aplastaba en una fila horizontal
     con TODO visible (10 ítems desparramados, sin agrupar) — encontrado por
     Sebastián probando en su teléfono: "que tenga las 3 rayas en vez de todo
     desplegado", igual que ya tiene el panel principal (`shell.tsx`). Ahora
     en celular es una barra angosta con el nombre + botón de menú, y el
     contenido de siempre se abre como cajón lateral — en escritorio (`md:`)
     sigue exactamente igual que antes, fija a la izquierda. */
  const [abierto, setAbierto] = useState(false);

  const grupos: Grupo[] = [
    {
      titulo: "Inicio",
      items: [{ href: "/panel/agente", texto: "Resumen", icono: "inicio", tour: "resumen" }],
    },
    {
      titulo: "Operación",
      items: [
        {
          href: "/panel/agente/conversaciones",
          texto: "Conversaciones",
          icono: "mensajes",
          cuenta: esperando,
          alerta: true,
          tour: "conversaciones",
        },
        {
          href: "/panel/agente/correo",
          texto: "Correo",
          icono: "correo",
          cuenta: esperandoCorreo,
          alerta: true,
          tour: "correo",
        },
        {
          href: "/panel/agente/contactos",
          texto: "Contactos",
          icono: "clientes",
          cuenta: contactos,
          tour: "contactos",
        },
        { href: "/panel/agente/citas", texto: "Citas", icono: "calendario", cuenta: citas, tour: "citas" },
      ],
    },
    {
      titulo: "El agente",
      items: [
        { href: "/panel/agente/como-responde", texto: "Cómo responde", icono: "ajustes", tour: "como-responde" },
        { href: "/panel/agente/que-sabe", texto: "Qué sabe", icono: "documento", tour: "que-sabe" },
        {
          href: "/panel/agente/correcciones",
          texto: "Correcciones",
          icono: "pendientes",
          cuenta: correcciones,
          alerta: true,
          tour: "correcciones",
        },
      ],
    },
    {
      titulo: "Ajustes",
      items: [
        { href: "/panel/agente/conexion", texto: "Conexión", icono: "conexiones", tour: "conexion" },
        { href: "/panel/agente/uso", texto: "Uso y límites", icono: "actividad", tour: "uso" },
      ],
    },
  ];

  /* `/panel/agente` es prefijo de todas las demás: si se comparara con
     startsWith, el Resumen quedaría marcado en cada pantalla. */
  const esActual = (href: string) =>
    href === "/panel/agente" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Barra angosta de celular — lo único visible ahí hasta que se abre
          el cajón. Reemplaza la fila horizontal con todo desparramado que
          había antes. */}
      <div className="flex flex-none items-center gap-2.5 border-b border-line bg-surface px-3.5 py-2.5 md:hidden">
        <button
          type="button"
          onClick={() => setAbierto(true)}
          aria-label="Abrir menú"
          aria-expanded={abierto}
          className="grid h-8 w-8 flex-none place-items-center rounded-[9px] border border-line-strong text-ink-mute transition-colors hover:bg-surface-2"
        >
          <Icono nombre="menu" className="h-4 w-4" />
        </button>
        <span className="grid h-7 w-7 flex-none place-items-center rounded-lg border border-line-strong bg-surface-3 text-ok">
          <Icono nombre="mensajes" className="h-3.5 w-3.5" />
        </span>
        <p className="min-w-0 flex-1 truncate text-[13px] font-semibold tracking-tight text-ink">
          Agente de WhatsApp
        </p>
        <span className={cn("h-1.5 w-1.5 flex-none rounded-full", activo ? "bg-ok" : "bg-ink-faint")} />
      </div>

      {abierto ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          aria-label="Cerrar menú"
          onClick={() => setAbierto(false)}
        />
      ) : null}

      <aside
        className={cn(
          "scroll-fino fixed inset-y-0 left-0 z-40 flex h-dvh w-[264px] flex-col border-line bg-surface transition-transform duration-200 ease-out",
          "md:sticky md:top-0 md:z-auto md:h-dvh md:w-[248px] md:translate-x-0 md:overflow-y-auto md:border-r",
          abierto ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="border-b border-line px-3.5 pt-3.5 pb-3">
          <div className="-mx-1.5 mb-3 flex items-center justify-between gap-2">
            <Link
              href="/panel/automatizaciones"
              onClick={() => setAbierto(false)}
              className="-mt-1 inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink-soft"
            >
              <Icono nombre="flecha" className="h-3 w-3 rotate-180" />
              Automatizaciones
            </Link>
            <TemaSelector />
          </div>

          <div className="flex items-start gap-2.5">
            <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-lg border border-line-strong bg-surface-3 text-ok">
              <Icono nombre="mensajes" className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-tight text-ink">
                Agente de WhatsApp
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-ink-mute">
                <span
                  className={cn(
                    "h-1.5 w-1.5 flex-none rounded-full",
                    activo ? "bg-ok" : "bg-ink-faint"
                  )}
                />
                <span className="truncate">
                  {activo ? "Activo" : "En pausa"}
                  {telefono ? ` · ${telefono}` : ""}
                </span>
              </p>
            </div>
          </div>
        </div>

        <nav className="scroll-fino flex-1 px-2.5 py-3">
          {grupos.map((g) => (
            <div key={g.titulo} className="[&+div]:mt-[18px]">
              <p className="px-2 pb-[7px] font-mono text-[10px] tracking-[0.12em] text-ink-faint uppercase">
                {g.titulo}
              </p>
              {g.items.map((it) => {
                const actual = esActual(it.href);
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    data-tour={it.tour}
                    onClick={() => setAbierto(false)}
                    aria-current={actual ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[7px] px-2 py-[7px] text-[13px] transition-colors",
                      actual
                        ? "bg-surface-3 font-medium text-ink"
                        : "text-ink-mute hover:bg-surface-2 hover:text-ink-soft"
                    )}
                  >
                    <Icono nombre={it.icono} className="h-[15px] w-[15px] flex-none opacity-85" />
                    <span className="flex-1 truncate">{it.texto}</span>
                    {it.cuenta ? (
                      <span
                        className={cn(
                          "min-w-[18px] rounded-full border px-1.5 text-center font-mono text-[10px] tabular-nums",
                          it.alerta
                            ? "border-warn/40 bg-warn/15 text-warn"
                            : "border-line-strong bg-surface-3 text-ink-mute"
                        )}
                      >
                        {it.cuenta}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="flex-none border-t border-line px-3.5 py-2.5">
          <LinkReiniciarTour id="agente-whatsapp" />
        </div>

        <TourGuiado id="agente-whatsapp" pasos={PASOS_TOUR} />
      </aside>
    </>
  );
}
