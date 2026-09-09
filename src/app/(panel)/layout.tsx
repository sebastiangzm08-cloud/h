import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PanelShell } from "@/components/panel/shell";
import { Icono } from "@/components/panel/iconos";
import { getCliente, getContadoresCliente, getPerfil } from "@/lib/panel/datos";
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

  /* Portón real de la sesión: acá (Node) `getPerfil()` valida el token
     contra Supabase sin rotarlo. El proxy sólo hace un chequeo local. */
  if (perfil.id === "sin-sesion") redirect("/acceso");

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
  ) : perfil.rol === "cliente" && !cliente.onboardingCompleto ? (
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
      rol={perfil.rol}
      nombre={perfil.rol === "admin" ? perfil.nombre : cliente.nombreNegocio}
      subtitulo={perfil.rol === "admin" ? "Administración" : `Plan ${cliente.plan}`}
      aviso={aviso}
      contadores={contadores}
    >
      {children}
    </PanelShell>
  );
}
