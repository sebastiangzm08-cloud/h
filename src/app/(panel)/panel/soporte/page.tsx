/* ==========================================================================
   Soporte.

   El canal real con el cliente tico es WhatsApp, así que es lo primero. El
   correo queda de respaldo. Abajo, las preguntas que se repiten, para
   resolver sin escribir.
   ========================================================================== */
import Link from "next/link";
import type { ReactNode } from "react";
import { BTN_PRIMARIO } from "@/components/panel/configuracion/estilos";
import { IconoChevron } from "@/components/panel/configuracion/iconos-extra";
import { EstadoVacio, Seccion } from "@/components/panel/configuracion/seccion";
import { Icono } from "@/components/panel/iconos";
import { PageHead, Pill } from "@/components/panel/ui";
import { getConsultas } from "@/lib/panel/datos";
import type { EstadoConsulta } from "@/lib/panel/tipos";
import { site, waLink } from "@/config/site";

const ESTADO: Record<EstadoConsulta, { texto: string; tono: "warn" | "ok" | "idle" }> = {
  sin_responder: { texto: "Esperando", tono: "warn" },
  respondida: { texto: "Respondida", tono: "ok" },
  resuelta: { texto: "Resuelta", tono: "idle" },
};

const enlace = "text-ink underline underline-offset-2";

const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: "¿Por qué no veo una automatización que contraté?",
    a: "Aparece en «Automatizaciones» apenas queda activada de nuestro lado. Si la contrataste hoy y no está, escribinos.",
  },
  {
    q: "¿Cómo cambio el tono o el horario?",
    a: (
      <>
        Entrá a{" "}
        <Link href="/panel/agente/como-responde" className={enlace}>
          Configuración
        </Link>
        : ahí cambiás el trato, el estilo, la agenda y el horario vos mismo.
      </>
    ),
  },
  {
    q: "¿Cuándo se cobra?",
    a: (
      <>
        Una vez al mes, por SINPE. La fecha y el monto están en{" "}
        <Link href="/panel/facturacion" className={enlace}>
          Facturación
        </Link>
        , junto con el número para pagar.
      </>
    ),
  },
  {
    q: "Olvidé mi contraseña",
    a: (
      <>
        En la pantalla de acceso, tocá «¿Olvidaste tu contraseña?» y seguí los pasos. Si todavía podés entrar, la
        cambiás en{" "}
        <Link href="/panel/ajustes" className={enlace}>
          Ajustes
        </Link>
        . Si no te llega el correo, escribinos por WhatsApp.
      </>
    ),
  },
];

export default async function SoportePage() {
  const consultas = await getConsultas();

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHead
          titulo="Soporte"
          descripcion="Abrí una consulta acá y te respondemos dentro del panel. Para algo urgente, WhatsApp."
        />
        <Link href="/panel/soporte/nueva" className={BTN_PRIMARIO}>
          <Icono nombre="mensajes" className="h-4 w-4" />
          Nueva consulta
        </Link>
      </div>

      <Seccion
        id="consultas"
        eyebrow="Tus consultas"
        titulo="Conversaciones con nosotros"
        descripcion="Las respuestas llegan acá, dentro del panel."
        sinRelleno
      >
        {consultas.length === 0 ? (
          <div className="px-4 sm:px-[18px]">
            <EstadoVacio
              icono="soporte"
              titulo="Todavía no abriste ninguna consulta"
              accion={
                <Link href="/panel/soporte/nueva" className={BTN_PRIMARIO}>
                  Escribir la primera
                </Link>
              }
            >
              Si algo no funciona o tenés una duda, contanos y te respondemos acá mismo.
            </EstadoVacio>
          </div>
        ) : (
          <ul className="divide-y divide-line border-t border-line">
            {consultas.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/panel/soporte/${c.id}`}
                  className="group flex min-h-[64px] items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-3/50 sm:px-[18px]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] leading-snug font-medium break-words text-ink group-hover:underline group-hover:underline-offset-2">
                      {c.asunto}
                    </span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                      {c.ultimaDe === "hoshizora" && c.estado !== "resuelta" ? (
                        <Pill tono="ok">Nueva respuesta</Pill>
                      ) : null}
                      <Pill tono={ESTADO[c.estado].tono}>{ESTADO[c.estado].texto}</Pill>
                      <span className="font-mono text-[10.5px] text-ink-mute">{c.cuando}</span>
                    </span>
                  </span>
                  <Icono nombre="flecha" className="h-3.5 w-3.5 flex-none text-ink-mute" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Seccion>

      <section aria-label="Escribinos directo" className="grid gap-3.5 sm:grid-cols-2">
        <a
          href={waLink("Hola, necesito ayuda con el panel.")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[88px] flex-col gap-2 rounded-2xl border border-line bg-surface-2 p-4 transition-[transform,border-color] duration-150 hover:-translate-y-0.5 hover:border-line-strong sm:p-[18px]"
        >
          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-surface-3 text-ink-soft shadow-[inset_0_0_0_1px_rgba(255,255,255,0.11)]">
            <Icono nombre="mensajes" className="h-[18px] w-[18px]" />
          </span>
          <span className="mt-1 text-[14px] font-semibold text-ink">WhatsApp</span>
          <span className="text-[12px] text-ink-mute">{site.contacto.whatsappVisible} · lo más rápido</span>
        </a>

        <a
          href={`mailto:${site.contacto.email}?subject=${encodeURIComponent("Ayuda con el panel")}`}
          className="flex min-h-[88px] flex-col gap-2 rounded-2xl border border-line bg-surface-2 p-4 transition-[transform,border-color] duration-150 hover:-translate-y-0.5 hover:border-line-strong sm:p-[18px]"
        >
          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-surface-3 text-ink-soft shadow-[inset_0_0_0_1px_rgba(255,255,255,0.11)]">
            <Icono nombre="soporte" className="h-[18px] w-[18px]" />
          </span>
          <span className="mt-1 text-[14px] font-semibold text-ink">Correo</span>
          <span className="text-[12px] break-all text-ink-mute">{site.contacto.email}</span>
        </a>
      </section>

      <Seccion
        id="preguntas"
        eyebrow="Preguntas frecuentes"
        titulo="Lo que más nos preguntan"
        descripcion="Quizás ya está respondido acá."
        sinRelleno
      >
        <div className="divide-y divide-line border-t border-line">
          {FAQ.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2.5 text-[13px] font-medium text-ink-soft transition-colors outline-none hover:bg-surface-3/50 focus-visible:bg-surface-3/50 sm:px-[18px] [&::-webkit-details-marker]:hidden">
                {item.q}
                <IconoChevron className="h-4 w-4 flex-none text-ink-mute transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="px-4 pb-4 text-[12.5px] leading-relaxed text-ink-mute sm:px-[18px]">{item.a}</p>
            </details>
          ))}
        </div>
      </Seccion>
    </>
  );
}
