/* ==========================================================================
   Soporte.

   El canal real con el cliente tico es WhatsApp, así que es lo primero. El
   correo queda de respaldo. Abajo, las preguntas que se repiten, para
   resolver sin escribir.
   ========================================================================== */
import Link from "next/link";
import { Caja, Eyebrow, PageHead, Pill } from "@/components/panel/ui";
import { Icono } from "@/components/panel/iconos";
import { getConsultas } from "@/lib/panel/datos";
import type { EstadoConsulta } from "@/lib/panel/tipos";
import { site, waLink } from "@/config/site";

const ESTADO: Record<EstadoConsulta, { texto: string; tono: "warn" | "ok" | "idle" }> = {
  sin_responder: { texto: "Esperando", tono: "warn" },
  respondida: { texto: "Respondida", tono: "ok" },
  resuelta: { texto: "Resuelta", tono: "idle" },
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "¿Cómo subo las fotos para redes?",
    a: "Entrá a la automatización de Redes sociales, pestaña «Subir contenido». Se abre en cuanto tus redes queden conectadas.",
  },
  {
    q: "¿Por qué no veo una automatización que contraté?",
    a: "Aparece en «Automatizaciones» apenas queda activada de nuestro lado. Si la contrataste hoy y no está, escribinos.",
  },
  {
    q: "¿Cómo cambio el tono o el horario?",
    a: "Por ahora se ajusta por WhatsApp. El formulario para editarlo vos mismo está en construcción.",
  },
  {
    q: "¿Cuándo se cobra?",
    a: "Una vez al mes, por SINPE. La fecha y el monto están en «Facturación», junto con el número para pagar.",
  },
  {
    q: "Olvidé mi contraseña",
    a: "En la pantalla de acceso, tocá «¿Olvidaste tu contraseña?» y seguí los pasos. Si no te llega el correo, escribinos por WhatsApp.",
  },
];

export default async function SoportePage() {
  const consultas = await getConsultas();

  return (
    <>
      <PageHead
        titulo="Soporte"
        descripcion="Abrí una consulta acá y te respondemos dentro del panel. Para algo urgente, WhatsApp."
      />

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <Eyebrow>Tus consultas</Eyebrow>
          <Link
            href="/panel/soporte/nueva"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[12.5px] font-medium text-paper transition-colors hover:bg-ink-soft"
          >
            <Icono nombre="mensajes" className="h-3.5 w-3.5" />
            Nueva consulta
          </Link>
        </div>
        {consultas.length === 0 ? (
          <Caja className="text-center">
            <p className="py-5 text-[13px] text-ink-faint">
              Todavía no abriste ninguna consulta.
            </p>
          </Caja>
        ) : (
          <div className="flex flex-col gap-2">
            {consultas.map((c) => (
              <Link
                key={c.id}
                href={`/panel/soporte/${c.id}`}
                className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl border border-line bg-surface-2 p-4 transition-colors hover:border-line-strong"
              >
                <span className="min-w-[160px] flex-1 text-[13px] font-medium text-ink">
                  {c.asunto}
                </span>
                {c.ultimaDe === "hoshizora" && c.estado !== "resuelta" ? (
                  <Pill tono="ok">Nueva respuesta</Pill>
                ) : null}
                <Pill tono={ESTADO[c.estado].tono}>{ESTADO[c.estado].texto}</Pill>
                <span className="font-mono text-[10.5px] text-ink-faint">
                  {c.cuando}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-3.5 sm:grid-cols-2">
        <a
          href={waLink("Hola, necesito ayuda con el panel.")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col gap-2 rounded-2xl border border-line bg-surface-2 p-[18px] transition-[transform,border-color] duration-150 hover:-translate-y-0.5 hover:border-line-strong"
        >
          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-surface-3 text-ink-soft shadow-[inset_0_0_0_1px_rgba(255,255,255,0.11)]">
            <Icono nombre="mensajes" className="h-[18px] w-[18px]" />
          </span>
          <span className="mt-1 text-[14px] font-semibold text-ink">WhatsApp</span>
          <span className="text-[12px] text-ink-faint">
            {site.contacto.whatsappVisible} · lo más rápido
          </span>
        </a>

        <a
          href={`mailto:${site.contacto.email}?subject=${encodeURIComponent("Ayuda con el panel")}`}
          className="flex flex-col gap-2 rounded-2xl border border-line bg-surface-2 p-[18px] transition-[transform,border-color] duration-150 hover:-translate-y-0.5 hover:border-line-strong"
        >
          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-surface-3 text-ink-soft shadow-[inset_0_0_0_1px_rgba(255,255,255,0.11)]">
            <Icono nombre="soporte" className="h-[18px] w-[18px]" />
          </span>
          <span className="mt-1 text-[14px] font-semibold text-ink">Correo</span>
          <span className="text-[12px] text-ink-faint">{site.contacto.email}</span>
        </a>
      </section>

      <section>
        <div className="mb-3">
          <Eyebrow>Preguntas frecuentes</Eyebrow>
        </div>
        <Caja>
          <dl className="flex flex-col">
            {FAQ.map((item, i) => (
              <div
                key={item.q}
                className={
                  i === FAQ.length - 1
                    ? "py-3"
                    : "border-b border-line py-3"
                }
              >
                <dt className="text-[13px] font-medium text-ink-soft">{item.q}</dt>
                <dd className="mt-1 text-[12.5px] leading-relaxed text-ink-faint">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </Caja>
      </section>
    </>
  );
}
