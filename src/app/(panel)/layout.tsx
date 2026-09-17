import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PanelShell } from "@/components/panel/shell";
import { Icono } from "@/components/panel/iconos";
import { SonidoEscalamiento } from "@/components/panel/sonido-escalamiento";
import { getAsignacion, getCliente, getContadoresCliente, getPerfil } from "@/lib/panel/datos";
import { getContadoresAdmin } from "@/lib/panel/admin";

/* El panel NUNCA se indexa: es área con sesión. */
export const metadata: Metadata = {
  title: "Panel · Hoshizora",
  robots: { index: false, follow: false },
};

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /* Los datos de identidad se piden una sola vez acá y bajan por props.
     Ninguna pantalla vuelve a preguntar quién es el usuario. */
  const [perfil, cliente] = await Promise.all([getPerfil(), getCliente()]);
  /* "Tu negocio" (el formulario de posts) y su aviso de onboarding solo le
     competen a quien tiene Redes sociales — ver el porqué en
     `panel/perfil/page.tsx`. */
  const redes = perfil.rol === "cliente" ? await getAsignacion("redes-sociales") : null;
  const tieneRedes = Boolean(redes);

  /* Portón real de la sesión: acá (Node) `getPerfil()` valida el token
     contra Supabase sin rotarlo. El proxy sólo hace un chequeo local. */
  if (perfil.id === "sin-sesion") redirect("/acceso");

  /* El admin no tiene "su negocio": si cae en una página de cliente (un
     enlace viejo, una pestaña vieja, un `volver` de después de un login)
     lo manda de vuelta a su panel en vez de mostrarle todo en cero, que
     parece un cliente fantasma o una cuenta rota. `x-pathname` lo pone
     `proxy.ts` — un layout de servidor no tiene la URL actual de otra
     forma.

     OJO: en los pedidos internos de refresco de React (`_rsc=...`) este
     dato a veces llega vacío. Con `!pathname.startsWith(...)`, una cadena
     vacía "no empieza con /panel/admin" y disparaba la redirección aunque
     el admin YA estuviera ahí — eso mandaba a `/panel/admin` de nuevo, que
     volvía a fallar el mismo chequeo vacío, en un bucle sin fin que se
     encontró en vivo el 2026-09-17 (cientos de pedidos seguidos, pantalla
     en negro). Por eso ahora exige un pathname que SÍ llegó, nunca uno
     vacío. */
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (perfil.rol === "admin" && pathname && !pathname.startsWith("/panel/admin")) {
    redirect("/panel/admin");
  }

  /* Contadores reales para las pastillas de la barra y la campana. Se piden
     según el rol; van por href para que el shell no tenga que saber nada. */
  const contadores: Record<string, number> = {};
  if (perfil.rol === "admin") {
    const c = await getContadoresAdmin();
    contadores["/panel/admin/clientes"] = c.clientes;
    contadores["/panel/admin/mensajes"] = c.mensajes;
    contadores["/panel/admin/ejecuciones"] = c.erroresHoy;
    contadores["/panel/admin/pagos"] = c.pagosVencidos;
  } else {
    const c = await getContadoresCliente(perfil.clienteId);
    contadores["/panel/pendientes"] = c.pendientes;
    contadores["/panel/automatizaciones"] = c.automatizaciones;
  }

  /* Bandas de aviso, por prioridad:
     1. servicio suspendido por pago  → rojo, lo más urgente
     2. formulario del negocio sin llenar → recordatorio, no bloquea nada */
  const suspendido =
    perfil.rol === "cliente" &&
    (cliente.estado === "pausado" || cliente.estado === "moroso");

  const aviso = suspendido ? (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px] text-bad">
      <span className="inline-flex items-center gap-2 font-medium">
        <Icono nombre="facturacion" className="h-3.5 w-3.5" />
        Tu servicio está pausado por un pago pendiente. No se publica nada hasta
        ponerte al día.
      </span>
      <Link
        href="/panel/facturacion"
        className="font-medium underline decoration-bad/50 underline-offset-2 hover:decoration-bad"
      >
        Ver facturación
      </Link>
    </div>
  ) : perfil.rol === "cliente" && tieneRedes && !cliente.onboardingCompleto ? (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px]">
      <span className="inline-flex items-center gap-2 text-ink-soft">
        <Icono nombre="negocio" className="h-3.5 w-3.5 text-ink-mute" />
        Contanos cómo es tu negocio para que la IA escriba como vos.
      </span>
      <Link
        href="/panel/perfil"
        className="font-medium text-ink underline decoration-line-strong underline-offset-2 hover:decoration-ink"
      >
        Completar ahora
      </Link>
    </div>
  ) : undefined;

  return (
    <PanelShell
      nombre={perfil.rol === "admin" ? perfil.nombre : cliente.nombreNegocio}
      subtitulo={perfil.rol === "admin" ? "Administración" : `Plan ${cliente.plan}`}
      aviso={aviso}
      contadores={contadores}
      tieneRedes={tieneRedes}
    >
      {perfil.rol === "cliente" ? <SonidoEscalamiento clienteId={cliente.id} /> : null}
      {children}
    </PanelShell>
  );
}
