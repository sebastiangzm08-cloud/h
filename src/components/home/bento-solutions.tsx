import Link from "next/link";
import {
  ChatCircleDots,
  FileText,
  ChartBar,
  Receipt,
  ArrowUpRight,
} from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";
import { CatalogLink } from "@/components/catalog-link";
import { catalogo, planPorNivel } from "@/lib/content";

const destacadas = [
  {
    id: "whatsapp-atencion",
    icon: ChatCircleDots,
    nombre: "Asistente de WhatsApp: Atención",
    descripcion:
      "Responde con tu información real, consulta inventario o pedidos en vivo si conectás tu tienda, y escala a una persona cuando hace falta.",
    ancha: true,
  },
  {
    id: "whatsapp-cobro",
    icon: Receipt,
    nombre: "Asistente de WhatsApp: Cobro",
    descripcion:
      "Aviso antes del vencimiento, confirma el pago leyendo el comprobante y, si querés, la factura electrónica sale sola.",
    ancha: false,
  },
  {
    id: "panel-alertas",
    icon: ChartBar,
    nombre: "Panel y alertas de métricas",
    descripcion:
      "Varios archivos consolidados en un panel siempre al día, con aviso el mismo día si algo se sale de rango.",
    ancha: false,
  },
  {
    id: "lectura-facturas",
    icon: FileText,
    nombre: "Lectura automática de facturas",
    descripcion:
      "Dejás la factura del proveedor en una carpeta y los datos salen solos, registrados en tu hoja de control.",
    ancha: false,
  },
];

export function BentoSolutions() {
  return (
    <section data-tema="oscuro" className="border-b border-noche-texto/10 bg-noche">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal>
            <p className="eyebrow mb-5 text-noche-texto/55">Soluciones destacadas</p>
            <h2 className="max-w-[26ch] text-[2rem] leading-[1.05] font-semibold tracking-tight text-noche-texto sm:text-[2.5rem]">
              Cuatro piezas que casi cualquier negocio termina necesitando
            </h2>
          </Reveal>
          <Link
            href="/planes"
            className="hidden shrink-0 items-center gap-1.5 text-[0.9375rem] text-noche-texto/70 underline underline-offset-4 hover:text-noche-texto sm:flex"
          >
            Ver los planes
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {destacadas.map((d, i) => {
            const Icon = d.icon;
            // El precio y el enlace salen del catálogo: una sola fuente de verdad
            const enCatalogo = catalogo.find((c) => c.id === d.id);
            if (!enCatalogo) return null;
            return (
              <Reveal
                key={d.id}
                delay={i * 80}
                className={d.ancha ? "sm:col-span-2 lg:col-span-3" : ""}
              >
                <CatalogLink
                  automatizacion={enCatalogo}
                  className={`group flex h-full scale-100 flex-col justify-between rounded-2xl border border-noche-texto/10 bg-noche-texto/[0.04] p-7 transition-all duration-200 ease-out hover:scale-[1.02] hover:border-acento/40 hover:shadow-[0_0_40px_-12px_var(--color-acento)] ${
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
                        className={`flex shrink-0 items-center justify-center rounded-xl border border-noche-texto/10 bg-noche-texto/[0.06] text-noche-texto ${
                          d.ancha ? "h-12 w-12" : "h-10 w-10"
                        }`}
                      >
                        <Icon size={d.ancha ? 22 : 18} />
                      </div>
                      <ArrowUpRight
                        size={18}
                        className="text-noche-texto/50 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 sm:hidden"
                      />
                    </div>

                    <div className={d.ancha ? "mt-6 sm:mt-0" : "mt-6"}>
                      <p
                        className={`font-medium tracking-tight text-noche-texto ${
                          d.ancha
                            ? "text-[1.25rem] leading-[1.2]"
                            : "text-[1.0625rem] leading-snug"
                        }`}
                      >
                        {d.nombre}
                      </p>
                      <p
                        className={`mt-2.5 leading-relaxed text-noche-texto/55 ${
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
                    <p className="text-[0.8125rem] font-medium text-noche-texto/70">
                      {!enCatalogo.disponible && "Contratar · "}
                      Incluido en {planPorNivel[enCatalogo.nivel]}
                    </p>
                    <ArrowUpRight
                      size={18}
                      className="hidden text-noche-texto/50 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 sm:block"
                    />
                  </div>
                </CatalogLink>
              </Reveal>
            );
          })}
        </div>

        <Link
          href="/planes"
          className="mt-8 flex items-center gap-1.5 text-[0.9375rem] text-noche-texto/70 underline underline-offset-4 sm:hidden"
        >
          Ver los planes
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </section>
  );
}
