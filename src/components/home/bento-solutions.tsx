import Link from "next/link";
import {
  ChatCircleDots,
  Package,
  ChartBar,
  Receipt,
  ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";
import { colones } from "@/config/site";

const destacadas = [
  {
    id: "bot-whatsapp",
    icon: ChatCircleDots,
    nombre: "Asistente de WhatsApp que responde y agenda",
    descripcion:
      "Responde preguntas frecuentes con tu información real, agenda contra tu calendario y escala a una persona cuando hace falta.",
    precio: 690000,
    ancha: true,
  },
  {
    id: "seguimiento-pedidos",
    icon: Package,
    nombre: "Gestión y seguimiento de pedidos",
    descripcion:
      "Avisos automáticos de estado en cada paso, sin que el cliente tenga que preguntar.",
    precio: 380000,
    ancha: false,
  },
  {
    id: "consolidar-excel",
    icon: ChartBar,
    nombre: "Dashboards financieros automáticos",
    descripcion:
      "Varios archivos de Excel consolidados en un panel siempre al día, sin trabajo manual.",
    precio: 350000,
    ancha: false,
  },
  {
    id: "recordatorio-cobros",
    icon: Receipt,
    nombre: "Recordatorios de cobro por SINPE",
    descripcion:
      "Aviso antes del vencimiento y escalado automático hasta que entra el pago.",
    precio: 310000,
    ancha: false,
  },
];

export function BentoSolutions() {
  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal>
            <p className="eyebrow mb-5">Soluciones destacadas</p>
            <h2 className="max-w-[26ch] text-[2rem] leading-[1.05] font-semibold tracking-tight text-ink sm:text-[2.5rem]">
              Cuatro piezas que casi cualquier negocio termina necesitando
            </h2>
          </Reveal>
          <Link
            href="/planes"
            className="hidden shrink-0 items-center gap-1.5 text-[0.9375rem] text-ink-soft underline underline-offset-4 sm:flex"
          >
            Ver el catálogo completo
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destacadas.map((d, i) => {
            const Icon = d.icon;
            return (
              <Reveal
                key={d.id}
                delay={i * 80}
                className={d.ancha ? "sm:col-span-2 lg:col-span-3" : ""}
              >
                <Link
                  href={`/orden/catalogo-${d.id}`}
                  className={`group flex h-full scale-100 flex-col justify-between rounded-2xl border border-line bg-surface p-7 shadow-[0_0_0_rgba(0,0,0,0)] transition-all duration-200 ease-out hover:scale-[1.02] hover:border-ink-mute hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.16)] ${
                    d.ancha ? "sm:flex-row sm:items-center sm:gap-8 lg:p-8" : ""
                  }`}
                >
                  <div
                    className={
                      d.ancha ? "sm:flex sm:flex-1 sm:items-center sm:gap-6" : ""
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex shrink-0 items-center justify-center rounded-xl bg-ink text-paper ${
                          d.ancha ? "h-12 w-12" : "h-10 w-10"
                        }`}
                      >
                        <Icon size={d.ancha ? 22 : 18} />
                      </div>
                      <ArrowUpRight
                        size={18}
                        className="text-ink-faint opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 sm:hidden"
                      />
                    </div>

                    <div className={d.ancha ? "mt-6 sm:mt-0" : "mt-6"}>
                      <p
                        className={`font-medium tracking-tight text-ink ${
                          d.ancha
                            ? "text-[1.25rem] leading-[1.2]"
                            : "text-[1.0625rem] leading-snug"
                        }`}
                      >
                        {d.nombre}
                      </p>
                      <p
                        className={`mt-2.5 leading-relaxed text-ink-mute ${
                          d.ancha ? "max-w-[44ch] text-[0.9375rem]" : "text-[0.8125rem]"
                        }`}
                      >
                        {d.descripcion}
                      </p>
                    </div>
                  </div>

                  <div
                    className={
                      d.ancha
                        ? "mt-6 flex shrink-0 items-center gap-4 sm:mt-0"
                        : "mt-4"
                    }
                  >
                    <p className="text-[0.8125rem] font-medium tnum text-ink-soft">
                      desde {colones(d.precio)}
                    </p>
                    <ArrowUpRight
                      size={18}
                      className="hidden text-ink-faint opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 sm:block"
                    />
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Link
          href="/planes"
          className="mt-8 flex items-center gap-1.5 text-[0.9375rem] text-ink-soft underline underline-offset-4 sm:hidden"
        >
          Ver el catálogo completo
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </section>
  );
}
