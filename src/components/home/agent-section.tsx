import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenText,
  CalendarCheck,
  ChartLineUp,
  ChatsCircle,
  Check,
  Clock,
  UserSwitch,
} from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { iniciales } from "@/components/panel/conversaciones/textos";
import { getCopy } from "@/lib/copy";
import type { Idioma } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/* ==========================================================================
   La sección de la portada que explica el Agente IA (reemplaza a la de
   "tres automatizaciones, una por plan"). Tres bloques:
   1. Qué hace: un ejemplo de conversación + cuatro capacidades reales.
   2. Cómo trabaja: cuatro pasos simples.
   3. Tu panel: lo que el cliente ve, y el cierre hacia el diagnóstico.

   Todo lo que se afirma existe en el producto. El chat es un EJEMPLO, y está
   rotulado como tal. No hay cifras de resultados ni testimonios.
   ========================================================================== */

const iconos = {
  reloj: Clock,
  libro: BookOpenText,
  agenda: CalendarCheck,
  persona: UserSwitch,
  chat: ChatsCircle,
  grafica: ChartLineUp,
} as const;

type NombreIcono = keyof typeof iconos;

/** 1. Qué hace: ejemplo de conversación + capacidades. */
export function AgentIntro({ idioma = "es" }: { idioma?: Idioma }) {
  const t = getCopy(idioma).agente;
  const hrefPlan = idioma === "en" ? "/en/plans" : "/planes";

  return (
    <section
      id={t.id}
      data-tema="oscuro"
      className="scroll-mt-16 border-b border-noche-texto bg-noche"
    >
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal>
            <p className="eyebrow mb-5 text-noche-texto">{t.eyebrow}</p>
            <h2 className="max-w-[22ch] text-[2rem] leading-[1.05] font-semibold tracking-tight text-noche-texto sm:text-[2.5rem]">
              {t.titulo}
            </h2>
            <p className="mt-4 max-w-[56ch] text-[0.9375rem] leading-relaxed text-noche-texto">
              {t.lead}
            </p>
          </Reveal>
          <Link
            href={hrefPlan}
            className="hidden shrink-0 items-center gap-1.5 text-[0.9375rem] text-noche-texto underline underline-offset-4 transition-colors hover:text-noche-texto sm:flex"
          >
            {t.verPlan}
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
          {/* Ejemplo de conversación */}
          <Reveal className="lg:col-span-5">
            {/* Réplica fiel de la vista Conversaciones del panel
                (panel/conversaciones/encabezado-chat.tsx + hilo.tsx): va
                dentro de `.panel-scope` para usar los mismos tokens, así lo
                que ve la clínica acá es lo que va a ver en su panel. */}
            <figure>
              <div
                data-tema="oscuro"
                className="panel-scope overflow-hidden rounded-2xl border border-line-strong bg-paper text-ink"
              >
                {/* Encabezado del chat */}
                <div className="flex items-center gap-3 border-b border-line bg-surface px-3 py-2.5 sm:px-4">
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-full border border-line-strong bg-surface-3 font-mono text-[12px] text-ink-mute">
                    {iniciales(t.chat.contacto)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14.5px] leading-tight font-medium text-ink">
                      {t.chat.contacto}
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[11px] text-ink-mute">
                      {t.chat.canal}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="hidden h-9 flex-none items-center rounded-lg border border-line-strong bg-surface-2 px-3 text-[12.5px] font-medium whitespace-nowrap text-ink-soft sm:inline-flex"
                  >
                    {t.chat.tomar}
                  </span>
                </div>

                {/* Hilo */}
                <ol className="flex flex-col gap-2.5 px-3 py-5 sm:px-5">
                  <li className="self-center rounded-full bg-surface-3 px-3 py-1 font-mono text-[10.5px] tracking-[0.06em] text-ink-mute">
                    {t.chat.dia}
                  </li>
                  {t.chat.mensajes.map((m, i) => {
                    const agente = m.de === "agente";
                    return (
                      <li
                        key={i}
                        className={cn("flex flex-col gap-1", agente ? "items-end" : "items-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-[1.45] sm:max-w-[82%] sm:text-[13.5px]",
                            agente
                              ? "rounded-br-[5px] border border-ok/25 bg-ok/[0.13] text-ink-soft"
                              : "rounded-bl-[5px] border border-line bg-surface-2 text-ink-soft"
                          )}
                        >
                          <p>{m.texto}</p>
                          <span className="mt-1.5 block font-mono text-[10px] text-ink-mute tnum">
                            {m.hora}
                            {agente ? ` · ${t.chat.autorIA}` : ""}
                          </span>
                        </div>
                        {agente && m.herramienta ? (
                          <p className="font-mono text-[10px] text-ink-mute">
                            {t.chat.consulto} <span className="text-ok">{m.herramienta}</span>
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                  <li className="flex items-center gap-2 self-center py-1 text-center font-mono text-[10.5px] leading-snug text-ink-mute">
                    <span className="h-px w-4 flex-none bg-line sm:w-6" />
                    <span className="min-w-0">{t.chat.sistema}</span>
                    <span className="h-px w-4 flex-none bg-line sm:w-6" />
                  </li>
                </ol>
              </div>

              <figcaption className="mt-3 text-[0.75rem] leading-relaxed text-noche-texto">
                <span className="mr-2 rounded-full border border-noche-texto px-2 py-0.5 font-mono text-[0.625rem] tracking-[0.1em] uppercase">
                  {t.chat.etiqueta}
                </span>
                {t.chat.nota}
              </figcaption>
            </figure>
          </Reveal>

          {/* Capacidades */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {t.capacidades.map((c, i) => {
                const Icon = iconos[c.icono as NombreIcono];
                return (
                  <Reveal key={c.titulo} delay={i * 70}>
                    <div className="flex h-full flex-col rounded-2xl border border-noche-texto p-6 transition-colors duration-200 hover:border-acento">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-noche-texto text-acento-claro">
                        <Icon size={19} aria-hidden="true" />
                      </span>
                      <h3 className="mt-5 text-[1.0625rem] leading-snug font-medium tracking-tight text-noche-texto">
                        {c.titulo}
                      </h3>
                      <p className="mt-2 text-[0.875rem] leading-relaxed text-noche-texto">
                        {c.texto}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            <Reveal delay={120}>
              <ul className="mt-5 flex flex-wrap gap-2">
                {t.extras.map((e) => (
                  <li
                    key={e}
                    className="flex items-center gap-1.5 rounded-full border border-noche-texto px-3.5 py-1.5 text-[0.8125rem] text-noche-texto"
                  >
                    <Check size={13} weight="bold" aria-hidden="true" className="text-acento-claro" />
                    {e}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>

        <Link
          href={hrefPlan}
          className="mt-10 flex items-center gap-1.5 text-[0.9375rem] text-noche-texto underline underline-offset-4 transition-colors hover:text-noche-texto sm:hidden"
        >
          {t.verPlan}
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </section>
  );
}

/** 2. Cómo trabaja: cuatro pasos simples. */
export function AgentSteps({ idioma = "es" }: { idioma?: Idioma }) {
  const t = getCopy(idioma).agente;

  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
        <Reveal>
          <p className="eyebrow mb-5">{t.pasos.eyebrow}</p>
          <h2 className="max-w-[24ch] text-[2rem] leading-[1.05] font-semibold tracking-tight text-ink sm:text-[2.5rem]">
            {t.pasos.titulo}
          </h2>
        </Reveal>

        <ol className="mt-14 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {t.pasos.items.map((p, i) => (
            <Reveal key={p.t} as="li" delay={i * 80} className="relative border-t border-line-strong pt-6">
              <span
                aria-hidden="true"
                className="absolute -top-[5px] left-0 h-2.5 w-2.5 rounded-full bg-acento shadow-[0_0_14px_var(--color-acento)]"
              />
              <p className="font-mono text-[0.75rem] tracking-[0.14em] text-acento">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 text-[1.0625rem] leading-snug font-medium tracking-tight text-ink">
                {p.t}
              </h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-mute">{p.d}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** 3. Tu panel + el cierre hacia el diagnóstico. */
export function AgentPanel({ idioma = "es" }: { idioma?: Idioma }) {
  const t = getCopy(idioma).agente;

  return (
    <section data-tema="oscuro" className="tema-noche border-b border-line bg-paper">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow mb-5">{t.panel.eyebrow}</p>
            <h2 className="max-w-[20ch] text-[2rem] leading-[1.05] font-semibold tracking-tight text-ink sm:text-[2.5rem]">
              {t.panel.titulo}
            </h2>
            <p className="mt-4 max-w-[44ch] text-[0.9375rem] leading-relaxed text-ink-mute">
              {t.panel.lead}
            </p>

            <div className="mt-9 rounded-2xl border border-acento p-6">
              <p className="text-[1.0625rem] font-medium tracking-tight text-ink">
                {t.cierre.titulo}
              </p>
              <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-mute">
                {t.cierre.texto}
              </p>
              <div className="mt-5 flex flex-col items-start gap-3">
                <Button href={t.cierre.cta.href} variant="primary" size="md">
                  {t.cierre.cta.label}
                </Button>
                <Link
                  href={t.cierre.enlace.href}
                  className="inline-flex items-center gap-1.5 text-[0.875rem] text-ink-soft underline underline-offset-4 transition-colors hover:text-ink"
                >
                  {t.cierre.enlace.label}
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
            {t.panel.items.map((it, i) => {
              const Icon = iconos[it.icono as NombreIcono];
              return (
                <Reveal key={it.t} delay={i * 70}>
                  <div className="flex h-full flex-col rounded-2xl border border-line bg-paper p-6 transition-colors duration-200 hover:border-line-strong">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line-strong bg-surface text-ink">
                      <Icon size={19} aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-[1.0625rem] leading-snug font-medium tracking-tight text-ink">
                      {it.t}
                    </h3>
                    <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-mute">{it.d}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function AgentSection({ idioma = "es" }: { idioma?: Idioma }) {
  return (
    <>
      <AgentIntro idioma={idioma} />
      <AgentSteps idioma={idioma} />
      <AgentPanel idioma={idioma} />
    </>
  );
}
