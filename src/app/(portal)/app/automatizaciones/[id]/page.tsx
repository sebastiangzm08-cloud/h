import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Pause,
  Play,
  PencilSimple,
  FileText,
} from "@phosphor-icons/react/dist/ssr";
import { automatizaciones, ejecucionesRecientes } from "@/lib/mock-portal";
import { StatusDot } from "@/components/portal/status-dot";
import { Button } from "@/components/ui/button";
import { ConstellationMark } from "@/components/constellation";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return automatizaciones.map((a) => ({ id: a.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const a = automatizaciones.find((x) => x.id === id);
  return { title: `${a?.nombre ?? "Automatización"} — Portal · ${site.nombre}` };
}

export default async function AutomatizacionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const a = automatizaciones.find((x) => x.id === id);
  if (!a) notFound();

  const ejecuciones = ejecucionesRecientes.filter(
    (e) => e.automatizacionId === a.id
  );
  const pausada = a.estado === "pausada";

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
      <Link
        href="/app/automatizaciones"
        className="inline-flex items-center gap-1.5 text-[0.875rem] text-ink-mute hover:text-ink"
      >
        <ArrowLeft size={15} />
        Automatizaciones
      </Link>

      <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="eyebrow mb-2">{a.proceso}</p>
          <h1 className="text-[1.75rem] font-semibold tracking-tight text-ink">
            {a.nombre}
          </h1>
          <div className="mt-2">
            <StatusDot estado={a.estado} />
          </div>
        </div>
        <div className="flex shrink-0 gap-2.5">
          <Button variant="secondary" size="md">
            {pausada ? <Play size={15} /> : <Pause size={15} />}
            {pausada ? "Activar" : "Pausar"}
          </Button>
          <Button href="/app/solicitudes" variant="primary" size="md">
            <PencilSimple size={15} />
            Solicitar cambio
          </Button>
        </div>
      </div>

      <p className="mt-6 max-w-[70ch] text-[0.9375rem] leading-relaxed text-ink-mute">
        {a.descripcion}
      </p>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow mb-5">Cómo funciona el flujo</p>
          <div className="rounded-2xl border border-line bg-surface p-7">
            <div className="mb-6 flex items-center gap-2 text-ink-faint">
              <ConstellationMark className="h-4 w-4" />
              <span className="text-[0.75rem]">Diagrama simplificado</span>
            </div>
            <ol className="flex flex-col gap-0">
              {a.flujo.map((paso, i) => (
                <li key={paso} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line-strong bg-paper font-mono text-[0.6875rem] text-ink-mute">
                      {i + 1}
                    </span>
                    {i < a.flujo.length - 1 && (
                      <span className="w-px flex-1 bg-line-strong" />
                    )}
                  </div>
                  <p className="pb-7 text-[0.9375rem] text-ink-soft">
                    {paso}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <p className="eyebrow mb-5 mt-10">Historial de ejecuciones</p>
          <div className="flex flex-col divide-y divide-line rounded-2xl border border-line bg-paper">
            {ejecuciones.length > 0 ? (
              ejecuciones.map((e) => (
                <div key={e.id} className="flex items-start gap-3 p-4">
                  <span
                    className={cn(
                      "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                      e.estado === "ok" ? "bg-ok" : "bg-bad"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.875rem] text-ink-soft">{e.detalle}</p>
                    <p className="mt-0.5 text-[0.75rem] text-ink-faint">
                      {e.fecha}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-5 text-[0.875rem] text-ink-faint">
                Sin ejecuciones registradas todavía.
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          <p className="eyebrow mb-5">Ajustes</p>
          <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6">
            <div>
              <label className="text-[0.8125rem] font-medium text-ink-soft">
                Minutos ahorrados por ejecución
              </label>
              <input
                type="number"
                defaultValue={a.minutosAhorradosPorEjecucion}
                className="mt-2 h-11 w-full rounded-lg border border-line-strong bg-paper px-4 text-[0.9375rem] text-ink outline-none focus:border-ink"
              />
              <p className="mt-1.5 text-[0.75rem] text-ink-faint">
                Define cómo se calcula tu ahorro en el resumen del portal.
              </p>
            </div>
            <div>
              <label className="text-[0.8125rem] font-medium text-ink-soft">
                Notificar por
              </label>
              <div className="mt-2 flex gap-2">
                <span className="rounded-full border border-ink bg-ink px-3.5 py-1.5 text-[0.8125rem] text-paper">
                  Correo
                </span>
                <span className="rounded-full border border-line-strong px-3.5 py-1.5 text-[0.8125rem] text-ink-mute">
                  WhatsApp
                </span>
              </div>
            </div>
          </div>

          <p className="eyebrow mb-5 mt-8">Documentación</p>
          <button className="flex w-full items-center gap-3 rounded-2xl border border-line bg-paper p-5 text-left transition-colors hover:border-ink-mute">
            <FileText size={18} className="shrink-0 text-ink-faint" />
            <div>
              <p className="text-[0.875rem] font-medium text-ink">
                Guía de uso y video explicativo
              </p>
              <p className="text-[0.75rem] text-ink-faint">
                Cómo funciona, para quién es y qué hacer si algo se ve raro
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
