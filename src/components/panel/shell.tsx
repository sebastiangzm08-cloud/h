"use client";

/* ==========================================================================
   El armazón del panel: barra lateral + barra superior. (Rediseño Fase 1,
   2026-09-23.)

   UNA SOLA barra para todo el panel del cliente. Antes el Agente de WhatsApp
   tenía la suya aparte (`agente-barra.tsx`) y al entrar "se cambiaba" de
   barra: ahora el Agente es parte del mismo menú, y sus pantallas viven
   dentro de este mismo armazón.

   La barra lateral CAMBIA ENTERA según el rol. No es que se oculten ítems:
   son dos menús distintos. Y el menú del cliente se arma según lo que TIENE
   contratado (`modulos`): sin Agente no aparece nada del Agente.

   Ojo: esconder ítems es cosmético. Quien de verdad impide que un cliente
   vea datos de otro son las reglas RLS en la base. Acá no hay ninguna
   decisión de seguridad.

   Estructura de la barra: marca fija arriba, menú con scroll propio en el
   medio, tarjeta del plan fija abajo. Sin esto, con muchos ítems la tarjeta
   se va bajo el borde y el menú parece cortado.

   DOS MODOS DE PÁGINA:
   - "página" (casi todo): el contenido tiene margen y ancho máximo, y la
     ventana entera scrollea.
   - "aplicación" (`/panel/agente/*`): pantallas que se operan todo el día
     (Conversaciones, Contactos, Correo) y manejan su propio alto. Acá la
     ventana NO scrollea: el único que scrollea es `<main>`, que ocupa lo que
     queda bajo la barra superior, y cada pantalla pone sus propios márgenes.
   ========================================================================== */
import "./panel-tokens.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ConstellationMark } from "@/components/constellation";
import { Icono, type NombreIcono } from "@/components/panel/iconos";
import { BuscadorPanel, type Destino } from "@/components/panel/buscador-panel";
import { TemaSelector } from "@/components/panel/tema-selector";
import { LinkReiniciarTour, TourGuiado } from "@/components/panel/tour";
import { ID_TOUR_AGENTE, PASOS_TOUR_AGENTE } from "@/components/panel/tour-agente";
import { Eyebrow } from "@/components/panel/ui";
import { cn } from "@/lib/utils";

type Item = {
  href: string;
  label: string;
  icono: NombreIcono;
  /** Con qué lo encuentra el recorrido guiado (ver `tour-agente.ts`). */
  tour?: string;
};
type Grupo = { titulo?: string; items: Item[] };

/** Lo que el cliente tiene contratado y cambia qué ve en el menú. */
export type ModulosCliente = {
  /** "Tu negocio" (el formulario de posts) solo le sirve a Redes sociales. */
  redes: boolean;
  agente: boolean;
};

/** Tarjeta del plan, abajo en la barra. `uso` solo si hay un tope real. */
export type PlanTarjeta = {
  nombre: string;
  uso: { etiqueta: string; usado: number; tope: number } | null;
};

/* Ítems cuya pastilla, cuando trae número, va en ámbar: son cosas por
   atender, no un simple recuento. Los demás ítems no llevan número: una
   pastilla con un total (contactos, citas) es ruido al lado de una alerta. */
const HREF_ALERTA = new Set([
  "/panel/agente/conversaciones",
  "/panel/agente/correo",
  "/panel/agente/correcciones",
  "/panel/admin/mensajes",
  "/panel/admin/ejecuciones",
  "/panel/admin/pagos",
]);

function navCliente({ redes, agente }: ModulosCliente): Grupo[] {
  const principal: Item[] = [
    { href: "/panel", label: "Inicio", icono: "inicio", tour: "resumen" },
  ];
  if (agente) {
    principal.push(
      { href: "/panel/agente/conversaciones", label: "Conversaciones", icono: "mensajes", tour: "conversaciones" },
      { href: "/panel/agente/correo", label: "Correo", icono: "correo", tour: "correo" },
      { href: "/panel/agente/contactos", label: "Clientes", icono: "clientes", tour: "contactos" },
      { href: "/panel/agente/citas", label: "Agenda", icono: "calendario", tour: "citas" }
    );
  }
  principal.push(
    { href: "/panel/automatizaciones", label: "Automatizaciones", icono: "automatizaciones" },
    { href: "/panel/catalogo", label: "Catálogo", icono: "catalogo" }
  );
  if (agente) {
    principal.push(
      { href: "/panel/agente/que-sabe", label: "Conocimiento", icono: "documento", tour: "que-sabe" },
      { href: "/panel/agente/correcciones", label: "Correcciones", icono: "pendientes", tour: "correcciones" },
      { href: "/panel/agente/uso", label: "Uso y límites", icono: "actividad", tour: "uso" }
    );
  }

  const negocio: Item[] = [];
  if (agente) {
    negocio.push(
      { href: "/panel/agente/como-responde", label: "Configuración", icono: "ajustes", tour: "como-responde" },
      { href: "/panel/agente/conexion", label: "Conexión de WhatsApp", icono: "conexiones", tour: "conexion" }
    );
  }
  if (redes) negocio.push({ href: "/panel/perfil", label: "Tu negocio", icono: "negocio" });
  /* `/panel/conexiones` es el genérico de Redes (excluye WhatsApp a
     propósito): a quien solo tiene el Agente no le muestra nada. */
  if (redes || !agente) {
    negocio.push({ href: "/panel/conexiones", label: "Integraciones", icono: "conexiones" });
  }
  negocio.push({ href: "/panel/actividad", label: "Actividad", icono: "actividad" });

  return [
    { items: principal },
    { titulo: "Mi negocio", items: negocio },
    {
      titulo: "Cuenta",
      items: [
        { href: "/panel/facturacion", label: "Facturación", icono: "facturacion" },
        { href: "/panel/ajustes", label: "Ajustes", icono: "ajustes" },
        { href: "/panel/soporte", label: "Soporte", icono: "soporte" },
      ],
    },
  ];
}

const NAV_ADMIN: Grupo[] = [
  {
    titulo: "Operación",
    items: [
      { href: "/panel/admin", label: "Inicio", icono: "inicio" },
      { href: "/panel/admin/clientes", label: "Clientes", icono: "clientes" },
      { href: "/panel/admin/pagos", label: "Pagos", icono: "facturacion" },
      { href: "/panel/admin/asignar", label: "Asignar automatización", icono: "asignar" },
      { href: "/panel/admin/alta", label: "Alta de cliente", icono: "alta" },
      { href: "/panel/admin/demos", label: "Demos de venta", icono: "demo" },
    ],
  },
  {
    titulo: "Sistema",
    items: [
      { href: "/panel/admin/catalogo", label: "Catálogo maestro", icono: "catalogo" },
      { href: "/panel/admin/ejecuciones", label: "Ejecuciones", icono: "ejecuciones" },
      { href: "/panel/admin/costos", label: "Costos e ingresos", icono: "costos" },
    ],
  },
  {
    titulo: "Soporte",
    items: [{ href: "/panel/admin/mensajes", label: "Mensajes", icono: "mensajes" }],
  },
];

/**
 * `/panel/automatizaciones/redes` tiene que marcar "Automatizaciones".
 * `/panel/agente` (el Resumen viejo del Agente) no tiene ítem propio: cuelga
 * de Inicio, que es donde vive lo mismo ahora.
 */
function estaActivo(href: string, pathname: string) {
  if (href === "/panel") return pathname === "/panel" || pathname === "/panel/agente";
  if (href === "/panel/admin") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

/** Resorte corto: se siente vivo sin hacer esperar. */
const RESORTE = { type: "spring", stiffness: 420, damping: 38, mass: 0.6 } as const;

const CLASE_ICONO_BOTON =
  "grid h-11 w-11 flex-none place-items-center rounded-[12px] border border-line bg-surface-2 text-ink-mute transition-colors hover:border-line-strong hover:text-ink-soft active:scale-95 lg:h-[36px] lg:w-[36px] lg:rounded-[10px]";

export function PanelShell({
  nombre,
  persona,
  subtitulo,
  aviso,
  contadores = {},
  modulos = { redes: true, agente: false },
  plan,
  children,
}: {
  /** El negocio (cliente) o el nombre del admin. */
  nombre: string;
  /** La persona que inició sesión, para la ficha de arriba a la derecha. */
  persona: string;
  subtitulo: string;
  /** Banda de aviso fija bajo el encabezado (ej. "completá tu perfil"). */
  aviso?: ReactNode;
  /** Números reales por href para las pastillas de la barra y la campana. */
  contadores?: Record<string, number>;
  /** Solo el cliente lo pasa; el admin ve su menú fijo. */
  modulos?: ModulosCliente;
  /** Solo el cliente: el admin no tiene plan. */
  plan?: PlanTarjeta;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [scrolleado, setScrolleado] = useState(false);
  const principalRef = useRef<HTMLElement>(null);

  const enAdmin = pathname.startsWith("/panel/admin");
  const enAgente = pathname.startsWith("/panel/agente");
  const grupos = enAdmin ? NAV_ADMIN : navCliente(modulos);

  /* Destinos para la búsqueda: los ítems del menú de este rol. */
  const destinos: Destino[] = grupos.flatMap((g) =>
    g.items.map((it) => ({ href: it.href, label: it.label, grupo: g.titulo }))
  );

  /* El menú móvil se cierra al tocar un ítem (ver `onClick` en los enlaces
     de abajo) y al tocar el fondo oscuro. No se reacciona a `pathname` con
     un efecto: cerrar es consecuencia del clic, no del cambio de ruta. */

  /* El encabezado deja de ser una barra plana y se despega al bajar.
     Medición dentro de rAF para no disparar trabajo en cada evento de
     scroll. En modo "aplicación" el que scrollea es `<main>`, no la ventana. */
  useEffect(() => {
    const destino: HTMLElement | Window | null = enAgente ? principalRef.current : window;
    if (!destino) return;
    const leer = () =>
      destino instanceof Window ? destino.scrollY : (destino as HTMLElement).scrollTop;
    let pendiente = false;
    const alScroll = () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(() => {
        setScrolleado(leer() > 8);
        pendiente = false;
      });
    };
    alScroll();
    destino.addEventListener("scroll", alScroll, { passive: true });
    return () => destino.removeEventListener("scroll", alScroll);
  }, [enAgente, pathname]);

  const destinoCampana = enAdmin ? "/panel/admin/mensajes" : "/panel/pendientes";
  const pendientesCampana = contadores[destinoCampana] ?? 0;
  const etiquetaCampana = enAdmin ? "Mensajes" : "Pendientes";

  const inicial = (persona || nombre).trim().charAt(0).toUpperCase() || "·";
  const fichaUsuario = (
    <>
      <span className="grid h-[38px] w-[38px] flex-none place-items-center rounded-full bg-[var(--panel-acento-fondo)] text-[13px] font-semibold text-[color:var(--panel-acento-texto)] shadow-[inset_0_0_0_1px_var(--panel-acento-borde)] sm:h-[30px] sm:w-[30px] sm:text-[12px]">
        {inicial}
      </span>
      <span className="hidden min-w-0 text-left sm:block">
        <span className="block max-w-[150px] truncate text-[12.5px] leading-tight font-medium text-ink-soft">
          {persona || nombre}
        </span>
        <span className="block max-w-[150px] truncate font-mono text-[10px] leading-tight tracking-wide text-ink-faint">
          {subtitulo}
        </span>
      </span>
    </>
  );

  return (
    <div
      className={cn(
        "panel-scope bg-paper text-ink-soft lg:grid lg:grid-cols-[264px_1fr]",
        enAgente ? "h-dvh overflow-hidden" : "min-h-dvh"
      )}
      // El script en el layout raíz (antes de hidratar) le pone `data-tema`
      // según lo que esta persona ya había elegido — el servidor no lo
      // puede saber, así que esta diferencia entre HTML de servidor y
      // cliente es esperada, no un bug.
      suppressHydrationWarning
    >
      {abierto ? (
        <button
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-label="Cerrar menú"
          onClick={() => setAbierto(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-dvh w-[264px] flex-col border-r border-line bg-surface transition-transform duration-200 ease-out",
          "lg:sticky lg:top-0 lg:z-auto lg:translate-x-0",
          abierto ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Marca — fija. El logo lleva al inicio. */}
        <div className="flex flex-none items-center gap-2.5 px-5 pt-5 pb-3">
          <Link
            href={enAdmin ? "/panel/admin" : "/panel"}
            prefetch={false}
            onClick={() => setAbierto(false)}
            aria-label="Ir al inicio"
            className="flex items-center gap-2.5 rounded-md transition-opacity hover:opacity-80"
          >
            <ConstellationMark className="h-[24px] w-[24px] text-ink" />
            <b className="text-[15.5px] font-semibold tracking-tight text-ink">Hoshizora</b>
          </Link>
          <span className="ml-auto rounded-full border border-line-strong px-[7px] py-0.5 font-mono text-[9.5px] tracking-[0.11em] text-ink-faint uppercase">
            {enAdmin ? "Studio" : "Panel"}
          </span>
        </div>

        {/* Menú — la única parte que hace scroll */}
        <div className="scroll-fino flex flex-1 flex-col gap-[18px] overflow-y-auto px-3.5 py-2">
          {grupos.map((grupo, i) => (
            <nav key={i} className="flex flex-col gap-0.5" aria-label={grupo.titulo ?? "Principal"}>
              {grupo.titulo ? (
                <div className="px-2.5 pt-1.5 pb-1">
                  <Eyebrow>{grupo.titulo}</Eyebrow>
                </div>
              ) : null}
              {grupo.items.map((item) => {
                const activo = estaActivo(item.href, pathname);
                const cuenta = contadores[item.href] ?? 0;
                const alerta = HREF_ALERTA.has(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-tour={item.tour}
                    // `false`: estos enlaces apuntan a datos que cambian
                    // seguido (clientes, pagos, mensajes). Con el prefetch
                    // por defecto, Next precarga la página en cuanto entra
                    // en pantalla y esa versión se puede quedar pegada en
                    // caché — se vio "0 clientes" en la lista con el dato
                    // real ya en 1. Sin prefetch, cada clic trae la página
                    // de una.
                    prefetch={false}
                    onClick={() => setAbierto(false)}
                    aria-current={activo ? "page" : undefined}
                    className={cn(
                      "relative flex w-full items-center gap-[11px] rounded-[10px] px-2.5 py-3 text-[14px] transition-colors duration-150 lg:py-[9px] lg:text-[13.5px]",
                      activo ? "font-medium text-ink" : "text-ink-mute hover:bg-surface-2 hover:text-ink-soft"
                    )}
                  >
                    {/* El resaltado se DESLIZA entre ítems en vez de saltar. */}
                    {activo ? (
                      <motion.span
                        layoutId={`nav-activo-${enAdmin ? "adm" : "cli"}`}
                        transition={RESORTE}
                        className="absolute inset-0 rounded-[10px] bg-[var(--panel-acento-fondo)] shadow-[inset_0_0_0_1px_var(--panel-acento-borde)]"
                      >
                        <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[var(--panel-acento)]" />
                      </motion.span>
                    ) : null}
                    <Icono
                      nombre={item.icono}
                      className={cn(
                        "relative z-10 h-[17px] w-[17px] flex-none",
                        activo ? "text-[color:var(--panel-acento-texto)]" : "opacity-85"
                      )}
                    />
                    <span className="relative z-10 truncate">{item.label}</span>
                    {cuenta > 0 ? (
                      <span
                        className={cn(
                          "relative z-10 ml-auto rounded-full px-1.5 py-px font-mono text-[10px] tabular-nums",
                          alerta ? "bg-warn/15 text-warn" : "bg-surface-3 text-ink-faint"
                        )}
                      >
                        {cuenta > 99 ? "99+" : cuenta}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          ))}
        </div>

        {/* Pie — fijo abajo, siempre visible */}
        <div className="flex flex-none flex-col gap-3 border-t border-line px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {enAdmin ? (
            <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface-2 p-2">
              <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-lg bg-surface-3 text-xs font-semibold text-ink shadow-[inset_0_0_0_1px_rgba(255,255,255,0.11)]">
                {inicial}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12.5px] font-medium text-ink-soft">{nombre}</span>
                <span className="block font-mono text-[10px] tracking-wide text-ink-faint">
                  {subtitulo}
                </span>
              </span>
            </div>
          ) : plan ? (
            <Link
              href="/panel/facturacion"
              prefetch={false}
              onClick={() => setAbierto(false)}
              className="group block rounded-xl border border-line bg-surface-2 p-3 transition-colors hover:border-line-strong"
            >
              <span className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-[var(--panel-acento-fondo)] text-[color:var(--panel-acento-texto)]">
                  <Icono nombre="facturacion" className="h-[15px] w-[15px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-medium text-ink">Plan {plan.nombre}</span>
                  <span className="block text-[11px] text-ink-faint group-hover:text-ink-mute">
                    Ver facturación
                  </span>
                </span>
              </span>
              {plan.uso ? (
                <span className="mt-3 block">
                  <span className="mb-1.5 flex items-baseline justify-between gap-2">
                    <span className="text-[11px] text-ink-mute">{plan.uso.etiqueta}</span>
                    <span className="font-mono text-[11px] whitespace-nowrap text-ink-soft tabular-nums">
                      {plan.uso.usado.toLocaleString("es-CR")} / {plan.uso.tope.toLocaleString("es-CR")}
                    </span>
                  </span>
                  <span
                    className="block h-1.5 overflow-hidden rounded-full bg-surface-3"
                    role="meter"
                    aria-valuenow={plan.uso.usado}
                    aria-valuemin={0}
                    aria-valuemax={plan.uso.tope}
                    aria-label={plan.uso.etiqueta}
                  >
                    <span
                      className={cn(
                        "medidor-barra block h-full w-full rounded-full",
                        plan.uso.tope > 0 && plan.uso.usado / plan.uso.tope >= 0.8
                          ? "bg-warn"
                          : "bg-[var(--panel-acento)]"
                      )}
                      style={
                        {
                          "--pct":
                            plan.uso.tope > 0 ? Math.min(1, plan.uso.usado / plan.uso.tope) : 0,
                        } as React.CSSProperties
                      }
                    />
                  </span>
                </span>
              ) : null}
            </Link>
          ) : null}

          {/* En celular el selector de tema no cabe en la barra de arriba: vive acá. */}
          <div className="sm:hidden">
            <TemaSelector />
          </div>

          <div className="flex items-center justify-between gap-3 px-1">
            {/* `<form method="post">`, no un `<Link>`: cerrar sesión cambia
                estado, y un GET normal se puede disparar solo con que Next
                precargue el enlace (está siempre a la vista en la barra). Un
                formulario sólo se envía con un clic real. */}
            <form action="/panel/salir" method="post">
              <button
                type="submit"
                className="-mx-1 rounded-md px-1 py-2 text-left text-[12.5px] text-ink-faint transition-colors hover:text-ink-soft lg:py-0.5 lg:text-[11.5px]"
              >
                Cerrar sesión
              </button>
            </form>
            {!enAdmin && modulos.agente ? <LinkReiniciarTour id={ID_TOUR_AGENTE} /> : null}
          </div>
        </div>
      </aside>

      <div className={cn("flex min-w-0 flex-col", enAgente && "h-dvh")}>
        <header
          className={cn(
            "z-20 flex flex-none items-center gap-3 border-b px-4 py-3 sm:px-[26px]",
            enAgente ? "relative" : "sticky top-0",
            "transition-[background-color,border-color,box-shadow] duration-300 ease-out",
            scrolleado
              ? "border-line bg-paper/80 shadow-[0_10px_30px_-22px_rgba(0,0,0,1)] backdrop-blur-md"
              : "border-transparent bg-paper"
          )}
        >
          <button
            onClick={() => setAbierto((v) => !v)}
            aria-label="Abrir menú"
            aria-expanded={abierto}
            className={cn(CLASE_ICONO_BOTON, "lg:hidden")}
          >
            <Icono nombre="menu" className="h-4 w-4" />
          </button>

          <BuscadorPanel destinos={destinos} />

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:block">
              <TemaSelector />
            </div>
            <Link
              href={destinoCampana}
              prefetch={false}
              aria-label={
                pendientesCampana > 0
                  ? `${etiquetaCampana} (${pendientesCampana} sin ver)`
                  : etiquetaCampana
              }
              className={cn(CLASE_ICONO_BOTON, "relative")}
            >
              <Icono nombre="campana" className="h-4 w-4" />
              {pendientesCampana > 0 ? (
                <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-warn px-1 font-mono text-[9px] font-medium text-paper tabular-nums">
                  {pendientesCampana > 9 ? "9+" : pendientesCampana}
                </span>
              ) : null}
            </Link>
            {/* El admin no tiene pantalla de Ajustes (su cuenta se maneja con
                el script `crear-admin.mjs`): para él la ficha es solo
                informativa, no un enlace que lo devuelva a su inicio. */}
            {enAdmin ? (
              <div className="flex flex-none items-center gap-2.5 rounded-[12px] border border-line bg-surface-2 py-[3px] pr-3 pl-[3px] max-sm:pr-[3px]">
                {fichaUsuario}
              </div>
            ) : (
              <Link
                href="/panel/ajustes"
                prefetch={false}
                aria-label="Tu cuenta"
                className="flex flex-none items-center gap-2.5 rounded-[12px] border border-line bg-surface-2 py-[3px] pr-3 pl-[3px] transition-colors hover:border-line-strong active:scale-[0.98] max-sm:pr-[3px]"
              >
                {fichaUsuario}
              </Link>
            )}
          </div>
        </header>

        {aviso ? (
          <div className="flex-none border-b border-line bg-surface px-4 py-2.5 sm:px-[26px]">
            {aviso}
          </div>
        ) : null}

        {/* La pantalla entra con un desplazamiento corto. `key` por ruta hace
            que se repita en cada navegación, no solo en la primera carga.
            6 px y 220 ms: se nota como respuesta, no como espera. */}
        <motion.main
          ref={principalRef}
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
          className={
            enAgente
              ? "scroll-fino flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto"
              : "flex max-w-[1180px] flex-col gap-[22px] px-4 pt-5 pb-[max(2.75rem,env(safe-area-inset-bottom))] sm:px-[26px] sm:pt-6"
          }
        >
          {children}
        </motion.main>
      </div>

      {/* El recorrido guiado solo corre dentro del entorno del Agente, igual
          que antes con su barra propia. */}
      {!enAdmin && enAgente && modulos.agente ? (
        <TourGuiado id={ID_TOUR_AGENTE} pasos={PASOS_TOUR_AGENTE} />
      ) : null}
    </div>
  );
}
