import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PanelShell } from "@/components/panel/shell";
import { SonidoEscalamiento } from "@/components/panel/sonido-escalamiento";
import { getCliente, getPerfil } from "@/lib/panel/datos";
import { getDatosShellCliente } from "@/lib/panel/shell-datos";

export const metadata: Metadata = {
  title: "Agente de WhatsApp · Hoshizora",
  robots: { index: false, follow: false },
};

/* ==========================================================================
   Armazón del entorno del agente.

   Desde el rediseño (Fase 1, 2026-09-23) usa la MISMA barra que el resto del
   panel (`PanelShell`): el Agente ya no "cambia" de barra al entrar. El
   armazón detecta por la URL que está en `/panel/agente/*` y pasa a modo
   "aplicación" (la ventana no scrollea, `<main>` ocupa el alto que queda y
   cada pantalla pone sus márgenes), que es lo que necesitan Conversaciones,
   Contactos y Correo.

   POR QUÉ VIVE EN SU PROPIO GRUPO DE RUTAS `(agente)` Y NO EN `(panel)`:
   quedó así de cuando tenía barra propia. Los layouts de Next se ANIDAN,
   nunca se reemplazan, y mover las 11 pantallas a `(panel)` cambiaría
   demasiado de una vez. Los dos grupos dibujan el mismo `PanelShell` con los
   mismos datos (`getDatosShellCliente`), así que el menú es idéntico.

   (Se intentó antes saltarse el shell leyendo `x-pathname` en el layout de
   `(panel)`. No sirve: ese header lo pone `proxy.ts` en la RESPUESTA, y
   `headers()` lee la PETICIÓN. No volver por ahí.)

   La URL sigue siendo `/panel/agente/*` a propósito, aunque el grupo sea
   otro: el matcher de `proxy.ts` sólo cubre `/panel/:path*`, y es el proxy
   quien renueva el token de Supabase. Fuera de `/panel` la sesión se caería
   sola a la hora.

   Como ya no cuelga de `(panel)`, el portón de sesión se hace ACÁ.
   ========================================================================== */
export default async function AgenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const perfil = await getPerfil();
  if (perfil.id === "sin-sesion") redirect("/acceso?volver=/panel/agente");

  /* El admin no tiene "su" agente: su entrada es el panel de administración.
     Misma regla que en `(panel)/layout.tsx`. */
  if (perfil.rol === "admin") redirect("/panel/admin");

  const cliente = await getCliente();

  /* Servicio suspendido = el agente NO está contestando. Mostrarle igual el
     entorno lleno de datos sería mentirle: se lo manda al panel, donde la
     banda roja explica qué pasó y cómo ponerse al día. */
  if (cliente.estado === "pausado" || cliente.estado === "moroso") {
    redirect("/panel");
  }

  const datos = await getDatosShellCliente(perfil.clienteId, cliente);
  if (!datos.agente) redirect("/panel/automatizaciones/agente-whatsapp");

  return (
    <PanelShell
      nombre={cliente.nombreNegocio}
      persona={perfil.nombre}
      subtitulo={cliente.nombreNegocio}
      contadores={datos.contadores}
      modulos={datos.modulos}
      plan={datos.plan}
    >
      <SonidoEscalamiento clienteId={cliente.id} />
      {children}
    </PanelShell>
  );
}
