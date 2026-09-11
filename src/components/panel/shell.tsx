"use client";

/* ==========================================================================
   El armazón del panel: barra lateral + barra superior.

   La barra lateral CAMBIA ENTERA según el rol. No es que se oculten ítems:
   son dos menús distintos. Y el selector Cliente/Admin de arriba a la
   derecha solo se dibuja si el perfil tiene rol admin — un cliente no sabe
   que existe.

   Ojo: esconder el selector es cosmético. Quien de verdad impide que un
   cliente vea datos de otro son las reglas RLS en la base. Acá no hay
   ninguna decisión de seguridad.

   Estructura de la barra: marca fija arriba, menú con scroll propio en el
   medio, ficha del usuario fija abajo. Sin esto, con muchos ítems la ficha
   se va bajo el borde y el menú parece cortado.
   ========================================================================== */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { ConstellationMark } from "@/components/constellation";
import { Icono, type NombreIcono } from "@/components/panel/iconos";
import { BuscadorPanel, type Destino } from "@/components/panel/buscador-panel";
import { Eyebrow } from "@/components/panel/ui";
import { cn } from "@/lib/utils";

type Item = {
  href: string;
  label: string;
  icono: NombreIcono;
};
type Grupo = { titulo?: string; items: Item[] };

/* Ítems cuya pastilla, cuando trae número, va en ámbar: son cosas por
   atender, no un simple recuento. El resto va en gris neutro. */
const HREF_ALERTA = new Set([
  "/panel/pendientes",
  "/panel/admin/mensajes",
  "/panel/admin/ejecuciones",
  "/panel/admin/pagos",
]);

const NAV_CLIENTE: Grupo[] = [
  {
    items: [
      { href: "/panel", label: "Inicio", icono: "inicio" },
      { href: "/panel/pendientes", label: "Pendientes", icono: "pendientes" },
      {
        href: "/panel/automatizaciones",
        label: "Automatizaciones",
        icono: "automatizaciones",
      },
      { href: "/panel/catalogo", label: "Catálogo", icono: "catalogo" },
    ],
  },
  {
    titulo: "Mi negocio",
    items: [
      { href: "/panel/perfil", label: "Tu negocio", icono: "negocio" },
      { href: "/panel/conexiones", label: "Conexiones", icono: "conexiones" },
      { href: "/panel/actividad", label: "Actividad", icono: "actividad" },
    ],
  },
  {
    titulo: "Cuenta",
    items: [
      { href: "/panel/facturacion", label: "Facturación", icono: "facturacion" },
      { href: "/panel/ajustes", label: "Ajustes", icono: "ajustes" },
      { href: "/panel/soporte", label: "Soporte", icono: "soporte" },
    ],
  },
];

const NAV_ADMIN: Grupo[] = [
  {
    titulo: "Operación",
    items: [
      { href: "/panel/admin", label: "Inicio", icono: "inicio" },
      { href: "/panel/admin/clientes", label: "Clientes", icono: "clientes" },
      { href: "/panel/admin/pagos", label: "Pagos", icono: "facturacion" },
      {
        href: "/panel/admin/asignar",
        label: "Asignar automatización",
        icono: "asignar",
      },
      { href: "/panel/admin/alta", label: "Alta de cliente", icono: "alta" },
    ],
  },
  {
    titulo: "Sistema",
    items: [
      {
        href: "/panel/admin/catalogo",
        label: "Catálogo maestro",
        icono: "catalogo",
      },
      {
        href: "/panel/admin/ejecuciones",
        label: "Ejecuciones",
        icono: "ejecuciones",
      },
      { href: "/panel/admin/costos", label: "Costos e ingresos", icono: "costos" },
    ],
  },
  {
    titulo: "Soporte",
    items: [
      { href: "/panel/admin/mensajes", label: "Mensajes", icono: "mensajes" },
    ],
  },
];

/** `/panel/automatizaciones/redes` tiene que marcar "Automatizaciones". */
function estaActivo(href: string, pathname: string) {
  if (href === "/panel" || href === "/panel/admin") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

/** Resorte corto: se siente vivo sin hacer esperar. */
const RESORTE = { type: "spring", stiffness: 420, damping: 38, mass: 0.6 } as const;

export function PanelShell({
  nombre,
  subtitulo,
  aviso,
  contadores = {},
  children,
}: {
  nombre: string;
  subtitulo: string;
  /** Banda de aviso fija bajo el encabezado (ej. "completá tu perfil"). */
  aviso?: ReactNode;
  /** Números reales por href para las pastillas de la barra y la campana. */
  contadores?: Record<string, number>;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [scrolleado, setScrolleado] = useState(false);

  const enAdmin = pathname.startsWith("/panel/admin");
  const grupos = enAdmin ? NAV_ADMIN : NAV_CLIENTE;

  /* Destinos para la búsqueda: los ítems del menú de este rol. */
  const destinos: Destino[] = grupos.flatMap((g) =>
    g.items.map((it) => ({ href: it.href, label: it.label, grupo: g.titulo }))
  );

  /* El menú móvil se cierra al tocar un ítem (ver `onClick` en los enlaces
     de abajo) y al tocar el fondo oscuro. No se reacciona a `pathname` con
     un efecto: cerrar es consecuencia del clic, no del cambio de ruta. */

  /* El encabezado deja de ser una barra plana y se despega al bajar.
     Mismo patrón que la navbar del sitio: medición dentro de rAF para no
     disparar trabajo en cada evento de scroll. */
  useEffect(() => {
    let pendiente = false;
    const alScroll = () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(() => {
        setScrolleado(window.scrollY > 8);
        pendiente = false;
      });
    };
    alScroll();
    window.addEventListener("scroll", alScroll, { passive: true });
    return () => window.removeEventListener("scroll", alScroll);
  }, []);

  return (
    <div className="panel-scope grid min-h-dvh bg-paper text-ink-soft lg:grid-cols-[264px_1fr]">
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
        <div className="flex flex-none items-center gap-2.5 px-6 pt-5 pb-3">
          <Link
            href={enAdmin ? "/panel/admin" : "/panel"}
            onClick={() => setAbierto(false)}
            aria-label="Ir al inicio"
            className="flex items-center gap-2.5 rounded-md transition-opacity hover:opacity-80"
          >
            <ConstellationMark className="h-[22px] w-[22px] text-ink" />
            <b className="text-[15px] font-semibold tracking-tight text-ink">Hoshizora</b>
          </Link>
          <span className="ml-auto rounded-full border border-line-strong px-[7px] py-0.5 font-mono text-[9.5px] tracking-[0.11em] text-ink-faint uppercase">
            {enAdmin ? "Studio" : "Panel"}
          </span>
        </div>

        {/* Menú — la única parte que hace scroll */}
        <div className="scroll-fino flex flex-1 flex-col gap-[18px] overflow-y-auto px-4 py-2">
          {grupos.map((grupo, i) => (
            <nav key={i} className="flex flex-col gap-0.5" aria-label={grupo.titulo}>
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
                      "relative flex w-full items-center gap-[11px] rounded-[9px] px-2.5 py-2.5 text-[13.5px] transition-colors duration-150",
                      activo
                        ? "text-ink"
                        : "text-ink-mute hover:bg-white/5 hover:text-ink-soft"
                    )}
                  >
                    {/* El resaltado se DESLIZA entre ítems en vez de saltar. */}
                    {activo ? (
                      <motion.span
                        layoutId={`nav-activo-${enAdmin ? "adm" : "cli"}`}
                        transition={RESORTE}
                        className="absolute inset-0 rounded-[9px] bg-white/6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.11)]"
                      >
                        <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-ink" />
                      </motion.span>
                    ) : null}
                    <Icono
                      nombre={item.icono}
                      className={cn(
                        "relative z-10 h-[17px] w-[17px] flex-none",
                        activo ? "opacity-100" : "opacity-85"
                      )}
                    />
                    <span className="relative z-10 truncate">{item.label}</span>
                    {cuenta > 0 ? (
                      <span
                        className={cn(
                          "relative z-10 ml-auto rounded-full px-1.5 py-px font-mono text-[10px] tabular-nums",
                          alerta
                            ? "bg-warn/15 text-warn"
                            : "bg-surface-3 text-ink-faint"
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

        {/* Ficha del usuario — fija abajo, siempre visible */}
        <div className="flex flex-none flex-col gap-2 border-t border-line px-5 py-4">
          <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface-2 p-2">
            <div className="grid h-[30px] w-[30px] flex-none place-items-center rounded-lg bg-surface-3 text-xs font-semibold text-ink shadow-[inset_0_0_0_1px_rgba(255,255,255,0.11)]">
              {nombre.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[12.5px] font-medium text-ink-soft">
                {nombre}
              </div>
              <div className="font-mono text-[10px] tracking-wide text-ink-faint">
                {subtitulo}
              </div>
            </div>
          </div>
          <Link
            href="/panel/salir"
            className="px-1 text-left text-[11.5px] text-ink-faint transition-colors hover:text-ink-soft"
          >
            Cerrar sesión
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header
          className={cn(
            "sticky top-0 z-20 flex items-center gap-3.5 border-b px-4 py-3 sm:px-[26px]",
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
            className="grid h-[34px] w-[34px] place-items-center rounded-[9px] border border-line text-ink-mute transition-colors hover:border-line-strong hover:text-ink-soft lg:hidden"
          >
            <Icono nombre="menu" className="h-4 w-4" />
          </button>

          <BuscadorPanel destinos={destinos} />

          <div className="ml-auto flex items-center gap-2">
            {(() => {
              const destinoCampana = enAdmin
                ? "/panel/admin/mensajes"
                : "/panel/pendientes";
              const pendientesCampana = contadores[destinoCampana] ?? 0;
              return (
                <Link
                  href={destinoCampana}
                  aria-label={
                    pendientesCampana > 0
                      ? `${enAdmin ? "Mensajes" : "Pendientes"} (${pendientesCampana} sin ver)`
                      : enAdmin
                        ? "Mensajes"
                        : "Pendientes"
                  }
                  className="relative grid h-[34px] w-[34px] place-items-center rounded-[9px] border border-line text-ink-mute transition-colors hover:border-line-strong hover:text-ink-soft active:scale-95"
                >
                  <Icono nombre="campana" className="h-4 w-4" />
                  {pendientesCampana > 0 ? (
                    <span className="absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-warn px-1 font-mono text-[9px] font-medium text-paper tabular-nums">
                      {pendientesCampana > 9 ? "9+" : pendientesCampana}
                    </span>
                  ) : null}
                </Link>
              );
            })()}
            <Link
              href="/panel/ajustes"
              className="grid h-[34px] w-[34px] place-items-center rounded-[9px] border border-line text-ink-mute transition-colors hover:border-line-strong hover:text-ink-soft active:scale-95"
              aria-label="Tu cuenta"
            >
              <Icono nombre="cuenta" className="h-4 w-4" />
            </Link>
          </div>
        </header>

        {aviso ? (
          <div className="border-b border-line bg-surface px-4 py-2.5 sm:px-[26px]">
            {aviso}
          </div>
        ) : null}

        {/* La pantalla entra con un desplazamiento corto. `key` por ruta hace
            que se repita en cada navegación, no solo en la primera carga.
            6 px y 220 ms: se nota como respuesta, no como espera. */}
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
          className="flex max-w-[1180px] flex-col gap-[22px] px-4 pt-6 pb-11 sm:px-[26px]"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
