import Link from "next/link";
import { Suspense } from "react";
import { Cabecera, Cuerpo } from "@/components/panel/agente-ui";
import { FormaPerfilWhatsapp } from "@/components/panel/agente-perfil-whatsapp";
import { BTN_PRIMARIO } from "@/components/panel/configuracion/estilos";
import { IconoAlerta, IconoCheck, Spinner } from "@/components/panel/configuracion/iconos-extra";
import { EsqueletoSeccion } from "@/components/panel/configuracion/esqueleto";
import { FilaDato, Filas, Seccion } from "@/components/panel/configuracion/seccion";
import { Pill } from "@/components/panel/ui";
import { getAsignacion, getCliente, getConexiones } from "@/lib/panel/datos";
import { getPerfilWhatsapp, getSaludConexion } from "@/lib/panel/agente";
import { cn } from "@/lib/utils";

/* ==========================================================================
   Conexión de WhatsApp.

   Lo que tarda es Meta: el chequeo de salud y el perfil se leen EN VIVO con
   su API. Por eso van cada uno en su `Suspense`: el estado del número y el
   resto de la pantalla aparecen enseguida y esas dos cajas se llenan cuando
   Meta contesta, en vez de dejar la pantalla entera esperando.
   ========================================================================== */

/** Chequeo en vivo: no mira lo guardado, le pregunta a Meta ahora mismo. */
async function SaludEnVivo() {
  const salud = await getSaludConexion();
  const bien = salud.estado === "ok";

  return (
    <section
      aria-label="Estado de la conexión con Meta"
      className={cn(
        "flex items-start gap-3.5 rounded-2xl border p-4 sm:p-[18px]",
        bien ? "border-ok/30 bg-ok/[0.06]" : "border-bad/35 bg-bad/[0.07]"
      )}
    >
      <span
        className={cn(
          "grid h-9 w-9 flex-none place-items-center rounded-xl",
          bien ? "bg-ok/15 text-ok" : "bg-bad/15 text-bad"
        )}
      >
        {bien ? <IconoCheck className="h-[18px] w-[18px]" /> : <IconoAlerta className="h-[18px] w-[18px]" />}
      </span>

      <div className="min-w-0 flex-1">
        {salud.estado === "ok" ? (
          <>
            <p className={cn("text-[13.5px] leading-snug font-medium", "text-ok")}>
              Meta confirma que el número está conectado ahora mismo
            </p>
            <p className="mt-1 max-w-[62ch] text-[12.5px] leading-snug text-ink-mute">
              {salud.numero ? `${salud.numero} · ` : ""}
              Calidad {salud.calidad ?? "sin datos"}. Este chequeo se hace en vivo cada vez que entrás a esta
              pantalla, no solo mira lo que hay guardado.
            </p>
          </>
        ) : (
          <>
            <p className="text-[13.5px] leading-snug font-medium text-bad">
              El WhatsApp se desconectó — el agente no puede contestar
            </p>
            <p className="mt-1 max-w-[62ch] text-[12.5px] leading-snug text-ink-mute">
              Meta respondió:{" "}
              <span className="font-mono text-[11.5px] break-words">
                {salud.estado === "token_vencido" ? salud.detalle : "sin conexión configurada"}
              </span>
              . Casi siempre es el token vencido — escribinos para renovarlo.
            </p>
            <Link href="/panel/soporte" className={cn(BTN_PRIMARIO, "mt-3.5")}>
              Avisar que se desconectó
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

function SaludCargando() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="flex items-center gap-3.5 rounded-2xl border border-line bg-surface-2 p-4 sm:p-[18px]"
    >
      <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-surface-3 text-ink-mute">
        <Spinner className="h-[18px] w-[18px]" />
      </span>
      <p className="text-[13px] text-ink-mute">Preguntándole a Meta si el número sigue conectado…</p>
    </div>
  );
}

/** Perfil que ve la gente al abrir el chat, leído en vivo de Meta. */
async function PerfilEnVivo() {
  const perfil = await getPerfilWhatsapp();
  if (perfil.estado === "sin_conectar") return null;
  return (
    <Seccion
      id="perfil"
      eyebrow="Perfil"
      titulo="Perfil de WhatsApp"
      descripcion="La foto, la info y los datos que ve la gente al abrir el chat. Se guardan directo en WhatsApp."
    >
      <FormaPerfilWhatsapp perfil={perfil} />
    </Seccion>
  );
}

export default async function ConexionPage() {
  const [cliente, conexiones, asignacion] = await Promise.all([
    getCliente(),
    getConexiones(),
    getAsignacion("agente-whatsapp"),
  ]);

  const wa = conexiones.find((c) => c.servicio === "whatsapp");
  const conectada = wa?.estado === "conectada";

  return (
    <>
      <Cabecera
        eyebrow="El agente"
        titulo="Conexión de WhatsApp"
        descripcion="El número de WhatsApp del negocio, conectado por la API oficial de Meta. El número es tuyo: si algún día te vas, te lo llevás."
      />

      <Cuerpo className="flex flex-col gap-[18px]">
        {conectada ? (
          <Suspense fallback={<SaludCargando />}>
            <SaludEnVivo />
          </Suspense>
        ) : null}

        <Seccion
          id="numero"
          eyebrow="Número"
          titulo="WhatsApp Business"
          descripcion={conectada ? "Recibiendo mensajes." : "Todavía sin conectar."}
          accion={<Pill tono={conectada ? "ok" : "idle"}>{conectada ? "Conectada" : "Sin conectar"}</Pill>}
        >
          <Filas>
            <FilaDato k="Número" mono>
              {cliente.whatsapp || "Sin definir"}
            </FilaDato>
            <FilaDato k="Nombre que ve la gente">{cliente.nombreNegocio}</FilaDato>
            <FilaDato k="Estado del agente">{asignacion?.estado === "activa" ? "Activo" : "En pausa"}</FilaDato>
            <FilaDato k="Mensajes de WhatsApp (Meta)">
              Meta cobra cada mensaje de WhatsApp según su tarifa; te confirmamos cómo se factura.
            </FilaDato>
          </Filas>
        </Seccion>

        {conectada ? (
          <Suspense fallback={<EsqueletoSeccion filas={4} />}>
            <PerfilEnVivo />
          </Suspense>
        ) : (
          <Seccion
            id="conectar"
            eyebrow="Falta un paso"
            titulo="Falta conectar el número"
            descripcion="La conexión con Meta la hacemos nosotros con vos: hay que verificar el número, poner el nombre que va a ver la gente y dejar la cuenta de Meta a nombre del negocio."
          >
            <Link href="/panel/soporte" className={BTN_PRIMARIO}>
              Escribirnos
            </Link>
          </Seccion>
        )}
      </Cuerpo>
    </>
  );
}
