import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AgenteBarra } from "@/components/panel/agente-barra";
import { SonidoEscalamiento } from "@/components/panel/sonido-escalamiento";
import { getAsignacion, getCliente, getPerfil } from "@/lib/panel/datos";
import {
  getContactos,
  getCitas,
  getConversaciones,
  getConversacionesCorreo,
  getCorrecciones,
} from "@/lib/panel/agente";

export const metadata: Metadata = {
  title: "Agente de WhatsApp · Hoshizora",
  robots: { index: false, follow: false },
};

/* ==========================================================================
   Armazón del entorno del agente.

   POR QUÉ VIVE EN SU PROPIO GRUPO DE RUTAS `(agente)` Y NO EN `(panel)`:
   el Agente no es una pantalla más, es un entorno con barra lateral propia.
   Los layouts de Next se ANIDAN, nunca se reemplazan — si estas rutas
   colgaran de `(panel)`, el `PanelShell` seguiría dibujando su barra y
   quedarían dos, una al lado de la otra. Un grupo aparte es la única forma
   limpia de sustituir el armazón.

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

  const asignacion = await getAsignacion("agente-whatsapp");
  if (!asignacion) redirect("/panel/automatizaciones/agente-whatsapp");

  const [cliente, conversaciones, conversacionesCorreo, contactos, citas, correcciones] = await Promise.all([
    getCliente(),
    getConversaciones(),
    getConversacionesCorreo(),
    getContactos(),
    getCitas(),
    getCorrecciones(),
  ]);

  /* Servicio suspendido = el agente NO está contestando. Mostrarle igual el
     entorno lleno de datos sería mentirle: se lo manda al panel, donde la
     banda roja explica qué pasó y cómo ponerse al día. */
  if (cliente.estado === "pausado" || cliente.estado === "moroso") {
    redirect("/panel");
  }

  return (
    <div
      className="panel-scope flex min-h-dvh flex-col bg-paper text-ink-soft md:flex-row"
      // Mismo motivo que en `shell.tsx`: el script del layout raíz aplica
      // `data-tema` antes de hidratar, según lo que ya se había elegido.
      suppressHydrationWarning
    >
      <AgenteBarra
        telefono={cliente.whatsapp}
        activo={asignacion.estado === "activa"}
        esperando={conversaciones.filter((c) => c.estado === "espera").length}
        esperandoCorreo={conversacionesCorreo.filter((c) => c.estado === "espera").length}
        contactos={contactos.length}
        citas={citas.length}
        correcciones={correcciones.length}
      />
      <SonidoEscalamiento clienteId={cliente.id} />
      {/* `<main>` es el ÚNICO que scrollea en escritorio — mismo trato que
          la barra lateral (`md:h-dvh md:overflow-y-auto`), para que TODAS
          las pantallas (las cortas como Qué sabe y las que ya manejan su
          propio scroll interno como Conversaciones) usen el mismo scrollbar
          fino, en vez de que unas lo tengan y otras dejen que la página
          entera scrollee con la barra nativa y gruesa del navegador. */}
      <main className="scroll-fino min-w-0 flex-1 md:h-dvh md:overflow-y-auto">{children}</main>
    </div>
  );
}
